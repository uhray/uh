#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs'),
    rl = require('readline-sync'),
    child = require('child_process'),
    cfgfile = argv.config || argv.c ||
              path.join(process.env.HOME, '.uh.config.json'),
    cfg = get_config(),
    proj = argv._.shift(),
    help = argv.h || argv.help;

if (help) return doHelp();
if (!proj) return list_projects();
if (proj == 'create') return create_project();
if (proj == 'delete') return delete_project();
else if (!argv._.length) return doProject();
else if (argv._.length > 1) return setValue();
else return doCommand();


// Commands ====================================================================

function doHelp() {
  console.log('Usage: uh [PROJECT] [key] [value] [--config path/to/config.json]');
  console.log();
  console.log('uh \t\t\t# lists projects');
  console.log('uh create \t\t# creates project');
  console.log('uh delete PROJECT \t# creates project');
  console.log('uh PROJECT \t\t# lists project key - variable');
  console.log('uh PROJECT key \t\t# runs the value for this key as a command');
  console.log();
  console.log('You can pass a custom config file with --config or -c');
}

function list_projects() {
  var k;
  if (Object.keys(cfg.projects).length) {
    console.log('Projects:');
    for (k in cfg.projects) {
      console.log(' %s: %s', k, cfg.projects[k].info.description || '');
    }
  } else console.log('No Projects');
  console.log('');
  console.log('uh create \t\t# creates project');
  console.log('uh delete PROJECT \t# creates project');
  console.log('uh PROJECT \t\t# lists project key - variable');
  console.log('uh PROJECT key \t\t# runs the value for this key as a command');
}

function doProject() {
  var p = cfg.projects[proj],
      max = -Infinity,
      k;

  if (!p) console.error('no project `%s`', proj), process.exit();

  console.log('=== Project %s', proj);
  for (k in p.info) max = Math.max(k.length, max);
  for (k in p.info) console.log('%s %s', pad(k + ':', max + 1), p.info[k]);
}

function setValue() {
  var p = cfg.projects[proj],
      key = argv._.shift(),
      val = argv._.shift();

  if (!p) console.error('no project `%s`', proj), process.exit();

  if (val) p.info[key] = val;
  else delete p.info[key];

  write_config(cfg);

  if (val) console.log('set `%s` to `%s`', key, val);
  else console.log('removed key `%s`', key)
}

function doCommand() {
  var p = cfg.projects[proj],
      key = argv._.shift(),
      cmd = p && p.info && p.info[key],
      args;

  if (!p) console.error('no project `%s`', proj), process.exit();
  if (!cmd) console.error('no value `%s`', key), process.exit();

  args = cmd.match(/"[^"]+"|[^"^ ]+/g);
  cmd = args.shift();
  console.log('cmd', cmd);
  console.log('args: %j', args);
  child.spawn(cmd, args, { stdio: 'inherit' });
}


// Utils =======================================================================

function get_config() {
  var p = cfgfile,
      cfg, str;
  if (fs.existsSync(p)) {
    str = fs.readFileSync(p);
    try { cfg = JSON.parse(str); }
    catch(e) {
      console.error('config file incorrectly formatted JSON');
      process.exit();
    }
    return cfg;
  } else {
    cfg = { projects: {} };
    write_config(cfg);
    fs.writeFileSync(p, JSON.stringify(cfg));
    return cfg;
  }
}

function write_config(cfg) {
  fs.writeFileSync(cfgfile, JSON.stringify(cfg, undefined, 2));
}

function delete_project() {
  var proj = argv._.shift();
  if (cfg.projects[proj]) {
    delete cfg.projects[proj];
    write_config(cfg);
  } else {
    console.log('no project `%s`', proj);
  }
}

function create_project() {
  var name, description;

  while (!name) {
    while (!name) name = rl.question('Project name: ');
    if (cfg.projects[name]) name = console.log('name `%s` is taken', name);
  }
  while (!description) description = rl.question('Project description: ');

  cfg.projects[name] = {
    info : {
      description: description,
    }
  }

  write_config(cfg);
}

function merge(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}

function pad(x, n, o) {
  var opts = merge({
        sep: ' ',
        right: true
      }, o || {});

  if (opts.right) while (x.length < n) x += opts.sep;
  else while (x.length < n) x = opts.sep + x;
  return x;
}
