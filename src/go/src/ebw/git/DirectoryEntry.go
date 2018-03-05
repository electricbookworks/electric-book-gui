package git

import (
	"encoding/json"
	"os"
	"path/filepath"

	"ebw/util"
)

type DirectoryEntry interface {
	Name() string
	IsDirectory() bool
	Map() map[string]interface{}
	Filter(base string, f func(fullname string) bool) DirectoryEntry
}

type File struct {
	name string
}

func (f *File) Name() string {
	return f.name
}

func (f *File) MarshalJSON() ([]byte, error) {
	return json.Marshal(map[string]interface{}{
		"N": f.name,
	})
}
func (f *File) IsDirectory() bool {
	return false
}

func (f *File) Filter(base string, filter func(fullname string) bool) DirectoryEntry {
	if filter(filepath.Join(base, f.name)) {
		return nil
	}
	return f
}

func (f *File) Map() map[string]interface{} {
	return map[string]interface{}{
		"N": f.name,
	}
}

type Directory struct {
	name  string
	Files []DirectoryEntry
}

func (d *Directory) Filter(base string, filter func(fullname string) bool) DirectoryEntry {
	if filter(filepath.Join(base, d.name)) {
		return nil
	}
	n := &Directory{
		name:  d.name,
		Files: make([]DirectoryEntry, 0, len(d.Files)),
	}
	var dbase string
	if `` != base {
		dbase = filepath.Join(base, d.name)
	} else {
		dbase = d.name
	}
	for _, f := range d.Files {
		de := f.Filter(dbase, filter)
		if nil != de {
			n.Files = append(n.Files, de)
		}
	}
	return n
}

func (d *Directory) Name() string {
	return d.name
}

func (d *Directory) MarshalJSON() ([]byte, error) {
	return json.Marshal(map[string]interface{}{
		"N": d.name,
		"F": d.Files,
	})
}

func (d *Directory) Map() map[string]interface{} {
	files := make([]map[string]interface{}, len(d.Files))
	for i, f := range d.Files {
		files[i] = f.Map()
	}
	return map[string]interface{}{
		"N": d.name,
		"F": files,
	}
}

func (d *Directory) IsDirectory() bool {
	return true
}

func (d *Directory) ReadDirectory(base string) error {
	d.Files = []DirectoryEntry{}
	f, err := os.Open(base)
	if nil != err {
		return util.Error(err)
	}
	files, err := f.Readdir(0)
	f.Close()
	if nil != err {
		return util.Error(err)
	}
	for _, f := range files {
		name := f.Name()
		if name == `.` || name == `..` {
			continue
		}
		if f.IsDir() {
			subdir := &Directory{name: name}
			if err := subdir.ReadDirectory(filepath.Join(base, name)); nil != err {
				return err
			}
			d.Files = append(d.Files, subdir)
		} else {
			d.Files = append(d.Files, &File{name: name})
		}
	}
	return nil
}

func NewDirectory(base string) (DirectoryEntry, error) {
	d := &Directory{name: filepath.Base(base)}
	if err := d.ReadDirectory(base); nil != err {
		return nil, err
	}
	return d, nil
}
