var request = require("request");
var cheerio = require('cheerio');
var util = require('util');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var Promise = require('bluebird');
Promise.promisifyAll(fs);
var htmlparser = require("htmlparser2");

var d = new Date();
d = d.toDateString();
var pathPrevDir = path.join('./../storage/', d, '/url/');

// leggo i file nella dir pathPrevDir
// e ritorno un array di questi
function readFiles() {
    return fs.readdirAsync(pathPrevDir);
}
exports.readFiles = readFiles;

function cleanHTML(html) {
    return new Promise(function(resolve, reject) {
        if (html) {
            var new_html = "";
            var x = true 
              var parser = new htmlparser.Parser({
                  onopentag: function(name, attribs){
                      if(name === "script" || name == "style"){
                          x = false
                      }
                  },
                  ontext: function(text){
                      if (x)
                        new_html = new_html + " " + text.trim();
                  },
                  onclosetag: function(tagname){
                      if(tagname === "script"){
                          x = true
                      }
                  }
              }, {decodeEntities: true});
              parser.write(html);
              parser.end();
            console.log(chalk.cyan('CLEAN HTML FILE.........'));
            resolve(new_html.replace(/[^a-z0-9|\\|\.|\,|\;|\!|\(|\)|\@]/gmi, " "));
        } else {
            resolve("");
        }
    });
}
exports.cleanHTML = cleanHTML;

var cont = 0;

function download(web) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            cont = cont + 1;
            console.log(chalk.white.bgYellow(new Date().toISOString() + ' - NOME --------> ' + web.name));
            console.log(chalk.magenta(new Date().toISOString() + ' - CONTATORE --------> ' + cont));
            request({
                url: web.url,
                rejectUnauthorized: true,
                strictSSL: false,
                encoding: 'utf-8',
                json: true
            }, function(error, response, html) {
                if (error) {
                    resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR REQUEST --------> ' + error + ' | ' + web.url)));
                } else {
                    if (response.statusCode === 200 || response.statusCode === 999) {
                        cleanHTML(html)
                            .then(function(new_html) {
                                var titleRegex = new RegExp('(?![\x00-\x7F]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})', 'g');
                                var new_title = web.title.replace(titleRegex, "");
                                var infoPage = {
                                    "name": web.name,
                                    "title": new_title,
                                    "description": web.description,
                                    "url": web.url,
                                };
                                var infoPageString = JSON.stringify(infoPage);
                                //var allHml = '<!--INFO' + infoPageString + 'INFO-->\n' + html;
                                var allHml = '<!--INFO' + infoPageString + 'INFO-->\n' + new_html;
                                // var pathHtmlFile = path.join('./../storage/', d, '/html/', web.name, '/', web.name, '_page', web.page, '.html');
                                var pathHtmlFile = './../storage/' + d + '/html/' + web.name + '/' + web.name + '_page' + web.page + '.html';
                                resolve(console.log(chalk.green(new Date().toISOString() + ' - WRITE FILE ---> ' + response.statusCode + ' | ' + pathHtmlFile)));
                                resolve(writeHTMLFile(web, allHml));

                            });
                    } else {
                        resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR FILE ---> ' + response.statusCode + ' | ' + web.url)));
                    }
                }

            });
        }, 5000);

    });
}
exports.download = download;

function writeHTMLFile(web, data) {
    var filePath = `./../storage/${d}/html/${web.name}/${web.name}_page-${web.page}.html`;
    // var pathHtmlFile = './../storage/' + d + '/html/' + web.name + '/' + web.name + '_page' + web.page + '.html';
    return fs.writeFileSync(filePath, data);
}
exports.writeHTMLFile = writeHTMLFile;

function createFolder(allPath) {
    var onlyName = allPath.split('.json')[0];
    var pathNextDir = path.join('./../storage/', d, '/html/', onlyName);
    return fs.statAsync(pathNextDir).return(allPath)
        .catch(err => fs.mkdirAsync(pathNextDir));
}
exports.createFolder = createFolder;

function getFileUrl(filePath) {
    var jsonFile = path.join(pathPrevDir, filePath);
    return fs.readFileAsync(jsonFile, 'utf8')
        .then(JSON.parse)
        .then(jsonData => {
            return jsonData.web.map(function(webObj, index) {
                return {
                    name: jsonData.name,
                    page: index,
                    url: webObj.url,
                    description: webObj.description,
                    title: webObj.title
                };
            });
        });
}
exports.getFileUrl = getFileUrl;

function flatPromiseArray(nestedArray) {
    return nestedArray.reduce(function(previousVal, currentVal) {
        return previousVal.concat(currentVal);
    }, []); // <= questo diventa previousVal alla prima iterazione
}
exports.flatPromiseArray = flatPromiseArray;

readFiles()
    .map(dir => createFolder(dir))
    .map(file => getFileUrl(file))
    .then(flatPromiseArray)
    // ho un array di oggetti web da cui devo scaricare l'HTML
    //.each(html => download(html))
    .map(html => download(html), { concurrency: 3 })
    .catch(err => {
        chalk.red(console.error(new Date().toISOString() + ' - ERROR PROMISE --->' + err));
    });