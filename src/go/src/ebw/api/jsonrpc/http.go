package jsonrpc


import (

	
	
	 "errors"
	 "fmt"
	 "io"
	 "encoding/json"
	 "net/http"
	 "github.com/golang/glog"
	 "bytes"
	

	_root "ebw/api"
)

// Just a placeholder to prevent errors if fmt isn't used
var _ = fmt.Println

/**
 * HttpHandlerFunc is the entry point for the http POST
 * handler.
 */
func HttpHandlerFunc(w http.ResponseWriter, r *http.Request) {
	if err := _root.NewConnection(w,r,func(conn *_root.Connection) error {
		return processJsonRpc(r.Body, w, conn)
	}); nil!=err {
		glog.Errorf("Error occurred: %s", err.Error())
		http.Error(w,err.Error(), http.StatusInternalServerError)
		return
	}
}

const JSONRPC_ERROR_PARSE_ERROR = -32700
const JSONRPC_ERROR_INVALID_REQUEST = -32600
const JSONRPC_ERROR_METHOD_NOT_FOUND = -32601
const JSONRPC_ERROR_INVALID_PARAMS = -32602
const JSONRPC_ERROR_INTERNAL_ERROR = -32603
const JSONRPC_ERROR_APPLICATION_ERROR = -1000


type jsonRequest struct {
	Jsonrpc string `json:"jsonrpc"`
	Method string `json:"method"`
	Params []json.RawMessage `json:"params"`
	Id	interface{} `json:"id"`
}
type jsonError struct {
	Code int `json:"code"`
	Message string `json:"message"`
	Data interface{} `json:"data,omitempty"`
}
type jsonResponse struct {
	Jsonrpc string `json:"jsonrpc"`
	Id interface{} `json:"id"`
	Result interface{} `json:"result,omitempty"`
	Error *jsonError `json:"error,omitempty"`
}

