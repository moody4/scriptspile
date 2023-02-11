# Contributing Guide

## Overview

The purpose of this repository is twofold: to create an open source collection of Adobe applications scripts from various authors in one place, and to maintain a user-friendly site for ordinary designers who could use the collection and benefit from automating their workflow. 

[Vuepress](https://v2.vuepress.vuejs.org) + [Github Pages](https://pages.github.com/) met both of the above requirements, so we went for it.

While participation in the development and maintenance of the site is highly encouraged, when we talk about contributing to the project, we mean primarily contributing to the script collection, so there is no need for strong technical skills if you're willing to participate. The project is structured to separate adding content logic from the technical part as much as possible with the tools we have. Superficial knowledge of [Git](https://git-scm.com/) and [Markdown](https://en.wikipedia.org/wiki/Markdown) is all you really need.

## Pre-requirement

Still, there's always software to install. Make sure you have Git and Node.js set up before proceeding:
- [Git](https://git-scm.com/)
- [Node.js](http://nodejs.org) **version 14.18.0+** 

## Run Locally

If you're undecided and just want to get your feet wet, you can always run and test the repo locally.

Clone the repo:

```bash
git clone https://github.com/moody4/scriptspile.git
cd scriptspile/
```

Install dependencies:
```bash
npm install
```

Now start the local server:

```bash
npm run dev
```

When it starts, type `localhost:8080` in the browser  and that's it — you're running the ScriptsPile site instance on your machine.

## Project Structure

Here is the project structure. Almost all of the functional implementation is in the `.vuepress/` directory. If you're just going to add content to the site, you don't need to worry about that. Most of the time you will only want to look at the markdown files in the `authors/` and `scripts/` folders. The former contains scripts author pages (a page includes author contact, links, license info, scripts list...) and the latter — `.jsx` scripts themselves and `.md` pages with the description of each individual script. 

For convenience, the `scripts/` folder is organized to have separate subfolders for each author. Therefore, for every page in the `authors/` folder, there should be a corresponding folder in the `scripts/` directory containing that author's scripts.

<!-- But for a user, scripts pages are accessed by a direct link `scriptspile.com/scripts/<script_name>` -->

```
├──docs
│  ├──.vuepress
│  │  └─ ...            // technical implementation goes here
│  ├──authors
│  │  ├─ index.md
│  │  └─ ...            // scripts authors .md pages
│  ├──public
│  │  └─ ...            // assets that are not directly referenced in .md files
│  ├──software
│  │  ├─ illustrator.md
│  │  └─ photoshop.md
│  ├──scripts
│  │  └─ ...            // scripts .md pages
│  ├─ about.md
│  ├─ contribute.md     // the page you are now on
│  ├─ index.md
│  └─ tags.md
├─ .gitignore
└─ package.json
```

## Adding Content

For now, let's assume that you want to add an author's page and illustrator script to your locally running ScriptsPile instance just for testing purposes.

### Author Page
First, you need to create a `<author's name>.md` file in the `authors/` directory and fill it with author information. The basic template for such file is below, but you can add some arbitrary chapters, e.g. with short bio or blog link.

```md
# <author's name>

## Contact
// Email, social links...

## License Info
// The license type under which author scripts are distributed

## Scripts
// Chapter with vue component that dynamically renders the author scripts list
<PageFilter filterKey="author" filterValue="<author's name>" />
```

A filled, ready to render markdown file will look like this:

```md
# Alice

## Contact
Email <alice@gmail.com>
GitHub [@alice](https://github.com/alice)

## License Info
All scripts are licensed under the MIT license.

## Scripts
<PageFilter filterKey="author" filterValue="alice" />
```

And will be placed here:

```
├─ docs
│  ├─authors
│  │ ├─ index.md
│  │ └─ alice.md		// Alice's page
```

### Author Scripts

Adding script is very similar, with the nuance that when you're creating a script `.md` page in the `scripts/` folder, you also need to place a `.jsx` script there, so that site users will be able to download it. Also, script markdown pages have a [YAML](https://quickref.me/yaml) header that contains script metadata, such as script name, script author, tags, etc. This header will not be rendered as is, but data will be actively used for site functioning.

Basic script page template:
```md
---
title: <script name>
author: <script author>
software: <script's target Adobe application>
tags: [<list of tags, separated with comma>]
---

# <script name>

// Here is an arbitrary script description 
// And much appreciated, attached visual references, like `.jpeg`, `.gif`, etc.
```

Visual references to script behavior are placed in the `scripts/<author's name>/assets` folder and relatively linked in the `.md` file using regular markdown syntax.

So here is the example of a filled script page ready for rendering:

```md
---
title: CropArtboard
author: Alice
software: illustrator
tags: [artboard, crop]
---

# CropArtboard

This script automatically crops all content in a document to the size of its artboard. This script is especially useful for quickly preparing documents for web or print output. It can save time and effort by eliminating the need to manually crop each artboard, and it can ensure that the output is always consistent.

![CropArtboard](./assets/CropArtboard.gif)
```

And the folder structure will look like this:

```
├─ docs
│  ├─scripts
│  │ └─alice                    // author folder
│  │   ├─assets                 // assets folder
│  │   │ └─ CropArtboard.gif    // visual reference 
│  │   ├─ CropArtboard.jsx      // jsx script 
│  │   └─ CropArtboard.md       // script description 
```
::: warning
Paths should not have spaces
:::

### Testing Changes

Now launch your local ScriptsPile instance and have a look at the result of your efforts.
```sh
npm run dev
```

## Contributing to Main Repo

*// There will be a step-by-step guide on how to contribute to the main repository*
