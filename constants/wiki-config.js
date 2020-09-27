module.exports = {
    baseConfig: {
        instance: "https://www.wikidata.org",
        sparqlEndpoint: "https://query.wikidata.org/sparql",
      },
    editConfig: {
        instance: "https://www.wikidata.org",
        credentials: require('./wiki-credentials'),
        bot: false,
        tags: [ /*'Wikidata-Surname-Bot',*/'WikibaseJS-edit' ],
      },
  };