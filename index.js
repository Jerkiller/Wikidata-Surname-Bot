const express = require('express')
const app = express();
// TODO fix borghetto castellazzo crocetta

app.get('/', async (req, res) => {
  res.send("Batch Started");
    let response;
    //response = await surnameCreation();
    for (let i = 0; i < 40; i++) {
      response = await testNames(i);
      console.log("DONE "+i);
      console.log(response);
    }
    
    console.log("Batch Finished");
});


async function surnameCreation(){
  const examples = [
    
  ];
  for (let surname of examples) {
    const Surname = require('./surname-creator');
    const s = new Surname(surname);
    await s.createEntity();
  }
}

async function testResearchers(){
  const WikidataResearchers = require('./wikidata-researcher');
  const wdr = new WikidataResearchers();
  await wdr.run();
}


async function testNames(index){

  const names = [
    /*{ name: "Luca", id: "wd:Q12795232" },
    { name: "Marco", id: "wd:Q17520955" },
    { name: "Franco", id: "wd:wd:Q15303969" },
    { name: "Matteo", id: "wd:Q10880598" },
    { name: "Giacomo", id: "wd:Q18020485" },
    { name: "Diego", id: "wd:Q3579048" },
    { name: "Renzo", id: "wd:Q1643997" },
    { name: "Simone", id: "wd:Q18067255" },
    { name: "Antonio", id: "wd:Q7141520" },
    { name: "Luigi", id: "wd:Q4245067" },
    { name: "Salvatore", id: "wd:Q610111" },
    { name: "Vincenzo", id: "wd:Q16741113" },
    { name: "Federica", id: "wd:Q18186517" },
    { name: "Federico", id: "wd:Q17539144" },
    { name: "Cesare", id: "wd:Q18341985" },
    { name: "Fabrizio", id: "wd:Q18011357" },
    { name: "Cristiano", id: "wd:Q12899500" },
    { name: "Luciano", id: "wd:Q7296213" },
    { name: "Claudio", id: "wd:Q1150993" },
    { name: "Bruno", id: "wd:Q1874605" },
    { name: "Riccardo", id: "wd:Q15720880" },
    { name: "Davide", id: "wd:Q18039918" },
    { name: "Leonardo", id: "wd:Q18220847" },
    { name: "Lorenzo", id: "wd:Q4267021" },
    { name: "Mattia", id: "wd:Q16279184" },
    { name: "Andrea", id: "wd:Q18177306" },
    { name: "Gabriele", id: "wd:Q17765515" },
    { name: "Tommaso", id: "wd:Q15654302" },
    { name: "Edoardo", id: "wd:Q16275627" },
    { name: "Enrico", id: "wd:Q16908530" },
    { name: "Paolo", id: "wd:Q15731774" },
    { name: "Giovanni", id: "wd:Q1158906" },
    { name: "Francesco", id: "wd:Q2268455" },
    { name: "Carlo", id: "wd:Q4205426" },
    { name: "Giuseppe", id: "wd:Q15720844" },
    { name: "Emanuele", id: "wd:Q18179872" },
    { name: "Sara", id: "wd:Q833345" },
    { name: "Giovanna", id: "wd:Q3806969" },
    { name: "Laura", id: "wd:Q429948" },
    { name: "Ale.a", id: "wd:Q4960889" },
    { name: "Ale.o", id: "wd:Q17501723" },
    { name: "Giorgio", id: "wd:Q12900074" },
    { name: "Domenico", id: "wd:Q1765453" },
    { name: "Sofia", id: "Q18201520" },
    { name: "Giulia", id: "wd:Q127733" },
    { name: "Aurora", id: "wd:Q1066178" },
    { name: "Alice", id: "wd:Q650689" },
    { name: "Ginevra", id: "wd:Q18059354" },
    { name: "Emma", id: "wd:Q541194" },*/
    { name: "Giorgia", id: "wd:Q3765201" },
    { name: "Greta", id: "wd:Q16639594" },
    { name: "Beatrice", id: "wd:Q734292" },
    { name: "Anna", id: "wd:Q666578" },
    { id:'Q340285', name: 'Achille' },
  { id:'Q348946', name: 'Renato' },
  { id:'Q364977', name: 'Adolfo' },
  { id:'Q376340', name: 'Narciso' },
  { id:'Q448671', name: 'Carmine' },
  { id:'Q483460', name: 'Anacleto' },
  { id:'Q533053', name: 'Elio' },
  { id:'Q539504', name: 'Silvio' },
  { id:'Q537566', name: 'Furio' },
  { id:'Q568979', name: 'Mariano' },
  { id:'Q610111', name: 'Salvatore' },
  { id:'Q628471', name: 'Donato' },
  { id:'Q639762', name: 'Guido' },
    { id: "wd:Q220484", name: "Zoran" },
    { id: "wd:Q220546", name: "Frank" },
    { id: "wd:Q221774", name: "Édouard" },
    { id: "wd:Q221978", name: "Bernhard" },
    { id: "wd:Q222412", name: "Gaetan" },
    { id: "wd:Q225020", name: "Diomede" },
    { id: "wd:Q225099", name: "Saburō" },
    { id: "wd:Q225898", name: "Jagiełło" },
    { id: "wd:Q226904", name: "Zoticus" },
    { id: "wd:Q227327", name: "Zsolt" },
    { id: "wd:Q227367", name: "Zsombor" },
    { id: "wd:Q231342", name: "Zvi" },
    { id: "wd:Q238771", name: "Gervasio" },
    { id: "wd:Q240255", name: "Kåre" },
    { id: "wd:Q240702", name: "Timon" },
    { id: "wd:Q240790", name: "Napoleone" },
    { id: "wd:Q240931", name: "Edwin" },
    { id: "wd:Q241658", name: "Maleachi" },
    { id: "wd:Q245304", name: "Zygmunt" },
    { id: "wd:Q246629", name: "Božidar" },
    { id: "wd:Q250661", name: "Álmos" },
    { id: "wd:Q252247", name: "Árni" },
    { id: "wd:Q252558", name: "Ásmundur" },
    { id: "wd:Q252934", name: "Aegidius" },
    { id: "wd:Q253551", name: "Seren" },
    { id: "wd:Q256463", name: "Pascal" },
    { id: "wd:Q256719", name: "Rabih" },
    { id: "wd:Q259268", name: "Brúnó" },
    { id: "wd:Q262439", name: "Ólafur" },
    { id: "wd:Q262776", name: "Nepomuk" },
    { id: "wd:Q263116", name: "Micha" },
    { id: "wd:Q265409", name: "Libor" },
    { id: "wd:Q265867", name: "Darius" },
    { id: "wd:Q266225", name: "Haroun" },
    { id: "wd:Q266749", name: "Placid" },
    { id: "wd:Q267401", name: "Facundo" },
    { id: "wd:Q271370", name: "Ælfwald" },
    { id: "wd:Q272330", name: "Çakar" },
    { id: "wd:Q272796", name: "Çetin" },
    { id: "wd:Q273754", name: "Éder" },
    { id: "wd:Q278835", name: "Edward" },
    { id: "wd:Q280684", name: "Toivo" },
    { id: "wd:Q280861", name: "Endre" },
    { id: "wd:Q283219", name: "Ajit" },
    { id: "wd:Q290080", name: "Vytautas" },
    { id: "wd:Q290693", name: "Nándor" },
    { id: "wd:Q292691", name: "Ernst" },
    { id: "wd:Q294054", name: "Ödön" },
    { id: "wd:Q294833", name: "Alan" },
    { id: "wd:Q295698", name: "Ariobarzanes" },
    { id: "wd:Q297611", name: "Öner" },
    { id: "wd:Q300770", name: "Aad" },
    { id: "wd:Q300777", name: "Aadolf" },
    { id: "wd:Q300780", name: "Aadu" },
    { id: "wd:Q307694", name: "Özay" },
    { id: "wd:Q307901", name: "Abdelkader" },
    { id: "wd:Q307910", name: "Özkaya" },
    { id: "wd:Q307967", name: "Abdelkarim" },
    { id: "wd:Q318375", name: "Abel" },
    { id: "wd:Q337400", name: "Ludger" },
    { id: "wd:Q340285", name: "Achille" },
    { id: "wd:Q340348", name: "Achim" },
    { id: "wd:Q340531", name: "Achisch" },
    { id: "wd:Q342004", name: "Đorđe" },
    { id: "wd:Q343153", name: "İbrahim" },
    { id: "wd:Q343476", name: "İhsan" },
    { id: "wd:Q343579", name: "İlhan" },
    { id: "wd:Q343835", name: "Ilyas" },
    { id: "wd:Q344119", name: "İsmail" },
    { id: "wd:Q344136", name: "Bogusław" },
    { id: "wd:Q345708", name: "Taichi" },
    { id: "wd:Q346622", name: "Hilding" },
    { id: "wd:Q347181", name: "Adam" },
    { id: "wd:Q347243", name: "Adalbert" },
    { id: "wd:Q348263", name: "Adalnot" },
    { id: "wd:Q348332", name: "Adalward" },
    { id: "wd:Q348454", name: "Kármán" },
    { id: "wd:Q348946", name: "Renato" },
    { id: "wd:Q352161", name: "Adamus" },
    { id: "wd:Q352883", name: "Addi" },
    { id: "wd:Q353737", name: "Deodato" },
    { id: "wd:Q354507", name: "Raphael" },
    { id: "wd:Q355713", name: "Malte" },
    { id: "wd:Q359360", name: "Adnan" },
    { id: "wd:Q361309", name: "Mike" },
    { id: "wd:Q361650", name: "Loïc" },
    { id: "wd:Q362868", name: "Chlodwig" },
  ];

  const WikidataNames = require('./wikidata-names');
  const wdn = new WikidataNames(names[index].id);
  const wikidataNames = await wdn.run();
  return wikidataNames;
}

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});