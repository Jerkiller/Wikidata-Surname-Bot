const express = require("express");
const app = express();

app.get("/", async (req, res) => {
  res.send("Batch Started");
  let response;
  /*
    response = await surnameCreation([
      //"","",...
    ]);
    */
  for (let i = 0; i < 40; i++) {
    response = await testNames(i);
    console.log(`DONE ${i}\n`, response);
  }
  console.log("Batch Finished");
});

async function surnameCreation(surnames) {
  for (let surname of surnames) {
    const Surname = require("./surname-creator");
    const s = new Surname(surname);
    await s.createEntity();
  }
}

// async function testResearchers(){
//   const WikidataResearchers = require('./wikidata-researcher');
//   const wdr = new WikidataResearchers();
//   await wdr.run();
// }

async function testNames(index) {
  const names = require('./examples/name-list');
  const WikidataNames = require("./wikidata-names");
  const wdn = new WikidataNames(names[index].id);
  const wikidataNames = await wdn.run();
  return wikidataNames;
}

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});
