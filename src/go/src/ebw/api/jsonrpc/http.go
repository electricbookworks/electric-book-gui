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

		
		
		case "RenameFile":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				FROMPATH string `json:"2"`
				
				TOPATH string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "RenameFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.FROMPATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.TOPATH);
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
				

				
					result[0] = context.RenameFile(
		args.REPOOWNER,
		args.REPONAME,
		args.FROMPATH,
		args.TOPATH,
		
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

		
		
		case "RemoveFile":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "RemoveFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
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
				

				
					result[0] = context.RemoveFile(
		args.REPOOWNER,
		args.REPONAME,
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATHREGEX string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "ListFiles")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATHREGEX);
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
				

				
					result[0],result[1] = context.ListFiles(
		args.REPOOWNER,
		args.REPONAME,
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

		
		
		case "FileExists":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "FileExists")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
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
				

				
					result[0],result[1] = context.FileExists(
		args.REPOOWNER,
		args.REPONAME,
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

		
		
		case "ListAllRepoFiles":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=2 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 2, len(request.Params), "ListAllRepoFiles")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
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
				

				
					result[0],result[1] = context.ListAllRepoFiles(
		args.REPOOWNER,
		args.REPONAME,
		
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "GetFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
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
				

				
					result[0],result[1] = context.GetFile(
		args.REPOOWNER,
		args.REPONAME,
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "GetFileString")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
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
				

				
					result[0],result[1] = context.GetFileString(
		args.REPOOWNER,
		args.REPONAME,
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
				CONTENT string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "UpdateFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.CONTENT);
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
				

				
					result[0] = context.UpdateFile(
		args.REPOOWNER,
		args.REPONAME,
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

		
		
		case "CommitFile":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "CommitFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
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
				

				
					result[0] = context.CommitFile(
		args.REPOOWNER,
		args.REPONAME,
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

		
		
		case "SaveWorkingFile":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
				CONTENT string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "SaveWorkingFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.CONTENT);
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
				

				
					result[0] = context.SaveWorkingFile(
		args.REPOOWNER,
		args.REPONAME,
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=2 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 2, len(request.Params), "ListPullRequests")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
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
				

				
					result[0],result[1] = context.ListPullRequests(
		args.REPOOWNER,
		args.REPONAME,
		
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PRNUMBER int `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "PullRequestDiffList")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PRNUMBER);
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
		args.REPOOWNER,
		args.REPONAME,
		args.PRNUMBER,
		
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				REMOTEURL string `json:"2"`
				
				REMOTESHA string `json:"3"`
				
				FILEPATH string `json:"4"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=5 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 5, len(request.Params), "PullRequestVersions")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.REMOTEURL);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.REMOTESHA);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 3+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[4], &args.FILEPATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 4+1, err.Error()), nil)
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
		args.REPOOWNER,
		args.REPONAME,
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
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				REMOTESHA string `json:"2"`
				
				FILEPATH string `json:"3"`
				
				DATA string `json:"4"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=5 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 5, len(request.Params), "PullRequestUpdate")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
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
			
			if err = json.Unmarshal(request.Params[4], &args.DATA);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 4+1, err.Error()), nil)
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
		args.REPOOWNER,
		args.REPONAME,
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

		
		
		case "Commit":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				MESSAGE string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "Commit")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.MESSAGE);
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
				

				
					result[0] = context.Commit(
		args.REPOOWNER,
		args.REPONAME,
		args.MESSAGE,
		
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

		
		
		case "CommitAll":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				MESSAGE string `json:"2"`
				
				NOTES string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "CommitAll")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.MESSAGE);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.NOTES);
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
				

				
					result[0] = context.CommitAll(
		args.REPOOWNER,
		args.REPONAME,
		args.MESSAGE,
		args.NOTES,
		
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

		
		
		case "CommitOnly":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				MESSAGE string `json:"2"`
				
				NOTES string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "CommitOnly")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.MESSAGE);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.NOTES);
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
				

				
					result[0] = context.CommitOnly(
		args.REPOOWNER,
		args.REPONAME,
		args.MESSAGE,
		args.NOTES,
		
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

		
		
		case "PrintPdfEndpoint":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				BOOK string `json:"2"`
				
				FORMAT string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "PrintPdfEndpoint")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.BOOK);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.FORMAT);
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
				

				
					result[0],result[1] = context.PrintPdfEndpoint(
		args.REPOOWNER,
		args.REPONAME,
		args.BOOK,
		args.FORMAT,
		
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

		
		
		case "MergedFileCat":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=3 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 3, len(request.Params), "MergedFileCat")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
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
			
			result := make([]interface{}, 5)
			

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
				

				
					result[0],result[1],result[2],result[3],result[4] = context.MergedFileCat(
		args.REPOOWNER,
		args.REPONAME,
		args.PATH,
		
				)

					
					if (nil!=result[4]) {
						return result[4].(error)
					}
					
					result = result[0:4]
					

								
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

		
		
		case "SaveMergingFile":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
				WORKINGEXISTS bool `json:"3"`
				
				WORKINGCONTENT string `json:"4"`
				
				THEIREXISTS bool `json:"5"`
				
				THEIRCONTENT string `json:"6"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=7 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 7, len(request.Params), "SaveMergingFile")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.WORKINGEXISTS);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 3+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[4], &args.WORKINGCONTENT);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 4+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[5], &args.THEIREXISTS);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 5+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[6], &args.THEIRCONTENT);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 6+1, err.Error()), nil)
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
				

				
					result[0] = context.SaveMergingFile(
		args.REPOOWNER,
		args.REPONAME,
		args.PATH,
		args.WORKINGEXISTS,
		args.WORKINGCONTENT,
		args.THEIREXISTS,
		args.THEIRCONTENT,
		
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

		
		
		case "MergeFileOriginal":
			
			
			args := struct {
				
				REPOOWNER string `json:"0"`
				
				REPONAME string `json:"1"`
				
				PATH string `json:"2"`
				
				VERSION string `json:"3"`
				
			}{}

			// Decoding request.Params as an array
			if len(request.Params)!=4 {
				err = fmt.Errorf(
					"Expected %d parameters, but got %d in call to %s", 4, len(request.Params), "MergeFileOriginal")
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, err, nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[0], &args.REPOOWNER);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 0+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[1], &args.REPONAME);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 1+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[2], &args.PATH);
				nil!=err {
				errorJsonRpc(out, request.Id, JSONRPC_ERROR_INVALID_PARAMS, fmt.Errorf(
					"Unable to decode JSON param %d: %s", 2+1, err.Error()), nil)
				return err
			}
			
			if err = json.Unmarshal(request.Params[3], &args.VERSION);
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
				

				
					result[0],result[1],result[2] = context.MergeFileOriginal(
		args.REPOOWNER,
		args.REPONAME,
		args.PATH,
		args.VERSION,
		
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
