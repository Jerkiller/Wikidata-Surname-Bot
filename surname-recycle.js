
surnameRecycle([
  //surnames
]);

async function surnameRecycle(surnames) {
  const WikidataSurnamesRecycler = require("./libs/wikidata-surnames-recycler");
  const Surname = require("./libs/surname-creator");
  for (const surname of surnames) {
    const wsr = new WikidataSurnamesRecycler(surname);
    const existing = await wsr.checkIfSurnameExists();
    if (!existing) {
      const s = new Surname(surname);
      await s.createEntity();
    }
  }
}