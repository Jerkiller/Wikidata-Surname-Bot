import * as fs from 'fs';
import { WikidataHelper } from './wikidata-helper.mjs';
import { p, q } from '../constants/index.mjs';

export class WikidataNames {
  constructor(nameToProcess) {
    this.wh = new WikidataHelper();
    this.nameToProcess = nameToProcess;
    this.logFile = "./logs/surname-opportunities.log";
    this.logFile2 = "./logs/surname-big-opportunities.log";
    this.logFile3 = "./logs/surname-big-opportunities-links.log";

    this.p = p;
    this.q = q;
  }

  async run() {
    let personsToBeFixed = await this.searchPersonsWithEmptyNames();
    if (
      personsToBeFixed == null ||
      personsToBeFixed.length == null ||
      personsToBeFixed.length == 0
    )
      return;
    let persons = [];
    for (
      let personIndex = 0;
      personIndex < personsToBeFixed.length;
      personIndex++
    ) {
      console.log(personsToBeFixed[personIndex].personLabel.value);
      const person = {
        personId: this.wh.urlToEntityId(
          personsToBeFixed[personIndex].person.value
        ),
        personUrl: personsToBeFixed[personIndex].person.value,
        fullName: personsToBeFixed[personIndex].personLabel.value,
        firstName: personsToBeFixed[personIndex].nameLabel.value,
      };

      // understand the surname
      const surname = this.getPersonSurname(person);
      person.surname = surname;
      if (surname != null) {
        const surnameId = await this.getSurnameEntity(surname);
        person.surnameId = surnameId;
        person.surnameUrl = this.wh.entityIdToUrl(surnameId);
      } else {
        this.logToFile(person.fullName);
      }

      // set the surname
      const result = await this.addSurnameToPerson(person);
      person.result = result;
      persons.push(person);
      await this.wh.sleep(900);
    }
    return persons;
  }

  async searchPersonsWithEmptyNames() {
    const sparql = `
SELECT ?person ?personLabel ?surname ?surnameLabel ?name ?nameLabel WHERE {
  ?person wdt:${this.p.isInstanceOf} wd:${this.q.human}; wdt:${this.p.hasName} ${this.nameToProcess}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?person wdt:${this.p.hasSurname} ?surname. }
  OPTIONAL { ?person wdt:${this.p.hasName} ?name. }
}
LIMIT 2000`;
    const persons = await this.wh.search(sparql);
    if (persons == null) return [];
    return persons.filter((x) => x.surname == null);
  }

  async getSurnameEntity(surname) {
    const entity = await this.wh.searchEntity(surname);
    if(entity == null) return null;
    const surnameEntities = entity
      .filter((x) => x.label == surname)
      .filter(
        (x) => x.description && x.description.indexOf("family name") >= 0
      );

    if (surnameEntities != null && surnameEntities.length > 0)
      return surnameEntities[0].id;
    else this.logToFileOpportunity(surname);
  }

  /// Luca Fancelli -> Fancelli
  /// Luca Melchiore Tempi -> null (cannot establish real surname)
  getPersonSurname(person) {
    person.fullName = person.fullName.replace("’", "'");
    const [name, surname, secondSurname, thirdSurname] = person.fullName.split(
      " "
    );
    let preSurnames = [ "de", "di", "del", "della", "degli", "dei", "dal", "dalla", "dai", "dagli", "dalle", "da" ];
    // Capitan Ventosa -> boh
    if (name != person.firstName) return null;
    // Luca Dal Sacco -> Dal Sacco
    if (
      surname != null &&
      preSurnames.indexOf(surname.toLowerCase()) >= 0 &&
      secondSurname != null &&
      thirdSurname == null
    )
      return surname.toLowerCase() === "di"
        ? `${surname} ${secondSurname}`
        : // Dal, Della, De. Not dal della de
          `${
            surname.charAt(0).toUpperCase() + surname.slice(1)
          } ${secondSurname}`;
    // Luca Shenko -> Shenko
    if (secondSurname == null && thirdSurname == null) return surname;
    // Luca Marini Marconi Mainardi / Luca Mandela King
    return null;
  }

  async addSurnameToPerson(person) {
    if (person.surname == null) return false;
    if (person.surnameId == null) return false;
    const added = await this.wh.addClaimToEntity(
      person.personId,
      this.p.hasSurname,
      person.surnameId
    );
    if (added) console.log("** Added surname :-) **");
    return added;
  }

  logToFile(data) {
    fs.appendFileSync(this.logFile, `${data}\n`);
  }

  logToFileOpportunity(data) {
    fs.appendFileSync(this.logFile2, `"${data}",\n`);
    fs.appendFileSync(
      this.logFile3,
      `https://www.wikidata.org/w/index.php?search=&search=${data}&title=Special%3ASearch&go=Vai&ns0=1&ns120=1\n`
    );
  }
};
