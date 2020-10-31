SELECT ?club_calcistico_femminile ?club_calcistico_femminileLabel ?club_calcistico_femminileDescription ?PaeseLabel ?sportLabel  ?classe_di_competizioneLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
  ?club_calcistico_femminile wdt:P31 wd:Q51481377.
  OPTIONAL { ?club_calcistico_femminile wdt:P17 ?Paese. }
  OPTIONAL { ?club_calcistico_femminile wdt:P641 ?sport. }
  OPTIONAL { ?club_calcistico_femminile wdt:P2094 ?classe_di_competizione. }
}