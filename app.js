var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/homepage');
var app = express();
var engines = require('consolidate');
var fs = require("fs")

//la homepage la deve prendere dalla cartella public
app.use(express.static(__dirname + '/public'));
app.use('/', routes);

//le pagine sono in html
app.set('views', __dirname + '/public');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

//porta di ascolto 3000
app.listen(3000, function () {
  console.log('App listening on port 3000!');
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// gestione dell'errore
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

//leggo il file contenente le informazioni per il bulk in elasticsearch
//var d = new Date();
//d = d.toLocaleDateString();

var dir = './storage/demo/elastic/elastic_demo.json';

fs.readFile(dir, function (err, data) {
   if (err) {
       return console.error(err);
   }
   else {
    var array = data.toString().split('\n');

    //preparo elastichsearch e carico i dati
    var elastic = require('./elasticsearch');  
    elastic.indexExists().then(function (exists) {  
      if (exists) {
        return elastic.deleteIndex();
      }
    }).then(function () {
      return elastic.initIndex().then(function () {
        elastic.addInBulk(array);
        });
    });
  }
});

module.exports = app;
