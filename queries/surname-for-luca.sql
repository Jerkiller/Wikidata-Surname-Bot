SELECT ?person ?personLabel ?surname ?surnameLabel ?name ?nameLabel WHERE {
  ?person wdt:P31 wd:Q5; wdt:P735 wd:Q12795232.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?person wdt:P734 ?surname. }
  OPTIONAL { ?person wdt:P735 ?name. }
}
LIMIT 1000