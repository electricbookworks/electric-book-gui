---
title: Understanding the code
---

# Understanding the code
{:.no_toc}

* TOC here
{:toc}

## `src`

The Golang source code.

- `src/ts`: Typescript source code and HTML template files converted to Javascript for the front-end.
- `src/go`: Golang server-side code.
- `src/scss`: Sass stylesheets.

Ensure you have Go version 11.4 or later. The `init.sh` script will attempt to download a suitable version, but you'll first need to remove any older version of Go from your machine.

## `public`

The public directory contains the 'root' of the web site, and the Golang HTML templates that are rendered by the server.

Note that _all_ the `.html` files beneath this directory are parsed by the Golang server as HTML template files, so if there is a file that somehow breaks Go's HTML template parsing, things will go wrong.

## Compile tools

### SCSS

The SCSS is built from the root directory with:

    gulp watch

### Typescript

The Typescript is compiled to JS with

    rollup -c --watch

### DTemplate

DTemplates are compiled to Typescript with

    dtemplate -dir src/ts -lang ts -logtostderr -out src/ts/Templates.ts -watch

## Configuration

To configure, copy `electricbook.yml` to `electricbook-0.yml`. Then you will need to configure a Github OAuth application with the appropriate return address, and set the Github client and secret provided by Github.

## Framework

We use a very simple framework that consists of three separate pieces:

1. [dtemplate](https://github.com/craigmj/dtemplate)

    Run DTemplate with the command above. It generates a Typescript template module, which is then compiled along with the regular Typescript.

2. Eventify

    Like DTemplate, eventify is super-simple. It takes a DOM element (like the result of a DTemplate call), and looks for all elements with a `data-event` attribute. It parses a comma-separated list of `event:callback` where `event` is the DOM event generated, and `callback` is the name of the callback function in an object passed to the Eventify function. The third parameter to Eventify is a context object for calls (so you don't need a `this`; it will be pre-set to the context object).

    A simple example:

        Eventify(this.el, {
            'click': function (evt){
                evt.preventDefault();
                this.click(this, this.file);
            }
        }, this);

    Any element in `this.el` with `data-event="click:click"` will run the `evt` code. As an abbreviation, Eventify assumes the name of the method will be the same as the name of the event if the method isn't given, so you can just use `data-event="click"`.

    Eventify is about 18 lines of code.

    Eventify (and the current JS version of DTemplate -- but we're using the Typescript version) require some custom functions that you can find in `querySelectorAll-extensions.js`, which are just iterator functions that run `querySelectorAll` on a DOM node, including considering the DOM node itself (usually `querySelectorAll` only considers the descendants of the node).

    Because Eventify and DTemplate are simple, and not coupled, we've changed the code in `RepoFileEditorCM.ts`. Where it had previously Eventify'd `this.el`, it now eventifies `document.getElementById('editor-actions')`. That's not ideal, because it still means that editor-actions needs to be a single `div` containing these identified action buttons, but it works fine for now.

3. The third piece is basically to have JS classes that construct their required DOM elements and manage them themselves. As craigmj explains:
 
    > Ideally these should transition to being web-components, but I'm waiting for that whole mess to actually start working, and to be honest I'm unsure it ever will, but JS-components are really easy to work with, and the way I'm structuring them is really lightweight, so all works fine :) Right now the whole JS backend of ebm is likely needing a bit of a restructure to be more MVC / MVVM - so I want to create a couple of models of the 'document' and the 'chapters', etc, and control saving / printing / changes etc from the js. But for now it all functions, I hope.
