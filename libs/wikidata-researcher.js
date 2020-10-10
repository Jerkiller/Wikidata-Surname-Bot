//Q96099108

const Researcher = require("./researcher");

module.exports = class WikidataResearchers {
  constructor(nameToProcess) {
    const wikiConfig = require("../constants/wiki-config");
    this.nameToProcess = nameToProcess;
    this.logFile = "./logs/surname-opportunities.log";
    this.logFile2 = "./logs/surname-big-opportunities.log";
    this.logFile3 = "./logs/surname-big-opportunities-links.log";
    this.wdk = require("wikibase-sdk")(wikiConfig.baseConfig);
    this.wbEdit = require("wikibase-edit")(wikiConfig.editConfig);
    this.p = require("../constants/properties");
    this.q = require("../constants/qualificators");
  }

  async run() {
    const pageNum = 50; // 0-50
    const Researcher = require("./researcher");
    for (let i = 0; i < 50; i++) {
      const elements = await this.search(pageNum, i * pageNum);
      console.log(elements);
      if(elements == null) continue;
      for (const element of elements) {
        const researcher = new Researcher(element);
        // be sure it is a researcher, then process it
        if (await researcher.isValid()) {
          researcher.logToFile("researcher ORCID");
          researcher.logToFile(this.entityIdToUrl(researcher.id));
          researcher.logToFile("---------------------------");
          await researcher.fix();
        }
        else {
          researcher.logToFile("NOTVALID");
          researcher.logToFile(this.entityIdToUrl(researcher.id));
          researcher.logToFile("---------------------------");
        }
      }
      await this.sleep(1000);
    }
    console.log("completed");
  }

  async search(limit, offset) {
    try {
      const url = await this.wdk.searchEntities({
        search: "researcher",
        language: "en",
        limit: limit,
        continue: offset,
      });
      console.log("search url ",url);
      const response = await this.request({ method: "GET", url });
      const jsonResponse = await response.json();
      return jsonResponse.search
        .filter(
          (x) => x.description && x.description.indexOf("researcher") >= 0
        )
        .map((x) => {
          return {
            id: x.id,
            description: x.description,
            label: x.label,
          };
        });
    } catch (e) {
      console.error(e);
    }
  }

  entityIdToUrl(entityId) {
    return `http://www.wikidata.org/entity/${entityId}`;
  }
  urlToEntityId(url) {
    return url.replace("http://www.wikidata.org/entity/", "");
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

  logToFile(data) {
    const fs = require("fs");
    fs.appendFileSync(this.logFile, `${data}\n`);
  }
};
