# CODE README

## Code Locations

Source code is directly in `src` subdirectory. The breakdown is:

### src/es6

es6 source code and html template files use by javascript classes.

### src/go

go-lang server-side code.

### src/scss

SASS stylesheets.

### public

The public directory contains the 'root' of the web site, and the Golang html templates that are rendered by the server. Note that _all_ the .html files beneath this directory are parsed by the Golang server as html template files, so if there is a file that somehow breaks Go's html template parsing, things will go wrong.

## Building and Running Locally

Building the go-lang system should be do-able with `./build.sh`. This will create a binary in `bin/electricbookworks` that can be executed with `bin/electricbookworks -logtostderr web`. This must be run from the repo directory, since it needs access to the `public` directory, to some other directories it will create on the fly, and to the `electricbook.yml` configuration file.

## Configuration

To configure, copy `electricbook.yml` to `electricbook-0.yml`. Then you will need to configure a github OAuth application with the appropriate return address, and set the github client and secret provided by github.

## Code Framework(s)

I'm using a VERY simple framework of my own devising, that consists of three separate pieces:

1. https://github.com/craigmj/dtemplate

## Super Simple

dtemplate takes a directory (and sub-directories) with a set of html files, and creates a Javascript function that will create instances of the DOM in each of those HTML files, named by the filename. It does this by pre-creating the DOM nodes, then deep-copying them. (I think this is fast.)

## data-set attribute

Besides returning the element, it also returns an object with every DOM element referenced with a `data-set` attribute. If the key for the object in the data-set attribute starts with `$`, it will be `jQuery` wrapped.

If the DOM element has a data-set attribute of `this`, then that DOM element is returned, not the root-element of the document. The reason: if you want to have a template that is a table-row `tr` for instance, you cannot actually instantiate a tr ourside a table, so you need a template that looks like this:

    <table>
      <tr data-set="this">
          <td>Name</td>
          <td data-set="name"> - name will go here - </td>
      </tr>
    </table>

Typically, I use it in a class like this:
   
        [this.el, this.$] = DTemplate(`RepoFileEditLink`);

I've then got a this.$ that contains all my data-set DOM elements, so I can set their values quickly:

        this.$.name.textContent = "Craig";

dtemplate is just under 50 lines of javascript.

2. Eventify

Like dtemplate, eventify is super-simple. It takes a DOM element (like the result of a DTemplate call), and looks for all elements with a data-event attribute. It parses a comma-separated list of EVENT:CALLBACK where event is the DOM event generated, and CALLBACK is the name of the callback function in an object passed to the Eventify function. The third parameter to Eventify is a context object for calls (so you don't need a this, it will be pre-set to the context object).

A simple example:

        Eventify(this.el, {
            'click': function (evt){
                evt.preventDefault();
                this.click(this, this.file);
            }
        }, this);

Any element in `this.el` with data-event="click:click" will run the evt code. As an abbreviation, Eventify assumes the name of the method will be the same as the name of the event if the method isn't given, so you can just use 'data-event="click"'.

Eventify is about 18 lines of code.

Both of these require some custom functions you can find in querySelectorAll-extensions.js, which are just iterator functions that run querySelectorAll on a DOM node, including considering the DOM node itself (usually querySelectorAll only considers the descendants of the node).

Because Eventify and DTemplate are simple, and not coupled, I changed the code in RepoFileEditorCM.js - where it had previously Eventify'd this.el, it now eventifies document.getElementById('editor-actions'). That's not ideal, because it still means that editor-actions needs to be single div containing these identified action buttons, but it works fine for now.

3. The third piece is basically to have JS classes that construct their required DOM elements and manage them themselves. Ideally these should transition to being web-components, but I'm waiting for that whole mess to actually start working, and to be honest I'm unsure it ever will, but JS-components are really easy to work with, and the way I'm structuring them is really lightweight, so all works fine :) Right now the whole JS backend of ebm is likely needing a bit of a restructure to be more MVC / MVVM - so I want to create a couple of models of the 'document' and the 'chapters', etc, and control saving / printing / changes etc from the js. But for now it all functions, I hope.

I think that's all there is to the tricky JS backend stuff. It's all very, very lightweight!

Have a lovely evening,
C


