var elasticsearch = require('elasticsearch');
var http = require('http');

var elasticClient = new elasticsearch.Client({  
    host: 'localhost:9200',
    log: 'info'
});

var indexName = "randomindex";


// Delete an existing index

function deleteIndex() {  
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;


// create the index

function initIndex() {  
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;


//check if the index exists

function indexExists() {  
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;  

// inizialize
function initMapping() {  
    return elasticClient.indices.putMapping({
        index: indexName,
        type: "people",
        body: {
            properties: {
                name: { type: "string" },
                title: { type: "string" },
                url: { type: "string" },
                description: { type: "string" },
                content: { type: "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.initMapping = initMapping;

function addInBulk(array) {
    return elasticClient.bulk({
        body: array
        }, function (err, resp) {
            if(err){
                console.log("errore nel bulk dei dati" + err )
            }
            else{
                console.log("dati inseriti correttamente")
            }
        }
)}
exports.addInBulk = addInBulk;

/*function addDocument(document) {  
    return elasticClient.index({
        index: indexName,
        type: "people",
        body: {
            name: document.name,
            title: document.title,
            url: document.url,
            description: document.description,
            content: document.content,
            suggest: { 
                input: document.content.split(" ").concat(document.title.split(" ").concat(document.name.split(" ").concat(document.description.split(" ")))),
                payload: document.metadata || {}
            }
        }
    });
}
exports.addDocument = addDocument; */

function getCompletion(input) {  
    return elasticClient.suggest({
        index: indexName,
        type: "people",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: "content",
                    fuzzy: true 
                }
            }
        }
    })
}
exports.getCompletion = getCompletion;

function getSuggestions(input) {  
    return elasticClient.suggest({
        index: indexName,
        type: "people",
        body: {
           docsuggest: {
                text: input,
                phrase: {
                    field : "_all",
                    size : 5,
                    real_word_error_likelihood : 0.85,
                    max_errors : 0.5,
                    gram_size : 2,
                    direct_generator : [ {
                      field : "_all",
                      suggest_mode : "always",
                      min_word_length : 2
                    } ],
                }
            }
        }
    })
}
exports.getSuggestions = getSuggestions;

function getSearch(input) {  
    return elasticClient.search({
      index: indexName,
      type: "people",
      body: {
        size: 1000,
        query: {
          multi_match: {
            query: input,
            operator: "and",
            type: 'best_fields',
            fields: ['title^3', 'name^2', 'content', 'description^2'],
            tie_breaker: 0.5
          }
        }
      }
    })
}

exports.getSearch = getSearch;
