const express = require("express");
const app = express();

app.get("/", async (req, res) => {
  res.send("Batch Started");
  let response;
  
    response = await surnameCreation([
     ]);
   testSurnameRecycler();
  for (let i = 0; i < 200; i++) {
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

async function testSurnameRecycler() {
  const surnames = [
  ];
  const WikidataSurnamesRecycler = require('./wikidata-surnames-recycler');
  const Surname = require("./surname-creator");
  for (const surname of surnames) {
    const wsr = new WikidataSurnamesRecycler(surname);
    const existing = await wsr.checkIfSurnameExists();
    if (!existing) {
      const s = new Surname(surname);
      await s.createEntity();
    } 
  }
}

async function testNames(index) {
  const names = require('./examples/milan-name-list');
  const WikidataNames = require("./wikidata-names");
  const wdn = new WikidataNames(names[index].id);
  const wikidataNames = await wdn.run();
  return wikidataNames;
}

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});
