// source: https://github.com/texastribune/queso-tools/blob/master/lib/styles.js
// Modified to use local compile

const ora = require('ora');
const fs = require('fs-extra');
const { isProductionEnv } = require('@texastribune/queso-tools/lib/env');
const { SCSS_SUCCESS } = require('@texastribune/queso-tools/lib/constants');
const hashFiles = require('@texastribune/queso-tools/lib/hash-files');
const compile = require('./compile');

const spinner = ora();

const processSass = async dirMap => {
  const file = dirMap.in;
  const { out } = dirMap;
  try {
    if (fs.existsSync(file)) {
      // compile scss
      let css = '';
      try {
        css = await compile({
          isMin: isProductionEnv,
          outFile: out,
          sourceMapOn: !isProductionEnv,
          isAmp: false,
          file,
        });
      } catch (err) {
        throw new Error(err.formatted);
      }
      // write out compiled css specified output directory
      try {
        await fs.outputFile(out, css);
        spinner.info(`Compiled: ${out}`);
        if (css.length < 1) {
          spinner.warn(`No CSS output in: ${out}`);
        }
      } catch (err) {
        throw new Error(err.message);
      }

      // generate cache busted files
    } else {
      spinner.warn(`${file} does not exist.`);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = async (dirs, manifest) => {
  spinner.start('Compile SCSS');
  await Promise.all(dirs.map(dirMap => processSass(dirMap)));
  spinner.succeed();

  // if manifest, assume hashed files are needed
  if (typeof manifest !== 'undefined') {
    await hashFiles(dirs, manifest);
  }

  return SCSS_SUCCESS;
};
