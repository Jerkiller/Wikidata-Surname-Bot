
main();

async function main(){
  let response;
  for (let i = 161; i < 200; i++) {
    response = await testNames(i);
    console.log(`DONE ${i}\n`, response);
  }
  console.log("Batch Finished");
}

async function testNames(index) {
  const names = require("./examples/milan-name-list");
  const WikidataNames = require("./libs/wikidata-names");
  const wdn = new WikidataNames(names[index].id);
  const wikidataNames = await wdn.run();
  return wikidataNames;
}
