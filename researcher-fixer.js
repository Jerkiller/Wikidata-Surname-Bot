import { WikidataResearchers } from './libs/wikidata-researcher.mjs';

fixResearchers();

async function fixResearchers(){
  const wdr = new WikidataResearchers();
  await wdr.run();
}
