const npm = require('npm')

const inquirer = require('inquirer');
const chalk = require('chalk');


module.exports = ({
  verbose,
  debug,
  outputPath
}) => new Promise(async (res, rej) => {
  const name = 'Install Packages';

  const { [name]: userResponse } = await inquirer
  .prompt({
    type: 'confirm',
    name,
    message: "do you want to install packages now?",
    default: false
  });

  if (!userResponse) {
    res(false);
    return;
  }

  console.log(chalk.cyan(`\tchanging current directory to '${outputPath}'`));

  process.chdir(outputPath);

  npm.load(function (err) {
    if (err) {
      return rej(err);
    }

    if (debug) {
      setImmediate(res, true);
    } else {
      npm.commands.install([], function (err, data) {
        if (err) {
          return rej(err);
        }

        res(true);
      });
    }

    verbose && npm.on('log', function (message) {
      console.log("message-");
      console.log(message);
    });
  });
})