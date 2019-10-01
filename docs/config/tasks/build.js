/**
 * Builds and compiles docs
 *
 */

const { icons } = require('@texastribune/queso-tools');
const styles = require('../tools/styles');
const copy = require('./copy');
const docs = require('./docs.js');

const { mappedStyles, mappedIcons, mappedCopies } = require('../paths.js');

async function build() {
  // compile and move files
  await styles(mappedStyles);
  await icons(mappedIcons);
  await copy(mappedCopies);

  // build doc data and template
  await docs();
}

build().catch(err => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});
