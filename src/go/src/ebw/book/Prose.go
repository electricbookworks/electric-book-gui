package book

import (
	"html/template"
	"io/ioutil"
	"path/filepath"
	"regexp"
	"strings"

	// "github.com/golang/glog"
	"gopkg.in/yaml.v2"

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
		tests = append(tests, proseIgnoreFilterJS(ignore))
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

func (p *Prose) IgnoreFilter() func(fullname string) bool {
	filters := make([]func(string) bool, len(p.Ignore))
	for i, ignore := range p.Ignore {
		filters[i] = proseIgnoreFilter(ignore)
	}
	return func(fullname string) bool {
		for _, f := range filters {
			if f(fullname) {
				return true
			}
		}
		return false
	}
}

func proseIgnoreFilter(ignore string) func(fullname string) bool {
	// strip leading / on ignore string
	// origIgnore := ignore
	if strings.HasPrefix(ignore, `/`) {
		ignore = ignore[1:]
	}
	if strings.Contains(ignore, `*`) {
		// If we have a wildcard *, we need it to match just path elements,
		// not regexp *
		ignore = strings.Replace(ignore, `*`, `[^/]*`, -1)
	}
	rExpr := `^` + ignore + `(/+.*)?`
	// glog.Infof(`Creating Ignore filter with expression: %s`, rExpr)
	re := regexp.MustCompile(rExpr)
	return func(fullname string) bool {
		match := re.MatchString(fullname)
		// if match {
		// 	glog.Infof(`%s matching %s (orig %s): %v`, fullname, rExpr, origIgnore, match)
		// }
		return match
	}
}

func proseIgnoreFilterJS(ignore string) string {
	if strings.HasPrefix(ignore, "/") {
		ignore = ignore[1:]
	}
	if strings.Contains(ignore, "*") {
		ignore = strings.Replace(ignore, "*", "[^/]*", -1)
		return `(function() { var r = new RegExp("` +
			template.JSEscapeString(`^`+ignore+"(/+.*)?") + `");
	return function(t) { return r.test(t); }; })()
	`
	}
	return `(function() { var r = new RegExp("` +
		template.JSEscapeString(`^`+ignore+"(/+.*)?") + `");
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
