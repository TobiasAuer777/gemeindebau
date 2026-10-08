/* ===== Gemeindebau – App ===== */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S = {me:null,profil:[],leitung:[],team:[],team_mitglied:[],aufgabe:[],eintrag:[],verfuegbarkeit:[],material:[],werkzeug:[],planobjekt:[],urls:{}};
let B=null, ansicht="start", kalMonat=new Date(), mehrfach=null, filterA={art:"alle",gewerk:"",phase:""}, filterM="alle", halleReiter="plan", planAuswahl=null, dreiD=null, suchW="";

const IC = {
  start:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  kalender:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><rect x="13" y="13" width="4" height="4" rx=".5"/>',
  aufgaben:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/>',
  tagebuch:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><circle cx="11.5" cy="8.5" r="1.6"/>',
  halle:'<path d="M3 20V9l9-5 9 5v11"/><path d="M3 20h18"/><rect x="9" y="13" width="6" height="7"/>',
  teams:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.6 3-5.5 6-5.5s5.4 1.9 6 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.6c2.6-.2 4.5 1.4 5 4.4"/>',
  material:'<path d="M3 8 12 3l9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  werkzeug:'<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5"/>',
  profil:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  benutzer:'<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  mehr:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', foto:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  zu:'<path d="M6 6l12 12M18 6 6 18"/>', links:'<path d="m15 5-7 7 7 7"/>', rechts:'<path d="m9 5 7 7-7 7"/>', check:'<path d="m5 12 4 4 10-10"/>',
  drehen:'<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>', papierkorb:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
const icon = (n,cls="") => `<svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||""}</svg>`;
const NAV = [["start","Start"],["kalender","Kalender"],["aufgaben","Aufgaben"],["tagebuch","Bautagebuch"],["halle","Halle & 3D"],"-",["teams","Teams & Leitung"],["material","Material"],["werkzeug","Werkzeug"]];

/* ---------- Personen & Formate ---------- */
const person = id => S.profil.find(p=>p.id===id);
const nameVon = id => person(id)?.name || "Unbekannt";
const vorname = id => nameVon(id).split(" ")[0];
const FARBEN = ["#2b4fa0","#e2641a","#0e7490","#7c3aed","#be185d","#15803d","#a8321c","#ca8a04","#334155","#0369a1"];
const farbe = id => { let h=0; for(const c of String(id)) h=(h*31+c.charCodeAt(0))>>>0; return FARBEN[h%FARBEN.length]; };
const init = id => nameVon(id).split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const ava = (id,gr) => `<span class="avatar" style="background:${farbe(id)}${gr?`;width:${gr}px;height:${gr}px;font-size:${Math.round(gr*.38)}px`:''}" title="${esc(nameVon(id))}">${esc(init(id))}</span>`;
const avas = (ids,max=6) => `<span class="avatare">${ids.slice(0,max).map(i=>ava(i)).join("")}${ids.length>max?`<span class="avatar" style="background:var(--text3)">+${ids.length-max}</span>`:""}</span>`;
const WT = ["So","Mo","Di","Mi","Do","Fr","Sa"];
const dKurz = s => { if(!s) return ""; const d=new Date(s+"T12:00:00"); return `${WT[d.getDay()]} ${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.`; };
const dLang = s => new Date(s+"T12:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const zeit = (v,b) => v||b ? `${(v||"").slice(0,5)}${b?"–"+b.slice(0,5):""} Uhr` : "ganztags";
const istLeitung = () => ["admin","bauleitung"].includes(S.me?.rolle);
const istAdmin = () => S.me?.rolle==="admin";
const teamVon = id => S.team.find(t=>t.id===id);
const gewerkFarbe = a => teamVon(a.team_id)?.farbe || "var(--linie)";
const zahlDe = n => (n==null||n==="") ? "" : String(n).replace(".",",");

/* ---------- Laden ---------- */
async function ladeAlles(){ await Promise.all(TABELLEN.map(async t=>{ try{ S[t]=await B.alle(t); }catch(e){ console.warn(t,e); S[t]=[]; } }));
  const ich=S.profil.find(p=>p.id===S.me?.id); if(ich) S.me=ich; }
let nachladenTimer={};
function nachladen(t){ clearTimeout(nachladenTimer[t]); nachladenTimer[t]=setTimeout(async()=>{ try{ S[t]=await B.alle(t); if(t==="profil"){ const ich=S.profil.find(p=>p.id===S.me.id); if(ich) S.me=ich; } }catch(e){}
  if(ansicht==="halle"){ if(t==="planobjekt") halleAktualisieren(); } else if(!document.querySelector(".schleier")) render(); },250); }
async function speichere(fn,meldung){ try{ const r=await fn(); if(meldung) toast(meldung); return r; }catch(e){ console.error(e); toast("Nicht gespeichert: "+(e.message||e)); throw e; } }

/* ---------- Rahmen ---------- */
function rahmen(){
  const navBtn = ([k,l]) => `<button data-a="geh" data-ziel="${k}" ${ansicht===k?'aria-current="page"':''}>${icon(k)}<span>${l}</span></button>`;
  const ich = S.me;
  return `<div class="app">
  <aside class="seite">
    <div class="marke"><img src="${LOGO}" alt="Logo Tabernacle Church"><div><b>Gemeindebau</b><span>Tabernacle Church · Konzstraße 9</span></div></div>
    <nav class="nav" aria-label="Bereiche">${[...NAV,...(istAdmin()?[["benutzer","Benutzer"]]:[])].map(n=>n==="-"?'<div class="trenn"></div>':navBtn(n)).join("")}</nav>
    <button class="ich" data-a="geh" data-ziel="profil">${ava(ich.id,34)}<span><b>${esc(ich.name)}</b><small>${rolleText(ich.rolle)}</small></span></button>
  </aside>
  <main class="haupt" id="haupt">
    <div class="handykopf"><div class="marke"><img src="${LOGO}" alt="Logo"><div><b>Gemeindebau</b><span>Tabernacle Church</span></div></div>
      <button class="btn still" data-a="geh" data-ziel="profil" aria-label="Profil">${ava(ich.id,32)}</button></div>
    ${B.modus==="demo"?`<div class="demo-band"><b>Vorschau mit Beispieldaten.</b> Alles, was du hier einträgst, bleibt nur in diesem Browser. Die echte Seite für die Gemeinde läuft mit eigener Anmeldung. <button class="btn klein" data-a="demoReset">Beispieldaten zurücksetzen</button></div>`:""}
    <div id="ansicht">${ANSICHTEN[ansicht]()}</div>
  </main>
  <nav class="unten" aria-label="Bereiche">${[["start","Start"],["kalender","Kalender"],["aufgaben","Aufgaben"],["halle","Halle"],["mehr","Mehr"]].map(([k,l])=>`<button data-a="${k==="mehr"?"mehr":"geh"}" data-ziel="${k}" ${ansicht===k||(k==="mehr"&&["tagebuch","teams","material","werkzeug","profil","benutzer"].includes(ansicht))?'aria-current="page"':''}>${icon(k)}${l}</button>`).join("")}</nav>
</div>`;
}
const rolleText = r => ({admin:"Admin · Bauleitung",bauleitung:"Bauleitung",mitglied:"Gemeindemitglied"})[r]||r;
function render(){ if(dreiD){ dreiD.stop(); dreiD=null; }
  document.getElementById("wurzel").innerHTML = rahmen(); nachRender(); }
function nachRender(){
  if(ansicht==="halle") halleStarten();
  fotosAufloesen(document);
}
async function fotosAufloesen(root){ const imgs=$$("img[data-foto]",root); const fehlend=[...new Set(imgs.map(i=>i.dataset.foto).filter(p=>!S.urls[p]))];
  if(fehlend.length){ try{ Object.assign(S.urls, await B.fotoUrls(fehlend)); }catch(e){} }
  imgs.forEach(i=>{ const u=S.urls[i.dataset.foto]; if(u) i.src=u; }); }
const fotoImg = p => `<img data-foto="${esc(p)}" alt="Baustellenfoto" loading="lazy" ${p.startsWith("data:")?`src="${p}"`:""}>`;

/* ---------- Dialog & Meldungen ---------- */
function oeffne(titel,html,unter=""){ schliesse(); const s=document.createElement("div"); s.className="schleier";
  s.innerHTML=`<div class="schublade" role="dialog" aria-modal="true" aria-label="${esc(titel)}"><header><div><h2>${esc(titel)}</h2>${unter?`<p class="leise klein" style="margin-top:4px">${unter}</p>`:""}</div><button class="btn still" data-a="zu" aria-label="Schließen">${icon("zu")}</button></header>${html}</div>`;
  s.addEventListener("click",e=>{ if(e.target===s) schliesse(); }); document.body.appendChild(s); fotosAufloesen(s); setTimeout(()=>s.querySelector("input,textarea,select")?.focus({preventScroll:true}),50); return s; }
function schliesse(){ $$(".schleier").forEach(x=>x.remove()); }
document.addEventListener("keydown",e=>{ if(e.key==="Escape") schliesse(); });
function toast(t){ $$(".toast").forEach(x=>x.remove()); const d=document.createElement("div"); d.className="toast"; d.setAttribute("role","status"); d.textContent=t; document.body.appendChild(d); setTimeout(()=>d.remove(),2600); }

/* ================= Ansichten ================= */
const ANSICHTEN = {};

/* ---------- Start ---------- */
ANSICHTEN.start = () => {
  const heute=heuteIso(), sa=naechsterSamstag(), daSa=S.verfuegbarkeit.filter(v=>v.datum===sa);
  const ichSa=daSa.some(v=>v.profil_id===S.me.id);
  const meine=S.aufgabe.filter(a=>a.zugewiesen.includes(S.me.id)&&a.status!=="erledigt").sort((a,b)=>(a.datum||"9")<(b.datum||"9")?-1:1);
  const fertig=S.aufgabe.filter(a=>a.status==="erledigt").length, gesamt=S.aufgabe.length;
  const proz=gesamt?Math.round(fertig/gesamt*100):0;
  const letzte=[...S.eintrag].sort((a,b)=>b.erstellt<a.erstellt?-1:1).slice(0,3);
  const tage=[...Array(14)].map((_,i)=>plusTage(heute,i)); const anz=tage.map(d=>S.verfuegbarkeit.filter(v=>v.datum===d).length); const maxA=Math.max(3,...anz);
  const nachT=taetigkeitsZaehlung(daSa);
  const anfragen=S.material.filter(m=>m.status==="angefragt");
  const ohne=S.aufgabe.filter(a=>!a.zugewiesen.length&&a.status!=="erledigt");
  return `<div class="kopf"><div><p class="etikett">Umnutzung Werkhalle → Begegnungsstätte</p><h1>Hallo ${esc(S.me.name.split(" ")[0])}!</h1>
    <p class="unter">${istLeitung()?"Deine Bauleitungs-Übersicht.":"Schön, dass du mit anpackst."} Samstage sind die großen Bautage.</p></div>
    <div class="zeile"><button class="btn primaer" data-a="verfOeffnen" data-datum="${sa}">${icon("kalender")}Ich bin da …</button><button class="btn" data-a="eintragNeu">${icon("foto")}Foto & Notiz</button><button class="btn" data-a="materialNeu">${icon("material")}Material anfragen</button></div></div>
  <div class="raster r2">
    <section class="karte" style="border-top:4px solid var(--flamme)"><header><div><p class="etikett">Nächster Bautag</p><h2>${dLang(sa)}</h2></div><span class="zahl">${daSa.length}<small>dabei</small></span></header>
      ${daSa.length?`<div class="stapel">${avas(daSa.map(v=>v.profil_id),10)}
        <div class="chips">${nachT.map(([t,n])=>`<span class="pille">${esc(t)} · ${n}</span>`).join("")}</div></div>`:`<div class="leer">Noch niemand eingetragen. Trag dich als Erster ein.</div>`}
      <div class="zeile" style="margin-top:14px">${ichSa?`<span class="pille erledigt">${icon("check","")}Du bist eingetragen</span><button class="btn klein" data-a="verfOeffnen" data-datum="${sa}">Ändern</button>`:`<button class="btn flamme" data-a="verfOeffnen" data-datum="${sa}">Ich bin dabei</button>`}<button class="btn still klein" data-a="tagOeffnen" data-datum="${sa}">Wer kommt wann?</button></div></section>
    <section class="karte"><header><h2>Meine Aufgaben</h2><span class="pille">${meine.length}</span></header>
      ${meine.length?`<div class="liste">${meine.slice(0,5).map(a=>`<button class="akarte" style="--farbe:${gewerkFarbe(a)};border-top:0;border-right:0;border-bottom:0;border-radius:0;padding:10px 0 10px 12px;background:none" data-a="aufgabe" data-id="${a.id}"><b>${esc(a.titel)}</b><span class="zeile klein leise"><span class="pille ${a.status}">${STATUS[a.status]}</span>${a.datum?`<span class="mass">${dKurz(a.datum)}</span>`:""}${a.bereich?`<span>${esc(a.bereich)}</span>`:""}</span></button>`).join("")}</div>`:`<div class="leer">Dir ist gerade nichts zugewiesen. Trag dich im Kalender ein, dann plant dich die Bauleitung ein.</div>`}</section>
    <section class="karte"><header><h2>Wer ist da? Nächste 14 Tage</h2><button class="btn still klein" data-a="geh" data-ziel="kalender">Kalender ${icon("rechts")}</button></header>
      <div class="leiste14">${tage.map((d,i)=>{ const sa_=new Date(d+"T12:00").getDay()===6; return `<button class="s ${sa_?"sa":""}" style="border:0;background:none;padding:0;cursor:pointer" data-a="tagOeffnen" data-datum="${d}" title="${dKurz(d)}: ${anz[i]} Personen"><span class="lbl">${anz[i]||""}</span><span style="height:64px;display:flex;align-items:flex-end;width:100%"><span class="bal" style="height:${Math.max(3,anz[i]/maxA*64)}px"></span></span><span class="lbl">${WT[new Date(d+"T12:00").getDay()]}</span></button>`; }).join("")}</div></section>
    <section class="karte"><header><h2>Baufortschritt</h2><span class="zahl">${proz}<small>%</small></span></header>
      <div style="height:10px;border-radius:99px;background:var(--flaeche2);overflow:hidden"><div style="height:100%;width:${proz}%;background:linear-gradient(90deg,var(--blau),var(--flamme))"></div></div>
      <div class="zeile klein leise" style="margin-top:10px">${Object.keys(STATUS).map(s=>`<span class="pille ${s}">${STATUS[s]} · ${S.aufgabe.filter(a=>a.status===s).length}</span>`).join("")}</div>
      <p class="klein leise" style="margin-top:12px">Bauantrag eingereicht am 17.09.2026, Aktenzeichen <span class="mass">20261647</span>. Stand 22.09.: an das zuständige Bauteam der Stadt Mannheim weitergeleitet.</p></section>
    ${istLeitung()?`<section class="karte"><header><h2>Offene Material-Anfragen</h2><span class="pille ${anfragen.length?"angefragt":""}">${anfragen.length}</span></header>
      ${anfragen.length?`<div class="liste">${anfragen.slice(0,6).map(m=>`<div class="zeile weit"><div><b>${esc(m.name)}</b> <span class="mass leise">${m.menge?zahlDe(m.menge)+" "+esc(m.einheit||""):""}</span><div class="klein leise">${esc(vorname(m.angefragt_von))}${m.aufgabe_id?` · ${esc(S.aufgabe.find(a=>a.id===m.aufgabe_id)?.titel||"")}`:""}</div></div><div class="zeile"><button class="btn klein" data-a="mStatus" data-id="${m.id}" data-s="freigegeben">Freigeben</button><button class="btn klein still" data-a="mStatus" data-id="${m.id}" data-s="abgelehnt">Ablehnen</button></div></div>`).join("")}</div>`:`<div class="leer">Keine offenen Anfragen.</div>`}</section>
    <section class="karte"><header><h2>Aufgaben ohne Zuweisung</h2><span class="pille">${ohne.length}</span></header>
      ${ohne.length?`<div class="liste">${ohne.slice(0,6).map(a=>`<button class="zeile weit" style="border-left:0;border-right:0;border-bottom:0;background:none;cursor:pointer;text-align:left;width:100%" data-a="aufgabe" data-id="${a.id}"><span><b>${esc(a.titel)}</b><span class="klein leise" style="display:block">${esc(a.gewerk||"")}${a.datum?" · "+dKurz(a.datum):""}</span></span>${icon("rechts")}</button>`).join("")}</div>`:`<div class="leer">Alle Aufgaben sind verteilt.</div>`}</section>`:""}
  </div>
  <section class="karte" style="margin-top:16px"><header><h2>Neu im Bautagebuch</h2><button class="btn still klein" data-a="geh" data-ziel="tagebuch">Alle Einträge ${icon("rechts")}</button></header>
    ${letzte.length?`<div class="raster r3">${letzte.map(eintragKarte).join("")}</div>`:`<div class="leer">Noch keine Einträge. Halte den ersten Fortschritt mit Foto fest.</div>`}</section>`;
};
function taetigkeitsZaehlung(liste){ const z={}; liste.forEach(v=>{ if(v.alles_gleich){ z["Alles gleich gern"]=(z["Alles gleich gern"]||0)+1; } else if(v.taetigkeiten[0]) z[v.taetigkeiten[0]]=(z[v.taetigkeiten[0]]||0)+1; });
  return Object.entries(z).sort((a,b)=>b[1]-a[1]); }
function eintragKarte(e){ const a=S.aufgabe.find(x=>x.id===e.aufgabe_id);
  return `<article class="stapel" style="gap:8px">${e.fotos.length?`<div class="foto-reihe">${e.fotos.slice(0,3).map(fotoImg).join("")}</div>`:""}
    <div class="zeile">${ava(e.autor,26)}<div class="klein"><b>${esc(nameVon(e.autor))}</b> <span class="leise">· ${dKurz(e.datum)}</span>${a?`<div class="leise">${esc(a.titel)}</div>`:""}</div></div>
    <p>${esc(e.text||"")}</p></article>`; }

/* ---------- Kalender ---------- */
ANSICHTEN.kalender = () => {
  const j=kalMonat.getFullYear(), m=kalMonat.getMonth(); const erster=new Date(j,m,1), start=new Date(erster); start.setDate(1-((erster.getDay()+6)%7));
  const heute=heuteIso(); const zellen=[];
  for(let i=0;i<42;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const s=iso(d); const da=S.verfuegbarkeit.filter(v=>v.datum===s);
    const ich=da.some(v=>v.profil_id===S.me.id), gew=mehrfach&&mehrfach.has(s); const plan=S.aufgabe.filter(a=>a.datum===s).length;
    zellen.push(`<button class="tag ${d.getMonth()!==m?"fremd":""} ${d.getDay()===6?"sa":""} ${s===heute?"heute":""} ${ich?"ich-da":""}" style="${gew?"outline:3px solid var(--flamme);outline-offset:-3px":""}" data-a="${mehrfach?"mehrTag":"tagOeffnen"}" data-datum="${s}" aria-label="${dLang(s)}, ${da.length} Personen">
      <span class="nr">${d.getDate()}<span class="anz">${da.length?da.length+" "+(da.length===1?"Pers.":"Pers."):""}</span></span>
      <span class="namen">${da.map(v=>esc(vorname(v.profil_id))).join(", ")}</span>${plan?`<span class="pille" style="font-size:10.5px;padding:1px 6px">${plan} Aufg.</span>`:""}</button>`); }
  const monatName=kalMonat.toLocaleDateString("de-DE",{month:"long",year:"numeric"});
  return `<div class="kopf"><div><p class="etikett">Wer ist wann da?</p><h1>Kalender</h1><p class="unter">Tippe auf einen Tag, um zu sehen, wer kommt, und dich selbst einzutragen. <span class="pille" style="background:var(--gold-weich);color:var(--warn)">Samstag = großer Bautag</span></p></div>
    <div class="zeile">${mehrfach?`<span class="klein leise">${mehrfach.size} Tage gewählt</span><button class="btn primaer" data-a="mehrEintragen" ${mehrfach.size?"":"disabled"}>Für diese Tage eintragen</button><button class="btn still" data-a="mehrAus">Abbrechen</button>`:`<button class="btn" data-a="mehrAn">${icon("kalender")}Mehrere Tage auf einmal</button>`}</div></div>
  <section class="karte"><header><div class="zeile"><button class="btn still" data-a="monat" data-d="-1" aria-label="Voriger Monat">${icon("links")}</button><h2 style="min-width:170px;text-align:center">${monatName}</h2><button class="btn still" data-a="monat" data-d="1" aria-label="Nächster Monat">${icon("rechts")}</button></div>
    <button class="btn klein" data-a="monat" data-d="0">Heute</button></header>
    <div class="kal">${["Mo","Di","Mi","Do","Fr","Sa","So"].map(w=>`<div class="wt">${w}</div>`).join("")}${zellen.join("")}</div>
    <p class="klein leise" style="margin-top:12px">Orange Unterkante = du bist eingetragen.</p></section>`;
};
function tagDialog(datum){
  const da=S.verfuegbarkeit.filter(v=>v.datum===datum).sort((a,b)=>(a.von||"")<(b.von||"")?-1:1);
  const plan=S.aufgabe.filter(a=>a.datum===datum); const nachT=taetigkeitsZaehlung(da); const ich=da.find(v=>v.profil_id===S.me.id);
  oeffne(dLang(datum), `
    <div class="zeile">${ich?`<button class="btn" data-a="verfOeffnen" data-datum="${datum}">Meinen Eintrag ändern</button>`:`<button class="btn flamme" data-a="verfOeffnen" data-datum="${datum}">Ich bin da</button>`}<span class="pille">${da.length} ${da.length===1?"Person":"Personen"}</span></div>
    ${nachT.length?`<div class="chips">${nachT.map(([t,n])=>`<span class="pille">${esc(t)} · ${n}</span>`).join("")}</div>`:""}
    <section><h3 style="margin-bottom:8px">Wer kommt</h3>${da.length?`<div class="liste">${da.map(v=>`<div class="zeile" style="align-items:flex-start">${ava(v.profil_id)}<div style="flex:1;min-width:0"><b>${esc(nameVon(v.profil_id))}</b> <span class="mass leise">${zeit(v.von,v.bis)}</span>
      <div class="klein leise">${v.alles_gleich?"Alles gleich gern":v.taetigkeiten.map((t,i)=>`${i+1}. ${esc(t)}`).join(" · ")||"–"}</div>${v.notiz?`<div class="klein">${esc(v.notiz)}</div>`:""}
      ${person(v.profil_id)?.hinweis?`<div class="klein leise">${esc(person(v.profil_id).hinweis)}</div>`:""}</div></div>`).join("")}</div>`:`<div class="leer">Noch niemand eingetragen.</div>`}</section>
    <section><h3 style="margin-bottom:8px">Geplante Aufgaben</h3>${plan.length?`<div class="liste">${plan.map(a=>`<button class="zeile weit" style="border-left:0;border-right:0;border-bottom:0;background:none;width:100%;cursor:pointer;text-align:left" data-a="aufgabe" data-id="${a.id}"><span><b>${esc(a.titel)}</b><span class="klein leise" style="display:block">${a.zugewiesen.map(vorname).map(esc).join(", ")||"noch niemand zugewiesen"}</span></span><span class="pille ${a.status}">${STATUS[a.status]}</span></button>`).join("")}</div>`:`<p class="leise klein">Für diesen Tag ist noch nichts geplant.</p>`}</section>`);
}
function verfDialog(daten){
  const eins=daten.length===1; const vorh=eins?S.verfuegbarkeit.find(v=>v.datum===daten[0]&&v.profil_id===S.me.id):null;
  const reihe=vorh?[...vorh.taetigkeiten]:[...(S.me.schwerpunkte||[])]; const gleich=vorh?vorh.alles_gleich:false;
  const sa=new Date(daten[0]+"T12:00").getDay()===6;
  const s=oeffne(eins?dLang(daten[0]):`${daten.length} Tage eintragen`, `
    <form class="stapel" data-form="verf" data-daten="${daten.join(",")}" ${vorh?`data-id="${vorh.id}"`:""}>
      ${!eins?`<p class="klein leise">${daten.map(dKurz).join(" · ")}</p>`:""}
      <div class="felder"><label class="feld">Von<input type="time" name="von" id="v-von" value="${(vorh?.von||(sa?"08:00":"17:00")).slice(0,5)}"></label><label class="feld">Bis<input type="time" name="bis" id="v-bis" value="${(vorh?.bis||(sa?"17:00":"20:00")).slice(0,5)}"></label></div>
      <div class="stapel" style="gap:6px"><span class="etikett">Was machst du am liebsten?</span><p class="klein leise">Tippe in der Reihenfolge deiner Wünsche. Die Zahl zeigt die Rangfolge, erneut tippen nimmt es heraus.</p>
        <label class="zeile klein" style="font-weight:600"><input type="checkbox" name="gleich" id="v-gleich" ${gleich?"checked":""}> Ich mache alles gleich gern</label>
        <div class="chips" id="v-chips" ${gleich?'style="opacity:.4;pointer-events:none"':""}>${TAETIGKEITEN.map(t=>{ const i=reihe.indexOf(t); return `<button type="button" class="chip" data-a="rang" data-t="${esc(t)}" aria-pressed="${i>=0}">${i>=0?`<span class="nr">${i+1}</span>`:""}${esc(t)}</button>`; }).join("")}</div></div>
      <label class="feld">Notiz (optional)<input type="text" name="notiz" id="v-notiz" value="${esc(vorh?.notiz||"")}" placeholder="z. B. bringe Mörtelrührer mit, komme erst nach dem Mittag"></label>
      <div class="zeile"><button class="btn primaer" type="submit">${icon("check")}Speichern</button>${vorh?`<button class="btn gefahr" type="button" data-a="verfLoeschen" data-id="${vorh.id}">Austragen</button>`:""}</div>
    </form>`);
  s._reihe=reihe;
  s.querySelector("#v-gleich").addEventListener("change",e=>{ const c=s.querySelector("#v-chips"); c.style.opacity=e.target.checked?.4:1; c.style.pointerEvents=e.target.checked?"none":""; });
}

/* ---------- Aufgaben ---------- */
const PLAN_VORSCHLAEGE = [  // [phase, titel, beschreibung, tätigkeit, bereich, team-gewerk, prio] – abgestimmt mit Tobis Checkliste
  [0, "Baugenehmigung verfolgen", "Nutzungsänderung, Az. 20261647. Klären, welche Arbeiten vorher erlaubt sind; Nutzung als Versammlungsstätte erst nach Genehmigung und Abnahme.", "Planung & Organisation", "Ganze Halle", null, 1],
  [0, "Auflagen aus dem Bescheid übernehmen", "Brandschutz, Rettungswege, Sicherheitsbeleuchtung, Personenzahl – als Aufgaben ergänzen, sobald der Bescheid da ist.", "Planung & Organisation", "Ganze Halle", null, 1],
  [0, "Statiker beauftragen", "Ytong-Wände auf der Bodenplatte, Ringanker an beiden langen Wänden inkl. Anschluss an Außenwände, Last der LED-Wand. Die roten Wände sind nicht tragend.", "Planung & Organisation", "Ganze Halle", null, 1],
  [0, "Schadstoffe vor dem Rückbau prüfen", "Asbest in Bodenplatten, Kleber, Dach- oder Fassadenplatten; alte Dämmwolle; Öl im Boden. Bei Verdacht Probe nehmen lassen.", "Planung & Organisation", "Ganze Halle", null, 1],
  [0, "Helfer bei der BG BAU anmelden", "Unfallversicherung für ehrenamtliche Bauhelfer; Bauherren-Haftpflicht prüfen.", "Planung & Organisation", "Ganze Halle", null, 1],
  [0, "Hausanschluss und Leistung prüfen", "Netzbetreiber: Leistung für Küche, LED-Wand und Technik; ggf. Leistungserhöhung beantragen. Fachbetrieb nötig.", "Elektrik", "Ganze Halle", "Elektrik", 2],
  [0, "Bestandsaufnahme mit Fotos", "Alle Räume fotografieren, Zählerstände notieren.", "Planung & Organisation", "Ganze Halle", null, 2],
  [0, "Baustelle einrichten", "Baustrom-Verteiler, Container für Bauschutt und Mischabfall, Erste-Hilfe-Kasten, Feuerlöscher, Baustellen-Regeln aushängen.", "Aufräumen & Entsorgen", "Ganze Halle", "Rückbau", 2],
  [0, "Gerüst bzw. Hubarbeitsbühne organisieren", "Für Decke und Lampen; Raumhöhe 3,70 m (Traufe) bis 5,09 m (First).", "Einkauf & Transport", "Ganze Halle", null, 2],
  [0, "Materialliste und Lieferzeiten erfassen", "Vor allem Küche, Gastherme, Bodenbelag, LED-Wand und Türen.", "Einkauf & Transport", "Ganze Halle", null, 2],
  [1, "Strom abschalten, alte Elektrik stilllegen", "Betroffene Bereiche spannungsfrei schalten und sichern. Fachbetrieb nötig.", "Elektrik", "Ganze Halle", "Elektrik", 1],
  [1, "Gas absperren, alte Gastherme demontieren", "Fachbetrieb nötig.", "Heizung & Gas", "Ganze Halle", null, 1],
  [1, "Alte Lampen abbauen", "Gottesdienstraum und Gemeinschaftsraum.", "Rückbau & Abbruch", "Ganze Halle", "Rückbau", 2],
  [1, "Alte Leitungen, Dosen und Verteiler zurückbauen", "Elektrik kommt komplett neu.", "Elektrik", "Ganze Halle", "Elektrik", 2],
  [1, "Rote Wand oben rechts abbrechen", "Gottesdienstraum, ca. 4,2 m (rot im Plan). Nicht tragend.", "Rückbau & Abbruch", "Gottesdienstraum", "Rückbau", 1],
  [1, "Rote Wand unten rechts abbrechen", "Gottesdienstraum, Winkel ca. 4,6 m + 6,2 m (rot im Plan). Nicht tragend.", "Rückbau & Abbruch", "Gottesdienstraum", "Rückbau", 1],
  [1, "Alte Küche bzw. Einbauten ausbauen", "Sofern vorhanden.", "Rückbau & Abbruch", "Küche", "Rückbau", 2],
  [1, "Alte Bodenbeläge entfernen", "Kleberreste auf Schadstoffe prüfen.", "Rückbau & Abbruch", "Ganze Halle", "Rückbau", 2],
  [1, "Schutt getrennt entsorgen", "Bauschutt, Holz, Metall, Elektroschrott, Mischabfall.", "Aufräumen & Entsorgen", "Ganze Halle", "Rückbau", 2],
  [1, "Halle besenrein, Fotos ins Bautagebuch", "", "Aufräumen & Entsorgen", "Ganze Halle", "Rückbau", 3],
  [2, "Neue Wände anreißen", "Mit dem aktuellen Plan abgleichen: Türbreiten, Fluchtwege.", "Mauern (Ytong)", "Ganze Halle", "Mauern", 1],
  [2, "Dosen und Leerrohre in neuen Wänden festlegen", "Elektro-Planung abschließen, bevor gemauert wird.", "Elektrik", "Ganze Halle", "Elektrik", 1],
  [2, "Wand hinter der Bühne mit Ringanker", "Ca. 19,9 m von Außenwand zu Außenwand, Ytong, Ringanker aus U-Schalen, Bewehrung und Beton nach Statik.", "Mauern (Ytong)", "Bühne", "Mauern", 1],
  [2, "Anschluss der Ringanker-Wände festlegen", "Beide langen Wände: Maueranker zu den Außenwänden, Kopfanschluss an Dach bzw. Decke. Vorher vom Statiker freigeben lassen.", "Mauern (Ytong)", "Bühne", "Mauern", 1],
  [2, "Trennwand Gemeinschaftsraum | Gottesdienstraum mit Ringanker", "Ca. 19,9 m, Ytong, Ringanker nach Statik (läuft über die 2 Türöffnungen durch), Stürze für die Türen.", "Mauern (Ytong)", "Gemeinschaftsraum", "Mauern", 2],
  [2, "Wand zum Flur im Gemeinschaftsraum", "Ca. 11 m, Ytong.", "Mauern (Ytong)", "Gemeinschaftsraum", "Mauern", 2],
  [2, "Wände Küche", "NGF 20,96 m², mit Türöffnung.", "Mauern (Ytong)", "Küche", "Mauern", 2],
  [2, "Wände WC-Block", "2 × WC D/H + 1 × barrierefrei, NGF 20,96 m².", "Mauern (Ytong)", "WC-Block", "Mauern", 2],
  [2, "Erste Steinlage mit Sperrbahn", "Ausgleichsmörtel und Sperrbahn gegen aufsteigende Feuchte – bei allen neuen Wänden.", "Mauern (Ytong)", "Ganze Halle", "Mauern", 2],
  [2, "Durchbrüche vorsehen", "Abwasser, Wasser, Abgas und Lüftung für Küche, WC und Therme.", "Mauern (Ytong)", "Ganze Halle", "Mauern", 2],
  [2, "Türzargen bzw. Türmaße", "Maße für Türbestellung nehmen; Brandschutztüren nach Auflage.", "Trockenbau", "Ganze Halle", null, 2],
  [3, "Elektroplan erstellen", "Stromkreise je Raum, Steckdosen, Schalter, Licht, Küche, Therme, Bühne, LED-Wand, Technikbereich.", "Elektrik", "Ganze Halle", "Elektrik", 1],
  [3, "Neue Unterverteilung", "FI/LS-Schutz, Zählerplatz prüfen. Fachbetrieb nötig.", "Elektrik", "Ganze Halle", "Elektrik", 1],
  [3, "Neue Leitungen ziehen", "Kabeltrassen an der Decke, Leerrohre in den Wänden.", "Elektrik", "Ganze Halle", "Elektrik", 2],
  [3, "Bühnenstrom und Stromkreis LED-Wand", "Steckdosen und ggf. CEE-Anschluss an der Bühne, eigener Stromkreis für die LED-Wand.", "Elektrik", "Bühne", "Elektrik", 2],
  [3, "Daten- und Audioleitungen Technik → Bühne", "Leerrohr oder Bodenkanal vom Technikbereich zur Bühne und LED-Wand – vor dem neuen Boden!", "Elektrik", "Gottesdienstraum", "Elektrik", 1],
  [3, "Netzwerk und WLAN", "Für Technik und Gemeinde.", "Elektrik", "Ganze Halle", "Elektrik", 3],
  [3, "Sicherheitsbeleuchtung und Rettungszeichen", "Nach Auflage aus der Genehmigung.", "Elektrik", "Ganze Halle", "Elektrik", 2],
  [3, "Elektro-Prüfung und Messprotokoll", "Fertigmeldung an den Netzbetreiber. Fachbetrieb nötig.", "Elektrik", "Ganze Halle", "Elektrik", 1],
  [3, "Heizlast berechnen, Therme auswählen", "Gottesdienstraum 528,97 m², Gemeinschaftsraum 209,21 m². Fachbetrieb nötig.", "Heizung & Gas", "Ganze Halle", null, 1],
  [3, "Neue Gastherme einbauen", "Abgasführung, Abnahme durch den Schornsteinfeger. Fachbetrieb nötig.", "Heizung & Gas", "Ganze Halle", null, 1],
  [3, "Heizkörper bzw. Heizflächen", "Prüfen oder neu planen.", "Heizung & Gas", "Ganze Halle", null, 2],
  [3, "Sanitär WC-Block", "Wasser, Abwasser, Warmwasser; barrierefreies WC.", "Sanitär", "WC-Block", null, 2],
  [3, "Sanitär Küche", "Wasser, Abwasser, Spülmaschine.", "Sanitär", "Küche", null, 2],
  [3, "Lüftung", "Konzept für den Saal, Abluft WC, Dunstabzug Küche.", "Planung & Organisation", "Ganze Halle", null, 2],
  [4, "Decke vorbereiten", "Gottesdienstraum und Gemeinschaftsraum: reinigen, Risse schließen, abdecken.", "Malern", "Ganze Halle", null, 2],
  [4, "Decke streichen", "Mit Hubarbeitsbühne oder Rollgerüst – vor dem neuen Boden.", "Malern", "Ganze Halle", null, 2],
  [4, "Neue Lampen Gottesdienstraum", "Lichtplanung (Helligkeit, dimmbar, Bühnenlicht getrennt), Montage; Anschluss durch Elektrofachkraft.", "Elektrik", "Gottesdienstraum", "Elektrik", 2],
  [4, "Neue Lampen Gemeinschaftsraum", "Auswahl und Montage.", "Elektrik", "Gemeinschaftsraum", "Elektrik", 2],
  [4, "Wände verputzen bzw. spachteln", "Neue Wände; Bestandswände ausbessern.", "Trockenbau", "Ganze Halle", null, 2],
  [4, "Wände streichen", "", "Malern", "Ganze Halle", null, 2],
  [4, "Raumakustik Gottesdienstraum", "Absorber an Decke oder Wänden gegen Nachhall planen.", "Bühne & Technik", "Gottesdienstraum", null, 2],
  [4, "Fliesen WC-Block", "Boden und Wände.", "Fliesen", "WC-Block", "Fliesen", 2],
  [4, "Fliesen Küche", "Boden und Spritzschutz.", "Fliesen", "Küche", "Fliesen", 2],
  [4, "Neue Küche planen und bestellen", "Lieferzeit beachten.", "Küche", "Küche", null, 1],
  [4, "Küche montieren und anschließen", "Elektro- und Wasseranschluss durch Fachleute.", "Küche", "Küche", null, 2],
  [4, "Untergrund für den Boden prüfen", "Ebenheit, Feuchte, Ölreste; ggf. ausgleichen oder Estrich.", "Boden", "Ganze Halle", null, 2],
  [4, "Bodenbelag auswählen", "Belastbar, rutschhemmend, mindestens schwer entflammbar (falls gefordert).", "Boden", "Ganze Halle", null, 2],
  [4, "Neuen Boden verlegen", "Inkl. Sockelleisten.", "Boden", "Ganze Halle", null, 2],
  [4, "Türen einbauen", "", "Trockenbau", "Ganze Halle", null, 2],
  [5, "Bühne bauen", "Ca. 14 × 4 m, ca. 0,6 m hoch, mit Treppe; Rampe bzw. Zugang für Rollstuhl prüfen. Seitlich je 14 Stühle mit rotem Bezug (Lobpreisteam | Pastoren).", "Bühne & Technik", "Bühne", null, 2],
  [5, "Bühnenkante sichern, Kabeldurchführungen", "", "Bühne & Technik", "Bühne", null, 2],
  [5, "LED-Wand auswählen, Angebot einholen", "Pixelabstand für den Sichtabstand, Gewicht, Stromverbrauch.", "Bühne & Technik", "Bühne", null, 1],
  [5, "Unterkonstruktion LED-Wand", "10 × 3 m an der Wand hinter der Bühne, Unterkante ca. 0,9 m. Vorher vom Statiker freigeben lassen.", "Bühne & Technik", "Bühne", null, 2],
  [5, "LED-Wand montieren und anschließen", "Strom und Signal; Fachbetrieb bzw. Lieferant.", "Bühne & Technik", "Bühne", "Elektrik", 2],
  [5, "Technikbereich einrichten", "Ca. 2,4 × 6,4 m an der Rückseite: Pult für Ton, Licht und Video, Strom, Netzwerk, Verbindung zur Bühne.", "Bühne & Technik", "Gottesdienstraum", null, 2],
  [5, "Tonanlage", "Lautsprecherpositionen, Kabelwege, Monitor auf der Bühne.", "Bühne & Technik", "Gottesdienstraum", null, 2],
  [5, "Bestuhlung festlegen", "300, 400 oder 500 Stühle in 3 Blöcken – in der App unter „Halle“ umschaltbar; Rettungswegbreiten mit der Genehmigung abgleichen.", "Planung & Organisation", "Gottesdienstraum", null, 3],
  [6, "Rettungswege und Notausgänge", "Frei, gekennzeichnet und beleuchtet.", "Planung & Organisation", "Ganze Halle", null, 1],
  [6, "Feuerlöscher und Rauchmelder", "Bzw. Brandmeldeanlage nach Auflage.", "Planung & Organisation", "Ganze Halle", null, 2],
  [6, "Barrierefreiheit prüfen", "Eingang, WC, Zugang Bühne.", "Planung & Organisation", "Ganze Halle", null, 2],
  [6, "Abnahme Elektrik", "Messprotokoll. Fachbetrieb nötig.", "Elektrik", "Ganze Halle", "Elektrik", 1],
  [6, "Abnahme Gastherme", "Durch den Schornsteinfeger. Fachbetrieb nötig.", "Heizung & Gas", "Ganze Halle", null, 1],
  [6, "Schlussabnahme Bauaufsicht", "Stadt Mannheim, falls im Bescheid gefordert.", "Planung & Organisation", "Ganze Halle", null, 1],
  [6, "Restarbeiten und Endreinigung", "", "Aufräumen & Entsorgen", "Ganze Halle", "Rückbau", 2],
  [6, "Unterlagen sammeln", "Pläne, Protokolle, Rechnungen, Garantien.", "Planung & Organisation", "Ganze Halle", null, 3],
  [6, "Einweihung planen", "", "Planung & Organisation", "Ganze Halle", null, 3]
];
ANSICHTEN.aufgaben = () => {
  let liste=S.aufgabe; const f=filterA;
  if(f.art==="meine") liste=liste.filter(a=>a.zugewiesen.includes(S.me.id));
  if(f.art==="ohne") liste=liste.filter(a=>!a.zugewiesen.length);
  if(f.gewerk) liste=liste.filter(a=>a.gewerk===f.gewerk);
  if(f.phase!=="") liste=liste.filter(a=>a.phase===+f.phase);
  const gewerke=[...new Set(S.aufgabe.map(a=>a.gewerk).filter(Boolean))];
  const spalte=st=>{ const l=liste.filter(a=>a.status===st).sort((a,b)=>((a.phase??9)-(b.phase??9))||(a.prio-b.prio)||((a.datum||"9")<(b.datum||"9")?-1:1));
    return `<section class="spalte"><h3>${STATUS[st]} <span class="pille ${st}">${l.length}</span></h3>${l.map(aufgabeKarte).join("")||`<p class="klein leise" style="padding:4px">–</p>`}</section>`; };
  return `<div class="kopf"><div><p class="etikett">Arbeiten & Zuständigkeiten</p><h1>Aufgaben</h1><p class="unter">${istLeitung()?"Lege Arbeiten an, teile Teams und Leute ein.":"Hier siehst du, was ansteht und was dir zugewiesen ist."}</p></div>
    ${istLeitung()?`<button class="btn primaer" data-a="aufgabeNeu">${icon("plus")}Aufgabe anlegen</button>`:""}</div>
  <div class="zeile" style="margin-bottom:14px;gap:10px"><div class="reiter" role="group" aria-label="Filter">${[["alle","Alle"],["meine","Meine"],["ohne","Ohne Zuweisung"]].map(([k,l])=>`<button data-a="filterA" data-k="${k}" aria-pressed="${f.art===k}">${l}</button>`).join("")}</div>
    <select id="f-gewerk" data-a="filterG" style="width:auto;min-width:200px"><option value="">Alle Tätigkeiten</option>${gewerke.map(g=>`<option ${f.gewerk===g?"selected":""}>${esc(g)}</option>`).join("")}</select>
    <select id="f-phase" data-a="filterP" style="width:auto;min-width:200px"><option value="">Alle Phasen</option>${PHASEN.map((p,i)=>`<option value="${i}" ${f.phase===String(i)?"selected":""}>${i} · ${esc(p)}</option>`).join("")}</select></div>
  ${S.aufgabe.length?`<div class="brett">${Object.keys(STATUS).map(spalte).join("")}</div>`:
    `<div class="leer stapel" style="align-items:center"><p>Noch keine Aufgaben angelegt.</p>${istLeitung()?`<p class="klein">Aus dem aktuellen Plan und deiner Checkliste stehen ${PLAN_VORSCHLAEGE.length} Arbeiten in ${PHASEN.length} Phasen bereit – von Genehmigung und Statik über Rückbau, Ytong-Wände mit Ringanker, Elektrik, Gastherme, Decke, Boden und Küche bis zu Bühne, LED-Wand und Abnahmen.</p><button class="btn flamme" data-a="vorschlaege">Vorschläge aus dem Plan übernehmen</button>`:""}</div>`}`;
};
function aufgabeKarte(a){ const t=teamVon(a.team_id);
  return `<button class="akarte" style="--farbe:${gewerkFarbe(a)}" data-a="aufgabe" data-id="${a.id}">
    <b>${a.prio===1?'<span style="color:var(--flamme)">●</span> ':""}${esc(a.titel)}</b>
    <span class="zeile klein leise" style="gap:6px">${a.phase!=null?`<span class="pille" title="${esc(PHASEN[a.phase]||"")}">P${a.phase}</span>`:""}${a.datum?`<span class="mass">${dKurz(a.datum)}</span>`:""}${a.bereich?`<span>${esc(a.bereich)}</span>`:""}${a.vorschlag?`<span class="pille vorschlag">Vorschlag</span>`:""}</span>
    <span class="zeile weit">${a.zugewiesen.length?avas(a.zugewiesen,4):`<span class="klein leise">niemand zugewiesen</span>`}${t?`<span class="klein" style="color:${t.farbe};font-weight:600">${esc(t.name)}</span>`:""}</span></button>`; }
function aufgabeDialog(id){
  const a=S.aufgabe.find(x=>x.id===id); if(!a) return; const t=teamVon(a.team_id); const darf=istLeitung()||a.zugewiesen.includes(S.me.id);
  const ein=S.eintrag.filter(e=>e.aufgabe_id===id).sort((x,y)=>y.erstellt<x.erstellt?-1:1); const mat=S.material.filter(m=>m.aufgabe_id===id);
  const daAmTag=a.datum?S.verfuegbarkeit.filter(v=>v.datum===a.datum):[];
  oeffne(a.titel, `
    <div class="zeile"><span class="pille ${a.status}">${STATUS[a.status]}</span>${a.phase!=null?`<span class="pille">Phase ${a.phase} · ${esc(PHASEN[a.phase]||"")}</span>`:""}${a.gewerk?`<span class="pille">${esc(a.gewerk)}</span>`:""}${a.bereich?`<span class="pille">${esc(a.bereich)}</span>`:""}${a.datum?`<span class="pille mass">${dKurz(a.datum)}</span>`:""}${a.prio===1?`<span class="pille" style="color:var(--flamme)">Wichtig</span>`:""}${a.vorschlag?`<span class="pille vorschlag">Vorschlag aus dem Plan</span>`:""}</div>
    ${a.beschreibung?`<p>${esc(a.beschreibung)}</p>`:""}
    <div class="stapel" style="gap:6px"><span class="etikett">Team & Zuständige</span><div class="zeile">${t?`<span class="punkt" style="background:${t.farbe}"></span><b>${esc(t.name)}</b><span class="leise klein">Leitung: ${esc(t.leiter||"–")}</span>`:`<span class="leise">kein Team</span>`}</div>
      <div class="zeile">${a.zugewiesen.map(z=>`<span class="zeile" style="gap:6px">${ava(z,26)}<span class="klein">${esc(nameVon(z))}</span></span>`).join("")||`<span class="leise klein">Noch niemand zugewiesen.</span>`}</div>
      ${a.datum?`<p class="klein leise">Am ${dKurz(a.datum)} eingetragen: ${daAmTag.map(v=>esc(vorname(v.profil_id))).join(", ")||"noch niemand"}</p>`:""}</div>
    ${darf?`<div class="stapel" style="gap:6px"><span class="etikett">Status ändern</span><div class="reiter">${Object.entries(STATUS).map(([k,l])=>`<button data-a="aStatus" data-id="${a.id}" data-s="${k}" aria-pressed="${a.status===k}">${l}</button>`).join("")}</div></div>`:""}
    ${istLeitung()?`<div class="zeile"><button class="btn" data-a="aufgabeBearbeiten" data-id="${a.id}">Bearbeiten & zuweisen</button>${!a.zugewiesen.includes(S.me.id)?`<button class="btn still" data-a="aMich" data-id="${a.id}">Mich zuweisen</button>`:""}</div>`:""}
    <section class="stapel"><h3>Notizen & Fotos</h3>
      <form class="stapel karte" style="box-shadow:none;padding:12px" data-form="eintrag" data-aufgabe="${a.id}">
        <textarea name="text" id="ea-text" placeholder="Was wurde gemacht? Was fehlt noch?"></textarea>
        <div class="zeile weit"><label class="btn klein">${icon("foto")}Fotos<input type="file" name="fotos" id="ea-fotos" accept="image/*" multiple hidden></label><span class="klein leise" data-fotozahl></span><button class="btn primaer klein" type="submit">Speichern</button></div></form>
      ${ein.length?ein.map(eintragKarte).join(""):`<p class="klein leise">Noch keine Notizen zu dieser Aufgabe.</p>`}</section>
    <section class="stapel"><div class="zeile weit"><h3>Material</h3><button class="btn klein" data-a="materialNeu" data-aufgabe="${a.id}">${icon("plus")}Anfragen</button></div>
      ${mat.length?`<div class="liste">${mat.map(m=>`<div class="zeile weit"><span><b>${esc(m.name)}</b> <span class="mass leise">${m.menge?zahlDe(m.menge)+" "+esc(m.einheit||""):""}</span></span><span class="pille ${m.status}">${MSTATUS[m.status]}</span></div>`).join("")}</div>`:`<p class="klein leise">Noch kein Material angefragt.</p>`}</section>`,
    `${a.zugewiesen.length?a.zugewiesen.length+" zugewiesen":"noch niemand zugewiesen"}`);
}
function aufgabeForm(a){
  const zug=new Set(a?.zugewiesen||[]); const datum=a?.datum||"";
  const verf=new Set(S.verfuegbarkeit.filter(v=>v.datum===datum).map(v=>v.profil_id));
  const leute=[...S.profil].sort((x,y)=>(verf.has(y.id)-verf.has(x.id))||x.name.localeCompare(y.name));
  oeffne(a?"Aufgabe bearbeiten":"Neue Aufgabe", `
    <form class="stapel" data-form="aufgabe" ${a?`data-id="${a.id}"`:""}>
      <label class="feld">Titel<input type="text" name="titel" id="af-titel" required value="${esc(a?.titel||"")}" placeholder="z. B. Ytong-Wand Gemeinschaftsraum, Abschnitt 1"></label>
      <label class="feld">Beschreibung<textarea name="beschreibung" id="af-beschr">${esc(a?.beschreibung||"")}</textarea></label>
      <div class="felder"><label class="feld">Tätigkeit<select name="gewerk" id="af-gewerk"><option value="">–</option>${TAETIGKEITEN.map(t=>`<option ${a?.gewerk===t?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
        <label class="feld">Bereich<select name="bereich" id="af-bereich"><option value="">–</option>${BEREICHE.map(t=>`<option ${a?.bereich===t?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
        <label class="feld">Phase<select name="phase" id="af-phase"><option value="">–</option>${PHASEN.map((p,i)=>`<option value="${i}" ${a?.phase===i?"selected":""}>${i} · ${esc(p)}</option>`).join("")}</select></label>
        <label class="feld">Datum<input type="date" name="datum" id="af-datum" value="${datum}"></label>
        <label class="feld">Team<select name="team_id" id="af-team"><option value="">–</option>${S.team.map(t=>`<option value="${t.id}" ${a?.team_id===t.id?"selected":""}>${esc(t.name)}</option>`).join("")}</select></label>
        <label class="feld">Wichtigkeit<select name="prio" id="af-prio"><option value="1" ${a?.prio===1?"selected":""}>Wichtig</option><option value="2" ${!a||a.prio===2?"selected":""}>Normal</option><option value="3" ${a?.prio===3?"selected":""}>Kann warten</option></select></label>
        ${a?`<label class="feld">Status<select name="status" id="af-status">${Object.entries(STATUS).map(([k,l])=>`<option value="${k}" ${a.status===k?"selected":""}>${l}</option>`).join("")}</select></label>`:""}</div>
      <div class="stapel" style="gap:6px"><span class="etikett">Zuweisen</span>${datum?`<p class="klein leise">Oben stehen die, die am ${dKurz(datum)} eingetragen sind.</p>`:`<p class="klein leise">Tipp: Mit Datum siehst du, wer an dem Tag da ist.</p>`}
        <div class="chips">${leute.filter(p=>!p.gesperrt||zug.has(p.id)).map(p=>`<button type="button" class="chip" data-a="zug" data-id="${p.id}" aria-pressed="${zug.has(p.id)}">${verf.has(p.id)?"● ":""}${esc(p.name)}</button>`).join("")}</div></div>
      <div class="zeile"><button class="btn primaer" type="submit">${icon("check")}Speichern</button>${a?`<button class="btn gefahr" type="button" data-a="aufgabeLoeschenFrage" data-id="${a.id}">Löschen</button>`:""}</div>
      <div data-loeschfrage></div>
    </form>`);
}

/* ---------- Bautagebuch ---------- */
ANSICHTEN.tagebuch = () => {
  const nachTag={}; [...S.eintrag].sort((a,b)=>b.erstellt<a.erstellt?-1:1).forEach(e=>(nachTag[e.datum]=nachTag[e.datum]||[]).push(e));
  const tage=Object.keys(nachTag).sort().reverse();
  return `<div class="kopf"><div><p class="etikett">Tagesfortschritte mit Text & Bild</p><h1>Bautagebuch</h1><p class="unter">Jeder kann festhalten, was am Tag geschafft wurde.</p></div><button class="btn primaer" data-a="eintragNeu">${icon("foto")}Neuer Eintrag</button></div>
  ${tage.length?`<section class="karte">${tage.map(d=>{ const dt=new Date(d+"T12:00"); return `<div class="feed-tag"><div class="datum"><span>${WT[dt.getDay()]}</span><b>${dt.getDate()}.</b><span>${dt.toLocaleDateString("de-DE",{month:"short"})}</span></div><div class="inhalt">${nachTag[d].map(eintragKarte).join("")}</div></div>`; }).join("")}</section>`
  :`<div class="leer">Noch keine Einträge. Halte den ersten Fortschritt mit Foto fest.</div>`}`;
};
function eintragDialog(aufgabeId){
  oeffne("Neuer Eintrag", `<form class="stapel" data-form="eintrag" ${aufgabeId?`data-aufgabe="${aufgabeId}"`:""}>
    <div class="felder"><label class="feld">Datum<input type="date" name="datum" id="e-datum" value="${heuteIso()}"></label>
      <label class="feld">Zu welcher Aufgabe?<select name="aufgabe_id" id="e-aufgabe"><option value="">allgemein</option>${S.aufgabe.filter(a=>a.status!=="erledigt").map(a=>`<option value="${a.id}" ${a.id===aufgabeId?"selected":""}>${esc(a.titel)}</option>`).join("")}</select></label></div>
    <label class="feld">Was wurde geschafft?<textarea name="text" id="e-text" placeholder="z. B. Erste 6 m der Trennwand gemauert, Ringanker-Schalung vorbereitet."></textarea></label>
    <div class="zeile weit"><label class="btn">${icon("foto")}Fotos hinzufügen<input type="file" name="fotos" id="e-fotos" accept="image/*" multiple hidden></label><span class="klein leise" data-fotozahl></span></div>
    <button class="btn primaer" type="submit">${icon("check")}Speichern</button></form>`);
}

/* ---------- Teams & Leitung ---------- */
ANSICHTEN.teams = () => {
  const L=[...S.leitung].sort((a,b)=>a.sort-b.sort);
  return `<div class="kopf"><div><p class="etikett">Wer macht was</p><h1>Teams & Leitung</h1><p class="unter">Tritt einem Team bei, damit die Teamleiter wissen, auf wen sie zählen können.</p></div>${istLeitung()?`<button class="btn primaer" data-a="teamNeu">${icon("plus")}Team anlegen</button>`:""}</div>
  <section class="karte" style="margin-bottom:16px"><header><h2>Leitungsgruppe</h2><span class="pille">${L.length}</span></header>
    <div class="raster r3" style="gap:10px">${L.map(l=>`<div class="zeile" style="align-items:flex-start">${l.profil_id?ava(l.profil_id):`<span class="avatar" style="background:var(--text3)">${esc(l.name.split(" ").map(w=>w[0]).join("").slice(0,2))}</span>`}<div><b>${esc(l.name)}</b><div class="klein leise">${esc(l.schwerpunkt||"")}</div>${l.hinweis?`<div class="klein" style="color:var(--warn)">${esc(l.hinweis)}</div>`:""}${!l.profil_id?`<div class="klein leise">noch nicht angemeldet</div>`:""}</div></div>`).join("")}</div></section>
  <div class="raster r3">${[...S.team].sort((a,b)=>a.sort-b.sort).map(t=>{ const m=S.team_mitglied.filter(x=>x.team_id===t.id).map(x=>x.profil_id); const drin=m.includes(S.me.id);
    return `<section class="karte" style="border-top:4px solid ${t.farbe||"var(--linie)"}"><header><div><h2>${esc(t.name)}</h2><p class="klein leise">Leitung: ${esc(t.leiter||"–")}</p></div>${istLeitung()?`<button class="btn still klein" data-a="teamBearbeiten" data-id="${t.id}">Bearbeiten</button>`:""}</header>
      <p class="klein">${esc(t.beschreibung||"")}</p>
      <div class="zeile weit" style="margin-top:12px">${m.length?avas(m,8):`<span class="klein leise">noch niemand</span>`}<button class="btn klein ${drin?"":"primaer"}" data-a="${drin?"austreten":"beitreten"}" data-id="${t.id}">${drin?"Austreten":"Beitreten"}</button></div>
      <p class="klein leise" style="margin-top:8px">${S.aufgabe.filter(a=>a.team_id===t.id&&a.status!=="erledigt").length} offene Aufgaben</p></section>`; }).join("")}</div>
  <section class="karte" style="margin-top:16px"><header><h2>Alle Mitglieder</h2><span class="pille">${S.profil.length}</span></header>
    <div class="tabelle-rahmen"><table><thead><tr><th>Name</th><th>Rolle</th><th>Schwerpunkte</th><th>Hinweis</th></tr></thead><tbody>
    ${[...S.profil].sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<tr><td><span class="zeile" style="flex-wrap:nowrap">${ava(p.id,26)}<b>${esc(p.name)}</b></span></td>
      <td>${istAdmin()&&p.id!==S.me.id?`<select data-a="rolle" data-id="${p.id}" style="width:auto">${["mitglied","bauleitung","admin"].map(r=>`<option value="${r}" ${p.rolle===r?"selected":""}>${rolleText(r)}</option>`).join("")}</select>`:`<span class="pille">${rolleText(p.rolle)}</span>`}</td>
      <td class="klein">${(p.schwerpunkte||[]).map(esc).join(", ")||"–"}</td><td class="klein leise">${esc(p.hinweis||"")}</td></tr>`).join("")}</tbody></table></div></section>`;
};
function teamForm(t){
  oeffne(t?"Team bearbeiten":"Neues Team", `<form class="stapel" data-form="team" ${t?`data-id="${t.id}"`:""}>
    <label class="feld">Name<input type="text" name="name" id="t-name" required value="${esc(t?.name||"")}"></label>
    <div class="felder"><label class="feld">Tätigkeit<select name="gewerk" id="t-gewerk"><option value="">–</option>${TAETIGKEITEN.map(x=>`<option ${t?.gewerk===x?"selected":""}>${esc(x)}</option>`).join("")}</select></label>
      <label class="feld">Leitung<input type="text" name="leiter" id="t-leiter" value="${esc(t?.leiter||"")}" placeholder="z. B. Andre, Igor"></label>
      <label class="feld">Farbe<input type="color" name="farbe" id="t-farbe" value="${t?.farbe||"#2b4fa0"}" style="height:40px;padding:3px"></label></div>
    <label class="feld">Beschreibung<textarea name="beschreibung" id="t-beschr">${esc(t?.beschreibung||"")}</textarea></label>
    <button class="btn primaer" type="submit">${icon("check")}Speichern</button></form>`);
}

/* ---------- Material ---------- */
ANSICHTEN.material = () => {
  let l=[...S.material].sort((a,b)=>b.erstellt<a.erstellt?-1:1); if(filterM!=="alle") l=l.filter(m=>m.status===filterM);
  const zaehl=k=>S.material.filter(m=>m.status===k).length;
  return `<div class="kopf"><div><p class="etikett">Bedarf, Anfragen & Bestellungen</p><h1>Material</h1><p class="unter">Jeder kann Material anfragen. Die Bauleitung gibt frei und bestellt.</p></div><button class="btn primaer" data-a="materialNeu">${icon("plus")}Material anfragen</button></div>
  <div class="reiter" style="margin-bottom:14px" role="group" aria-label="Status-Filter">${[["alle","Alle"],...Object.entries(MSTATUS)].map(([k,lb])=>`<button data-a="filterM" data-k="${k}" aria-pressed="${filterM===k}">${lb}${k!=="alle"?` · ${zaehl(k)}`:""}</button>`).join("")}</div>
  <section class="karte">${l.length?`<div class="tabelle-rahmen"><table><thead><tr><th>Material</th><th>Menge</th><th>Tätigkeit / Aufgabe</th><th>Angefragt von</th><th>Status</th><th></th></tr></thead><tbody>
    ${l.map(m=>{ const a=S.aufgabe.find(x=>x.id===m.aufgabe_id); const eigen=m.angefragt_von===S.me.id&&m.status==="angefragt";
      return `<tr><td><b>${esc(m.name)}</b>${m.vorschlag?` <span class="pille vorschlag">Vorschlag</span>`:""}${m.notiz?`<div class="klein leise">${esc(m.notiz)}</div>`:""}</td><td class="mass">${m.menge?zahlDe(m.menge)+" "+esc(m.einheit||""):`<span class="leise">${esc(m.einheit||"–")}</span>`}</td>
      <td class="klein">${esc(m.gewerk||"")}${a?`<div class="leise">${esc(a.titel)}</div>`:""}</td><td class="klein">${esc(nameVon(m.angefragt_von))}</td>
      <td>${istLeitung()?`<select data-a="mStatusSel" data-id="${m.id}" style="width:auto">${Object.entries(MSTATUS).map(([k,lb])=>`<option value="${k}" ${m.status===k?"selected":""}>${lb}</option>`).join("")}</select>`:`<span class="pille ${m.status}">${MSTATUS[m.status]}</span>`}</td>
      <td>${istLeitung()||eigen?`<button class="btn still klein gefahr" data-a="mLoeschen" data-id="${m.id}" aria-label="Löschen">${icon("papierkorb")}</button>`:""}</td></tr>`; }).join("")}</tbody></table></div>`
    :`<div class="leer">Keine Einträge in dieser Ansicht.</div>`}</section>`;
};
function materialDialog(aufgabeId){
  const a=S.aufgabe.find(x=>x.id===aufgabeId);
  oeffne("Material anfragen", `<form class="stapel" data-form="material">
    <label class="feld">Was wird gebraucht?<input type="text" name="name" id="m-name" required placeholder="z. B. Ytong-Plansteine 24 cm"></label>
    <div class="felder"><label class="feld">Menge<input type="number" name="menge" id="m-menge" step="any" min="0"></label><label class="feld">Einheit<input type="text" name="einheit" id="m-einheit" placeholder="Stück, Sack, m, Palette …"></label>
      <label class="feld">Tätigkeit<select name="gewerk" id="m-gewerk"><option value="">–</option>${TAETIGKEITEN.map(t=>`<option ${a?.gewerk===t?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
      <label class="feld">Für Aufgabe<select name="aufgabe_id" id="m-aufgabe"><option value="">–</option>${S.aufgabe.map(x=>`<option value="${x.id}" ${x.id===aufgabeId?"selected":""}>${esc(x.titel)}</option>`).join("")}</select></label></div>
    <label class="feld">Notiz<input type="text" name="notiz" id="m-notiz" placeholder="Hersteller, Maße, bis wann gebraucht …"></label>
    <button class="btn primaer" type="submit">${icon("check")}Anfrage senden</button></form>`, "Die Bauleitung sieht deine Anfrage auf ihrer Startseite.");
}

/* ---------- Werkzeug ---------- */
const WKAT = ["Mauern","Fliesen","Elektrik","Rückbau","Trockenbau","Malern","Messen","Leitern & Gerüst","Transport","Allgemein"];
const WVERF = ["Samstags dabei","nach Absprache","bleibt auf der Baustelle","leihweise abholbar"];
ANSICHTEN.werkzeug = () => {
  const q=suchW.toLowerCase(); const l=S.werkzeug.filter(w=>!q||(w.name+" "+nameVon(w.besitzer)+" "+(w.kategorie||"")).toLowerCase().includes(q));
  const grp={}; l.forEach(w=>(grp[w.kategorie||"Allgemein"]=grp[w.kategorie||"Allgemein"]||[]).push(w));
  return `<div class="kopf"><div><p class="etikett">Was ist schon da?</p><h1>Werkzeug</h1><p class="unter">Trag ein, was du zur Verfügung stellen kannst. So muss nichts doppelt gekauft werden.</p></div><button class="btn primaer" data-a="werkzeugNeu">${icon("plus")}Werkzeug anbieten</button></div>
  <input type="text" id="w-suche" data-a="suchW" value="${esc(suchW)}" placeholder="Suchen: z. B. Rührer, Gerüst, Igor …" style="margin-bottom:14px;max-width:420px">
  ${Object.keys(grp).length?`<div class="raster r3">${Object.keys(grp).sort().map(k=>`<section class="karte"><header><h2>${esc(k)}</h2><span class="pille">${grp[k].length}</span></header><div class="liste">${grp[k].map(w=>`<div class="zeile weit" style="align-items:flex-start"><div style="min-width:0"><b>${esc(w.name)}</b>${w.anzahl>1?` <span class="mass leise">× ${w.anzahl}</span>`:""}<div class="klein leise">${esc(nameVon(w.besitzer))} · ${esc(w.verfuegbarkeit||"")}</div>${w.notiz?`<div class="klein">${esc(w.notiz)}</div>`:""}</div>${w.besitzer===S.me.id||istLeitung()?`<button class="btn still klein gefahr" data-a="wLoeschen" data-id="${w.id}" aria-label="Entfernen">${icon("papierkorb")}</button>`:""}</div>`).join("")}</div></section>`).join("")}</div>`
  :`<div class="leer">${q?"Nichts gefunden.":"Noch kein Werkzeug eingetragen."}</div>`}`;
};
function werkzeugDialog(){
  oeffne("Werkzeug anbieten", `<form class="stapel" data-form="werkzeug">
    <label class="feld">Werkzeug<input type="text" name="name" id="w-name" required placeholder="z. B. Mörtelrührer, Rollgerüst, Laser-Wasserwaage"></label>
    <div class="felder"><label class="feld">Kategorie<select name="kategorie" id="w-kat">${WKAT.map(k=>`<option>${k}</option>`).join("")}</select></label><label class="feld">Anzahl<input type="number" name="anzahl" id="w-anz" value="1" min="1"></label>
      <label class="feld">Verfügbar<select name="verfuegbarkeit" id="w-verf">${WVERF.map(k=>`<option>${k}</option>`).join("")}</select></label></div>
    <label class="feld">Notiz<input type="text" name="notiz" id="w-notiz" placeholder="z. B. Akku mitbringen, nur mit Einweisung"></label>
    <button class="btn primaer" type="submit">${icon("check")}Eintragen</button></form>`);
}

/* ---------- Halle ---------- */
const bestuhlungObj = () => S.planobjekt.find(o=>o.typ==="bestuhlung");
const bestuhlungN = () => +(bestuhlungObj()?.label||0);
const seitenObj = () => S.planobjekt.find(o=>o.typ==="seiten");
const seitenAn = () => seitenObj()?.label==="1";
const sitzText = () => { const st=stuhlPositionen(bestuhlungN()).length, se=seitenAn()?seitenPositionen().length:0, ti=S.planobjekt.reduce((s,o)=>s+(OBJEKTE[o.typ]?.plaetze||0),0);
  const teile=[st?`${st} Stühle`:"", se?`${se} an der Bühne`:"", ti?`${ti} an Tischen`:""].filter(Boolean); return teile.join(" + ")||"0 Sitzplätze"; };
const sitzplaetze = () => S.planobjekt.reduce((s,o)=>s+(OBJEKTE[o.typ]?.plaetze||0),0)+stuhlPositionen(bestuhlungN()).length;
ANSICHTEN.halle = () => {
  const plaetze=sitzplaetze(), bn=bestuhlungN(), bi=bestuhlungInfo(bn);
  return `<div class="kopf"><div><p class="etikett">Konzstraße 9 · 47,40 × 19,90 m Innenmaß · Traufe 3,70 m · First 5,09 m</p><h1>Halle & 3D</h1><p class="unter">Grundriss nach dem aktuellen Plan, Maße vom Architekten. Plane die Einrichtung und geh virtuell durch die Halle.</p></div>
    <div class="reiter" role="group" aria-label="Ansicht"><button data-a="halleReiter" data-k="plan" aria-pressed="${halleReiter==="plan"}">Grundriss & Planen</button><button data-a="halleReiter" data-k="3d" aria-pressed="${halleReiter==="3d"}">3D begehen</button></div></div>
  ${halleReiter==="plan"?`
  <div class="raster" style="grid-template-columns:minmax(0,1fr)">
    <section class="karte"><header><div class="zeile"><h2>Einrichtung planen</h2><span class="pille" id="plaetze">${sitzText()}</span></div>
      <div class="zeile"><button class="btn klein" data-a="grundeinrichtung">Bühne & Esstische einrichten</button><button class="btn klein still" data-a="planLeerenFrage">Alles entfernen</button></div></header>
      <div class="zeile" style="gap:12px;margin-bottom:12px"><span class="etikett" style="margin:0">Bestuhlung Gottesdienstraum</span>
        <div class="reiter" role="group" aria-label="Bestuhlung">${[0,300,400,500].map(n=>`<button data-a="bestuhlungWahl" data-k="${n}" aria-pressed="${bn===n}">${n?n+" Stühle":"Keine"}</button>`).join("")}</div>
        <button class="chip" data-a="seitenWahl" aria-pressed="${seitenAn()}"><span style="width:10px;height:10px;border-radius:2px;background:${STUHL.rot};display:inline-block"></span>Seitenplätze an der Bühne</button>
        <span class="klein leise" id="bestuhlung-info">${bi?`3 Blöcke (${bi.bloecke.join(" | ")}), ${bi.reihen} Reihen, Reihenabstand ${String(bi.abstand).replace(".",",")} m, Gänge ${String(bi.gang).replace(".",",")} m`:""}</span></div>
      <div class="palette" style="margin-bottom:12px">${Object.entries(OBJEKTE).map(([k,o])=>`<button class="chip" data-a="objNeu" data-typ="${k}">${icon("plus")}${esc(o.n)}</button>`).join("")}</div>
      <div data-leerfrage></div>
      <div class="halle-rahmen" id="plan-rahmen" style="overflow-x:auto"><div style="min-width:760px" id="plan-svg">${planSvg(S.planobjekt,{bearbeiten:true,auswahl:planAuswahl,bestuhlung:bn,seiten:seitenAn()})}</div></div>
      <div id="auswahl-leiste" style="margin-top:12px">${auswahlLeiste()}</div>
      <div class="zeile klein leise" style="margin-top:14px;gap:16px">
        <span class="zeile" style="gap:6px"><span style="width:22px;height:5px;background:var(--gold);display:inline-block;border-radius:2px"></span>Neue Wände (Ytong)</span>
        <span class="zeile" style="gap:6px"><span style="width:22px;height:5px;background:linear-gradient(var(--gold) 0 30%,var(--tinte) 30% 55%,var(--gold) 55%);display:inline-block;border-radius:2px"></span>Mit Ringanker (beide langen Wände)</span>
        <span class="zeile" style="gap:6px"><span style="width:22px;height:0;border-top:4px dashed var(--glut);display:inline-block"></span>Wird abgerissen (rot im Plan)</span>
        <span class="zeile" style="gap:6px"><span style="width:14px;height:10px;background:radial-gradient(var(--text3) 1px,transparent 1.5px) 0 0/4px 4px;border:1px solid var(--text3);display:inline-block"></span>Technikbereich</span>
        <span class="zeile" style="gap:6px"><span style="width:22px;height:4px;background:var(--text2);display:inline-block;border-radius:2px"></span>Bestand</span>
        <span class="zeile" style="gap:6px"><span style="width:22px;height:5px;background:var(--flamme);display:inline-block;border-radius:2px"></span>LED-Wand 10 × 3 m</span>
        <span>1 Kästchen = 1 m · Objekte ziehen zum Verschieben</span></div></section>
  </div>`:`
  <section class="karte" style="padding:10px">
    <div class="dreid" id="dreid"><div class="hud"><div class="zeile" style="gap:6px">${[["eingang","Eingang"],["raum","Gottesdienstraum"],["vorn","Zur Bühne"],["buehne","Auf der Bühne"],["gemein","Gemeinschaftsraum"],["oben","Von oben"],["aussen","Von außen"]].map(([k,l])=>`<button class="btn klein" data-a="blick" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="tafel">Ziehen = umsehen · W A S D oder Pfeile = gehen · Shift = schneller · Mausrad = vor/zurück</div></div><div class="joy" aria-hidden="true"><i></i></div></div>
    <div class="zeile weit klein leise" style="margin-top:10px;padding:0 4px"><label class="zeile" style="gap:6px"><input type="checkbox" id="neu-gelb" checked data-a="neuGelb"> Neue Wände gelb zeigen</label><span>Eingerichtete Objekte aus dem Grundriss erscheinen hier mit.</span></div>
  </section>`}`;
};
function auswahlLeiste(){ const o=S.planobjekt.find(x=>x.id===planAuswahl); if(!o) return `<p class="klein leise">Tippe ein Objekt an, um es zu drehen oder zu entfernen.</p>`;
  return `<div class="zeile"><b>${esc(OBJEKTE[o.typ]?.n||o.typ)}</b><span class="mass leise">x ${o.x.toFixed(1).replace(".",",")} m · y ${o.y.toFixed(1).replace(".",",")} m · ${Math.round(o.rot||0)}°</span>
    <button class="btn klein" data-a="objDreh" data-g="15">${icon("drehen")}15°</button><button class="btn klein" data-a="objDreh" data-g="90">${icon("drehen")}90°</button><button class="btn klein gefahr" data-a="objWeg">${icon("papierkorb")}Entfernen</button></div>`; }
function halleAktualisieren(){ const p=$("#plan-svg"); if(p&&!planZug){ p.innerHTML=planSvg(S.planobjekt,{bearbeiten:true,auswahl:planAuswahl,bestuhlung:bestuhlungN(),seiten:seitenAn()}); const a=$("#auswahl-leiste"); if(a) a.innerHTML=auswahlLeiste();
  const z=$("#plaetze"); if(z) z.textContent=sitzText(); }
  if(dreiD){ dreiD.objekte(S.planobjekt); if(dreiD._n!==bestuhlungN()){ dreiD._n=bestuhlungN(); dreiD.bestuhlung(dreiD._n); } if(dreiD._s!==seitenAn()){ dreiD._s=seitenAn(); dreiD.seiten(dreiD._s); } } }
let planZug=null;
function halleStarten(){
  if(halleReiter==="3d"){ const c=$("#dreid"); if(c){ dreiD=halle3d(c,S.planobjekt,{logo:LOGO,stoff:STOFF,bestuhlung:bestuhlungN(),seiten:seitenAn()}); dreiD._n=bestuhlungN(); dreiD._s=seitenAn(); } return; }
  const rahmen=$("#plan-svg"); if(!rahmen) return;
  const punkt=(svg,e)=>{ const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const m=pt.matrixTransform(svg.getScreenCTM().inverse()); return {x:(m.x-40)/20,y:(m.y-40)/20}; };
  rahmen.addEventListener("pointerdown",e=>{ const g=e.target.closest("[data-obj]"); const svg=rahmen.querySelector("svg"); if(!g){ if(planAuswahl){ planAuswahl=null; halleAktualisieren(); } return; }
    const o=S.planobjekt.find(x=>x.id===g.dataset.obj); if(!o) return; const p=punkt(svg,e); planAuswahl=o.id; halleAktualisieren();
    planZug={o,dx:p.x-o.x,dy:p.y-o.y,bewegt:false}; rahmen.setPointerCapture(e.pointerId); e.preventDefault(); });
  rahmen.addEventListener("pointermove",e=>{ if(!planZug) return; const svg=rahmen.querySelector("svg"); const p=punkt(svg,e);
    const nx=Math.max(0.2,Math.min(HALLE.L-0.2,p.x-planZug.dx)), ny=Math.max(0.2,Math.min(HALLE.B-0.2,p.y-planZug.dy));
    planZug.o.x=Math.round(nx*10)/10; planZug.o.y=Math.round(ny*10)/10; planZug.bewegt=true;
    const g=svg.querySelector(`[data-obj="${planZug.o.id}"]`); if(g) g.setAttribute("transform",`translate(${planZug.o.x*20+40} ${planZug.o.y*20+40}) rotate(${planZug.o.rot||0})`); });
  const los=async()=>{ if(!planZug) return; const {o,bewegt}=planZug; planZug=null; if(bewegt){ try{ await B.aendern("planobjekt",o.id,{x:o.x,y:o.y,geaendert:new Date().toISOString()}); }catch(e){ toast("Nicht gespeichert"); } } halleAktualisieren(); };
  rahmen.addEventListener("pointerup",los); rahmen.addEventListener("pointercancel",los);
}

/* ---------- Profil ---------- */
ANSICHTEN.profil = () => {
  const p=S.me; const sw=new Set(p.schwerpunkte||[]);
  return `<div class="kopf"><div><p class="etikett">${rolleText(p.rolle)}</p><h1>Mein Profil</h1></div>${B.modus==="live"?`<button class="btn" data-a="abmelden">Abmelden</button>`:""}</div>
  <div class="raster r2"><section class="karte"><form class="stapel" data-form="profil">
    <label class="feld">Name<input type="text" name="name" id="p-name" required value="${esc(p.name)}"></label>
    <label class="feld">Telefon (für die Bauleitung)<input type="text" name="telefon" id="p-tel" value="${esc(p.telefon||"")}" placeholder="optional"></label>
    <label class="feld">Hinweis<input type="text" name="hinweis" id="p-hinweis" value="${esc(p.hinweis||"")}" placeholder="z. B. lange Anreise, eher am Wochenende"></label>
    <div class="stapel" style="gap:6px"><span class="etikett">Was kannst du gut?</span><div class="chips">${TAETIGKEITEN.map(t=>`<button type="button" class="chip" data-a="schwer" data-t="${esc(t)}" aria-pressed="${sw.has(t)}">${esc(t)}</button>`).join("")}</div>
      <p class="klein leise">Wird beim Eintragen im Kalender als Wunsch vorgeschlagen.</p></div>
    <button class="btn primaer" type="submit">${icon("check")}Speichern</button></form></section>
  ${istAdmin()?`<section class="karte stapel"><h2>Gemeinde-Code</h2><p class="klein">Neue Mitglieder registrieren sich mit diesem Code. Gib ihn nur an Leute aus der Gemeinde weiter. Wenn er die Runde macht, ändere ihn hier.</p>
    ${B.modus==="live"?`<form class="zeile" data-form="code"><input type="text" name="code" id="p-code" required placeholder="neuer Code" style="flex:1;min-width:160px"><button class="btn" type="submit">Ändern</button></form>`:`<p class="klein leise">In der Vorschau nicht aktiv.</p>`}
    <h2 style="margin-top:8px">Benutzer</h2><p class="klein">Rollen vergeben, Zugänge sperren und sehen, wer zuletzt angemeldet war.</p><button class="btn" data-a="geh" data-ziel="benutzer">${icon("benutzer")}Benutzer verwalten</button></section>`:""}
  <section class="karte stapel"><h2>Zugang & Geräte</h2>
    <p class="klein">Du bist angemeldet als <b>${esc(B.email?.()||"–")}</b>. Mit dieser E-Mail und deinem Passwort meldest du dich auf jedem Gerät an – Handy, Tablet, PC. Alles ist überall gleich, weil es zentral gespeichert wird.</p>
    ${B.modus==="live"?`<form class="stapel" data-form="pwAendern"><span class="etikett">Passwort ändern</span>
      <div class="felder"><label class="feld">Neues Passwort<input type="password" name="pw1" id="p-pw1" minlength="8" required autocomplete="new-password"></label>
      <label class="feld">Wiederholen<input type="password" name="pw2" id="p-pw2" minlength="8" required autocomplete="new-password"></label></div>
      <button class="btn" type="submit">Passwort ändern</button></form>
    <button class="btn still" data-a="abmelden">Auf diesem Gerät abmelden</button>`:`<p class="klein leise">In der Vorschau nicht aktiv.</p>`}</section></div>`;
};

/* ---------- Benutzerverwaltung (nur Admin) ---------- */
let benutzerInfo=null;   // {id:{email,zuletzt,registriert}}
async function benutzerLaden(){ try{ const l=await B.benutzerListe(); benutzerInfo=Object.fromEntries(l.map(x=>[x.id,x])); }catch(e){ benutzerInfo={fehler:e.message}; } if(ansicht==="benutzer") render(); }
const datumZeit = s => s ? new Date(s).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : "noch nie";
ANSICHTEN.benutzer = () => {
  if(!istAdmin()) return `<div class="leer">Nur für Admins.</div>`;
  if(benutzerInfo===null){ benutzerLaden(); }
  const info=benutzerInfo&&!benutzerInfo.fehler?benutzerInfo:{};
  const liste=[...S.profil].sort((a,b)=>(!!a.gesperrt-!!b.gesperrt)||a.name.localeCompare(b.name));
  const aktiv=liste.filter(p=>!p.gesperrt).length;
  return `<div class="kopf"><div><p class="etikett">Admin</p><h1>Benutzer</h1><p class="unter">${aktiv} aktiv${liste.length-aktiv?` · ${liste.length-aktiv} gesperrt`:""}. Jeder hat ein eigenes Konto (E-Mail + Passwort) und kann sich damit auf beliebig vielen Geräten anmelden.</p></div>
    <button class="btn" data-a="benutzerNeuLaden">${icon("drehen")}Aktualisieren</button></div>
  ${benutzerInfo?.fehler?`<div class="hinweis klein">E-Mail-Adressen und letzte Anmeldung konnten nicht geladen werden (${esc(benutzerInfo.fehler)}). Ist die Datenbank-Erweiterung 2 eingespielt?</div>`:""}
  <section class="karte"><div class="tabelle-rahmen"><table><thead><tr><th>Name</th><th>E-Mail</th><th>Rolle</th><th>Zuletzt angemeldet</th><th>Zugang</th></tr></thead><tbody>
  ${liste.map(p=>{ const i=info[p.id]||{}; const ich=p.id===S.me.id;
    return `<tr${p.gesperrt?' style="opacity:.55"':""}><td><span class="zeile" style="flex-wrap:nowrap">${ava(p.id,26)}<b>${esc(p.name)}</b>${ich?'<span class="pille">du</span>':""}</span></td>
      <td class="klein">${esc(i.email||"–")}</td>
      <td>${!ich?`<select data-a="rolle" data-id="${p.id}" style="width:auto">${["mitglied","bauleitung","admin"].map(r=>`<option value="${r}" ${p.rolle===r?"selected":""}>${rolleText(r)}</option>`).join("")}</select>`:`<span class="pille">${rolleText(p.rolle)}</span>`}</td>
      <td class="klein mass">${datumZeit(i.zuletzt)}</td>
      <td>${ich?"":p.gesperrt?`<button class="btn klein" data-a="sperren" data-id="${p.id}" data-k="0">Entsperren</button>`:`<button class="btn klein gefahr" data-a="sperren" data-id="${p.id}" data-k="1">Sperren</button>`}</td></tr>`; }).join("")}
  </tbody></table></div></section>
  <div class="raster r2" style="margin-top:16px">
    <section class="karte stapel"><h2>Neue Leute einladen</h2><p class="klein">Schick ihnen den Link zur Seite und den Gemeinde-Code. Sie registrieren sich selbst mit E-Mail und Passwort. Wer zur Leitungsgruppe gehört, wird beim Beitritt automatisch Bauleitung.</p>
      ${B.modus==="live"?`<form class="zeile" data-form="code"><input type="text" name="code" id="b-code" required placeholder="neuer Gemeinde-Code" style="flex:1;min-width:160px"><button class="btn" type="submit">Code ändern</button></form>`:`<p class="klein leise">In der Vorschau nicht aktiv.</p>`}</section>
    <section class="karte stapel"><h2>Passwort vergessen?</h2><p class="klein">Auf der Anmeldeseite gibt es „Passwort vergessen“. Dann kommt eine E-Mail mit einem Link. Gesperrte Personen können sich nicht mehr anmelden. Ihre Einträge, Fotos und ihr Werkzeug bleiben aber sichtbar.</p></section>
  </div>`;
};

/* ---------- Anmeldung (live) ---------- */
function zeigeTor(art,fehler="",info=""){
  const reg=art==="registrieren", beit=art==="beitreten", verg=art==="vergessen", neuPw=art==="neuesPasswort";
  document.getElementById("wurzel").innerHTML=`<div class="tor"><div class="karte">
    <div class="marke"><img src="${LOGO}" alt="Logo Tabernacle Church"><div><b>Gemeindebau</b><span>Tabernacle Church · Konzstraße 9</span></div></div>
    ${verg?`<form class="stapel" data-form="vergessen"><p>Gib deine E-Mail ein. Du bekommst einen Link, mit dem du ein neues Passwort festlegst.</p>
      <label class="feld">E-Mail<input type="email" name="email" id="t-e" required autocomplete="email"></label>
      ${fehler?`<p class="fehler">${esc(fehler)}</p>`:""}<button class="btn primaer" type="submit">Link schicken</button><button class="btn still" type="button" data-a="tor" data-k="anmelden">Zurück zur Anmeldung</button></form>`:
    neuPw?`<form class="stapel" data-form="neuesPasswort"><p>Lege dein neues Passwort fest.</p>
      <label class="feld">Neues Passwort<input type="password" name="pw1" id="t-p1" minlength="8" required autocomplete="new-password"></label>
      <label class="feld">Wiederholen<input type="password" name="pw2" id="t-p2" minlength="8" required autocomplete="new-password"></label>
      ${fehler?`<p class="fehler">${esc(fehler)}</p>`:""}<button class="btn primaer" type="submit">Speichern und weiter</button></form>`:
    beit?`<form class="stapel" data-form="beitreten"><p>Fast geschafft. Gib deinen Namen und den Gemeinde-Code ein.</p>
      <label class="feld">Dein Name<input type="text" name="name" id="t-n" required autocomplete="name"></label>
      <label class="feld">Gemeinde-Code<input type="text" name="code" id="t-c" required></label>
      ${fehler?`<p class="fehler">${esc(fehler)}</p>`:""}<button class="btn primaer" type="submit">Beitreten</button><button class="btn still" type="button" data-a="abmelden">Abmelden</button></form>`:`
    <div class="reiter" style="margin-bottom:16px"><button data-a="tor" data-k="anmelden" aria-pressed="${!reg}" style="flex:1">Anmelden</button><button data-a="tor" data-k="registrieren" aria-pressed="${reg}" style="flex:1">Neu registrieren</button></div>
    <form class="stapel" data-form="${reg?"registrieren":"anmelden"}">
      ${reg?`<label class="feld">Dein Name<input type="text" name="name" id="t-n" required autocomplete="name" placeholder="Vorname Nachname"></label>`:""}
      <label class="feld">E-Mail<input type="email" name="email" id="t-e" required autocomplete="email"></label>
      <label class="feld">Passwort<input type="password" name="pw" id="t-p" required minlength="${reg?8:6}" autocomplete="${reg?"new-password":"current-password"}"></label>${reg?"":`<button type="button" class="link klein" data-a="tor" data-k="vergessen" style="align-self:flex-end">Passwort vergessen?</button>`}
      ${reg?`<label class="feld">Gemeinde-Code<input type="text" name="code" id="t-c" required placeholder="bekommst du von der Bauleitung"></label>`:""}
      ${fehler?`<p class="fehler">${esc(fehler)}</p>`:""}${info?`<p class="hinweis">${esc(info)}</p>`:""}
      <button class="btn primaer" type="submit">${reg?"Registrieren":"Anmelden"}</button></form>
    <p class="klein leise" style="margin-top:14px;text-align:center">${reg?"Nur für die Tabernacle Church. Den Code bekommst du von der Bauleitung.":"Noch kein Zugang? Tippe oben auf „Neu registrieren“. Ein Konto gilt für alle deine Geräte."}</p>`}
  </div></div>`;
}

/* ================= Aktionen ================= */
const AKT = {
  geh:t=>{ ansicht=t.dataset.ziel; schliesse(); render(); window.scrollTo(0,0); },
  mehr:()=>oeffne("Mehr", `<nav class="nav">${[["tagebuch","Bautagebuch"],["teams","Teams & Leitung"],["material","Material"],["werkzeug","Werkzeug"],["profil","Mein Profil"],...(istAdmin()?[["benutzer","Benutzer verwalten"]]:[])].map(([k,l])=>`<button data-a="geh" data-ziel="${k}">${icon(k)}<span>${l}</span></button>`).join("")}</nav>`),
  zu:()=>schliesse(),
  demoReset:()=>{ DemoBackend.zuruecksetzen(); ladeAlles().then(()=>{ S.me=S.profil.find(p=>p.id===DemoBackend.d.me); render(); toast("Beispieldaten zurückgesetzt"); }); },
  monat:t=>{ const d=+t.dataset.d; kalMonat = d===0?new Date():new Date(kalMonat.getFullYear(),kalMonat.getMonth()+d,1); render(); },
  tagOeffnen:t=>tagDialog(t.dataset.datum),
  verfOeffnen:t=>verfDialog([t.dataset.datum]),
  mehrAn:()=>{ mehrfach=new Set(); render(); }, mehrAus:()=>{ mehrfach=null; render(); },
  mehrTag:t=>{ const d=t.dataset.datum; mehrfach.has(d)?mehrfach.delete(d):mehrfach.add(d); render(); },
  mehrEintragen:()=>{ if(mehrfach?.size) verfDialog([...mehrfach].sort()); },
  rang:t=>{ const s=t.closest(".schleier"); const r=s._reihe; const x=t.dataset.t; const i=r.indexOf(x); i>=0?r.splice(i,1):r.push(x);
    $$("#v-chips .chip",s).forEach(c=>{ const j=r.indexOf(c.dataset.t); c.setAttribute("aria-pressed",j>=0); c.innerHTML=(j>=0?`<span class="nr">${j+1}</span>`:"")+esc(c.dataset.t); }); },
  verfLoeschen:async t=>{ await speichere(()=>B.loeschen("verfuegbarkeit",t.dataset.id),"Ausgetragen"); await neu("verfuegbarkeit"); schliesse(); render(); },
  filterA:t=>{ filterA.art=t.dataset.k; render(); },
  aufgabe:t=>aufgabeDialog(t.dataset.id),
  aufgabeNeu:()=>aufgabeForm(null),
  aufgabeBearbeiten:t=>aufgabeForm(S.aufgabe.find(a=>a.id===t.dataset.id)),
  zug:t=>t.setAttribute("aria-pressed",t.getAttribute("aria-pressed")!=="true"),
  aStatus:async t=>{ await speichere(()=>B.aendern("aufgabe",t.dataset.id,{status:t.dataset.s}),"Status: "+STATUS[t.dataset.s]); await neu("aufgabe"); aufgabeDialog(t.dataset.id); render(); },
  aMich:async t=>{ const a=S.aufgabe.find(x=>x.id===t.dataset.id); await speichere(()=>B.aendern("aufgabe",a.id,{zugewiesen:[...a.zugewiesen,S.me.id]}),"Dir zugewiesen"); await neu("aufgabe"); aufgabeDialog(a.id); render(); },
  aufgabeLoeschenFrage:t=>{ const z=t.closest("form").querySelector("[data-loeschfrage]"); z.innerHTML=`<div class="hinweis zeile weit"><span>Aufgabe wirklich löschen? Notizen bleiben im Bautagebuch.</span><span class="zeile"><button type="button" class="btn klein gefahr" data-a="aufgabeLoeschen" data-id="${t.dataset.id}">Ja, löschen</button><button type="button" class="btn klein still" data-a="frageZu">Nein</button></span></div>`; },
  frageZu:t=>{ t.closest("[data-loeschfrage],[data-leerfrage]").innerHTML=""; },
  aufgabeLoeschen:async t=>{ await speichere(()=>B.loeschen("aufgabe",t.dataset.id),"Gelöscht"); await neu("aufgabe"); schliesse(); render(); },
  vorschlaege:async ()=>{ const tm=g=>S.team.find(t=>t.gewerk===g)?.id||null;
    const zeilen=PLAN_VORSCHLAEGE.map(([phase,titel,beschreibung,gewerk,bereich,tg,prio])=>({titel,beschreibung:beschreibung||null,gewerk,bereich,phase,status:"offen",prio,team_id:tg?tm(tg):null,zugewiesen:[],vorschlag:true}));
    await speichere(()=>B.neuViele("aufgabe",zeilen));
    await neu("aufgabe"); render(); toast(PLAN_VORSCHLAEGE.length+" Aufgaben übernommen"); },
  eintragNeu:()=>eintragDialog(null),
  materialNeu:t=>materialDialog(t.dataset.aufgabe||null),
  mStatus:async t=>{ await speichere(()=>B.aendern("material",t.dataset.id,{status:t.dataset.s}),MSTATUS[t.dataset.s]); await neu("material"); render(); },
  mLoeschen:async t=>{ await speichere(()=>B.loeschen("material",t.dataset.id),"Entfernt"); await neu("material"); render(); },
  filterM:t=>{ filterM=t.dataset.k; render(); },
  werkzeugNeu:()=>werkzeugDialog(),
  wLoeschen:async t=>{ await speichere(()=>B.loeschen("werkzeug",t.dataset.id),"Entfernt"); await neu("werkzeug"); render(); },
  teamNeu:()=>teamForm(null), teamBearbeiten:t=>teamForm(S.team.find(x=>x.id===t.dataset.id)),
  beitreten:async t=>{ await speichere(()=>B.neu("team_mitglied",{team_id:t.dataset.id,profil_id:S.me.id}),"Beigetreten"); await neu("team_mitglied"); render(); },
  austreten:async t=>{ await speichere(()=>B.austreten(t.dataset.id,S.me.id),"Ausgetreten"); await neu("team_mitglied"); render(); },
  schwer:t=>t.setAttribute("aria-pressed",t.getAttribute("aria-pressed")!=="true"),
  halleReiter:t=>{ halleReiter=t.dataset.k; render(); },
  objNeu:async t=>{ const k=OBJEKTE[t.dataset.typ]; const o=await speichere(()=>B.neu("planobjekt",{typ:t.dataset.typ,x:30,y:9.9,rot:t.dataset.typ==="stuhlreihe"?90:0,label:k.n}));
    await neu("planobjekt"); planAuswahl=o?.id||null; halleAktualisieren(); },
  objDreh:async t=>{ const o=S.planobjekt.find(x=>x.id===planAuswahl); if(!o) return; o.rot=((o.rot||0)+(+t.dataset.g))%360; halleAktualisieren(); await speichere(()=>B.aendern("planobjekt",o.id,{rot:o.rot})); },
  objWeg:async ()=>{ const id=planAuswahl; planAuswahl=null; await speichere(()=>B.loeschen("planobjekt",id),"Entfernt"); await neu("planobjekt"); halleAktualisieren(); },
  bestuhlungWahl:async t=>{ const n=+t.dataset.k, o=bestuhlungObj();
    await speichere(()=>o?B.aendern("planobjekt",o.id,{label:String(n),geaendert:new Date().toISOString()}):B.neu("planobjekt",{typ:"bestuhlung",x:0,y:0,rot:0,label:String(n)}),n?n+" Stühle gestellt":"Bestuhlung entfernt");
    await neu("planobjekt"); render(); },
  seitenWahl:async ()=>{ const o=seitenObj(), an=!seitenAn();
    await speichere(()=>o?B.aendern("planobjekt",o.id,{label:an?"1":"0",geaendert:new Date().toISOString()}):B.neu("planobjekt",{typ:"seiten",x:0,y:0,rot:0,label:"1"}),an?"Seitenplätze gestellt":"Seitenplätze entfernt");
    await neu("planobjekt"); render(); },
  grundeinrichtung:async ()=>{ const da=new Set(S.planobjekt.map(o=>o.typ)); const neue=grundeinrichtung().filter(o=>!da.has(o.typ));
    if(!neue.length) return toast("Bühne und Esstische sind schon eingerichtet");
    await speichere(()=>B.neuViele("planobjekt",neue)); await neu("planobjekt"); halleAktualisieren(); toast(neue.length+" Objekte gesetzt"); },
  planLeerenFrage:()=>{ $("[data-leerfrage]").innerHTML=`<div class="hinweis zeile weit" style="margin-bottom:12px"><span>Alle ${S.planobjekt.length} Objekte aus dem Plan entfernen? Das gilt für alle.</span><span class="zeile"><button class="btn klein gefahr" data-a="planLeeren">Ja, entfernen</button><button class="btn klein still" data-a="frageZu">Nein</button></span></div>`; },
  planLeeren:async ()=>{ for(const o of [...S.planobjekt]) await B.loeschen("planobjekt",o.id); planAuswahl=null; await neu("planobjekt"); render(); },
  blick:t=>dreiD?.ansicht(t.dataset.k),
  tor:t=>zeigeTor(t.dataset.k),
  abmelden:async ()=>{ await B.abmelden(); location.reload(); },
  benutzerNeuLaden:()=>{ benutzerInfo=null; neu("profil").then(render); },
  sperren:async t=>{ const an=t.dataset.k==="1"; await speichere(()=>B.sperren(t.dataset.id,an),an?"Zugang gesperrt":"Zugang wieder frei"); await neu("profil"); render(); }
};
async function neu(t){ try{ S[t]=await B.alle(t); }catch(e){} }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t||t.tagName==="SELECT"||(t.tagName==="INPUT"&&t.type!=="checkbox")) return; if(t.type==="checkbox"&&t.dataset.a!=="neuGelb") return; const f=AKT[t.dataset.a]; if(f){ f(t,e); } });
document.addEventListener("change",async e=>{ const t=e.target; const a=t.dataset?.a;
  if(t.matches('input[type=file]')){ const z=t.closest("form")?.querySelector("[data-fotozahl]"); if(z) z.textContent=t.files.length?`${t.files.length} Foto${t.files.length>1?"s":""} gewählt`:""; }
  if(a==="filterG"){ filterA.gewerk=t.value; render(); }
  if(a==="filterP"){ filterA.phase=t.value; render(); }
  if(a==="mStatusSel"){ await speichere(()=>B.aendern("material",t.dataset.id,{status:t.value}),MSTATUS[t.value]); await neu("material"); }
  if(a==="rolle"){ await speichere(()=>B.aendern("profil",t.dataset.id,{rolle:t.value}),"Rolle geändert"); await neu("profil"); render(); }
  if(a==="neuGelb") dreiD?.neueHervorheben(t.checked);
});
document.addEventListener("input",e=>{ if(e.target.dataset?.a==="suchW"){ suchW=e.target.value; const pos=e.target.selectionStart; render(); const i=$("#w-suche"); if(i){ i.focus(); i.setSelectionRange(pos,pos); } } });

/* ================= Formulare ================= */
const FORM = {
  verf:async f=>{ const s=f.closest(".schleier"); const daten=f.dataset.daten.split(","); const gleich=f.gleich.checked;
    const werte={von:f.von.value||null,bis:f.bis.value||null,taetigkeiten:gleich?[]:[...s._reihe],alles_gleich:gleich,notiz:f.notiz.value.trim()||null};
    for(const d of daten){ const vorh=S.verfuegbarkeit.find(v=>v.datum===d&&v.profil_id===S.me.id);
      await speichere(()=>vorh?B.aendern("verfuegbarkeit",vorh.id,werte):B.neu("verfuegbarkeit",{...werte,datum:d,profil_id:S.me.id})); }
    toast(daten.length>1?`${daten.length} Tage eingetragen`:"Eingetragen"); mehrfach=null; await neu("verfuegbarkeit"); schliesse(); render(); },
  aufgabe:async f=>{ const zug=$$('[data-a="zug"][aria-pressed="true"]',f).map(b=>b.dataset.id);
    const w={titel:f.titel.value.trim(),beschreibung:f.beschreibung.value.trim()||null,gewerk:f.gewerk.value||null,bereich:f.bereich.value||null,phase:f.phase.value===""?null:+f.phase.value,datum:f.datum.value||null,team_id:f.team_id.value||null,prio:+f.prio.value,zugewiesen:zug};
    if(f.status) w.status=f.status.value;
    const id=f.dataset.id; if(id) w.vorschlag=false;
    const r=await speichere(()=>id?B.aendern("aufgabe",id,w):B.neu("aufgabe",{...w,status:"offen"}),"Gespeichert"); await neu("aufgabe"); render(); aufgabeDialog(id||r.id); },
  eintrag:async f=>{ const knopf=f.querySelector("[type=submit]"); knopf.disabled=true; knopf.textContent="Speichert …";
    try{ const fotos=[]; for(const d of [...(f.fotos?.files||[])]) fotos.push(await B.fotoHoch(d));
      const text=(f.text.value||"").trim(); if(!text&&!fotos.length){ toast("Bitte Text oder Foto angeben"); knopf.disabled=false; knopf.textContent="Speichern"; return; }
      const aufgabe_id=f.aufgabe_id?.value||f.dataset.aufgabe||null;
      await speichere(()=>B.neu("eintrag",{datum:f.datum?.value||heuteIso(),text:text||null,aufgabe_id,fotos,autor:S.me.id}),"Eintrag gespeichert");
      await neu("eintrag"); if(f.dataset.aufgabe&&!f.datum){ aufgabeDialog(f.dataset.aufgabe); } else schliesse(); render();
    }catch(e){ knopf.disabled=false; knopf.textContent="Speichern"; } },
  material:async f=>{ const w={name:f.elements.name.value.trim(),menge:f.menge.value?+f.menge.value:null,einheit:f.einheit.value.trim()||null,gewerk:f.gewerk.value||null,aufgabe_id:f.aufgabe_id.value||null,notiz:f.notiz.value.trim()||null,status:"angefragt",angefragt_von:S.me.id};
    await speichere(()=>B.neu("material",w),"Anfrage gesendet"); await neu("material"); schliesse(); render(); },
  werkzeug:async f=>{ await speichere(()=>B.neu("werkzeug",{name:f.elements.name.value.trim(),kategorie:f.kategorie.value,anzahl:+f.anzahl.value||1,verfuegbarkeit:f.verfuegbarkeit.value,notiz:f.notiz.value.trim()||null,besitzer:S.me.id}),"Eingetragen. Danke!"); await neu("werkzeug"); schliesse(); render(); },
  team:async f=>{ const w={name:f.elements.name.value.trim(),gewerk:f.gewerk.value||null,leiter:f.leiter.value.trim()||null,farbe:f.farbe.value,beschreibung:f.beschreibung.value.trim()||null};
    await speichere(()=>f.dataset.id?B.aendern("team",f.dataset.id,w):B.neu("team",{...w,sort:S.team.length+1}),"Gespeichert"); await neu("team"); schliesse(); render(); },
  profil:async f=>{ const sw=$$('[data-a="schwer"][aria-pressed="true"]',f).map(b=>b.dataset.t);
    await speichere(()=>B.aendern("profil",S.me.id,{name:f.elements.name.value.trim(),telefon:f.telefon.value.trim()||null,hinweis:f.hinweis.value.trim()||null,schwerpunkte:sw}),"Profil gespeichert");
    await neu("profil"); S.me=S.profil.find(p=>p.id===S.me.id)||S.me; render(); },
  code:async f=>{ await speichere(()=>B.codeSetzen(f.code.value),"Code geändert"); f.reset(); },
  pwAendern:async f=>{ if(f.pw1.value!==f.pw2.value) return toast("Die Passwörter stimmen nicht überein");
    await speichere(()=>B.passwortAendern(f.pw1.value),"Passwort geändert – gilt ab jetzt auf allen Geräten"); f.reset(); },
  vergessen:async f=>{ try{ await B.passwortVergessen(f.email.value.trim()); zeigeTor("anmelden","","Wenn die E-Mail registriert ist, kommt gleich ein Link. Schau auch im Spam-Ordner nach."); }
    catch(e){ zeigeTor("vergessen",e.message); } },
  neuesPasswort:async f=>{ if(f.pw1.value!==f.pw2.value) return zeigeTor("neuesPasswort","Die Passwörter stimmen nicht überein.");
    try{ await B.passwortAendern(f.pw1.value); history.replaceState(null,"",location.pathname); await nachAnmeldung(); }catch(e){ zeigeTor("neuesPasswort",e.message); } },
  anmelden:async f=>{ try{ await B.anmelden(f.email.value.trim(),f.pw.value); await nachAnmeldung(); }catch(e){ zeigeTor("anmelden",e.message==="Invalid login credentials"?"E-Mail oder Passwort stimmt nicht.":e.message); } },
  registrieren:async f=>{ const name=f.elements.name.value.trim(), code=f.code.value.trim();
    try{ await B.registrieren(f.email.value.trim(),f.pw.value); await B.beitreten(code,name); await nachAnmeldung(); }
    catch(e){ const m=/registered/i.test(e.message)?"Diese E-Mail ist schon registriert. Bitte anmelden.":e.message; if(await B.sitzung()) zeigeTor("beitreten",m); else zeigeTor("registrieren",m); } },
  beitreten:async f=>{ try{ await B.beitreten(f.code.value.trim(),f.elements.name.value.trim()); await nachAnmeldung(); }catch(e){ zeigeTor("beitreten",e.message); } }
};
document.addEventListener("submit",e=>{ const f=e.target; if(!f.dataset?.form) return; e.preventDefault(); FORM[f.dataset.form]?.(f); });

async function nachAnmeldung(){ const p=await B.meinProfil(); if(!p) return zeigeTor("beitreten"); if(p.gesperrt) return zeigeTor("beitreten","Dein Zugang ist gesperrt. Bitte wende dich an die Bauleitung."); S.me=p; B.abonnieren(nachladen); await ladeAlles(); render(); }

/* ================= Start ================= */
async function starten(){
  let live=false; try{ live = !!(window.GB_KONFIG&&GB_KONFIG.url) && await LiveBackend.init(); }catch(e){ live=false; }
  if(live){ B=LiveBackend; const s=await B.sitzung(); if(!s) return zeigeTor("anmelden");
    if(B.wiederherstellung) return zeigeTor("neuesPasswort"); return nachAnmeldung(); }
  B=DemoBackend; await B.init(); S.me=await B.meinProfil(); await ladeAlles(); render();
}
starten();
