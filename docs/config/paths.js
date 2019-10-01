const buildDir = './docs/dist/';

const mappedStyles = [
  {
    in: './docs/src/scss/ds.scss',
    out: `${buildDir}css/ds.css`,
  },
  {
    in: './assets/scss/all.scss',
    out: `${buildDir}css/all.css`,
  },
  {
    in: './assets/scss/all.scss',
    out: `./assets/dist/css/all.css`,
  },
  // {
  //   in: './assets/scss/all-legacy.scss',
  //   out: `${buildDir}css/all-legacy.css`,
  // },
  {
    in: './assets/scss/no-resets.scss',
    out: `${buildDir}css/no-resets.css`,
  },
  {
    in: './assets/scss/all.scss',
    out: `./assets/dist/css/no-resets.css`,
  },
];

const docsStyles = './assets/scss';

const mappedIcons = [
  {
    in: './assets/icons/wbez/',
    out: `${buildDir}sprites/wbez.svg`,
  },
  {
    in: './assets/icons/wbez/',
    out: `./assets/dist/sprites/wbez.svg`,
  },
];

const docsIcons = ['./assets/icons/'];

const docsLogos = ['./assets/logos'];

const mappedCopies = [
  {
    in: './docs/src/img',
    out: `${buildDir}img`,
  },
  {
    in: './docs/src/js',
    out: `${buildDir}js`,
  },
  {
    in: './assets/logos',
    out: `${buildDir}logos`,
  },
  {
    in: './docs/src/favicon.ico',
    out: `${buildDir}favicon.ico`,
  },
];

module.exports = {
  mappedStyles,
  docsStyles,
  mappedIcons,
  docsIcons,
  docsLogos,
  mappedCopies,
  buildDir,
};
