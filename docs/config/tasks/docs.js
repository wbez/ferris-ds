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

const {
  docsStyles,
  docsIcons,
  docsLogos,
  mappedGithubData,
} = require('../paths.js');

const COMPONENT_CSS_FILE = 'all.css';
const COMPONENT_CSS_PATH = './docs/dist/css';

const clean = async html => {
  const css = COMPONENT_CSS_FILE;

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

const merge = async styles => {
  let github = {};
  try {
    github = await fs.readJson(mappedGithubData.out).then(d => d.items);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return styles;
  }
  const items = styles.items.map(section => {
    const list = section.list.map(classInfo => {
      const { mainClass } = classInfo;

      // set githubData
      let githubData = [];
      if (
        typeof github[mainClass] !== 'undefined' &&
        !github[mainClass][0].isParameter
      ) {
        githubData = github[mainClass][0].searchDataArr;
      }

      // set modifiers
      const modifiers = classInfo.modifiers.map(modifier => {
        const { className } = modifier;
        let githubDataMod = [];

        try {
          githubDataMod = github[mainClass].find(d => d.className === className)
            .searchDataArr;
        } catch (err) {
          if (err instanceof TypeError) {
            // do nothing
          } else {
            // eslint-disable-next-line no-console
            console.error(err);
          }
        }

        return {
          ...modifier,
          githubData: githubDataMod,
        };
      });

      // set parameters
      const parameters = classInfo.parameters.map(parameter => {
        const { name: className } = parameter;
        let githubDataParam = [];

        try {
          githubDataParam = github[mainClass].find(
            d => d.className === className
          ).searchDataArr;
        } catch (err) {
          if (err instanceof TypeError) {
            // do nothing
          } else {
            // eslint-disable-next-line no-console
            console.error(err);
          }
        }

        return {
          ...parameter,
          githubData: githubDataParam,
        };
      });

      // set colors
      const colors = classInfo.colors.map(color => {
        const { name: className } = color;
        let githubDataColor = [];
        if (typeof github[mainClass] !== 'undefined') {
          githubDataColor = github[mainClass].find(
            d => d.className === className
          ).searchDataArr;
        }

        return {
          ...color,
          githubData: githubDataColor,
        };
      });

      // approximate github reference count
      let githubUrls = [];

      const getUrls = data =>
        data
          .map(d => d.results)
          .flat()
          .map(d => d.url);

      githubUrls = githubUrls.concat(getUrls(githubData));

      githubUrls = githubUrls.concat(
        getUrls(modifiers.map(d => d.githubData).flat())
      );

      githubUrls = githubUrls.concat(
        getUrls(parameters.map(d => d.githubData).flat())
      );

      githubUrls = githubUrls.concat(
        getUrls(colors.map(d => d.githubData).flat())
      );

      const githubCount = [...new Set(githubUrls)].length;

      // final return
      return {
        ...classInfo,
        githubCount,
        githubData,
        modifiers,
        parameters,
        colors,
      };
    });
    return {
      ...section,
      list,
    };
  });
  return {
    ...styles,
    items,
  };
};

module.exports = async () => {
  // creates object for docs
  let styleDocs = await styleDocRunner(docsStyles);
  const iconDocs = await iconDocRunner(docsIcons);
  const logoDocs = await logoDocRunner(docsLogos);

  // add github data
  try {
    styleDocs = await merge(styleDocs);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }

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
  await Promise.all(componentArr.map(component => clean(component.out)));

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
