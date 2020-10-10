
//testResearchers();

async function testResearchers(){
  const WikidataResearchers = require('./libs/wikidata-researcher');
  const wdr = new WikidataResearchers();
  await wdr.run();
}
