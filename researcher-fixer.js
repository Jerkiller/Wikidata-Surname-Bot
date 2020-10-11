
fixResearchers();

async function fixResearchers(){
  const WikidataResearchers = require('./libs/wikidata-researcher');
  const wdr = new WikidataResearchers();
  await wdr.run();
}
