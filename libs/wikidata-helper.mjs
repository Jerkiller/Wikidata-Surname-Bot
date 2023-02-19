import fetch from 'node-fetch';
import wbedit from "wikibase-edit";
import WBK from 'wikibase-sdk';

import { p, q, wikiConfig, botConfig } from '../constants/index.mjs';


export class WikidataHelper {

  constructor() {
    this.wdk = WBK(wikiConfig.baseConfig);
    this.wbEdit = wbedit(wikiConfig.editConfig);
    this.p = p;
    this.q = q;
  }


  async getSimilarElements(element){
    try {
      const url = await this.wdk.searchEntities({
        search: element,
        language: "en",
        limit: 50,
      });
      const req = await this.request({ method: "GET", url });
      if(req.ok) {
        const jsonResponse = await req.json();
        return jsonResponse;
      }
      else {
          console.error(req);
          return null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getElementById(elementId) {
    try {
      const url = this.wdk.getEntities({
        ids: [ elementId ],
      });
      const req = await this.request({ method: "GET", url });
      if(req.ok) {
        const entities = await req.json();
        return entities.entities[elementId]
      }
      else {
          console.error(req);
          return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  entityIdToUrl(entityId) {
    return `https://www.wikidata.org/entity/${entityId}`;
  }
  urlToEntityId(url) {
    return url
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.wikidata.org/wiki/", "")
      .replace("www.wikidata.org/entity/", "");
  }

  // Search all persons with name nameToProcess
  // ?person wdt:P31 wd:Q5. //humans
  // ?person wdt:P735 wd:Q12795232. //luca name
  // And filter the ones without surname property wdt:P734 //surname
  async search(query) {
    const sparql = query;
    try {
      const response = await this.request({
        method: "GET",
        url: this.wdk.sparqlQuery(sparql),
      });
      const jsonResponse = await response.json();
      return jsonResponse.results.bindings;
    } catch (error) {
      console.error(error);
    }
  }

  async searchEntity(entityName) {
    try {
      const url = await this.wdk.searchEntities({
        search: entityName,
        language: "en",
        limit: 30,
      });
      const response = await this.request({ method: "GET", url });
      const jsonResponse = await response.json();
      return jsonResponse.search;
    } catch (e) {
      console.error(e);
    }
  }

  async request(req) {
    const { method, url, body } = req;
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

  async addClaimToEntity(entityId, property, value) {

    try {
      const res = await this.wbEdit.claim.create({
        id: entityId,
        property: property,
        value: value,
      });
      return res.success;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getRandomElementId(){
    const randomUrl = 'https://www.wikidata.org/wiki/Special:Random';
    const response = await this.request({url:randomUrl, method:'GET'});
    if(response.ok)
      return this.urlToEntityId(response.url);
  }

  async getRandomElement(){
    const id = await this.getRandomElementId();
    this.sleep(500);
    return await this.getElementById(id);
  }


};
