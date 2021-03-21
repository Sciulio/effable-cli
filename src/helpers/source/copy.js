const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');

const glob = require("glob");
const chalk = require('chalk');


const copySourceFactory = (templatePath, outputPath, debug, verbose) => srcItem => {
  const srcStats = statSync(srcItem);
  const isDirectory = srcStats.isDirectory();
  const isFile = srcStats.isFile();

  const srcFolder = isDirectory ? srcItem : dirname(srcItem);
  const relFolder = relative(templatePath, srcFolder);

  const outFolder = join(outputPath, relFolder);
  const outFile = isFile ? join(outFolder, basename(srcItem)) : null;

  console.log(`\t- ${relative(templatePath, srcItem)} ${isDirectory ? '' : `(${Math.round(srcStats.size / 1024 * 100) / 100}kb)`}`);
  if (verbose) {
    console.log(chalk.cyan('\t- - from        ', srcItem));
    outFile || console.log(chalk.cyan('\t- - out [folder]', outFolder));
    outFile && console.log(chalk.cyan('\t- - out [file]  ', outFile));
  }

  if (debug) {
    return;
  }

  if (!existsSync(outFolder)) {
    mkdirSync(outFolder, {
      recursive: true
    });
  }

  if (outFile) {
    const outFile = join(outFolder, basename(srcItem));

    copyFileSync(srcItem, outFile);
  }
}

module.exports = ({
  verbose,
  debug,
  template,
  outputPath
}) => {
  Object.entries(template.templates)
  .forEach(([ templateName, templatePath ]) => {
    const ioItems = glob.sync(join(templatePath, '**/*'), {
      dot: true
    });

    console.log(chalk.cyanBright(`
 Copying template's '${templateName}' source:
  from  '${templatePath}'
  to    '${outputPath}'`));
    
    ioItems
    .forEach(copySourceFactory(templatePath, outputPath, debug, verbose));
  });
}