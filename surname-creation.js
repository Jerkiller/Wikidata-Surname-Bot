
surnameCreation([
  // Put here any surname that you want to create
]);

async function surnameCreation(surnames) {
  for (let surname of surnames) {
    const Surname = require("./libs/surname-creator");
    const s = new Surname(surname);
    await s.createEntity();
  }
}