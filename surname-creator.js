/*
// Esamples
const examples = [
    "Valdesi",
    "Birigozzi",
    "D’Ascanio",
    "Chiappino"
];
*/
module.exports = class Surname {
  
    constructor(surname) {
      const wikiConfig = require("./constants/wiki-config");
      this.surname = surname;
      this.logFile = 'logs/surname-creator.log';
      this.wdk = require("wikibase-sdk")(wikiConfig.baseConfig);
      this.wbEdit = require("wikibase-edit")(wikiConfig.editConfig);
      this.p = require('./constants/properties');
      this.q = require("./constants/qualificators");
    }
  
    getEntity() {
      const soundex = require('soundex-code')
      const caverphone = require( 'caverphone-phonetics' )
      const colognePhonetic = require( 'cologne-phonetic' ).colognePhonetic;
      const entity = {
        type: 'item',
        labels: {
            it: this.surname,
            en: this.surname,
            fr: this.surname,
            de: this.surname,
            es: this.surname
        },
        descriptions: {
            it: 'cognome',
            en: 'family name',
            fr: 'nom de famille',
            de: 'Familienname',
            es: 'apellido'
        },
        aliases: {
            it: [],
            en: [],
            fr: [],
            de: [],
            es: []
        },
        claims: {},
        sitelinks: {}
      };
      entity.claims[this.p.isInstanceOf] = this.q.surname;
      entity.claims[this.p.hasAlphabet] = this.q.latinAlphabet;
      entity.claims[this.p.hasOriginalName] = {
        text: this.surname,
        language: 'mul'
      };
      entity.claims[this.p.hasSoundex] = soundex(this.surname);
      entity.claims[this.p.hasCologne] = colognePhonetic(this.surname);
      entity.claims[this.p.hasCaverphone] = caverphone(this.surname);

      return entity;
    }

    logToFile(data) {
        const fs = require('fs');
        //fs.writeFile(this.logFile, data);
        fs.appendFileSync(this.logFile, `${data}\n`);
    }

    async createEntity() {
        const currentEntity = this.getEntity();
        console.log(currentEntity);
        try {
            const { entity } = await this.wbEdit.entity.create(currentEntity);
            console.log('created item id', entity.id);
            console.log(this.entityIdToUrl(entity.id));
            this.logToFile(this.entityIdToUrl(entity.id));
            return entity;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

  
    entityIdToUrl(entityId) {
      return `http://www.wikidata.org/entity/${entityId}`;
    }
    urlToEntityId(url) {
      return url.replace("http://www.wikidata.org/entity/", "");
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
  
    async request(req) {
      const { method, url, body } = req;
      const fetch = require("node-fetch");
      const botConfig = require('./constants/bot-config');
      console.log({ method, url, body });
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
  };
  