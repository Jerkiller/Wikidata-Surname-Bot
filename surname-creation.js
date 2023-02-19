import { Surname } from './libs/surname-creator.mjs';

surnameCreation([
  // Put here any surname that you want to create
  'Santeufemia',
// 'Santomero',
// 'Santese',
// 'Santipolo',
// 'Santirocco',
]);

async function surnameCreation(surnames) {
  for (let surname of surnames) {
    const s = new Surname(surname);
    await s.createEntity();
  }
}