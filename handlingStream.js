#!/usr/bin/env node

// ? read substack/stream-handbook on github

"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform
var zlib = require("zlib")

/** yargs is an alternative to minimist to create CLI applications */
var args = require("minimist")( process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"],
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

var OUT_PATH = path.join(BASE_PATH, "out.txt");
  
if (args.help) {
  printHelp()
}
else if (
  args.in ||
  args._.includes("-")
) {
   processFile(process.stdin);
}
else if (args.file) {
  // creating a readStream on the given file path
  let stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  processFile(stream)
} else {
  error("Incorrect usage.", true)
}

// ************GETSTDIN*****************

/**handles stream and allows us to do operation on readable stream and
 * pipes it to a writeable stream. Using stream we only take upto 65000 megabytes
 * long data to the memory at a time and perform operation, in this case 
 * perform some operation and dump ot to stdout
 * 
 * In order to perform operations on readable streams we have transform 
 * streams. In Node js we can use Transform class from "stream" library
 *  */
function processFile(inStream) {
  var outStream = inStream;

  // 
  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
  }
  
  // transform function that uppercase the input stream
  var upperStream = new Transform({
    transform(chunk, enc, cb) {
      this.push(chunk.toString().toUpperCase());
      cb();
    }
  })
  // piping the outStream and reassigning it to the outStream
  var outStream = outStream.pipe(upperStream);
  
  // create a zlib Gzip stream and piping it to the outStream
  if (args.compress) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUT_PATH = `${OUT_PATH}.gz`;
  }

  var targetStream;
  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUT_PATH);
  }

  outStream.pipe(targetStream);
}

// ************GETSTDIN*****************

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("")
    printHelp()
  }
}

function printHelp() {
  console.log("handleStream usage:")
  console.log("  handleStream.js --file={FILENAME}")
  console.log("")
  console.log("--help                        print  this help")
  console.log("--file={FILENAME}             process this file")
  console.log("--in, -                       process stdin")
  console.log("--out                         print to stdout")
  console.log("--compress                    gzip the output")
  console.log("--uncompress                  un-gzip the input")
  console.log("")
}