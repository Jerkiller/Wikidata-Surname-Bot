//Q96099108

const Researcher = require("./researcher");

module.exports = class WikidataResearchers {
  constructor() {
    
    const WH = require("../libs/wikidata-helper");
    this.wh = new WH();

    this.logFile = "./logs/researcher-found.log";
    this.p = require("../constants/properties");
    this.q = require("../constants/qualificators");
  }

async run() {
  const elements = [
'Q50271955',
'Q42326413',
'Q90248973',
'Q42314415',
'Q83830711',
'Q57902702',
'Q56479831',
'Q54196873',
'Q2758100',
'Q30128636',
'Q4726279',
'Q40206892',

  ];
  for (const element of elements) {
    console.log(this.wh.entityIdToUrl(element));
    const researcher = new Researcher({id: element});
    // be sure it is a researcher, then process it
    if (await researcher.isValid()) {
      console.log("researcher ORCID");
      await researcher.fix();
    }
    else {
      console.log("NOTVALID");
    }
    console.log("---------------------------");
  }
}

async findResearchers() {
  while(true) {
    const article = await this.getArticle();
    const authorIds = this.getArticleAuthorIds(article);
    //console.log(article.labels.en, authorIds.join(', '));
    authorIds.map(a => {
      this.logResearcherToFile(a);
    });
    this.wh.sleep(1000);
  }
}

async getArticle() {
  while(true) {
    const randomElement = await this.wh.getRandomElement();
    if(this.isArticle(randomElement))
      return randomElement;
    this.wh.sleep(500);
  }
}

isArticle(entity) {
  const instances = entity.claims[this.p.isInstanceOf];
  if(instances == null)return false; // No instances... don't know what it is
  const ids = instances.map(i => i.mainsnak.datavalue.value.id);
  return ids.indexOf(this.q.scienceArticle) >= 0;
}

getArticleAuthorIds(article) {
  if(!this.isArticle(article))return [];
  const authors = article.claims[this.p.author];
  if(authors == null)return [];
  return authors.map(i => i.mainsnak.datavalue.value.id);
}

  async oldRun() {
    const pageNum = 50; // 0-50
    const Researcher = require("./researcher");
    for (let i = 0; i < 50; i++) {
      const elements = await this.searchReasearchers(pageNum, i * pageNum);
      console.log(elements);
      if(elements == null) continue;
      for (const element of elements) {
        const researcher = new Researcher(element);
        // be sure it is a researcher, then process it
        if (await researcher.isValid()) {
          researcher.logToFile("researcher ORCID");
          researcher.logToFile(this.wh.entityIdToUrl(researcher.id));
          researcher.logToFile("---------------------------");
          await researcher.fix();
        }
        else {
          researcher.logToFile("NOTVALID");
          researcher.logToFile(this.wh.entityIdToUrl(researcher.id));
          researcher.logToFile("---------------------------");
        }
      }
      await this.wh.sleep(1000);
    }
    console.log("completed");
  }

  async searchReasearchers(limit, offset) {
    try {
      const url = await this.wdk.searchEntities({
        search: "researcher",
        language: "en",
        limit: limit,
        continue: offset,
      });
      console.log("search url ",url);
      const response = await this.wh.request({ method: "GET", url });
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

  logResearcherToFile(data) {
    const fs = require("fs");
    fs.appendFileSync(this.logFile, `${data}\n`);
  }
};
