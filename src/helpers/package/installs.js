const npm = require('npm')


module.exports = ({
  verbose,
  debug,
  outputPath
}) => new Promise((res, rej) => {
  process.chdir(outputPath);

  npm.load(function (err) {
    if (err) {
      return rej(err);
    }

    if (debug) {
      setTimeout(res);
    } else {
      npm.commands.install([], function (err, data) {
        if (err) {
          return rej(err);
        }
        res();
      });
    }

    verbose && npm.on('log', function (message) {
      console.log("message-");
      console.log(message);
    });
  });
})