SELECT ?album ?albumLabel ?publication_date ?MusicBrainz_release_group_ID ?record_labelLabel ?Discogs_master_ID ?title WHERE {
  ?album wdt:P31 wd:Q482994;
    wdt:P175 wd:Q167546.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL { ?album wdt:P577 ?publication_date. }
  OPTIONAL { ?album wdt:P436 ?MusicBrainz_release_group_ID. }
  OPTIONAL { ?album wdt:P264 ?record_label. }
  OPTIONAL { ?album wdt:P1954 ?Discogs_master_ID. }
  OPTIONAL { ?album wdt:P1476 ?title. }
}