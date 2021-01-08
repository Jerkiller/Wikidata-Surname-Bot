#List of small monuments with link to Commons category (either from sitelink and P373)
SELECT ?item ?comm ?p373 ?cat ?immagine WHERE {
  ?item (wdt:P131*) wd:Q38.
  OPTIONAL {
    ?comm schema:about ?item;
      schema:isPartOf <https://commons.wikimedia.org/>.
  }
  BIND(REPLACE(wikibase:decodeUri(SUBSTR(STR(?comm), 45 )), "_", " ") AS ?comm_decode)
  OPTIONAL { ?item wdt:P373 ?p373. }
  OPTIONAL { ?item wdt:P18 ?immagine. }
  BIND(COALESCE(?comm_decode, ?p373) AS ?cat)
  VALUES ?trida {
    wd:Q1746392
    wd:Q108325
    wd:Q4989906
    wd:Q10861631
    wd:Q15077340
    wd:Q1516537
    wd:Q47008262
  }
  ?item (wdt:P31/(wdt:P279*)) ?trida.
}