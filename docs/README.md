# Docs for the EBM

This is a Jekyll site built with the Jekyll Start template created by [Electric Book Works](https://electricbookworks.com).

## Usage

This site is built with [Jekyll](https://jekyllrb.com). Follow the installation and running [instructions for Jekyll](https://jekyllrb.com/docs/home/) to install and run it locally.

### Building the live website

This project can be set up to use GitHub Pages as its live web host. This means that any changes committed to the master branch of this repository will be built into the live site immediately.

If this changes in future, and you want to build HTML to place manually on a server:

1. To set up, run `bundle install` at least once in the repo root to install the Ruby gems we need.
2. From the Terminal, run `bundle exec jekyll serve --baseurl=""`.
3. Open your browser to `127.0.0.1:4000` and test the site.
4. If all's well, copy the contents of the `_site` folder to the `public_html` folder (or equivalent) of the live webserver.

## Editing content

Once you've created your own project repository from the files in this template, follow these editing guidelines to change your site content.

### How to make changes

If you're confident with Git, you can clone this repo and edit locally.

Otherwise, the easiest place to edit text is on [prose.io](https://prose.io). Prose is a simple text editor for editing files on GitHub. If you don't have write access to the original project, your changes will be sent to the repo administrator, who can merge them into the live site.

To create your own copy of the site to play with:

1. Fork the repository on GitHub.
2. In your fork's repository settings, activate GitHub Pages.
3. On GitHub, open the `_config.yml` file and change the `baseurl` line to `baseurl: "/jekyll-starter"`.
4. Edit your files on GitHub.com directly, or use [prose.io](https://prose.io). When you use prose.io, make sure you're editing *your fork*, and not the original repository.
5. Your site and changes you make will be live at `username.github.io/jekyll-starter`, where `username` is your GitHub username.
6. To submit your changes to the original repository, create a Pull Request on your repository on GitHub.

### Main site pages

The site's main pages are markdown files in the project root. The home page is `index.md`.

### Data and settings

Edit site settings and the menu (navigation) in the files in the `_data` directory.

1. The `settings.yml` file is where you set things like the site's name, tagline, description, default image, canonical URL and Google Analytics ID.
2. Create your nav menu in the `menu.yml` file. There are code comments there to guide you.
3. Edit (or translate) phrases used in the site's HTML templates in `locales.yml`. If you change the language of your site in `settings.yml`, then change the phrases in `locales.yml` for that language subtag (e.g. `fr` for French).

### Images

To add an image, you can use standard [kramdown syntax](https://kramdown.gettalong.org/quickref.html#links-and-images), but then you'll be missing a key feature of this template: your user's browser won't fetch the size of image best suited to their device. Instead, use this image tag:

```
{% include image file="foobar.jpg" %}
```

where `foobar.jpg` is the original filename of the image.

If necessary, you can add `class` or `alt` attributes to the image, too:

```
{% include image file="foobar.jpg" class="example" alt="An example image." %}
```

(You can also use `src="foobar.jpg"` instead of `file="foobar.jpg"`, if you're used to standard HTML `img` syntax, which uses `src`.)

#### Generating images

It's best practice to let a user's browser fetch a size of image that suits their device (e.g. smaller versions of images on their phone). This template lets you do that.

For each image, the site needs four sizes: a default size and then 320-, 640- and 1024-pixel-wide versions. These need to be saved in the `images` folder. You can create these versions manually, but it's easier to use a script to generate them automatically. If you're working on a copy of the site on your own, local machine, you can do this. (You can't do this when you're using an online editor like prose.io.)

To generate the variously sized versions of images for different devices, place the original, high-res versions of your images in `_source/images`. Then from the Terminal or Command Prompt, in the project root, enter `gulp`.

The gulp script will process all the images in `_source/images` and save the various sizes in `images` for you.

Of course, for this to work you must have set up your computer beforehand:

1. Install [Node.js](https://nodejs.org).
2. Install [gulp](https://gulpjs.com/).
3. Install [GraphicsMagick](http://www.graphicsmagick.org/).
4. Run `npm install` once from the Terminal or Command Prompt, in the project root.

### Captions

To create a caption for an image, make an image the first line of the paragraph that is the caption text, and give the paragraph the `image-with-caption` class tag, like this:

```
{% include image file="great-expectations.jpg" %}
The cover of Great Expectations
{:.image-with-caption}
```

This also works with regular markdown image syntax:

```
![]({{ site.baseurl }}/images/great-expectations.jpg)
The cover of Great Expectations
{:.image-with-caption}
```

### Gallery

To create a gallery of images that tiles on the page, add all the images one after the other, each on a new line. Then add a `{:.gallery}` tag on the last line after the images.

```
{% include image file="sam.jpg" %}
{% include image file="pat.jpg" %}
{% include image file="cam.jpg" %}
{:.gallery}
```

By default, a gallery fits three images in a row on a large screen. To get two, larger images per row, use `{:.gallery-larger}` instead of `{:.gallery}`. Or give the specific images you want larger a `large` class:

```
{% include image file="toni.jpg" class="large" %}
{% include image file="phil.jpg" class="large" %}
{% include image file="sam.jpg" %}
{% include image file="pat.jpg" %}
{% include image file="cam.jpg" %}
{:.gallery}
```

You may need to add empty placeholder images to balance a gallery that has one or two images on the last line, for multiples of three (or two if using `large` or `gallery-larger`):

```
{% include image file="toni.jpg" %}
{% include image file="sam.jpg" %}
{% include image file="pat.jpg" %}
{% include image file="cam.jpg" %}
![](){:.placeholder}
![](){:.placeholder}
{:.gallery}
```

### Drafts

You can keep unfinished drafts of posts in `_drafts`. These have no effect on the built site.

### Social sharing and page info

When you share a link on a site like Facebook or Twitter, that site shows a preview of the page you're linking to. Usually, it shows a title, an image and a description.

This information is defined for each page in its 'YAML frontmatter', the section at the top of each markdown page between three hyphens: `---`. For example:

```
---
title: "Team"
description: "Our team of Wookiees are leaders in the field of starship repair and maintenance."
image: "chewie.jpg"
---
```

Note that the content or value for each item is inside straight quotation marks, so that Jekyll knows where it starts and ends.

If you don't add a description or image for a page, the fallback is what's in `_data/settings.yml`.
