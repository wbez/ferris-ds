/**
 * Create object of svg logos in a directory
 *
 * @param {Arr} dir - in/out directory
 * @returns {Object} - array of processed logos
 */

// utility packages
const glob = require('fast-glob');
const ora = require('ora');
const path = require('path');

const createLogoMap = async dirMap => {
  // find all .png and .svg files in specified icon directory
  const pngs = await glob(`${dirMap}*/**.png`);
  const svgs = await glob(`${dirMap}*/**.svg`);

  const output = {};

  [...pngs, ...svgs].forEach(img => {
    // filename
    const name = path.basename(img, path.extname(img));
    const ext = path.extname(img).slice(1);
    const filename = path.basename(img);

    if (name in output) {
      output[name][ext] = filename;
    } else {
      output[name] = { [ext]: filename };
    }
  });

  return output;
};

module.exports = async dir => {
  const spinner = ora('Creating logo map').start();
  const docs = createLogoMap(dir);
  spinner.succeed();
  return docs;
};
