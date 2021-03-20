const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const chalk = require('chalk');


module.exports = (templatePath, outputPath, verbose) => srcItem => {
  const srcStats = statSync(srcItem);
  const isDirectory = srcStats.isDirectory();

  const srcFolder = isDirectory ? srcItem : dirname(srcItem);
  const relFolder = relative(templatePath, srcFolder);

  const outFolder = join(outputPath, relFolder);
  const outFile = srcStats.isFile() ? join(outFolder, basename(srcItem)) : null;

  console.log('\t- ', relative(templatePath, srcItem), isDirectory ? '' : `(${Math.round(srcStats.size / 1024 * 100) / 100}kb)`);
  if (verbose) {
    console.log(chalk.cyan('   - from        ', srcItem));
    outFile || console.log(chalk.cyan('   - out [folder]', outFolder));
    outFile && console.log(chalk.cyan('   - out [file]  ', outFile));
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