/**
 * Kicks off all the documentation runners and template compiling steps
 *
 */

const fs = require('fs-extra');
const Purgecss = require('purgecss');
const purgeHtml = require('purgecss-from-html');
const path = require('path');
const { parse: parseHtml } = require('node-html-parser');

const styleDocRunner = require('./style-doc');
const iconDocRunner = require('./icon-doc');
const logoDocRunner = require('./logo-doc');
const htmlRunner = require('./html');

const { docsStyles, docsIcons, docsLogos } = require('../paths.js');

const COMPONENT_CSS_FILE = 'all.css';
const LEGACY_CSS_FILE = 'all-legacy.css';
const COMPONENT_CSS_PATH = './docs/dist/css';

const clean = async (html, deprecated) => {
  let css = COMPONENT_CSS_FILE;
  if (deprecated) {
    css = LEGACY_CSS_FILE;
  }

  const filePath = `${COMPONENT_CSS_PATH}/${css}`;
  const purgecss = new Purgecss({
    content: [html],
    css: [filePath],
    extractors: [
      {
        extractor: purgeHtml,
        extensions: ['html'],
      },
    ],
  });
  const file = path.basename(html, path.extname(html));
  const dir = path.dirname(html);
  const purgecssResult = await purgecss.purge();
  const purgecssParsed = purgecssResult[0].css;
  // create a css file
  try {
    await fs.outputFile(`${dir}/${file}.css`, purgecssParsed);
  } catch (err) {
    throw err;
  }
  // create a styled preview
  try {
    const htmlStr = await fs.readFileSync(html, 'utf-8');
    const document = parseHtml(htmlStr);
    const htmlStyle = parseHtml(`<style>${purgecssParsed}</style>`, {
      style: true,
    });
    document.querySelector('head').appendChild(htmlStyle);

    await fs.outputFile(
      `${dir}/${file}-preview.html`,
      `<!DOCTYPE html>\n${document.toString()}`
    );
  } catch (err) {
    throw err;
  }
};

module.exports = async () => {
  // creates object for docs
  const styleDocs = await styleDocRunner(docsStyles);
  const iconDocs = await iconDocRunner(docsIcons);
  const logoDocs = await logoDocRunner(docsLogos);

  // loop through classes and add github data
  const allDocs = {
    styleDocs,
    iconDocs,
    logoDocs,
  };

  try {
    await fs.outputFile(
      './docs/dist/data/docs.json',
      JSON.stringify(allDocs, null, 2)
    );
  } catch (err) {
    throw new Error(err.message);
  }

  // creates pages
  const pagesPathIn = './docs/src/page.html';
  const pagesPathOut = './docs/dist/pages/';
  const htmlMap = styleDocs.items.map(section => {
    return {
      in: pagesPathIn,
      out: `${pagesPathOut}${section.slug}/index.html`,
      data: {
        ...section,
      },
    };
  });

  await htmlRunner(htmlMap);

  // creates previews
  const previewPathIn = './docs/src/preview.html';
  const previewPathInRaw = './docs/src/preview-raw.html';
  const previewPathOut = './docs/dist/pages/';
  const previewArr = [];
  const componentArr = [];
  styleDocs.items.forEach(section => {
    section.list.forEach(item => {
      if (item.markup.length > 0) {
        const out = `${previewPathOut}${section.slug}/${item.mainClass}`;
        // build preview
        previewArr.push({
          in: previewPathIn,
          out: `${out}.html`,
          data: {
            ...item,
          },
        });

        // build raw preview
        componentArr.push({
          in: previewPathInRaw,
          out: `${out}/raw.html`,
          data: item,
        });
      }
    });
  });

  await htmlRunner(previewArr);
  await htmlRunner(componentArr);

  // generate component CSS
  await Promise.all(
    componentArr.map(component =>
      clean(component.out, component.data.deprecated)
    )
  );

  // creates main
  const mainPathIn = './docs/src/index.html';
  const mainPathOut = './docs/dist/index.html';
  const mainMap = {
    in: mainPathIn,
    out: mainPathOut,
    data: allDocs,
  };

  await htmlRunner([mainMap]);

  return 'Generated docs';
};
