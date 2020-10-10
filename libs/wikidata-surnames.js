module.exports = class WikidataNames {
  constructor(nameToProcess) {
    const WBK = require("wikibase-sdk");
    this.nameToProcess = nameToProcess;
    this.wdk = WBK({
      instance: "https://www.wikidata.org",
      sparqlEndpoint: "https://query.wikidata.org/sparql",
    });

    const credentials = require('./wiki-credentials');
    const generalConfig = {
      instance: "https://www.wikidata.org",
      credentials
    };

    this.wbEdit = require("wikibase-edit")(generalConfig);
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
        personId: this.urlToEntityId(
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
        person.surnameUrl = this.entityIdToUrl(surnameId);
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

    try {
      const response = await this.request({
        method: "GET",
        url: this.wdk.sparqlQuery(sparql),
      });
      const jsonResponse = await response.json();
      const persons = jsonResponse.results.bindings;
      return persons.filter((x) => x.surname == null);
      //console.log(response, response.text(),"\n\n",response.json());
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
      const surnameEntities = jsonResponse.search.filter(
        (x) => x.label == surname && x.description == "family name"
      );
      if (surnameEntities != null && surnameEntities.length > 0)
        return surnameEntities[0].id;
      //const persons = jsonResponse.results.bindings;
      //return persons.filter(x => x.surname == null);
      //console.log(response, response.text(),"\n\n",response.json());
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
    // Luca Dal Pont -> Dal Pont
    if (preSurnames.indexOf(secondSurname) >= 0 && thirdSurname == null)
      return `${surname} ${secondSurname}`;
    // Luca Cranio -> Cranio
    if (secondSurname == null && thirdSurname == null) return surname;
    // Luca Marini Marconi Mainardi / Luca Mandela King
    return null;
  }

  
  async request(req) {
    const { method, url, body } = req;
    const fetch = require("node-fetch");
    const botConfig = require('../constants/bot-config');
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
        property: "P734", // surname
        value: person.surnameId,
      });
      return res.success;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

};
