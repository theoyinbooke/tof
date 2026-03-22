const rawNigeriaStateToLgas = JSON.parse(String.raw`{"Abia":["Aba North","Aba South","Arochukwu","Bende","Ikwuano","Isiala Ngwa North","Isiala Ngwa South","Isuikwuato","Oboma Ngwa","Ohafia","Osisioma","Ugwunagbo","Ukwa East","Ukwa West","Umu-Nneochi","Umuahia North","Umuahia South"],"Federal Capital Territory":["Abaji","Bwari","Gwagwalada","Kuje","Kwali","Municipal"],"Adamawa":["Demsa","Fufore","Ganye","Girie","Gombi","Guyuk","Hong","Jada","Lamurde","Madagali","Maiha","Mayo-Belwa","Michika","Mubi North","Mubi South","Numan","Shelleng","Song","Teungo","Yola North","Yola South"],"Akwa Ibom":["Abak","Eastern Obolo","Eket","Esit Eket","Essien Udim","Etim Ekpo","Etinan","Ibeno","Ibesikpo Asutan","Ibiono Ibom","Ika","Ikono","Ikot Abasi","Ikot Ekpene","Ini","Itu","Mbo","Mkpat Enin","Nsit Atai","Nsit Ibom","Nsit Ubium","Obot Akara","Okobo","Onna","Oron","Oruk Anam","Udung Uko","Ukanafun","Uruan","Urue Offong|Oruko","Uyo"],"Anambra":["Aguata","Anambra East","Anambra West","Anaocha","Awka North","Awka South","Ayamelum","Dunukofia","Ekwusigo","Idemili North","Idemili South","Ihiala","Njikoka","Nnewi North","Nnewi South","Ogbaru","Onitsha North","Onitsha South","Orumba North","Orumba South","Oyi"],"Bauchi":["Alkaleri","Bauchi","Bogoro","Damban","Darazo","Dass","Gamawa","Gamjuwa","Giade","Itas/Gadau","Jama'are","Katagum","Kirfi","Misau","Ningi","Shira","Tafawa-Balewa","Toro","Warji","Zaki"],"Bayelsa":["Brass","Ekeremor","Kolokuma-Opokuma","Nembe","Ogbia","Sagbama","Southern Ijaw","Yenagoa"],"Benue":["Ado","Agatu","Apa","Buruku","Gboko","Guma","Gwer East","Gwer West","Katsina- Ala","Konshisha","Kwande","Logo","Makurdi","Obi","Ogbadibo","Ohimini","Oju","Okpokwu","Oturkpo","Tarka","Ukum","Ushongo","Vandeikya"],"Borno":["Abadam","Askira/Uba","Bama","Bayo","Biu","Chibok","Damboa","Dikwa","Gubio","Guzamala","Gwoza","Hawul","Jere","Kaga","Kala/Balge","Konduga","Kukawa","Kwaya Kusar","Mafa","Magumeri","Maiduguri","Marte","Mobbar","Monguno","Ngala","Nganzai","Shani"],"Cross River":["Abi","Akamkpa","Akpabuyo","Bakassi","Bekwarra","Biase","Boki","Calabar Municipality","Calabar South","Etung","Ikom","Obanliku","Obubra","Obudu","Odukpani","Ogoja","Yakurr","Yala"],"Delta":["AniochaN","AniochaS","Bomadi","Burutu","Ethiope West","EthiopeE","IkaNorth","IkaSouth","IsokoNor","IsokoSou","Ndokwa East","Ndokwa West","Okpe","Oshimili North","Oshimili South","Patani","Sapele","Udu","Ughelli North","Ughelli South","Ukwuani","Uvwie","Warri North","Warri South","Warri South-West"],"Ebonyi":["Abakalik","Afikpo North","Afikpo South","Ebonyi","Ezza North","Ezza South","Ikwo","Ishielu","Ivo","Izzi","Ohaozara","Ohaukwu","Onicha"],"Edo":["Akoko Edo","Egor","Esan Centtral","Esan North East","Esan South East","Esan West","Etsako Central","Etsako East","Etsako West","Igueben","Ikpoba-Okha","Oredo","Orhionmw","Ovia North East","Ovia South West","Owan East","Owan West","Uhunmwonde"],"Ekiti":["Ado-Ekiti","Efon","Ekiti East","Ekiti South West","Ekiti West","Emure","Gboyin","Ido-Osi","Ijero","Ikere","Ikole","Ilejemeje","Irepodun-Ifelodun","Ise-Orun","Moba","Oye"],"Enugu":["Aninri","Awgu","Enugu East","Enugu North","EnuguSou","Ezeagu","Igbo-Eti","Igbo-eze North","Igbo-eze South","Isi-Uzo","Nkanu East","Nkanu West","Nsukka","Oji-River","Udenu","Udi","Uzo-Uwani"],"Gombe":["Akko","Balanga","Billiri","Dukku","Funakaye","Gombe","Kaltungo","Kwami","Nafada","Shomgom","Yalmatu / Deba"],"Imo":["Aboh-Mbaise","Ahiazu-Mbaise","Ehime-Mbano","Ezinihitte Mbaise","Ideato North","Ideato South","Ihitte-Uboma Isinweke","Ikeduru","Isiala Mbano","Isu","Mbaitoli","Ngor-Okpala","Njaba","Nkwerre","Nwangele","Obowo","Oguta","Ohaji-Egbema","Okigwe","Orlu","Orsu","Oru-East","Oru-West","Owerri Municipal","Owerri North","Owerri West","Unuimo"],"Jigawa":["Auyo","Babura","Biriniwa","Birnin Kudu","Buji","Dutse","Gagarawa","Garki","Gumel","Guri","Gwaram","Gwiwa","Hadejia","Jahun","Kafin Hausa","Kaugama","Kazaure","Kirika Samma","Kiyawa","Maigatari","Malam Mado","Miga","Ringim","Roni","Sule Tankarkar","Taura","Yankwashi"],"Kaduna":["Birnin Gwari","Chikun","Giwa","Igabi","Ikara","Jaba","Jema'a","Kachia","Kaduna North","Kaduna South","Kagarko","Kajuru","Kaura","Kauru","Kubau","Kudan","Lere","Makarfi","Sabon Gari","Sanga","Soba","Zangon Kataf","Zaria"],"Kano":["Ajingi","Albasu","Bagwai","Bebeji","Bichi","Bunkure","Dala","Dambatta","Dawakin Kudu","Dawakin Tofa","Doguwa","Fagge","Gabasawa","Garko","Garum Mallam","Gaya","Gezawa","Gwale","Gwarzo","Kabo","Kano Municipal","Karaye","Kibiya","Kiru","Kumbotso","Kunchi","Kura","Madobi","Makoda","Minjibir","Nasarawa","Rano","Rimin Gado","Rogo","Shanono","Sumaila","Takai","Tarauni","Tofa","Tsanyawa","Tundun Wada","Ungogo","Warawa","Wudil"],"Katsina":["Bakori","Batagarawa","Batsari","Baure","Bindawa","Charanchi","Dandume","Danja","Danmusa","Daura","Dutsi","Dutsin-M","Faskari","Funtua","Ingawa","Jibia","Kafur","Kaita","Kankara","Kankiya","Katsina (K)","Kurfi","Kusada","Mai'Adua","Malumfashi","Mani","Mashi","Matazu","Musawa","Rimi","Sabuwa","Safana","Sandamu","Zango"],"Kebbi":["Aleiro","Arewa","Argungu","Augie","Bagudo","Birnin Kebbi","Bunza","Dandi","Danko Wasagu","Fakai","Gwandu","Jega","Kalgo","Koko/Bes","Maiyama","Ngaski","Sakaba","Shanga","Suru","Yauri","Zuru"],"Kogi":["Adavi","Ajaokuta","Ankpa","Bassa","Dekina","Ibaji","Idah","Igalamela-Odolu","Ijumu","Kabba-Bunu","Koton-Karfe","Lokoja","Mopa-Muro","Ofu","Ogori Magongo","Okehi","Okene","Olamaboro","Omala","Yagba East","Yagba West"],"Kwara":["Asa","Baruten","Edu","Ekiti","Ifelodun","Ilorin East","Ilorin South","Ilorin West","Irepodun","Isin","Kaiama","Moro","Offa","Oke-Ero","Oyun","Pategi"],"Lagos":["Agege","Ajeromi/Ifelodun","Alimosho","Amuwo Odofin","Apapa","Badagary","Epe","Eti-Osa","Ibeju/Lekki","Ifako/Ijaye","Ikeja","Ikorodu","Kosofe","Lagos Island","Lagos Mainland","Mushin","Ojo","Oshodi/Isolo","Shomolu","Surulere"],"Nassarawa":["Akwanga","Awe","Doma","Karu","Keana","Keffi","Kokona","Lafia","Nasarawa","Nassarawa Egon","Obi","Toto","Wamba"],"Niger":["Agaie","Agwara","Bida","Borgu","Bosso","Chanchaga","Edati","Gbako","Gurara","Katcha","Kontogur","Lapai","Lavun","Magama","Mariga","Mashegu","Mokwa","Muya","Paikoro","Rafi","Rijau","Shiroro","Suleja","Tafa","Wushishi"],"Ogun":["Abeokuta North","Abeokuta South","Ado Odo-Ota","Egbado North","Egbado South","Ewekoro","Ifo","Ijebu East","Ijebu North","Ijebu North-East","Ijebu-Ode","Ikenne","Imeko-Afon","Ipokia","Obafemi-Owode","Odeda","Odogbolu","Ogun Waterside","Remo North","Shagamu"],"Ondo":["Akoko North-East","Akoko South-East","Akoko South-West","AkokoNorthWest","Akure North","Akure South","Ese-Odo","Idanre","Ifedore","Ilaje","IleOluji/Okeigbo","Irele","Odigbo","Okitipupa","Ondo East","Ondo West","Ose","Owo"],"Osun":["Atakumosa East","Atakumosa West","Ayedaade","Ayedire","Boluwaduro","Boripe","Ede North","Ede South","Egbedore","Ejigbo","Ife East","Ife North","Ife South","IfeCentral","Ifedayo","Ifelodun","Ila","Ilesha East","Ilesha West","Irepodun","Irewole","Isokan","Iwo","Obokun","Odo Otin","Ola-Oluwa","Olorunda","Oriade","Orolu","Osogbo"],"Oyo":["Afijio","Akinyele","Atiba","Atisbo","Egbeda","Ibadan North","Ibadan North East","Ibadan North West","Ibadan South East","Ibadan South West","Ibarapa Central","Ibarapa East","Ibarapa North","Ido","Irepo","Iseyin","Itesiwaju","Iwajowa","Kajola","Lagelu","Ogbomosho North","Ogbomosho South","Ogo-Oluwa","Olorunsogo","Oluyole","Ona-Ara","Orelope","Ori-Ire","Oyo East","Oyo West","Saki East","Saki West","Surulere"],"Plateau":["Barkin Ladi","Bassa","Bokkos","Jos East","Jos North","Jos South","Kanam","Kanke","Langtang North","Langtang South","Mangu","Mikang","Pankshin","Qua'anpa","Riyom","Shendam","Wase"],"Rivers":["Abua/Odu","Ahoada East","Ahoada West","Akukutor","Andoni/Odual","Asari-Toru","Bonny","Degema","Eleme","Emuoha","Etche","Gokana","Ikwerre","Khana","Obio/Akpor","Ogba/Egbema/Andoni","Ogu/Bolo","Okrika","Omumma","Opobo/Nkoro","Oyigbo","Port Harcourt","Tai"],"Sokoto":["Binji","Bodinga","Dange-Shuni","Gada","Goronyo","Gudu","Gwadabaw","Illela","Isa","Kebbe","Kware","Rabah","Sabon Birni","Shagari","Silame","Sokoto North","Sokoto South","Tambawal","Tangazar","Tureta","Wamakko","Wurno","Yabo"],"Taraba":["Ardo-Kola","Bali","Donga","Gashaka","Gassol","Ibi","Jalingo","Karim-Lamido","Kurmi","Lau","Sardauna","Takum","Ussa","Wukari","Yorro","Zing"],"Yobe":["Bade","Borsari","Damaturu","Fika","Fune","Geidam","Gujba","Gulani","Jakusko","Karasuwa","Machina","Nangere","Nguru","Potiskum","Tarmuwa","Yunusari","Yusufari"],"Zamfara":["Anka","Bakura","Birnin Magaji","Bukkuyum","Bungudu","Gummi","Gusau","Kaura-Namoda","Maradun","Maru","Shinkafi","Talata-Mafara","Tsafe","Zurmi"]}`) as Record<string, string[]>;

