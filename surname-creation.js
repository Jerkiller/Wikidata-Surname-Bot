import { Surname } from './libs/surname-creator.mjs';

surnameCreation([
  // Put here any surname that you want to create
 "Vachieri",//"Trabona","Randello","Percuoco","Mainaldi","Cannavà","Brizz","Affori","Limina","Bonaugurio","Armelli","Ballarò","Boncompagno","Grammatica","Lobetti","Magnolfi","Valdemarin","Acquisti","Budri","Gualchieri","Jocolano","Mattarello","Olcesi","Rondine","Agenori","Zammataro",
]);

async function surnameCreation(surnames) {
  for (let surname of surnames) {
    const s = new Surname(surname);
    await s.createEntity();
  }
}