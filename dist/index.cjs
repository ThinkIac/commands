var createCommandRunner, createHost, fs, path, provideCommands;

fs = require('node:fs');

path = require('node:path');

createCommandRunner = function(ports) {
  var createContext, resolveConditions, resolveMiddlewares, runMiddlewares, scan;
  ({scan, resolveConditions, createContext, resolveMiddlewares, runMiddlewares} = ports);
  return async function(workspace, name, args = {}, context = createContext()) {
    var command, commandWorkspace, commands, middlewares, packageFolder;
    packageFolder = context && context.pkg;
    commandWorkspace = packageFolder ? path.join(workspace, packageFolder) : workspace;
    if (packageFolder && (!fs.existsSync(commandWorkspace) || !fs.statSync(commandWorkspace).isDirectory())) {
      throw new Error(`Package not found: ${packageFolder}`);
    }
    commands = (await scan(commandWorkspace));
    command = commands.find(function(entry) {
      return entry.name === name;
    });
    if (!command) {
      throw new Error(`Command not found: ${name}`);
    }
    if (!(await resolveConditions(command.condition || {}, context))) {
      throw new Error(`Command not available in this context: ${name}`);
    }
    middlewares = (await resolveMiddlewares(commandWorkspace, context));
    return runMiddlewares(middlewares, context, function() {
      return command.call(args, context);
    });
  };
};

provideCommands = function(host) {
  /*
  @register module commands
  @accepts command
  @context capability
  */
  var run;
  run = createCommandRunner(host.commands);
  return {
    name: 'commands',
    phase: 'wire',
    api: {run},
    install: function() {
      host.on('command:run', (function(payload = {}, context) {
        return run(payload.workspace || host.workspace(), payload.name, payload.args, context);
      }), {
        priority: 50
      });
    }
  };
};

createHost = function(...args) {
  return require('@thinkiac/module-runtime-compat').createHost(...args);
};

module.exports = {
  provideCommands,
  createCommandRunner,
  createHost,
  createRuntimeModule: provideCommands
};
