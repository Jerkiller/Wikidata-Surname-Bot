import { names } from './examples/generic-name-list.mjs';
import { WikidataNames } from './libs/wikidata-names.mjs';

main();

async function main(){
  let response;
  for (let i = 0; i < 500; i++) {
    response = await testNames(i);
    console.log(`DONE ${i}\n`, response);
  }
  console.log("Batch Finished");
}

async function testNames(index) {
  const wdn = new WikidataNames(names[index].id);
  const wikidataNames = await wdn.run();
  return wikidataNames;
}
