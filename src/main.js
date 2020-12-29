const generate = require("./generate");


const [task, ...args] = process.argv.slice(2);


switch(task) {
  case 'generate':
    generate();
    break;
  default:
    console.log('Nothing to do!');
}