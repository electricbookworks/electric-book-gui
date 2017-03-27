package print

import (
	"net/http"
	"sync"

	"github.com/golang/glog"
	"github.com/gorilla/mux"
	"github.com/julienschmidt/sse"
	"github.com/satori/go.uuid"

	"ebw/git"
)

var endpoints = make(map[string]*PrintRequest)
var endpointsL sync.Mutex

func MakeEndpoint(pr *PrintRequest) string {
	key := uuid.NewV4().String()
	endpointsL.Lock()
	defer endpointsL.Unlock()
	endpoints[key] = pr
	return key
}

// PrintRoutes sets up the routes for printing on the given router
func PrintRoutes(r *mux.Router) {
	r.HandleFunc(`/print/sse/{key}`, endpointHandler)
}

func endpointHandler(w http.ResponseWriter, r *http.Request) {
	key := mux.Vars(r)[`key`]
	pr, ok := endpoints[key]
	if !ok {
		http.Error(w, `Failed to find endpoint for key '`+key+`'`, 404)
		return
	}
	s := sse.New()
	C := make(chan PrintMessage)
	go func() {
		for m := range C {
			glog.Infof(`About to SendJSON: data = %v`, m.Data)
			s.SendJSON(`id`, m.Event, m.Data)
		}
		s.SendJSON(`id`, `done`, nil)
	}()

	go func() {
		defer func() {
			close(C)
			endpointsL.Lock()
			delete(endpoints, key)
			endpointsL.Unlock()
		}()

		repoDir, err := git.RepoDir(pr.Username, pr.Repo)
		if nil != err {
			C <- PrintMessage{Event: `error`, Data: err.Error()}
			return
		}

		// pdfPath, err := PrintInContainer(repoDir, pr.Book, C)
		pdfPath, err := PrintLocal(repoDir, pr.Book, C)
		if nil != err {
			C <- PrintMessage{Event: `error`, Data: err.Error()}
		} else {
			m := PrintMessage{Event: `output`, Data: pdfPath}
			glog.Infof(`PrintMessage = %v`, m)
			C <- m
		}
		glog.Infof(`Quitting SSE loop for %s`, key)
	}()
	glog.Infof("Serving SSE for %s", key)
	s.ServeHTTP(w, r)
	glog.Infof("Exiting handler for SSE %s", pr.Repo)
}
