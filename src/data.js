/* ===== Datenschicht: live (Supabase) oder Vorschau (Beispieldaten im Browser) ===== */
const TAETIGKEITEN = ["Mauern (Ytong)","Rückbau & Abbruch","Elektrik","Fliesen","Trockenbau","Malern","Boden","Sanitär",
  "Bühne & Technik","Aufräumen & Entsorgen","Einkauf & Transport","Verpflegung"];
const BEREICHE = ["Gottesdienstraum","Bühne","Gemeinschaftsraum","Küche","WC-Block","Jugendraum","Stillraum","Kinderraum",
  "Pastor-Büro","Warteraum","Flur & Eingang","Außenbereich","Ganze Halle"];
const STATUS = {offen:"Offen",geplant:"Geplant",in_arbeit:"In Arbeit",erledigt:"Erledigt"};
const MSTATUS = {bedarf:"Bedarf",angefragt:"Angefragt",freigegeben:"Freigegeben",bestellt:"Bestellt",geliefert:"Geliefert",abgelehnt:"Abgelehnt"};
const TABELLEN = ["profil","leitung","team","team_mitglied","aufgabe","eintrag","verfuegbarkeit","material","werkzeug","planobjekt"];

const iso = d => { const z=new Date(d); z.setMinutes(z.getMinutes()-z.getTimezoneOffset()); return z.toISOString().slice(0,10); };
const heuteIso = () => iso(new Date());
const plusTage = (s,n) => { const d=new Date(s+"T12:00:00"); d.setDate(d.getDate()+n); return iso(d); };
const naechsterSamstag = () => { const d=new Date(); const n=(6-d.getDay()+7)%7; d.setDate(d.getDate()+n); return iso(d); };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "x"+Math.random().toString(36).slice(2)+Date.now().toString(36));

