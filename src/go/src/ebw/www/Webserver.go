package www

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/golang/glog"
	"github.com/gorilla/mux"
	"github.com/uniplaces/carbon"
	"golang.org/x/net/webdav"

	"ebw/api/jsonrpc"
	"ebw/print"
	"ebw/util"
)

func webdavRoutes(r *mux.Router, prefix string) {
	handler := &webdav.Handler{
		Prefix:     prefix,
		FileSystem: NewOSFileSystem("test"),
		LockSystem: webdav.NewMemLS(),
		Logger: func(r *http.Request, err error) {
			glog.Infof("%s %s : %v", r.Method, r.RequestURI, err)
		},
	}
	r.HandleFunc(prefix+"{t:.*}", func(w http.ResponseWriter, r *http.Request) {
		glog.Infof("webdav handler: %s %s", r.Method, r.RequestURI)
		handler.ServeHTTP(w, r)
	})
}

func WebError(w http.ResponseWriter, r *http.Request, err error) {
	http.Error(w, err.Error(), http.StatusInternalServerError)
}

func RunWebServer(bind string) error {
	r := mux.NewRouter()
	r.Handle(`/`, WebHandler(repoList))
	webdavRoutes(r, `/webdav`)
	print.PrintRoutes(r)
	r.HandleFunc(`/rpc/API/json`, jsonrpc.HttpHandlerFunc)
	r.HandleFunc(`/rpc/API/json/ws`, jsonrpc.WsHandlerFunc)
	r.Handle(`/github/login`, WebHandler(githubLogin))
	r.HandleFunc(`/github/auth`, githubAuth)

	r.Handle(`/github/create/fork`, WebHandler(githubCreateFork))
	r.Handle(`/github/create/new`, WebHandler(githubCreateNew))
	r.Handle(`/repo/{repoOwner}/{repoName}/update`, WebHandler(repoUpdate))
	r.Handle(`/repo/{repoOwner}/{repoName}`, WebHandler(repoView))
	r.Handle(`/repo/{repoOwner}/{repoName}/pull`, WebHandler(pullRequestList))
	r.Handle(`/repo/{repoOwner}/{repoName}/pull/{number}`, WebHandler(pullRequestView))
	r.Handle(`/repo/{repoOwner}/{repoName}/pull/{number}/close`, WebHandler(pullRequestClose))
	r.Handle(`/repo/{repoOwner/{repoName}/pull_new`, WebHandler(pullRequestCreate))
	r.Handle(`/www/{path:.*}`, WebHandler(repoFileServer))
	r.Handle(`/jekyll/{repoOwner}/{repoName}/{path:.*}`, WebHandler(jeckylRepoServer))

	r.Handle(`/logoff`, WebHandler(LogoffHandler))
	r.Handle(`/to-github`, WebHandler(ToGithubHandler))

	r.Handle(`/{p:.*}`, http.FileServer(http.Dir(`public`)))

	http.HandleFunc(`/`, func(w http.ResponseWriter, req *http.Request) {
		w.Header().Add(`Cache-Control`, `no-cache, no-store, must-revalidate`)
		w.Header().Add(`Pragma`, `no-cache`)
		w.Header().Add(`Expires`, `0`)
		r.ServeHTTP(w, req)
	})
	// @TODO convert to handle signals and clean shutdown
	glog.Infof("Listening on %s", bind)
	return http.ListenAndServe(bind, nil)
}

// pathRepoEdit returns the URL path to edit the given repo
func pathRepoEdit(c *Context, repoUserAndName string) (string, error) {
	parts := strings.Split(repoUserAndName, `/`)
	// @TODO If we move to storing the repoUser in the path as well,
	// we'll need to make this 1==len(parts) and error condition
	if 1 == len(parts) {
		return fmt.Sprintf(`/repo/%s/update`, parts[0]), nil
	}
	if 2 != len(parts) {
		return ``, util.Error(fmt.Errorf(`Expected user/name format for repoUserAndName(%s)`, repoUserAndName))
	}
	return fmt.Sprintf(`/repo/%s/update`, parts[1]), nil
}

func Render(w http.ResponseWriter, r *http.Request, tmpl string, data interface{}) error {
	t := template.New("").Funcs(map[string]interface{}{
		"Rand": func() string {
			return fmt.Sprintf("%d-%d", time.Now().Unix(), rand.Int())
		},
		"json": func(in interface{}) string {
			raw, err := json.Marshal(in)
			if nil != err {
				return err.Error()
			}
			return string(raw)
		},
		"humantime": func(in interface{}) string {
			t, ok := in.(time.Time)
			if !ok {
				return "NOT time.Time"
			}
			ct := carbon.NewCarbon(t)
			// ct = carbon.Now().SubMinutes(20)
			s, err := ct.DiffForHumans(nil, false, false, false)
			if nil != err {
				return err.Error()
			}
			return s
		},
	})
	if err := filepath.Walk("public", func(name string, info os.FileInfo, err error) error {
		// glog.Infof("walk: %s", name)
		if nil != err {
			return err
		}
		if !strings.HasSuffix(name, ".html") {
			return nil
		}
		// We don't parse html in bower_components
		if strings.Contains(name, `bower_components/`) {
			return nil
		}
		// glog.Infof("Found template: %s", name)
		raw, err := ioutil.ReadFile(name)
		if nil != err {
			return err
		}
		if _, err := t.New(name[7:]).Parse(string(raw)); nil != err {
			return err
		}
		return nil
	}); nil != err {
		WebError(w, r, err)
		return err
	}
	if err := t.ExecuteTemplate(w, tmpl, data); nil != err {
		WebError(w, r, err)
		return err
	}
	return nil
}
