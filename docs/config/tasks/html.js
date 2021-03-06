/**
 * Generates static files of nunjucks templates based on data passed along in param
 *
 * @param {Arr} mappedHTML - in/out/data directory
 * @returns {Arr} - array completed templates
 */

// utility packages
const fs = require('fs-extra');
const ora = require('ora');

// html packages
const nunjucks = require('nunjucks');

const { mappedGithubData } = require('../paths.js');

const processHTML = async dirMap => {
  try {
    const env = nunjucks.configure('./');

    // pass npm package version to template
    const { npm_package_version } = process.env; // eslint-disable-line camelcase

    const { updated } = await fs.readJson(mappedGithubData.out);

    const githubUpdated = new Date(updated).toLocaleDateString('en-us', {
      timeZone: 'America/Chicago',
      dateStyle: 'medium',
    });

    const rendered = env.render(dirMap.in, {
      ...dirMap.data,
      npm_package_version,
      githubUpdated,
    });
    fs.outputFile(dirMap.out, rendered);
    return `✓ ${dirMap.out}`;
  } catch (err) {
    throw err;
  }
};

module.exports = async mappedHTML => {
  const spinner = ora('Building HTML templates').start();
  // loop through each file found and process our sass
  return Promise.all(mappedHTML.map(dirMap => processHTML(dirMap)))
    .then(resp => {
      spinner.succeed();
      return resp;
    })
    .catch(error => {
      throw new Error(error.message);
    });
};
