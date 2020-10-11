module.exports = class WikidataSurnamesRecycler {
  constructor(surname) {
    const WikiHelper = require("./wikidata-helper");
    this.wh = new WikiHelper();
    this.surname = surname;
    
    this.logFile = './logs/entities.log';
    this.p = require('../constants/properties');
    this.q = require('../constants/qualificators');
  }


  async checkIfSurnameExists(){
    const entities = await this.wh.getSimilarElements(this.surname);
    console.log('entities', entities)
    for (const element of entities.search) {
      try {
        let isSurname = await this.isSurname(element);
        if(isSurname)return true;
        
        let capitalizedElement = element.charAt(0).toUpperCase() + element.slice(1)
        let isSurnameCapitalized = await this.isSurname(capitalizedElement);
        if(isSurnameCapitalized)return true;
      } catch (error) {
        // in doubt... it is a suname
        return true;
      }
    }
    return false;
  }

  async isSurname(element){
    const entity = await this.wh.getElementById(element.id);
    //console.log("entity",entity);

    const whatIsIt = entity.claims[this.p.isInstanceOf];
    for (const instance of whatIsIt) {
      const val = instance.mainsnak.datavalue.value.id;
      if(val == this.q.surname) return true;

      if(val == this.q.human) return false;
      if(val == this.q.disambiguate) return false;
      if(val == this.q.company) return false;
      if(val == this.q.family) return false;
      if(val == this.q.nobleFamily) return false;
      if(val == this.q.settlement) return false;
      if(val == this.q.school) return false;
      if(val == this.q.taxon) return false;
      if(val == this.q.village) return false;
      if(val == this.q.city) return false;
      if(val == this.q.bigCity) return false;
      if(val == this.q.locality) return false;
      if(val == this.q.italyComuneSub) return false;
      if(val == this.q.italyComune) return false;
      if(val == this.q.frenchComune) return false;
      if(val == this.q.spainComune) return false;
      if(val == this.q.highSchool) return false;
      if(val == this.q.scienceArticle) return false;
      if(val == this.q.researcher) return false;
      if(val == this.q.maleName) return false;
      if(val == this.q.bio) return false;
      if(val == this.q.character) return false;
      if(val == this.q.lord) return false;
      if(val == this.q.asteroid) return false;
      if(val == this.q.river) return false;
      if(val == this.q.mountain) return false;
      if(val == this.q.street) return false;
      if(val == this.q.album) return false;
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
    const fs = require('fs');
    fs.appendFileSync(this.logFile, `${data}\n`);
  }

};
