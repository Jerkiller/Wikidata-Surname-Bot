
module.exports = class Surname {
  
    constructor(surname) {
      const wikiConfig = require("../constants/wiki-config");
      this.surname = surname;
      this.logFile = './logs/surname-creator.log';
      this.wdk = require("wikibase-sdk")(wikiConfig.baseConfig);
      this.wbEdit = require("wikibase-edit")(wikiConfig.editConfig);
      this.p = require('../constants/properties');
      this.q = require("../constants/qualificators");
    }
  
    getEntity() {
      const soundex = require('soundex-code')
      const caverphone = require( 'caverphone-phonetics' )
      const colognePhonetic = require( 'cologne-phonetic' ).colognePhonetic;
      const descriptions = {
        ast: 'apellíu',
        bar: 'Schreibnam',
        br: 'anv-tiegezh',
        ca: 'cognom',
        cs: 'příjmení',
        da: 'efternavn',
        de: 'Familienname',
        'de-at': 'Familienname',
        'de-ch': 'Familienname',
        en: 'family name',
        'en-ca': 'family name',
        'en-gb': 'surname',
        eo: 'familia nomo',
        es: 'apellido',
        et: 'perekonnanimi',
        eu: 'abizen',
        fi: 'sukunimi',
        fit: 'sukunimi',
        fo: 'ættarnavn',
        fr: 'nom de famille',
        ga: 'sloinne',
        gl: 'apelido',
        hr: 'prezime',
        is: 'eftirnafn',
        it: 'cognome',
        la: 'nomen gentilicium',
        lt: 'pavardė',
        lv: 'uzvārds',
        mi: 'ingoa whānau',
        nl: 'achternaam',
        oc: 'nom d\'ostal',
        pl: 'nazwisko',
        pms: 'cognòm',
        pt: 'sobrenome',
        'pt-br': 'nome de família',
        ro: 'nume de familie',
        sco: 'faimily name',
        sk: 'priezvisko',
        sl: 'priimek',
        sq: 'mbiemër',
        sv: 'efternamn',
        tr: 'soyadı',
        wa: 'no d\'famile',
        zu: 'isibongo',
      };
      const labels = {};
      Object.keys(descriptions).map(k => {
        labels[k] = this.surname;
      });
      const entity = {
        type: 'item',
        labels: labels,
        descriptions,
        aliases: {},
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
      
      entity.claims[this.p.geneanetId] = this.surname.toUpperCase();

      if(this.surname.indexOf('-') >= 0)
        entity.claims[this.p.isInstanceOf] = [this.q.surname,this.q.surnameComposed];

      if(this.isSurnameAffixed(this.surname))
        entity.claims[this.p.isInstanceOf] = [this.q.surname,this.q.surnameAffixed];

      return entity;
    }

    isSurnameAffixed (surname) {
      if(surname.indexOf('Di ') == 0) return true;
      if(surname.indexOf('De ') == 0) return true;
      if(surname.indexOf('Della ') == 0) return true;
      if(surname.indexOf('Delle ') == 0) return true;
      if(surname.indexOf('Degli ') == 0) return true;
      if(surname.indexOf('Dei ') == 0) return true;
      if(surname.indexOf('Del ') == 0) return true;
      if(surname.indexOf("D'") == 0) return true;
      if(surname.indexOf('Dal ') == 0) return true;
      if(surname.indexOf('Dalla ') == 0) return true;
      if(surname.indexOf('Dalle ') == 0) return true;
      if(surname.indexOf('Dai ') == 0) return true;
      if(surname.indexOf('Da ') == 0) return true;
      if(surname.indexOf("Van '") == 0) return true;
      return false;
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
      const botConfig = require('../constants/bot-config');
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
  