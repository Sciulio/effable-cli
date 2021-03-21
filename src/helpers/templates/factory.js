const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob");
const chalk = require('chalk');

const stringify = item => (item ? Array.isArray(item) ? item : [item] : []).join('\n');

const appendLine = (...args) => args
.filter(Boolean)
.join('\n -\n');

function expandTemplate(templateName, templates, list, tCtx) {
  if (list.indexOf(templateName) >= 0) {
    //circular dependencies
    return;
  }

  const template = templates.find(({ name }) => name == templateName)

  if (!template) {
    throw "Error!";
  }

  if (!('version' in tCtx)) {
    tCtx.version = template.config.version;
  }

  list.push(templateName);

  (template.dependencies || [])
  .forEach(({ name }) => expandTemplate(name, templates, list, tCtx));

  Object.assign(tCtx, {
    templates: {
      ...tCtx.templates,
      [template.name]: template.path
    },

    info: appendLine(tCtx.info, template.config.info),
    alert: appendLine(tCtx.alert, template.config.alert),
    notes: appendLine(tCtx.notes, template.config.notes),

    package: {
      ...[
        ...Object.keys(tCtx.package || {}),
        ...Object.keys(template.config?.package || {})
      ]
      .reduce((accum, key) => accum.includes(key) ? accum : [
        ...accum,
        key
      ], [])
      .reduce((accum, prop) => ({
        ...accum,
        [prop]: {
          ...tCtx.package?.[prop],
          ...template.config.package?.[prop]
        }
      }), {})
    }
  });
}

module.exports = {
  lookup(templatesPath) {
    const templates = glob.sync(join(templatesPath, "*.json"))
    .reduce((accum, filePath) => {
      const name = basename(filePath, extname(filePath));
      const path = join(templatesPath, name);
      let config = JSON.parse(readFileSync(filePath).toString());

      // todo: merge with dependencies
      config = {
        ...config,
        info: stringify(config.info),
        alert: stringify(config.alert),
        notes: stringify(config.notes),
      };

      return {
        ...accum,
        [name]: {
          name,
          path,
          config,
          dependencies: null
        }
      };
    }, {});

    Object.entries(templates)
    .filter(([_, { config: { dependencies = {} } }]) => Object.keys(dependencies).length)
    .forEach(([prop, template]) => {
      template.dependencies = Object.keys(template.config.dependencies)
      .map(templateName => templates[templateName]);
    });

    return Object.entries(templates)
    .map(([name, data]) => data);
  },
  expand(name, templates) {
    const tCtx = {
      name
    };
    expandTemplate(name, templates, [], tCtx);

    return tCtx;
  }
}