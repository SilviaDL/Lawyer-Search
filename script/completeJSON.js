var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
Promise.promisifyAll(fs);

var d = new Date();
d = d.toDateString();
var pathPrevDir = path.join('./../storage/', d, '/html/');
var pathNextDir = path.join('./../storage/', d, '/url-html/');

var myMap = new Map();

//creo un array di directory delle pagine html
function readDirs() {
    return fs.readdirAsync(pathPrevDir);
}
exports.readDirs = readDirs;

//creo un file per ogni directory
function createFileJson(name) {
    var filePath = `./../storage/${d}/url-html/${name}.json`;
    chalk.red(console.log('nuovo file: ' + name));
    return fs.writeFileAsync(filePath, '').return(name);
}
exports.createFileJson = createFileJson;

//creo un array dei file pagine html divise per directory
function readFiles(pathDir) {
    return fs.readdirAsync(path.join(pathPrevDir, pathDir));
}
exports.readFiles = readFiles;

//creo un array di tutte le pagine html
function aggregate(nestedArray) {
    return nestedArray.reduce(function(previousVal, currentVal) {
        return previousVal.concat(currentVal);
    }, []); // <= questo diventa previousVal alla prima iterazione
}
exports.aggregate = aggregate;

function addMap(elem) {
    var values = [];
    if (myMap.has(elem.name)) {
        values = myMap.get(elem.name);
    }
    values.push(elem);
    myMap.set(elem.name, values);
}
exports.addMap = addMap;

function getHTML(htmlPath) {
    var nameDir = htmlPath.substring(htmlPath.lastIndexOf("/") + 1, htmlPath.lastIndexOf("_"));
    var htmlFile = path.join(pathPrevDir, nameDir, htmlPath);
    return fs.readFileAsync(htmlFile, 'utf8')
        .then(htmlPage => {
            var infoComment = htmlPage.split('<!--INFO');
            var info = infoComment[1].split('INFO-->');
            var allHtml = JSON.parse(info[0]);
            var html = info[1].toString();
            allHtml.content = html;
            return addMap(allHtml);
        }, function(err) {
            console.log(err);
        });

}
exports.getHTML = getHTML;

function writeJSONFile() {
    console.log("writeJSONFile");
    myMap.forEach(function(value, key, map) {
        var filePath = `./../storage/${d}/url-html/${key}.json`;
        console.log("scrivo i dati di: " + key);
        return fs.appendFile(filePath, JSON.stringify(value));
    });
}
exports.writeJSONFile = writeJSONFile;

readDirs()
    .map(name => createFileJson(name))
    .map(d => readFiles(d))
    .then(aggregate)
    .map(file => getHTML(file), { concurrency: 1 })
    .then(function() {
        writeJSONFile();
    })
    .catch(err => {
        console.error(chalk.red('ERROOOOOOOOOOOR ------->' + err));
    });
