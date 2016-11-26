/*
Package xerror extends the functionality of Go's built-in error interface: it allows to generate nicely formatted error
messages while making it easy to programmatically check for error types, and allowing to propagate additional
information such as stack traces and debug values.
*/
package xerror

import (
	"encoding/json"
	"fmt"
	"runtime/debug"
	"strings"
)

// Error is the augmented error interface provided by this package.
type Error interface {
	error
	json.Marshaler
	fmt.GoStringer

	Is(string) bool
	Contains(string) bool
	Debug() []interface{}
	Stack() []string
	Clone() Error
}

// xerror is the internal implementation of Error
type xerr struct {
	msg   string
	fmts  []string
	dbg   []interface{}
	stack []string
}

// xerrorJSON is used to serialize Error to JSON
type xerrJSON struct {
	Message string        `json:"message"`
	Debug   []interface{} `json:"debug,omitempty"`
	Stack   []string      `json:"stack"`
}

// New returns a new augmented error. Parameters that don't have a placeholder in the format string are only stored as debug objects.
func New(format string, v ...interface{}) Error {
	v = nilToEmpty(v)
	return &xerr{
		msg:   safeSprintf(format, v),
		fmts:  []string{format},
		dbg:   v,
		stack: strings.Split(string(debug.Stack()), "\n"),
	}
}

// Wrap returns a new augmented error that wraps the given Go `error` or `Error`.
func Wrap(err error, format string, v ...interface{}) Error {
	v = nilToEmpty(v)
	xerr := cloneOrNew(err)
	xerr.msg = fmt.Sprintf("%v: %v", safeSprintf(format, v), xerr.msg)
	xerr.fmts = append([]string{format}, xerr.fmts...)
	xerr.dbg = append(v, xerr.dbg...)
	return xerr
}

// Error implements the `error` interface.
func (e *xerr) Error() string {
	return e.msg
}

// MarshalJSON implements the `json.Marshaler` interface.
func (e *xerr) MarshalJSON() ([]byte, error) {
	return json.Marshal(&xerrJSON{
		Message: e.msg,
		Debug:   e.dbg,
		Stack:   e.stack,
	})
}

// GoString implements the `fmt.GoStringer` interface.
func (e *xerr) GoString() string {
	buf, err := e.MarshalJSON()
	if err != nil {
		return fmt.Sprintf("!ERROR(%v)", err)
	}
	return string(buf)
}

// Is returns true if the outermost error message format equals the given message format, false otherwise.
func (e *xerr) Is(fmt string) bool {
	return e.fmts[0] == fmt
}

// Contains returns true if the error contains the given message format, false otherwise.
func (e *xerr) Contains(format string) bool {
	for _, f := range e.fmts {
		if f == format {
			return true
		}
	}
	return false
}

// Debug returns the slice of debug objects.
func (e *xerr) Debug() []interface{} {
	return e.dbg
}

// Stack returns the stack trace associated with the error.
func (e *xerr) Stack() []string {
	return e.stack
}

// Clone returns an exact copy of the `Error`.
func (e *xerr) Clone() Error {
	return &xerr{
		msg:   e.msg,
		fmts:  append(make([]string, 0, len(e.fmts)), e.fmts...),
		dbg:   append(make([]interface{}, 0, len(e.dbg)), e.dbg...),
		stack: append(make([]string, 0, len(e.stack)), e.stack...),
	}
}

// Is returns true if the outermost message format (if `err` is `Error`) or error string (if `err` is a Go `error`) equals the given message.
func Is(err error, format string) bool {
	if err == nil {
		return false
	}
	if xerr, ok := err.(*xerr); ok {
		return xerr.Is(format)
	}
	return err.Error() == format
}

// Contains is like Is, but in case `err` is of type `Error` compares the message format with all attached message formats.
func Contains(err error, format string) bool {
	if err == nil {
		return false
	}
	if xerr, ok := err.(*xerr); ok {
		return xerr.Contains(format)
	}
	return err.Error() == format
}

// cloneOrNew wraps the given `error` unless it is already of type `*xerror`, in which case it returns a copy
func cloneOrNew(err error) *xerr {
	if x, ok := err.(*xerr); ok {
		return x.Clone().(*xerr)
	}
	return New(err.Error()).(*xerr)
}

// safeSprintf is like `fmt.Sprintf`, but passes through only at most parameters as placeholders in the format string
func safeSprintf(format string, v []interface{}) string {
	if n := strings.Count(format, "%") - strings.Count(format, "%%")*2; len(v) > n {
		v = v[:n]
	}
	return fmt.Sprintf(format, v...)
}

// nilToEmpty returns the given slice if not nil, or an empty slice if nil
func nilToEmpty(v []interface{}) []interface{} {
	if v == nil {
		return []interface{}{}
	}
	return v
}
