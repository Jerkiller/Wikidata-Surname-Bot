SELECT ?person ?personLabel ?given_name ?given_nameLabel ?family_name ?family_nameLabel WHERE {
  ?person wdt:P31 wd:Q5;
    wdt:P54 wd:Q1543.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?person wdt:P735 ?given_name. }
  OPTIONAL { ?person wdt:P734 ?family_name. }
}