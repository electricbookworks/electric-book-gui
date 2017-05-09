package book

import (
	"io/ioutil"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v2"
	"html/template"

	"ebw/util"
)

type Prose struct {
	Ignore []string `yaml:ignore`
}

func (p *Prose) IgnoreFilterJS() template.JS {
	js := make([]string, 0, 3)
	js = append(js, `(function(){
		var tests = [`)
	tests := make([]string, 0, len(p.Ignore))
	for _, ignore := range p.Ignore {
		tests = append(tests, proseIgnoreFilter(ignore))
	}
	js = append(js, strings.Join(tests, `,`))
	js = append(js, `];
		var testLength = tests.length;
		return function(test) {
			var i=0;
			for (; i<testLength; i++) {
				if (tests[i](test)) {
					return true;
				}
			}
			return false;
		};
	})()`)
	return template.JS(strings.Join(js, ``))
}

func proseIgnoreFilter(ignore string) string {
	if strings.HasPrefix(ignore, "/") {
		ignore = ignore[1:]
	}
	if strings.Contains(ignore, "*") {
		ignore = strings.Replace(ignore, "*", "[^/]*", -1)
		return `(function() { var r = new RegExp("` + template.JSEscapeString(`^`+ignore+"(/+.*)?") + `");
	return function(t) { return r.test(t); }; })()
	`
	}
	return `(function() { var r = new RegExp("` + template.JSEscapeString(`^`+ignore+"(/+.*)?") + `");
	return function(t) { return r.test(t); }; })()
	`
}

type ProseFile struct {
	Prose *Prose `yaml:"prose"`
}

func ReadProse(dir string) (*Prose, error) {
	raw, err := ioutil.ReadFile(filepath.Join(dir, `_prose.yml`))
	if nil != err {
		return nil, util.Error(err)
	}
	p := &ProseFile{}
	if err := yaml.Unmarshal(raw, p); nil != err {
		return nil, util.Error(err)
	}
	return p.Prose, nil
}
