var Bing = require('node-bing-api')({ accKey: "Avz6XU0BwrFDxpOClR75ahxB7kKyZ8zO8ngbpBhPeVQ" });
var fs = require('fs');

var d = new Date();
d = d.toDateString();

if (process.env.urlDir) {
    var urlDir = process.env.urlDir;
}

// ogni giorno viene creata una nuova dir per immagazzinare i dati
var parent_dir = './../storage/' + d + '/';
// sottodirectory per salvataggio dei dati
var paths = [
    'elastic/',
    'html/',
    'url/',
    'url-html/',
];


// cancella in maniera ricorsiva una directory e tutto il suo contenuto
var deleteFolderRecursive = function(path) {
    // la cartella url contiene un file creato tramite richiesta a Bing
    // essendo le richieste a Bing limitate conviene eliminarla solo se necessario
    console.log('delete directory ---> ', path);
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

// crea le sottodirectory con dello storage nella cartella versionata
var createOtherDir = function() {
    for (var i = 0; i < paths.length; i++) {
        var completePath = parent_dir + paths[i];
        if (!fs.existsSync(completePath)) {
            fs.mkdirSync(completePath);
            console.log('create directory ---> ', completePath);
        } else {
            deleteFolderRecursive(completePath);
        }
    }
};

// crea la cartella versionata(giorno per giorno)
var createFolder = function() {
    if (fs.existsSync(parent_dir)) {
        deleteFolderRecursive(parent_dir);
        console.log('--------------------------------------------');
    }
    console.log('create directory ---> ', parent_dir);
    fs.mkdirSync(parent_dir);
    // eseguo funzione che crea sottodirectory
    createOtherDir();

};

createFolder();