/* ---------- Vorschau-Speicher ---------- */
function demoDaten(){
  const sa = naechsterSamstag(), sa2 = plusTage(sa,7), sa3 = plusTage(sa,14);
  const P = (name,rolle,schwer,hinweis)=>({id:uid(),name,rolle,schwerpunkte:schwer,hinweis:hinweis||null,telefon:null,erstellt:new Date().toISOString()});
  const tobi=P("Tobi","admin",["Bühne & Technik","Elektrik"]), andreas=P("Andreas Kollert","bauleitung",[]), roland=P("Roland","bauleitung",[]),
    christoph=P("Christoph","bauleitung",[]), bernd=P("Bernd","bauleitung",[],"lange Anreise – eher am Wochenende"),
    igor=P("Igor","bauleitung",["Mauern (Ytong)"],"lange Anreise – eher am Wochenende"), andre=P("Andre","bauleitung",["Mauern (Ytong)","Fliesen"]),
    daniel=P("Daniel Lutz","bauleitung",["Elektrik"]), linda=P("Linda","bauleitung",["Verpflegung"]), jonas=P("Jonas","bauleitung",["Verpflegung"]),
    parfait=P("Parfait","mitglied",[]);
  const profil=[tobi,andreas,roland,christoph,bernd,igor,andre,daniel,linda,jonas,parfait];
  const L=(p,schwer,hinweis,sort)=>({id:uid(),name:p.name,schwerpunkt:schwer,hinweis:hinweis||null,profil_id:p.id,sort});
  const leitung=[L(tobi,"alles",null,1),L(andreas,"alles",null,2),L(roland,"alles",null,3),L(christoph,"alles",null,4),
    L(bernd,"alles","lange Anreise – eher am Wochenende",5),L(igor,"alles, vor allem Mauern","lange Anreise – eher am Wochenende",6),
    L(andre,"alles, vor allem Mauern und Fliesenlegen",null,7),L(daniel,"Elektrik",null,8),L(linda,"Verpflegung",null,9),
    L(jonas,"Verpflegung",null,10),L(parfait,"Pastor (übergeordnet, kein Bautrupp)",null,11)];
  const T=(name,gewerk,beschreibung,leiter,farbe,sort)=>({id:uid(),name,gewerk,beschreibung,leiter,farbe,sort});
  const tMauer=T("Mauerwerk & Ytong","Mauern","Neue Wände (gelb im Plan), Ytong mit Ringanker","Andre, Igor","#c2410c",1),
    tFliesen=T("Fliesen","Fliesen","WC-Block, Küche, Sanitär","Andre","#0e7490",2),
    tElektro=T("Elektrik","Elektrik","Leitungen, Verteilung, Licht, Bühne & LED-Wand","Daniel Lutz","#ca8a04",3),
    tRueck=T("Rückbau & Allgemein","Rückbau","Wände zurückbauen, Entsorgen, Aufräumen, Helfen","Leitungsgruppe","#475569",4),
    tVerpf=T("Verpflegung","Verpflegung","Essen und Getränke für die Bautage","Linda, Jonas","#be185d",5);
  const team=[tMauer,tFliesen,tElektro,tRueck,tVerpf];
  const tm=(t,p)=>({team_id:t.id,profil_id:p.id});
  const team_mitglied=[tm(tMauer,andre),tm(tMauer,igor),tm(tFliesen,andre),tm(tElektro,daniel),tm(tElektro,tobi),tm(tRueck,andreas),tm(tRueck,roland),tm(tRueck,christoph),tm(tRueck,bernd),tm(tVerpf,linda),tm(tVerpf,jonas)];
  const A=(titel,beschreibung,gewerk,bereich,status,team,zug,datum,prio)=>({id:uid(),titel,beschreibung,gewerk,bereich,status,prio:prio||2,datum:datum||null,team_id:team?team.id:null,zugewiesen:(zug||[]).map(p=>p.id),vorschlag:true,erstellt_von:tobi.id,erstellt:new Date().toISOString()});
  const a1=A("Nicht benötigte Wände zurückbauen","Wände, die laut aktuellem Plan wegfallen, abbrechen und Schutt entsorgen.","Rückbau & Abbruch","Ganze Halle","in_arbeit",tRueck,[andreas,roland,christoph],sa),
    a2=A("Trennwand Gemeinschaftsraum | Gottesdienstraum","Lange Wand, ca. 20 m, Ytong, mit Ringanker (gelb im Plan).","Mauern (Ytong)","Gemeinschaftsraum","geplant",tMauer,[andre,igor],sa2,1),
    a3=A("Wand hinter der Bühne (LED-Wand)","Lange Wand, ca. 20 m, Ytong, mit Ringanker. Trägt später die LED-Leinwand 10 × 3 m.","Mauern (Ytong)","Bühne","offen",tMauer,[],sa3,1),
    a4=A("Wände Küche und WC-Block","Neue Wände Küche (NGF 20,96 m²) und WC-Block (NGF 20,96 m²), gelb im Plan.","Mauern (Ytong)","Küche","offen",tMauer,[]),
    a5=A("Elektro-Planung Bühne & LED-Wand","Stromkreise für LED-Leinwand, Bühnenlicht und Ton festlegen.","Elektrik","Bühne","geplant",tElektro,[daniel,tobi]),
    a6=A("Fliesen WC-Block","Boden- und Wandfliesen im WC-Block.","Fliesen","WC-Block","offen",tFliesen,[andre]),
    a7=A("Verpflegung Samstag","Mittagessen und Getränke für alle Helfer.","Verpflegung","Gemeinschaftsraum","geplant",tVerpf,[linda,jonas],sa);
  const aufgabe=[a1,a2,a3,a4,a5,a6,a7];
  const V=(p,datum,von,bis,taet,gleich,notiz)=>({id:uid(),profil_id:p.id,datum,von,bis,taetigkeiten:taet,alles_gleich:!!gleich,notiz:notiz||null});
  const verfuegbarkeit=[V(tobi,sa,"08:00","17:00",["Bühne & Technik","Elektrik"]),V(andreas,sa,"08:00","16:00",[],true),V(roland,sa,"09:00","15:00",["Rückbau & Abbruch","Aufräumen & Entsorgen"]),
    V(christoph,sa,"08:00","14:00",[],true),V(bernd,sa,"10:00","18:00",["Mauern (Ytong)","Rückbau & Abbruch"],false,"komme Freitagabend an"),V(igor,sa,"10:00","18:00",["Mauern (Ytong)"]),
    V(linda,sa,"11:00","15:00",["Verpflegung"]),V(jonas,sa,"11:00","15:00",["Verpflegung","Einkauf & Transport"]),V(andre,sa2,"08:00","17:00",["Mauern (Ytong)","Fliesen"]),
    V(igor,sa2,"09:00","17:00",["Mauern (Ytong)"]),V(bernd,sa2,"09:00","17:00",[],true),V(daniel,plusTage(sa,3),"17:00","20:00",["Elektrik"]),V(tobi,plusTage(sa,3),"17:00","20:00",["Elektrik"])];
  const E=(p,datum,text,a)=>({id:uid(),datum,text,aufgabe_id:a?a.id:null,fotos:[],autor:p.id,erstellt:new Date(datum+"T16:00:00").toISOString()});
  const eintrag=[E(andreas,plusTage(sa,-7),"Beispiel: Erster Rückbau-Samstag – zwei Zwischenwände im alten Lagerbereich abgebrochen, Schutt in den Container.",a1),
    E(linda,plusTage(sa,-7),"Beispiel: Mittagessen für 14 Helfer, Getränke reichen noch für nächsten Samstag.",a7)];
  const M=(name,menge,einheit,gewerk,status,notiz,a,p,vorschlag)=>({id:uid(),name,menge,einheit,gewerk,status,notiz:notiz||null,aufgabe_id:a?a.id:null,vorschlag:!!vorschlag,angefragt_von:p.id,erstellt:new Date().toISOString()});
  const material=[M("Ytong-Plansteine",null,"Paletten","Mauern (Ytong)","bedarf","Menge nach Wandhöhe berechnen",a2,tobi,true),
    M("Dünnbettmörtel",null,"Sack","Mauern (Ytong)","bedarf",null,a2,tobi,true),M("U-Schalen für Ringanker",null,"Stück","Mauern (Ytong)","bedarf",null,a2,tobi,true),
    M("Bewehrungsstahl Ringanker",null,"m","Mauern (Ytong)","bedarf",null,a2,tobi,true),M("Schuttsäcke",50,"Stück","Rückbau & Abbruch","angefragt","Beispiel-Anfrage",a1,roland)];
  const W=(p,name,kategorie,anzahl,verf,notiz)=>({id:uid(),name,kategorie,anzahl,verfuegbarkeit:verf,notiz:notiz||null,besitzer:p.id,erstellt:new Date().toISOString()});
  const werkzeug=[W(igor,"Mörtelrührer","Mauern",1,"Samstags dabei"),W(andre,"Fliesenschneider 1,2 m","Fliesen",1,"nach Absprache"),
    W(roland,"Abbruchhammer","Rückbau",1,"bleibt auf der Baustelle"),W(daniel,"Kabeltrommel 50 m","Elektrik",2,"Samstags dabei"),W(christoph,"Rollgerüst","Allgemein",1,"nach Absprache")];
  const planobjekt=[];
  return {me:tobi.id,profil,leitung,team,team_mitglied,aufgabe,eintrag,verfuegbarkeit,material,werkzeug,planobjekt};
}

