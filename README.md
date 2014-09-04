# uh

Uhray Projects toolbelt. Handles any commands and information you want to store around a project.

### Install

```
npm install -g git://github.com/uhray/uh.git
```

### Create a project

```
$ uh create
Project name: testproject
Project description: this is my description
```

### View Projects

```
$ uh
Projects:
 testproject: this is my description

uh create 		    # creates project
uh delete PROJECT 	# creates project
uh PROJECT 		    # lists project key - variable
uh PROJECT key 		# runs the value for this key as a command
```

### View Project Information

```
$ uh testproject
=== Project testproject
description: this is my description
```

### Add/Edit/remove Information

```
$ uh testproject description "updated description"  # edit info
set `description` to `updated description`
$ uh testproject key value                          # add info
set `key` to `value`
$ uh testporject key ''                             # remove info
removed key `key`
```

### Run stored command

If you have set a key/value to be a command, then you can run the command here.

Example:

```
$ uh testproject db 'mongo kahana.mongohq.com:PORT/DBNAME  -u user -p password' # set db to be database command
$ uh testproject db
MongoDB shell version: 2.4.5
connecting to: kahana.mongohq.com:PORT/DBNAME
> _
```
