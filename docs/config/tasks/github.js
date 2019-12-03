/**
 * Fetches GitHub data from s3 and writes to JSON file
 *
 */

const ora = require('ora');
const fs = require('fs-extra');

const { mappedGithubData } = require('../paths.js');

module.exports = async () => {
  const spinner = ora();
  spinner.start('Copying GitHub data from src');
  // add github data
  try {
    await fs.copyFile(mappedGithubData.in, mappedGithubData.out);
    spinner.succeed('Wrote GitHub data');
  } catch (err) {
    spinner.fail('Did not copy data');
    throw new Error(err.message);
  }
};