const DemoBackend = {
  modus:"demo", d:null,
  async init(){ let roh=null; try{ roh=localStorage.getItem("gb-demo-v1"); }catch(e){}
    this.d = roh ? JSON.parse(roh) : demoDaten(); this.speichern(); return true; },
  speichern(){ try{ const kopie={...this.d}; localStorage.setItem("gb-demo-v1",JSON.stringify(kopie)); }catch(e){} },
  zuruecksetzen(){ this.d=demoDaten(); this.speichern(); },
  async sitzung(){ return {user:{id:this.d.me}}; },
  async meinProfil(){ return this.d.profil.find(p=>p.id===this.d.me)||null; },
  async alle(t){ return JSON.parse(JSON.stringify(this.d[t]||[])); },
  async neu(t,o){ const z={id:uid(),...o}; if(t==="team_mitglied") delete z.id; this.d[t].push(z); this.speichern(); return z; },
  async aendern(t,id,p){ const z=this.d[t].find(r=>r.id===id); Object.assign(z,p); this.speichern(); return z; },
  async loeschen(t,id){ this.d[t]=this.d[t].filter(r=>r.id!==id); this.speichern(); },
  async austreten(teamId,profilId){ this.d.team_mitglied=this.d.team_mitglied.filter(r=>!(r.team_id===teamId&&r.profil_id===profilId)); this.speichern(); },
  async fotoHoch(datei){ return await verkleinern(datei,900,.8); },   // als data-URL (nur Vorschau)
  async fotoUrls(pfade){ const o={}; pfade.forEach(p=>o[p]=p); return o; },
  abonnieren(){}, async abmelden(){}, async codeSetzen(){ return true; }
};

