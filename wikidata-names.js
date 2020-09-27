module.exports = class WikidataNames {
  constructor(nameToProcess) {
    const wikiConfig = require("./constants/wiki-config");
    this.nameToProcess = nameToProcess;
    this.logFile = 'logs/surname-opportunities.log';
    this.logFile2 = 'logs/surname-big-opportunities.log';
    this.logFile3 = 'logs/surname-big-opportunities-links.log';
    this.wdk = require("wikibase-sdk")(wikiConfig.baseConfig);
    this.wbEdit = require("wikibase-edit")(wikiConfig.editConfig);
    this.p = require('./constants/properties');
    this.q = require('./constants/qualificators');
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
        personId: this.urlToEntityId(personsToBeFixed[personIndex].person.value),
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
        person.surnameUrl = this.entityIdToUrl(surnameId);
      }
      else {
        this.logToFile(person.fullName);
      }

      // set the surname
      const result = await this.addSurnameToPerson(person);
      person.result = result;

      persons.push(person);
      await this.sleep(1000);
    }
    return persons;
  }

  entityIdToUrl(entityId) {
    return `http://www.wikidata.org/entity/${entityId}`;
  }
  urlToEntityId(url) {
    return url.replace("http://www.wikidata.org/entity/", "");
  }



  /*
  //test
  SELECT ?person ?personLabel ?surname ?surnameLabel ?name ?nameLabel WHERE {
    ?person wdt:P31 wd:Q5; wdt:P735 wd:Q16275627.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    OPTIONAL { ?person wdt:P734 ?surname. }
    OPTIONAL { ?person wdt:P735 ?name. }
  }
  LIMIT 300
*/
  // Search all persons with name nameToProcess
  // ?person wdt:P31 wd:Q5. //humans
  // ?person wdt:P735 wd:Q12795232. //luca name
  // And filter the ones without surname property wdt:P734 //surname
  async searchPersonsWithEmptyNames() {
    const sparql = `
SELECT ?person ?personLabel ?surname ?surnameLabel ?name ?nameLabel WHERE {
  ?person wdt:${this.p.isInstanceOf} wd:${this.q.human}; wdt:${this.p.hasName} ${this.nameToProcess}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?person wdt:${this.p.hasSurname} ?surname. }
  OPTIONAL { ?person wdt:${this.p.hasName} ?name. }
}
LIMIT 400`;

    try {
      const req = await this.request({
        method: "GET",
        url: this.wdk.sparqlQuery(sparql),
      });
      
      if(req.ok) {
        const jsonResponse = await req.json();
        const persons = jsonResponse.results.bindings;
        return persons.filter((x) => x.surname == null);
      }
      else {
          console.error(req);
          return null;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getSurnameEntity(surname) {
    try {
      const url = await this.wdk.searchEntities({
        search: surname,
        language: "en",
        limit: 30,
      });
      const response = await this.request({ method: "GET", url });
      const jsonResponse = await response.json();
      //console.log(jsonResponse);
      const surnameEntities = jsonResponse.search
        .filter((x) => x.label == surname)
        .filter((x) => x.description && x.description.indexOf("family name") >= 0);

      if (surnameEntities != null && surnameEntities.length > 0)
        return surnameEntities[0].id;
      else this.logToFileOpportunity(surname);
    } catch (e) {
      console.error(e);
    }
  }

  /// Luca Fancelli -> Fancelli
  /// Luca Melchiore Tempi -> null (cannot establish real surname)
  getPersonSurname(person) {
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
    // Luca Dal Sacco -> Dal Sacco
    if (preSurnames.indexOf(surname) >= 0 && secondSurname != null && thirdSurname == null)
      return `${surname} ${secondSurname}`;
    // Luca Shenko -> Shenko
    if (secondSurname == null && thirdSurname == null) return surname;
    // Luca Marini Marconi Mainardi / Luca Mandela King
    return null;
  }

  async request(req) {
    const { method, url, body } = req;
    const fetch = require("node-fetch");
    const botConfig = require('./constants/bot-config');
    //console.log({ method, url, body });
    return await fetch(url, {
      method,
      body,
      headers: {
        'User-Agent': botConfig.userAgent
      }
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async addSurnameToPerson(person) {
    if (person.surname == null) return false;
    if (person.surnameId == null) return false;

    try {
      const res = await this.wbEdit.claim.create({
        id: person.personId,
        property: this.p.hasSurname,
        value: person.surnameId,
      });
      console.log("** Added surname :-) **")
      return res.success;
    } catch (error) {
      console.error(error);
      return false;
    }
  }


  logToFile(data) {
    const fs = require('fs');
    fs.appendFileSync(this.logFile, `${data}\n`);
  }

  logToFileOpportunity(data) {
    const fs = require('fs');
    fs.appendFileSync(this.logFile2, `"${data}",\n`);
    fs.appendFileSync(this.logFile3, `https://www.wikidata.org/w/index.php?search=&search=${data}&title=Special%3ASearch&go=Vai&ns0=1&ns120=1\n`);
  }
};
