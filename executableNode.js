#!/usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");

var getStdin = require("get-stdin");

/** yargs is an alternative to minimist to create CLI applications */
var args = require("minimist")( process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"]
} );


/**
 * to run this program we do not need to call node executable in the command line
 * instead we can run this javascript file just like an executable
 * ./executableNode.js
 *  */ 

var BASE_PATH = path.resolve(
  process.env.BASE_PATH || __dirname
)

if (args.help) {
  printHelp()
}
else if (
  args.in ||
  args._.includes("-")
) {
  getStdin().then(processContents).catch(error); 
}
else if (args.file) {
  /** // synchronous file read
  * processFile(path.join(BASE_PATH, args.file))
  * **/

  // asynchronous file read
  processFileAsync(path.join(BASE_PATH, args.file))
} else {
  error("Incorrect usage.", true)
}

// **************FS*********************

function processFile(filepath) {
  /** var contents = fs.readFileSync(filepath); // returns buffer
  * // console.log(contents) would stringify the Buffer returned by readFileSync before the processing
  * console.log("console.log(contents)", contents);
  *
  * // process.stdout.write(contents) would just return the Buffer without performing any processing operation
  * process.stdout.write(contents);
  * **/

  var contents = fs.readFileSync(filepath, "utf-8");
  console.log(contents);  
}

function processFileAsync(filepath) {
  fs.readFile(filepath, function onConetents(err, contents){
    if (err) {
      error(err.toString());
    } else {
      contents = contents.toString().toUpperCase();
      process.stdout.write(contents);
    }
  });
}

// ***************FS********************

// ************GETDTDIN*****************

function processContents(contents) {
  contents = contents.toString().toUpperCase();
  process.stdout.write(contents);
}

// ************GETDTDIN*****************

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("")
    printHelp()
  }
}

function printHelp() {
  console.log("executableNode usage:")
  console.log("  executableNode --file={FILENAME}")
  console.log("")
  console.log("--help                        print  this help")
  console.log("--file={FILENAME}             process this file")
  console.log("--in, -                       process stdin")
  console.log("")
}