/* ---------- Live (Supabase) ---------- */
const LiveBackend = {
  modus:"live", sb:null, kanal:null,
  async init(){ if(!window.supabase||!GB_KONFIG.url) return false;
    this.sb = window.supabase.createClient(GB_KONFIG.url, GB_KONFIG.anonKey, {auth:{persistSession:true,autoRefreshToken:true}}); return true; },
  async sitzung(){ const {data}=await this.sb.auth.getSession(); return data.session; },
  async anmelden(email,pw){ const {data,error}=await this.sb.auth.signInWithPassword({email,password:pw}); if(error) throw error; return data; },
  async registrieren(email,pw){ const {data,error}=await this.sb.auth.signUp({email,password:pw}); if(error) throw error;
    if(!data.session) throw new Error("Bitte bestätige zuerst die E-Mail, dann anmelden."); return data; },
  async beitreten(code,name){ const {data,error}=await this.sb.rpc("beitreten",{p_code:code,p_name:name}); if(error) throw new Error(error.message); return data; },
  async abmelden(){ await this.sb.auth.signOut(); },
  async meinProfil(){ const s=await this.sitzung(); if(!s) return null;
    const {data}=await this.sb.from("profil").select("*").eq("id",s.user.id).maybeSingle(); return data; },
  async alle(t){ const {data,error}=await this.sb.from(t).select("*"); if(error) throw error; return data; },
  async neu(t,o){ const {data,error}=await this.sb.from(t).insert(o).select().maybeSingle(); if(error) throw error; return data; },
  async aendern(t,id,p){ const {data,error}=await this.sb.from(t).update(p).eq("id",id).select().maybeSingle(); if(error) throw error; return data; },
  async loeschen(t,id){ const {error}=await this.sb.from(t).delete().eq("id",id); if(error) throw error; },
  async austreten(teamId,profilId){ const {error}=await this.sb.from("team_mitglied").delete().eq("team_id",teamId).eq("profil_id",profilId); if(error) throw error; },
  async fotoHoch(datei){ const blob=await verkleinern(datei,1600,.82,true); const s=await this.sitzung();
    const pfad=`${s.user.id}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.jpg`;
    const {error}=await this.sb.storage.from("fotos").upload(pfad,blob,{contentType:"image/jpeg"}); if(error) throw error; return pfad; },
  async fotoUrls(pfade){ const o={}; if(!pfade.length) return o;
    const {data}=await this.sb.storage.from("fotos").createSignedUrls(pfade,3600); (data||[]).forEach(x=>{ if(x.signedUrl) o[x.path]=x.signedUrl; }); return o; },
  abonnieren(cb){ if(this.kanal) return; this.kanal=this.sb.channel("alles");
    TABELLEN.forEach(t=>this.kanal.on("postgres_changes",{event:"*",schema:"public",table:t},()=>cb(t))); this.kanal.subscribe(); },
  async codeSetzen(code){ const {error}=await this.sb.rpc("code_setzen",{p_code:code}); if(error) throw error; return true; }
};

/* Bild verkleinern (spart Datenvolumen auf der Baustelle) */
function verkleinern(datei,max,q,alsBlob){
  return new Promise((ok,fehl)=>{ const r=new FileReader(); r.onerror=fehl; r.onload=()=>{ const img=new Image(); img.onerror=()=>fehl(new Error("Bild nicht lesbar"));
    img.onload=()=>{ const f=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement("canvas"); c.width=Math.round(img.width*f); c.height=Math.round(img.height*f);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height); if(alsBlob) c.toBlob(b=>ok(b),"image/jpeg",q); else ok(c.toDataURL("image/jpeg",q)); }; img.src=r.result; }; r.readAsDataURL(datei); });
}
