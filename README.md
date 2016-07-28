# lawyer-search

**Script per Estrazione ed elaborazione delle pagine**

- cd script

- node createStruct.js ---> crea storage relativo al giorno in cui si esegue lo script. ATTEZIONE se lo si rilancia elimina tutto e ricrea la cartella vuota

- node bingResult.js: crea un file json per ogni persona con la lista degli oggetti tornati da bing. Ogni oggetto è del formato: {title: “...”, description:”...”, url: ”...”}. La lista dei nomi si trova nella cartella storage, file names.json
(NOTA: la chiave di bing è stata omessa dalla pubblicazione)

- node extractHTML.js: per ogni persona estrae tutti gli html degli url tornati da bing, li pulisce e li salva in diversi file all'interno della cartella. 

- node completeJSON.js: crea un oggetto json per ogni persona nel formato:  {name: “...”, title: “...”, description: “...”, url: “...”, content: “...” }

- node elasticJSON.js: crea un file unico con i json di tutte le persone nel formato richiesto dalle bulk API di Elasticsearch.

**DEMO**

Avviare Elasticseach (dalla sua directory):
	- ./bin/elasticsearch

Scaricare la repository da GitHub:
	- git clone --------

Istallare le dipendenze:
	- cd -----------
	- npm install

Eseguire il comando:
	- node app.js

Dal browser andare alla pagina:
	- localhost:3000
	
* Note: Per la Demo sono state indicizzate circa 50 pagine a persona per 45 persone. L'elenco delle persone indicizzate si trova nel file names.json della cartella storage.