type SelectOption = {
  label: string;
  value: string;
};

const STATE_NAME_CORRECTIONS: Record<string, string> = {
  Nassarawa: "Nasarawa",
};

const LGA_NAME_CORRECTIONS: Record<string, Record<string, string>> = {
  Abia: {
    "Oboma Ngwa": "Obingwa",
    Osisioma: "Osisioma Ngwa",
    "Umu-Nneochi": "Umunneochi",
  },
  Adamawa: {
    Girie: "Girei",
    Teungo: "Toungo",
  },
  Bauchi: {
    Gamjuwa: "Ganjuwa",
    "Tafawa-Balewa": "Tafawa Balewa",
  },
  Bayelsa: {
    "Kolokuma-Opokuma": "Kolokuma/Opokuma",
  },
  Benue: {
    "Katsina- Ala": "Katsina-Ala",
    Oturkpo: "Otukpo",
  },
  "Cross River": {
    "Calabar Municipality": "Calabar Municipal",
  },
  Delta: {
    AniochaN: "Aniocha North",
    AniochaS: "Aniocha South",
    EthiopeE: "Ethiope East",
    IkaNorth: "Ika North East",
    IkaSouth: "Ika South",
    IsokoNor: "Isoko North",
    IsokoSou: "Isoko South",
  },
  Ebonyi: {
    Abakalik: "Abakaliki",
  },
  Edo: {
    "Akoko Edo": "Akoko-Edo",
    "Esan Centtral": "Esan Central",
    "Esan North East": "Esan North-East",
    "Esan South East": "Esan South-East",
    Orhionmw: "Orhionmwon",
    "Ovia North East": "Ovia North-East",
    "Ovia South West": "Ovia South-West",
  },
  Ekiti: {
    "Ekiti South West": "Ekiti South-West",
    Gboyin: "Gbonyin",
    "Irepodun-Ifelodun": "Irepodun/Ifelodun",
    "Ise-Orun": "Ise/Orun",
  },
  Enugu: {
    EnuguSou: "Enugu South",
    "Igbo-Eti": "Igbo-Etiti",
    "Igbo-eze North": "Igbo-Eze North",
    "Igbo-eze South": "Igbo-Eze South",
    "Oji-River": "Oji River",
  },
  "Federal Capital Territory": {
    Municipal: "Abuja Municipal Area Council",
  },
  Gombe: {
    Shomgom: "Shongom",
    "Yalmatu / Deba": "Yamaltu/Deba",
  },
  Imo: {
    "Aboh-Mbaise": "Aboh Mbaise",
    "Ahiazu-Mbaise": "Ahiazu Mbaise",
    "Ehime-Mbano": "Ehime Mbano",
    "Ihitte-Uboma Isinweke": "Ihitte/Uboma",
    "Ngor-Okpala": "Ngor Okpala",
    "Ohaji-Egbema": "Ohaji/Egbema",
    "Oru-East": "Oru East",
    "Oru-West": "Oru West",
  },
  Jigawa: {
    "Kirika Samma": "Kiri Kasama",
    "Malam Mado": "Malam Madori",
  },
  Kano: {
    "Tundun Wada": "Tudun Wada",
  },
  Katsina: {
    Danmusa: "Dan Musa",
    "Dutsin-M": "Dutsin-Ma",
    Kankiya: "Kankia",
    "Katsina (K)": "Katsina",
  },
  Kebbi: {
    Arewa: "Arewa Dandi",
    "Danko Wasagu": "Wasagu/Danko",
    "Koko/Bes": "Koko/Besse",
  },
  Kogi: {
    "Kabba-Bunu": "Kabba/Bunu",
    "Koton-Karfe": "Kogi",
    "Ogori Magongo": "Ogori/Magongo",
  },
  Kwara: {
    "Oke-Ero": "Oke Ero",
  },
  Lagos: {
    "Ajeromi/Ifelodun": "Ajeromi-Ifelodun",
    "Amuwo Odofin": "Amuwo-Odofin",
    Badagary: "Badagry",
    "Ibeju/Lekki": "Ibeju-Lekki",
    "Ifako/Ijaye": "Ifako-Ijaiye",
    "Oshodi/Isolo": "Oshodi-Isolo",
  },
  Nasarawa: {
    "Nassarawa Egon": "Nasarawa Egon",
  },
  Niger: {
    Kontogur: "Kontagora",
  },
  Ogun: {
    "Ado Odo-Ota": "Ado-Odo/Ota",
    "Egbado North": "Yewa North",
    "Egbado South": "Yewa South",
    "Ijebu-Ode": "Ijebu Ode",
    "Imeko-Afon": "Imeko Afon",
    "Obafemi-Owode": "Obafemi Owode",
    Shagamu: "Sagamu",
  },
  Ondo: {
    AkokoNorthWest: "Akoko North-West",
    "Ese-Odo": "Ese Odo",
    "IleOluji/Okeigbo": "Ile Oluji/Okeigbo",
  },
  Osun: {
    "Atakumosa East": "Atakunmosa East",
    "Atakumosa West": "Atakunmosa West",
    IfeCentral: "Ife Central",
    "Ilesha East": "Ilesa East",
    "Ilesha West": "Ilesa West",
    "Ola-Oluwa": "Ola Oluwa",
  },
  Oyo: {
    "Ibadan North East": "Ibadan North-East",
    "Ibadan North West": "Ibadan North-West",
    "Ibadan South East": "Ibadan South-East",
    "Ibadan South West": "Ibadan South-West",
    "Ogo-Oluwa": "Ogo Oluwa",
    "Ona-Ara": "Ona Ara",
    "Ori-Ire": "Ori Ire",
  },
  Plateau: {
    "Qua'anpa": "Qua'an Pan",
  },
  Rivers: {
    "Abua/Odu": "Abua/Odual",
    Akukutor: "Akuku-Toru",
    "Andoni/Odual": "Andoni",
    "Ogba/Egbema/Andoni": "Ogba/Egbema/Ndoni",
    Omumma: "Omuma",
  },
  Sokoto: {
    "Dange-Shuni": "Dange Shuni",
    Gwadabaw: "Gwadabawa",
    Tambawal: "Tambuwal",
    Tangazar: "Tangaza",
    Wamakko: "Wamako",
  },
  Taraba: {
    "Ardo-Kola": "Ardo Kola",
    "Karim-Lamido": "Karim Lamido",
  },
  Yobe: {
    Borsari: "Bursari",
  },
  Zamfara: {
    "Kaura-Namoda": "Kaura Namoda",
    "Talata-Mafara": "Talata Mafara",
  },
};

