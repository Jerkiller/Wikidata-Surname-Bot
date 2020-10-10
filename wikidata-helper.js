module.exports = class WikidataHelper {

  constructor() {
    const WBK = require("wikibase-sdk");
    this.wdk = WBK({
      instance: "https://www.wikidata.org",
      sparqlEndpoint: "https://query.wikidata.org/sparql",
    });

    const credentials = require('./constants/wiki-credentials');
    const generalConfig = {
      instance: "https://www.wikidata.org",
      credentials
    };
    this.p = require('./constants/properties');
    this.q = require('./constants/qualificators');
    this.wbEdit = require("wikibase-edit")(generalConfig);
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
        const jsonResponse = await req.json();
        return jsonResponse;
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
    return `http://www.wikidata.org/entity/${entityId}`;
  }
  urlToEntityId(url) {
    return url.replace("http://www.wikidata.org/entity/", "");
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

};
