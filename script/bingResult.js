var Bing = require('node-bing-api')({ accKey: 'bing-Key' });
var jsonfile = require('jsonfile');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

var d = new Date();
d = d.toDateString();

var input = process.env.INPUT;

if (!input) {
    input = './../storage/names.json';
}

function readFiles() {
    console.log('LEGGO IL FILE ----------> ' + input);
    return fs.readFileAsync(input, 'utf8')
        .then(function(obj) {
            var objJSON = JSON.parse(obj);
            return objJSON.names;
        });
}
exports.readFiles = readFiles;

var getBingUrl = function(word, n, skip, timer) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            console.log('AVVIO RICERCA PER -----------> ' + word + ', SKIP ---> ' + skip);
            Bing.web(word, {
                top: 50,
                skip: 50 * skip,
                options: ['DisableLocationDetection', 'EnableHighlighting']
            }, function(error, res, body) {
                if (error) {
                    resolve(console.error('API BING ERROR --->', error));
                } else {
                    for (var i = body.d.results.length - 1; i >= 0; i--) {
                        var obj = body.d.results[i];
                        var web = {
                            'title': obj.Title,
                            'description': obj.Description,
                            'url': obj.Url
                        };
                        resolve(n.web.push(web));
                        if (i === 0) {
                            console.log('FINE RICERCA --------------> ' + n.name + ', TIMER ---> ' + timer / 1000 + 's');
                        }
                    }
                }
            });
        }, timer);
    });
};

function writeFileJSON(data) {
    var pathNextFile = path.join('./../storage/', d, '/url/', data.name + '.json');
    console.log('CREO FILE -------->', pathNextFile);
    var dataJSON = JSON.stringify(data);
    return fs.writeFile(pathNextFile, dataJSON);
}
exports.writeFileJSON = writeFileJSON;


function boh(element) {
    return new Promise(function(resolve, reject) {
        var n = {
            'name': element,
            'web': []
        };
        Promise.all([
                getBingUrl(element, n, 0, 10000),
                getBingUrl(element, n, 1, 20000),
                getBingUrl(element, n, 2, 30000),
                getBingUrl(element, n, 3, 40000),
                getBingUrl(element, n, 4, 50000),
                getBingUrl(element, n, 5, 60000),
                getBingUrl(element, n, 6, 70000)
            ])
            .then(value => {
                resolve(writeFileJSON(n));
            });
    });
}
exports.boh = boh;

readFiles()
    .then(console.log('<---------- INIZIO DELLA RICERCA DEGLI URL ---------->'))
    .map(res => boh(res), { concurrency: 1 });
