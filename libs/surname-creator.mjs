import { soundex } from 'soundex-code';
import * as fs from 'fs';
import fetch from 'node-fetch';
import caverphone from 'caverphone-phonetics';
import wbedit from "wikibase-edit";
import WBK from 'wikibase-sdk';

import { colognePhonetic } from 'cologne-phonetic';
import { p, q, wikiConfig, botConfig, labels } from '../constants/index.mjs';


export class Surname {
  
    constructor(surname) {
      this.surname = surname;
      this.logFile = './logs/surname-creator.log';
      this.wdk = WBK(wikiConfig.baseConfig);
      this.wbEdit = wbedit(wikiConfig.editConfig);
      this.p = p;
      this.q = q;
    }
  
    getEntity() {
      const descriptions = labels.surname;
      const newLabels = {};
      Object.keys(descriptions).map(k => {
        newLabels[k] = this.surname;
      });
      const entity = {
        type: 'item',
        labels: newLabels,
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
  