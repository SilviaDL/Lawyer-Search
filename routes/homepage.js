var express = require('express');
var router = express.Router();
var elastic = require('../elasticsearch');
var http = require('http');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({name: "silvia e paolo"}) 
});  

router.get('/:inputString', function(req, res, next) {
	var query = req.param('query')
	var page = req.param('page')
	if(page==null)
		numberPage = '1';

	elastic.getSearch(query).then(function (resp) {
		if(resp.hits.hits.length == 0){
			elastic.getSuggestions(query).then(function (suggest) {
				if(suggest.docsuggest[0].options.length == 0){
					res.render('resultPage.html', {
						nonTrovato: " Non trovati",
						noSuggerimento: "Prova con un'altra chiave di ricerca",
						inputString: query,
					});
				}
		    	else {
		    		res.render('resultPage.html', {
						nonTrovato: " Non trovati",
						cercavi: "Forse cercavi: ",
						inputString: query,
						similar: suggest.docsuggest[0].options
					});
		    	}
		    }, function (err) {
		        //console.log(err)
		    });
		}
		else {
			res.render('resultPage.html', {
					trovati: "Trovati",
					inputString: query,
					pages: resp.hits.hits,
					numberPage: parseInt(page)
				});
	    }
    }, function (err) {
        //console.log(err)
    });


});

module.exports = router;
