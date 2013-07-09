#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var sys = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertURLExists = function(infile) {
    var instr = infile.toString();
    if (instr) {
        restler.get(instr).on('complete', function(result) {
              if (result instanceof Error) {
                console.log("Error: " + result.message);
                process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
              }
              saved=fs.writeFileSync('bla.html',result,'utf8');
              var checkJson = checkHtmlFile('bla.html', program.checks);
              var outJson = JSON.stringify(checkJson, null, 4);
              console.log(outJson);
              fs.unlinkSync('bla.html');
          });
        return infile.toString();
    }
    return instr;
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        return "";
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var logChecks = function(filepath) {
    //Log Checks from file or downloaded file
    var checkJson = checkHtmlFile(filepath, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_html_file>', 'URL of html to check', clone(assertURLExists), "")
        .option('-f, --file <html_file>', 'Path to html (if no URL)', clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);
    if (program.url.length==0) { //No URL?  Make sure we have a file then
        if (assertFileExists(program.file)) { //URLs are handled in a callback, do files here
            logChecks(program.file);
        }
        else { 
            console.log("No URL or file specified. Exiting.", instr);
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        }
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
