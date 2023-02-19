import * as fs from 'fs';
import { WikidataHelper } from './wikidata-helper.mjs';
import { p, q, nonSurnames } from '../constants/index.mjs';

export class WikidataSurnamesRecycler {
  constructor(surname) {
    this.wh = new WikidataHelper();
    this.surname = surname;
    
    this.logFile = './logs/entities.log';
    this.logFile2 = './logs/opportunities-lost.log'
    this.p = p;
    this.q = q;
    this.nonSurnameEntities = nonSurnames;
  }


  async checkIfSurnameExists(){
    if(this.isRomanNumber())return false;
    let capitalizedSurname = (this.surname).charAt(0).toUpperCase() + (this.surname).slice(1);
    const entities = await this.wh.getSimilarElements(capitalizedSurname);
    console.log('entities', entities)
    for (const element of entities.search) {
      try {
        let isSurname = await this.isSurname(element);
        if(isSurname)return true;
      } catch (error) {
        // in doubt... it is a suname
        this.logToFileLost(this.surname);
        return true;
      }
    }
    return false;
  }

  isRomanNumber(){
    const romanNumberRegex = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$|^\d+$/;
    return this.surname.match(romanNumberRegex) > 0;
  }

  async isSurname(element){
    const entity = await this.wh.getElementById(element.id);
    //console.log("entity",entity);
    const superclasses = entity.claims[this.p.subclassOf];
    const isAbstractElem = superclasses && Array.isArray(superclasses) && superclasses.length > 0;
    if (isAbstractElem) return false;

    const whatIsIt = entity.claims[this.p.isInstanceOf];
    // if has no istanceOf it coud be a surname
    if (!Array.isArray(whatIsIt))
      return true;
    for (const instance of whatIsIt) {
      const val = instance.mainsnak.datavalue.value.id;
      if(val == this.q.surname)
        return true;

      if(this.nonSurnameEntities.indexOf(val) >= 0)
      return false;
      
      this.logToFile(val);
    }
    //const claimIdList = Object.keys(entity.claims);
    //if (claimIdList.filter((c) => c == this.p.orchidId)) return true;
    return true;
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
      console.log(personsToBeFixed[personIndex]);
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
      }

      // set the surname
      const result = await this.addSurnameToPerson(person);
      person.result = result;

      persons.push(person);
      await this.wh.sleep(1000);
    }
    return persons;
  }

  // Search all persons with name nameToProcess
  // ?person wdt:P31 wd:Q5. //humans
  // ?person wdt:P735 wd:Q12795232. //luca name
  // And filter the ones without surname property wdt:P734 //surname
  async searchPersonsWithEmptyNames() {
    const sparql = `
SELECT ?person ?personLabel ?surname ?surnameLabel ?name ?nameLabel WHERE {
  ?person wdt:P31 wd:Q5; wdt:P735 ${this.nameToProcess}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?person wdt:P734 ?surname. }
  OPTIONAL { ?person wdt:P735 ?name. }
}
LIMIT 200`;
    const persons = await this.wh.search(sparql);
    return persons.filter((x) => x.surname == null);
  }

  async getSurnameEntity(surname) {
    const entity = await searchEntity(surname);
    const surnameEntities = entity
      .filter((x) => x.label.toLowerCase() == surname.toLowerCase())
      .filter((x)=> x.description.toLowerCase().indexOf("family name") >= 0);
    if (surnameEntities != null && surnameEntities.length > 0)
      return surnameEntities[0].id;
  }

  /// Luca Fancelli -> Fancelli
  /// Luca Melchiore Tempi -> null (cannot establish real surname)
  getPersonSurname(person) {
    person.fullName = person.fullName.replace('’',"'");
    const [name, surname, secondSurname, thirdSurname] = person.fullName.split(
      " "
    );
    const preSurnames = [
      "de",
      "De",
      "Dal",
      "dal",
      "di",
      "Di",
      "Della",
      "della",
      "Dai",
      "dai",
    ];
    // Capitan Ventosa -> boh
    if (name != person.firstName) return null;
    // Luca Dal Pont -> Dal Pont
    if (preSurnames.indexOf(secondSurname) >= 0 && thirdSurname == null)
      return `${surname} ${secondSurname}`;
    // Luca Cranio -> Cranio
    if (secondSurname == null && thirdSurname == null) return surname;
    // Luca Marini Marconi Mainardi / Luca Mandela King
    return null;
  }

  async addSurnameToPerson(person) {
    if (person.surname == null) return false;
    if (person.surnameId == null) return false;
    const added = await this.wh.addClaimToEntity(
      person.personId, this.p.hasSurname, person.surnameId
      );
    return added;
  }


  logToFile(data) {
    fs.appendFileSync(this.logFile, `${data}\n`);
  }

  logToFileLost(data) {
    fs.appendFileSync(this.logFile2, `${data}\n`);
  }
};
