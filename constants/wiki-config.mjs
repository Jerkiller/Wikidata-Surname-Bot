import { credentials } from "./wiki-credentials.mjs";

export const wikiConfig = {
    baseConfig: {
        instance: "https://www.wikidata.org",
        sparqlEndpoint: "https://query.wikidata.org/sparql",
      },
    editConfig: {
        instance: "https://www.wikidata.org",
        /*
          credentials: {
            username: '',
            password: ''
          }
        */
        credentials,
        bot: false,
        tags: [ /*'Wikidata-Surname-Bot',*/'WikibaseJS-edit' ],
      },
  };