# @wbez/ferris-ds

> Centralizing styles for product development at WBEZ

This repo contains a library of styles and icons available to import via npm.

Along with the library, we set up a few tools that help document updates. CSS comments are parsed to create a JSON object of documentation. That data is rendered with nunjucks to give us a visual representation of the various components and rule-sets we're building.

Our goal is that as we iterate upon the design of our products, we document everything along the way. This keeps our **style docs current and allows for continuous optimization our CSS.**

This repo is forked from [texastribune/queso-ui@v3.2.0](https://github.com/texastribune/queso-ui/releases/tag/v3.2.0). Much thanks and props for building out such a great base for us to launch from.

## Index

- [Getting started](#getting-started)
- [Installing as a dependency](#installing-as-a-dependency)
- [Using assets](#using-assets)
- [Folders](#folders)
- [Adding to the CSS framework](#adding-to-the-css-framework)
- [Using this system in our products](#using-this-system-in-our-products)
- [Publishing](#publishing)

## Getting started

To preview these assets and accompanying docs locally, run the following commands:

```sh
npm i
```

```sh
npm run dev
```

Visit http://local.wbez.org:1234

This spins up a browsersync server and watch task for all SCSS and HTML files.

**Requirements**

- node >=8.11.3
- [Dart Sass](https://github.com/sass/dart-sass)

## Installing as a dependency

```sh
yarn add --dev @wbez/ferris-ds sass
```

```sh
npm install --save-dev @wbez/ferris-ds sass
```

## Using assets

SCSS

```scss
@import '@wbez/ferris-ds';
```

CSS in `<head>` via CDN

```html
<link
  rel="stylesheet"
  href="//unpkg.com/@wbez/ferris-ds@:version/assets/dist/css/all.css"
/>
```

Single icon

```js
import linkIcon from '@wbez/ferris-ds/assets/icons/wbez/link.svg';

<img src={linkIcon} alt="" />;
```

Icon using spritesheet

```jsx
import icons from '@wbez/ferris-ds/assets/dist/sprites/wbez.svg';

<svg aria-hidden="true">
  <use xlinkHref={`${icons}#link`} />
</svg>;
```

Logo (CDN)

```html
<img
  src="//unpkg.com/@wbez/ferris-ds@:version/assets/logos/wbez/wbez-chicago-logo-oneline.svg"
  alt="WBEZ Chicago logo"
/>
```

Logo (direct)

```jsx
import logo from "@wbez/ferris-ds/assets/logos/wbez/wbez-chicago-logo-oneline.svg";

<img src={logo} alt="WBEZ Chicago logo">
```

## Folders

| directory    | description                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| assets/scss  | Various SASS files establishing our CSS framework                                                           |
| assets/icons | Sets of individual SVG icons used throughout our products                                                   |
| assets/logos | Individual SVG/PNG logos used throughout our products                                                       |
| docs         | Tools and templates to statically render documentation, code examples, and usage info for our design system |

## Adding to the CSS framework

When you add a new class, component, scss variable, mixin, etc., you'll want to add a short bit of syntax to enable it to appear in the docs. Use the boilerplate below to get started.

### SCSS docs boilerplate

> How to document a new CSS class

We use a comment parser along with some [extra logic](https://github.com/wbez/ferris-ds/blob/master/tasks/style-doc.js) to generate our docs. To add a new section of documentation, add a boilerplate above your CSS rules like the one below:

```scss
// Title of Section (root-class-name)
//
// Description {{isWide}} {{isHelper}} {{isProse}}
//
// root-class-name-modifier - desc
//
// Markup: 6-components/test/test.html
//
// Styleguide 6.0.1
//
.root-class-name {
}
```

- `{{isWide}}` is used to display the demo of each modifier at full width
- `{{isHelper}}` is used to hide main demo and only display modifiers
- `{{isProse}}` is used to wrap the demo as if it were in a prose container
- `// Deprecated` is used to signify a class to be removed.
- `// Experimental` is used to signify a class we're considering.

**Deprecated** and **Experimental** are named per [KSS syntax](https://warpspire.com/kss/syntax/).

### Naming and organization

When building CSS dispersed on a variety of platforms, it can be difficult to know where certain style rules should live and what to call them. We use the following guideline to help with those decisions as we scale our framework.

#### ITCSS

We organize our SCSS files with the [inverted triangle](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) approach in mind. We put our own spin on it by adding a `typography`, `layouts` and `blocks` folder, but the general idea is all the same; increased specificity as you move down the stylesheet.

See also Brad Frost's write-up on atomic design for the rationale behind composable components. (`components` → `blocks` → `pages`)

#### BEM

We closely follow the BEM (Block Element Modifier) class naming convention in our `components` folder, but we break BEM rules in other places. This is a deliberate attempt to create a hybrid approach of using BEM when scoped to a component and helper classes when styling globally in a more ad hoc context.

#### Namespacing

Use namespacing for quick reference of the function of a CSS class. The following key can be used as a guideline for naming your class:

---

Components

```css
.c-component-name[__<element>|-<-modifier>] {
}
```

_Example: `c-button`_

---

Typography

```css
.t-type-util {
}
```

_Example: `t-headline`_

---

Layout

```css
.l-layout-util {
}
```

_Example: `l-container`_

---

Blocks

```css
.b-block-name {
}
```

_Example: `b-site-footer`_

---

Utilities

```css
.[is|has]-state {
}
```

_Example: `has-bg-yellow`_

---

## Using this system in our products

This system is experimental and under rapid development. Use it in situations where it makes sense for the scope of your task.

**Do** use this system when...

- Coding a new template from scratch (new landing pages)
- Creating something in a isolated environment outside of legacy systems (newsletters, new static sites, UMP)

**Don't** use this system when...

- Making a small CSS change to the legacy system (tiny visual tweak to our main repo)
- The system creates an unnecessarily layer of complexity (take the path of least resistance)

---

## Publishing

Make sure you have a [personal access token](https://github.com/settings/tokens) for GitHub and that token is available as the environment variable `GITHUB_TOKEN`.

Also make sure you have a [personal access token](https://app.shortcut.com/chicagopublicmedia/settings/account/api-tokens) for Shortcut and that token is available as the environment variable `SHORTCUT_API_TOKEN`.

Make sure you're authenticated for npm publishing.

1. `npm login` - then follow the prompts
2. `npm run release`

This invokes [release-it](https://github.com/release-it/release-it), which automatically bumps the `package.json` version and drafts a release in GitHub.

The release will deploy to the production env when published.

### Semantic versioning

The npm helper we use for versioning simplifies matching version numbers with the various `MAJOR`, `MINOR`, `PATCH` increment types. For guidance on what type of release you're making, refer to [https://semver.org/](https://semver.org/)

Generally, you could base your increment type on the following list:

- MAJOR version = CSS changes that visually break layouts where `ferris-ds` is used on production
- MINOR version = CSS changes that have no visual effect on production
- PATCH version = CSS changes that fix a previous bug introduced on production or in development

### Deploying our docs

Our docs are automatically published from the `master` branch by AWS Amplify.