function toCorrectedEntry(stateName: string, lgas: string[]) {
  const correctedStateName = STATE_NAME_CORRECTIONS[stateName] ?? stateName;
  const corrections = LGA_NAME_CORRECTIONS[correctedStateName] ?? {};

  return [
    correctedStateName,
    Array.from(new Set(lgas.map((lga) => corrections[lga] ?? lga))),
  ] as const;
}

const nigeriaLocationEntries = Object.entries(rawNigeriaStateToLgas)
  .map(([stateName, lgas]) => toCorrectedEntry(stateName, lgas))
  .sort(([left], [right]) => left.localeCompare(right));

export const NIGERIA_STATE_TO_LGAS = Object.fromEntries(
  nigeriaLocationEntries,
) as Record<string, string[]>;

export const NIGERIAN_STATES = nigeriaLocationEntries.map(([stateName]) => stateName);

export const NIGERIAN_STATE_OPTIONS: SelectOption[] = NIGERIAN_STATES.map(
  (stateName) => ({
    label:
      stateName === "Federal Capital Territory"
        ? "Federal Capital Territory (Abuja)"
        : stateName,
    value: stateName,
  }),
);

export function getNigeriaLgaOptions(stateName: string): SelectOption[] {
  return (NIGERIA_STATE_TO_LGAS[stateName] ?? []).map((lga) => ({
    label: lga,
    value: lga,
  }));
}
