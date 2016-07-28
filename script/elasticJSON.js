var Promise = require('bluebird');
var jsonfile = require('jsonfile');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
Promise.promisifyAll(fs);

var d = new Date();
d = d.toDateString();
var pathPrevDir = path.join('./../storage/', d, '/url-html/');
var elasticPath = './../storage/' + d + '/elastic/elastic_' + d + '.json';
var doc = "";
var index = -1;

function createElasticJson() {
    return fs.writeFileAsync(elasticPath, doc);
}
exports.createElasticJson = createElasticJson;

function readDirs() {
    return fs.readdirAsync(pathPrevDir);
}
exports.readDirs = readDirs;

function readFiles(pathDir) {
    return fs.readFileAsync(path.join(pathPrevDir, pathDir), 'utf8');
}
exports.readFiles = readFiles;

function flatPromiseArray(nestedArray) {
    return nestedArray.reduce(function(previousVal, currentVal) {
        return previousVal.concat(currentVal);
    }, []); // <= questo diventa previousVal alla prima iterazione
}
exports.flatPromiseArray = flatPromiseArray;

function elasticFormat(all) {
    var elasticData = JSON.parse(all);
    for (var i = elasticData.length - 1; i >= 0; i--) {
        index = index + 1;
        doc = doc + '{ "index": { "_index":"randomindex", "_type":"people", "_id": "' + index + '" } }\n' + JSON.stringify(elasticData[i]) + '\n';
    } 

}
exports.elasticFormat = elasticFormat;

function writeJSONFile() {
    console.log("Scrivo il file Elastic per il bulk dei dati!");
    return fs.appendFile(elasticPath, doc);
}
exports.writeJSONFile = writeJSONFile;

createElasticJson()
    .then(readDirs)
    .map(pathFile => readFiles(pathFile))
    .then(flatPromiseArray)
    .map(obj => elasticFormat(obj))
    .then(writeJSONFile);
