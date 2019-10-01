// utility packages
const fs = require('fs-extra');
const glob = require('fast-glob');
const ora = require('ora');
const path = require('path');

// icon packages
const SVGO = require('svgo');
const svgstore = require('svgstore');

// internal
const { SVG_SUCCESS } = require('@texastribune/queso-tools/lib/constants');

const spinner = ora();

const SVGOInstance = new SVGO({
  plugins: [
    {
      removeViewBox: false,
    },
  ],
});

const addSprite = async (currentSVG, spriteInstance) => {
  // filename
  const svgFilename = path.basename(currentSVG, path.extname(currentSVG));

  // extract svg contents
  const svgContents = fs.readFileSync(currentSVG, 'utf-8');

  // use SVGO to optimize contents string
  const optimized = await SVGOInstance.optimize(svgContents, {
    path: currentSVG,
  });

  // clean original file
  await fs.writeFileSync(currentSVG, optimized.data, 'utf-8');

  try {
    // add to optimized to sprite instance
    spriteInstance.add(svgFilename, optimized.data);
  } catch (e) {
    throw e;
  }
  return svgFilename;
};

const processSVGs = async dirMap => {
  const input = dirMap.in;
  let svgs = input;

  // check if a whole directory is passed
  if (typeof input === 'string' && !path.extname(input)) {
    svgs = await glob(`${input}/*.svg`);
    // check if dir is empty
    if (svgs.length < 1) {
      spinner.warn(`No icons found in ${input}`);
    }
  }

  // create a new svgstore instance
  const sprites = svgstore({
    svgAttrs: {
      xmlns: 'http://www.w3.org/2000/svg',
    },
  });

  // loop through each icon and compile sprite
  await Promise.all(svgs.map(svg => addSprite(svg, sprites)));

  // create svg element out of new sprite
  const svg = sprites.toString({ inline: true });

  // write sprite to dir
  try {
    await fs.outputFile(dirMap.out, svg);
  } catch (err) {
    throw err;
  }

  return SVG_SUCCESS;
};

module.exports = async dirs => {
  spinner.start('Build icons');

  return Promise.all(dirs.map(dirMap => processSVGs(dirMap)))
    .then(resp => {
      spinner.succeed();
      return resp;
    })
    .catch(error => {
      spinner.fail();
      throw new Error(error.message);
    });
};
