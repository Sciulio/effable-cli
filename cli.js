#!/usr/bin/env node

try {
  require(`${process.cwd()}/node_modules/@sciulio/effable-cli/src/main`);
} catch (e) {
  require('./src/main');
}