// processJsonRpc processes a json rpc request, reading 
// from the io.Reader and sending the
// result to the io.Writer.
func processJsonRpc(in io.Reader, out io.Writer, conn *_root.Connection) error {
	var buf bytes.Buffer
	var err error
	io.Copy(&buf, in)

	glog.Infof("processJsonRpc...: %s", buf.String())
	var request jsonRequest

	js := json.NewDecoder(bytes.NewReader(buf.Bytes()))
	if err = js.Decode(&request); nil!=err {
		errorJsonRpc(out, request.Id, JSONRPC_ERROR_PARSE_ERROR, err, nil)
		return err
	}
	if err = conn.Context(func (context *_root.API)error {
		switch request.Method {
		
		
		case "Version":
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 1)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0] = context.Version(
		
				)

					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "DeleteFile":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				PATH string `json:"1"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=2 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 2, len(request.Params), "DeleteFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 1)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0] = context.DeleteFile(
		args.REPO,
		args.PATH,
		
				)

					
					if (nil!=result[0]) {
						return result[0].(error)
					}
					
					result = result[0:0]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "ListFiles":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				PATHREGEX string `json:"1"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=2 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 2, len(request.Params), "ListFiles")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.PATHREGEX);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 2)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0],result[1] = context.ListFiles(
		args.REPO,
		args.PATHREGEX,
		
				)

					
					if (nil!=result[1]) {
						return result[1].(error)
					}
					
					result = result[0:1]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "GetFile":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				PATH string `json:"1"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=2 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 2, len(request.Params), "GetFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 2)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0],result[1] = context.GetFile(
		args.REPO,
		args.PATH,
		
				)

					
					if (nil!=result[1]) {
						return result[1].(error)
					}
					
					result = result[0:1]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "GetFileString":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				PATH string `json:"1"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=2 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 2, len(request.Params), "GetFileString")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 2)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0],result[1] = context.GetFileString(
		args.REPO,
		args.PATH,
		
				)

					
					if (nil!=result[1]) {
						return result[1].(error)
					}
					
					result = result[0:1]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "UpdateFile":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				PATH string `json:"1"`
				
				CONTENT string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "UpdateFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.CONTENT);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 1)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0] = context.UpdateFile(
		args.REPO,
		args.PATH,
		args.CONTENT,
		
				)

					
					if (nil!=result[0]) {
						return result[0].(error)
					}
					
					result = result[0:0]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "ListPullRequests":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=1 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 1, len(request.Params), "ListPullRequests")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 2)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0],result[1] = context.ListPullRequests(
		args.REPO,
		
				)

					
					if (nil!=result[1]) {
						return result[1].(error)
					}
					
					result = result[0:1]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "PullRequestDiffList":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				SHA string `json:"1"`
				
				REGEXP string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "PullRequestDiffList")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.SHA);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.REGEXP);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 2)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0],result[1] = context.PullRequestDiffList(
		args.REPO,
		args.SHA,
		args.REGEXP,
		
				)

					
					if (nil!=result[1]) {
						return result[1].(error)
					}
					
					result = result[0:1]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "PullRequestVersions":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				REMOTEURL string `json:"1"`
				
				REMOTESHA string `json:"2"`
				
				FILEPATH string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "PullRequestVersions")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REMOTEURL);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.REMOTESHA);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.FILEPATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 3+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 3)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0],result[1],result[2] = context.PullRequestVersions(
		args.REPO,
		args.REMOTEURL,
		args.REMOTESHA,
		args.FILEPATH,
		
				)

					
					if (nil!=result[2]) {
						return result[2].(error)
					}
					
					result = result[0:2]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		
		
		case "PullRequestUpdate":
			
			
			args := struct {
				
				REPO string `json:"0"`
				
				REMOTESHA string `json:"1"`
				
				FILEPATH string `json:"2"`
				
				DATA string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "PullRequestUpdate")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPO);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REMOTESHA);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.FILEPATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.DATA);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 3+1, err.Error()), nil)
				return err
			}
			
			

			// // Decoding request.Params as an object
			// err := json.Unmarshal(request.Params, &args)
			// if nil!=err {
			// 	errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
			// 	return
			// }
			
			result := make([]interface{}, 1)
			

			if err = func() (err error) {
				
				
				defer func() {
					if r:=recover(); nil!=r {
						if e, ok := r.(error); ok {
							err=e
						} else {
							err = fmt.Errorf("PANIC: %s", e)
						}
					}
				}()
				

				
					result[0] = context.PullRequestUpdate(
		args.REPO,
		args.REMOTESHA,
		args.FILEPATH,
		args.DATA,
		
				)

					
					if (nil!=result[0]) {
						return result[0].(error)
					}
					
					result = result[0:0]
					

								
				return nil
			}(); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
				return err
			}

			
			response := jsonResponse{
				Jsonrpc:"2.0",
				Id: request.Id,
				Result: result,
			}
			encoder := json.NewEncoder(out)
			if err := encoder.Encode(&response); nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INTERNAL_ERROR, err, nil)
				return err
			}

		 
		default:
			errorJsonRpc(out, request.Id, JSONRPC_ERROR_METHOD_NOT_FOUND, 
				errors.New("Method " + request.Method + " not found"),
				 nil)
			return err
		}		
		return nil
	}); nil!=err {
		errorJsonRpc(out, request.Id, JSONRPC_ERROR_APPLICATION_ERROR, err, nil)
		return err
	}
	return nil
}


// errorJsonRpc sends a JSONRpcError back to the client.
func errorJsonRpc(out io.Writer, id interface{}, code int, err error, data interface{}) {
	glog.Infof("ERROR on JsonRPC: %d, %s {%q}", code, err, data)
	response := jsonResponse{
		Jsonrpc:"2.0",
		Id: id,
		Error: &jsonError {
			Code:code,
			Message: err.Error(),
			Data: data,
		},
	}
	js := json.NewEncoder(out)
	// If our encoding fails on error response, we assume it's because
	// the data encoding failed, so we try again, but without the data,
	// instead sending our failed error message as the data
	if encErr := js.Encode(&response); nil!=encErr && nil!=data {
		errorJsonRpc(out, id, code, err, encErr.Error())
	}
}
