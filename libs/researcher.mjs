import * as fs from 'fs';
// import fetch from 'node-fetch';
// import wbedit from "wikibase-edit";
// import WBK from 'wikibase-sdk';

import { WikidataHelper } from './wikidata-helper.mjs';
// import { p, q, wikiConfig, botConfig, labels } from '../constants/index.mjs';

export class Researcher {
  constructor(researcher) {
    this.id = researcher.id;
    this.label = researcher.label;
    this.description = researcher.description;

    this.logFile = "./logs/researcher.log";
    this.wh = new WikidataHelper();
    this.entity = null;
  }

  // Be sure to process a researcher
  async isValid() {
    const entity = await this.getEntity();
    if (entity == null) return false;

    // First criteria: researcher has orcid, scopus, publons or reseacherId
    const claimIdList = Object.keys(entity.claims);
    if (claimIdList.filter((c) => c == this.p.orchidId)) return true;
    if (claimIdList.filter((c) => c == this.p.scopusId)) return true;
    if (claimIdList.filter((c) => c == this.p.publonsId)) return true;
    if (claimIdList.filter((c) => c == this.p.researcherId)) return true;

    // Second criteria: has occupation=researcher
    const occupationClaim = entity.claims[this.p.occupation];
    if (
      occupationClaim &&
      occupationClaim[0].mainsnak.datavalue.value.id == this.q.researcher
    )
      return true;

    // Third criteria: ORCID in description
    for (const lang in entity.descriptions) {
      if (entity.descriptions.hasOwnProperty(lang)) {
        const description = entity.descriptions[lang];
        if (description.toLowerCase().indexOf("orcid") >= 0) return true;
      }
    }

    // Fourth criteria: matching description
    if (entity.descriptions.en == "researcher") return true;
    if (entity.descriptions.it == "ricercatore") return true;
    if (entity.descriptions.it == "ricercatrice") return true;

    return false;
  }

  async fix() {
    await this.fixOccupation();
  }

  async fixOccupation() {
    const entity = await this.getEntity();
    const occupationClaim = entity.claims[this.p.occupation];

    

    const occupations = occupationClaim.filter(c => c.mainsnak.datavalue.value.id == this.q.researcher);
    if(occupations.length > 0)
      console.log("nothing to fix");
    else
      console.log("occu claim", occupationClaim, "OCCUPA", occupations);

  }

  logToFile(data) {
    fs.appendFileSync(this.logFile, `${data}\n`);
  }

  async getEntity() {
    if (this.entity == null) this.entity = await this.wh.getElementById(this.id);
    return this.entity;
  }

};
