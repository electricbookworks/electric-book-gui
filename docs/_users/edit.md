---
title: Edit, add, and save files
categories:
  - Electric Book Manager
order: 4
description: "How to edit, add and save files."
---

# Editing, adding, and saving files
{:.no_toc}

* Page contents
{:toc}

## Editing text

1. Once signed in, click on the name of your project (or click ‘Manage’ next to the name) to open the project-details page.
2. On the details page, click ‘Edit’ to load the editor.
3. In the sidebar on the left, click on the file you want to edit. For instance, to edit Chapter 1 in the ‘book’ folder, you might open `book/text/01.md`.
4. Edit the text in markdown. (See our [guidelines on markdown](https://electricbookworks.github.io/electric-book/docs/editing/markdown.html).)

### Searching in files

You can search for and replace text in the file you are editing.

1. From the editing page, open the file you would like to search in. 
2. Click anywhere in the text of that file.

To search:

1. Type `Ctrl + F` on Windows or Linux, or `Cmd + F` on Mac, to bring up a search bar within that file.
2. Enter your search term and hit `Enter`. This will highlight all instances of the search term.
3. To cycle through the results, type `Ctrl + G` or `Cmd + G`.
4. To move backwards through the results, type `Ctrl + Shift + G` or `Cmd + Shift + G`.

To search and replace:

1. Type `Ctrl + Shift + F` on Windows or Linux, or `Cmd + Alt + F` on Mac.
2. Enter the term you would like to find, and hit `Enter`.
3. Enter the term you would like to replace it with, and hit `Enter`.
4. A small dialogue box will appear in place of the seach box. You can cycle through all instances of the search term, and choose to replace some or all instances by clicking on the relevant option. Hitting `Enter` will select the default option "Yes".

To do regular expression (regex) search

5. Put your search between forward slashes. E.g. `/Americani[sz]e/` will find `Americanise` and `Americanize`. To search and replace use Ctrl + alt + F (or Cmd + alt + F if you're on Mac). [This page](https://codemirror.net/demo/search.html) explains a bit more.

## Adding new files

If you need to add a new file (for a new chapter, for example):

1. In the editor view, click ‘New file’.
2. Enter the full path to where the file should be created. Note that these paths have very strict requirements. A valid path for a chapter in the book folder would look like this: `book/text/filename.md`. Do not use spaces in filenames. We recommend using only lowercase letters and numbers, optionally separated with hyphens. Remember to include the `.md` file extension for markdown files (the filetype for text).
3. Click ‘Create file’. Your file will now appear at the bottom of the sidebar.
4. Every markdown file in a book must start with two rows of three hyphens:

    ```
    ---
    ---
    ```

    Between these, you can include 'YAML frontmatter', which is information about the file. Usually, this is just a title for the file. For example:

    ```
    ---
    title: "Chapter One"
    ---
    ```

    After this frontmatter section, add your text content.

## Saving and version-control

Storing your content is done in two steps:

1. Saving your work on the EBM server (by saving).
2. Taking a snapshot of the project for version control (by committing after saving).

To save, click 'Save' while you work as often as you like. At least, when you’re done making changes and before you close a file, click ‘Save’.

When you are ready to create a snapshot of your project for version-control, click 'Commit' and enter a short note that describes the changes you've made. Committing does two important things:

1. It takes a snapshot of the entire project.
2. It sends that snapshot to your GitHub account.

Once you have clicked ‘Commit’ and entered a description of your change, you can click ‘View Edit History’ to go to GitHub and see the changes stored in your commit. This will open in a new tab. If you click on the commit description on GitHub, you will see a diff (for 'difference') of your contributions, with additions in green and deletions in red.

If your project has a parent repository, where you can send your changes to be reviewed by a managing editor, on the EBM you can click ‘Submit these changes for review’, and enter a short description of your submission. If you do not see this button, it means that there is no parent repository, or that you have not made any changes that the managing editor of the parent repository doesn’t already have.

You do not have to submit your changes after every commit. Try to group similar changes into one commit. And try to group similar commits into one submission. This will make your project history easier for you and others to understand.

Also keep in mind that sensible batches of commits and submissions makes it easier for a managing editor to review.

For more detail on collaborating, see [Collaboration](../collaboration).
