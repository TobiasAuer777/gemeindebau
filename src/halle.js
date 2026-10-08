/* ===== Halle: Grundriss (Maße Architekt, Aufteilung „aktueller Plan") + Planen + 3D ===== */
/* Koordinaten in Metern, Innenmaß. x: von der Konzstraße (links) zur Industriestraße (rechts); y: vom Hof Kinder-Spiel (oben) zum Hof Eingang (unten). */
const HALLE = { L:47.40, B:19.90, traufe:3.70, first:5.09, wand:0.24 };

// Wände: [x1,y1,x2,y2, art]   art: bestand | neu (gelb im Plan) | neu-ra (gelb, mit Ringanker) | abriss (rot im Plan = wird entfernt)
const WAENDE_EIGEN = [
  // linker Block (Bestand) – nach Tobis aktuellem Plan (08.10.)
  [2.4,0,2.4,2.55,"bestand"],[1.45,2.55,2.4,2.55,"bestand"],[2.4,3.2,2.4,4.0,"bestand"],            // Bad | Waschraum
  [0,4.0,2.4,4.0,"bestand"],[2.4,4.0,3.1,4.0,"bestand"],[3.7,4.0,4.48,4.0,"bestand"],               // Bad/Wasch unten (Tür zum Flur)
  [4.48,0,4.48,5.7,"bestand"],[4.48,5.34,6.85,5.34,"bestand"],[7.65,5.34,8.96,5.34,"bestand"],      // Stillraum
  [8.96,0,8.96,5.34,"bestand"],
  [3.04,4.13,3.04,6.87,"neu"],                                                                      // Flur | Kinderraum (gelb im Plan)
  [3.04,6.87,3.2,6.87,"bestand"],[3.95,6.87,4.48,6.87,"bestand"],[4.48,6.75,4.48,10.3,"bestand"],  // Flur unten, Wand Kinderraum | Jugendraum
  [0,10.0,4.48,10.0,"bestand"],[4.48,7.5,8.96,7.5,"bestand"],                                       // Kinderraum unten, Gang | Jugendraum
  [4.0,10.3,4.48,10.3,"bestand"],[4.0,11.0,4.0,12.7,"bestand"],[4.0,13.5,4.0,16.45,"bestand"],[4.0,17.3,4.0,19.9,"bestand"],
  [0,11.77,4.0,11.77,"bestand"],[2.15,11.77,2.15,14.44,"bestand"],[0,14.44,0.7,14.44,"bestand"],[1.55,14.44,4.0,14.44,"bestand"],
  [4.0,16.4,5.97,16.4,"bestand"],[6.92,16.4,8.96,16.4,"bestand"],                                  // Jugendraum | Warteraum
  [8.96,7.5,8.96,16.4,"bestand"],[8.96,17.3,8.96,19.9,"bestand"],                                  // Blockwand zum Gemeinschaftsraum
  // Küche + WC-Block (neu, gelb)
  [9.0,3.9,11.9,3.9,"neu"],[12.8,3.9,14.4,3.9,"neu"],[14.4,0,14.4,3.9,"neu"],
  [15.7,0,15.7,3.9,"neu"],[15.7,3.9,16.8,3.9,"neu"],[17.7,3.9,21.2,3.9,"neu"],
  // Lange Trennwand Gemeinschaftsraum | Gottesdienstraum: Ytong + Ringanker (über die Türöffnungen durchlaufend)
  [21.2,0,21.2,4.3,"neu-ra"],[21.2,5.2,21.2,18.2,"neu-ra"],[21.2,19.1,21.2,19.9,"neu-ra"],
  // Wand unten im Gemeinschaftsraum (11 m)
  [10.4,17.7,21.2,17.7,"neu"],
  // Lange Wand hinter der Bühne: Ytong + Ringanker
  [46.7,0,46.7,19.9,"neu-ra"],
  // Rot im Plan: wird abgerissen
  [40.2,0,40.2,4.25,"abriss"],[40.2,15.55,46.7,15.55,"abriss"],[40.2,15.55,40.2,19.9,"abriss"]
];
const RAEUME_EIGEN = [
  {n:"Gottesdienstraum",x:21.2,y:0,w:25.5,h:19.9,m2:"528,97",haupt:true,ly:1.6},
  {n:"Gemeinschaftsraum",x:9.0,y:3.9,w:12.2,h:13.8,m2:"209,21",haupt:true},
  {n:"Küche",x:9.0,y:0,w:5.4,h:3.9,m2:"20,96"},{n:"WC-Block",x:15.7,y:0,w:5.5,h:3.9,m2:"20,96"},
  {n:"Bad (3 × DA)",x:0,y:0,w:2.4,h:4.0,klein:true},{n:"Waschraum",x:2.4,y:0,w:2.08,h:4.0,klein:true},{n:"Stillraum",x:4.48,y:0,w:4.48,h:5.34},
  {n:"Flur",x:3.04,y:4.0,w:1.44,h:2.87,klein:true},{n:"Kinderraum",x:0,y:4.0,w:3.04,h:6.0},{n:"Gang",x:4.48,y:5.34,w:4.48,h:2.16,klein:true},
  {n:"WC Unisex",x:0,y:10.0,w:4.0,h:1.77,klein:true},{n:"Pastor Bad/WC",x:0,y:11.77,w:2.15,h:2.67,klein:true},{n:"Küche Jugend",x:2.15,y:11.77,w:1.85,h:2.67,klein:true},
  {n:"Jugendraum",x:4.48,y:7.5,w:4.48,h:8.9},{n:"Pastor-Büro",x:0,y:14.44,w:4.0,h:5.46},{n:"Warteraum",x:4.0,y:16.4,w:4.96,h:3.5},
  {n:"Flur & Eingang",x:9.0,y:17.7,w:12.2,h:2.2,klein:true}
];
const BUEHNE_EIGEN = {x:42.7,y:2.85,w:4.0,h:14.0,hoehe:0.6};   // 14 m breit, 4 m tief (Tobi, 08.10.)
const LED_EIGEN = {y1:4.9,y2:14.8,unten:0.9,oben:3.9,wand:46.7};   // 10 m × 3 m an der Wand hinter der Bühne
const TECHNIK_EIGEN = {x:21.8,y:6.6,w:2.4,h:6.4};            // im Plan gepunktet: Technikbereich (Ton, Licht, Video)
// Architektenplanung: Bühne am Ende des großen Saals vor der Trennwand (x = 40,0), Technik und Bestuhlung rücken mit
const BUEHNE_ARCH = {...BUEHNE_EIGEN, x:36.0};
const LED_ARCH = {...LED_EIGEN, wand:40.0};
const ARCH_DX = BUEHNE_ARCH.x-BUEHNE_EIGEN.x;
const TECHNIK_ARCH = {...TECHNIK_EIGEN, x:TECHNIK_EIGEN.x+ARCH_DX};
let BUEHNE=BUEHNE_EIGEN, LED=LED_EIGEN, TECHNIK=TECHNIK_EIGEN;
const istNeu = a => a==="neu"||a==="neu-ra";
const TREPPEN_EIGEN = [{x:9.12,y:4.05,w:0.62,h:0.95},{x:9.12,y:9.92,w:0.62,h:1.0},{x:9.12,y:17.3,w:0.62,h:1.3}];  // je 6 Stufen
const TUEREN_EIGEN = [{x1:32.6,x2:40.0,y:19.9,n:"Haupteingang"},{x1:40.9,x2:41.9,y:0,n:"Notausgang"}];

/* ---------- Architektenplanung (Bauantrag, Erdgeschoss): Außenmaß 47,72 × 20,28–20,41 m ----------
   Innenmaß wie oben: x = Außenmaß − 0,15 (Wand Konzstraße). Linker Block: Spalten 1,865 | 3,115 | 3,55 m (oben)
   bzw. 3,82 | 4,825 m (unten); Reihen 3,905 | 5,72 | 1,40 | 2,30 | 5,97 m. Halle 31,00 m + 7,18 m. */
const WAENDE_ARCH = [
  [1.92,0,1.92,0.25,"bestand"],[1.92,0.95,1.92,1.55,"bestand"],[1.92,2.25,1.92,2.95,"bestand"],[1.92,3.65,1.92,3.905,"bestand"],  // WC | Vorraum
  [0,1.2825,1.92,1.2825,"bestand"],[0,2.6225,1.92,2.6225,"bestand"],                                                    // 3 WC
  [5.15,0,5.15,3.905,"bestand"],                                                                                         // Vorraum | Vorraum
  [0,4.025,2.3,4.025,"bestand"],[3.2,4.025,8.76,4.025,"bestand"],                                                        // oben | Waschraum/Aufenthaltsraum
  [5.15,4.145,5.15,5.8,"bestand"],[5.15,6.7,5.15,9.865,"bestand"],                                                       // Waschraum | Aufenthaltsraum
  [0,9.985,8.76,9.985,"bestand"],
  [2.0575,10.105,2.0575,11.505,"bestand"],[0,11.5625,3.82,11.5625,"bestand"],[0,13.9775,3.82,13.9775,"bestand"],        // WC | Vorraum, Abstellraum, Büro
  [3.88,10.105,3.88,10.7,"bestand"],[3.88,11.5,3.88,12.1,"bestand"],[3.88,12.9,3.88,16.6,"bestand"],[3.88,17.5,3.88,19.9,"bestand"],
  [8.88,0,8.88,1.5,"bestand"],[8.88,2.4,8.88,5.1,"bestand"],[8.88,6.0,8.88,17.9,"bestand"],[8.88,18.8,8.88,19.9,"bestand"],  // Blockwand zur Halle
  [40.075,0,40.075,19.9,"bestand"]                                                                                         // Begegnungsstätte | Begegnungsstätte
];
const RAEUME_ARCH = [
  {n:"Begegnungsstätte",x:9.0,y:0,w:31.0,h:19.9,m2:"618,55",haupt:true},
  {n:"Begegnungsstätte",x:40.15,y:0,w:7.25,h:19.9,m2:"144,37",haupt:true},
  {n:"WC",x:0,y:0,w:1.865,h:1.225,m2:"2,39",klein:true},{n:"WC",x:0,y:1.34,w:1.865,h:1.225,m2:"2,28",klein:true},{n:"WC",x:0,y:2.68,w:1.865,h:1.225,m2:"2,39",klein:true},
  {n:"Vorraum",x:1.98,y:0,w:3.115,h:3.905,m2:"12,19"},{n:"Vorraum",x:5.21,y:0,w:3.55,h:3.905,m2:"13,87"},
  {n:"Waschraum",x:0,y:4.145,w:5.095,h:5.72,m2:"29,14"},{n:"Aufenthaltsraum",x:5.21,y:4.145,w:3.55,h:5.72,m2:"20,31"},
  {n:"WC",x:0,y:10.105,w:2.0,h:1.4,m2:"2,92",klein:true},{n:"Vorraum",x:2.115,y:10.105,w:1.705,h:1.4,m2:"2,67",klein:true},
  {n:"Abstellraum",x:0,y:11.62,w:3.82,h:2.3,m2:"8,79"},{n:"Büro",x:0,y:14.035,w:3.82,h:5.865,m2:"22,81"},{n:"Büro",x:3.935,y:10.105,w:4.825,h:9.795,m2:"47,75"}
];
const TUEREN_ARCH = [{x1:10.37,x2:11.38,y:19.9,n:"Eingang"},{x1:30.47,x2:34.47,y:19.9,n:"Tor"},{x1:35.53,x2:39.53,y:19.9,n:"Notausgang"},{x1:42.35,x2:44.4,y:0,n:"Notausgang"}];

/* Umschalter: „Eigene Planung“ (Umbau) oder „Architektenplanung“ (Bauantrag) */
let PLANUNG="eigen", WAENDE, RAEUME, TREPPEN, TUEREN_AUSSEN;
function planungSetzen(art){ PLANUNG=art==="architekt"?"architekt":"eigen"; const a=PLANUNG==="architekt";
  WAENDE=a?WAENDE_ARCH:WAENDE_EIGEN; RAEUME=a?RAEUME_ARCH:RAEUME_EIGEN; TREPPEN=a?[]:TREPPEN_EIGEN; TUEREN_AUSSEN=a?TUEREN_ARCH:TUEREN_EIGEN;
  BUEHNE=a?BUEHNE_ARCH:BUEHNE_EIGEN; LED=a?LED_ARCH:LED_EIGEN; TECHNIK=a?TECHNIK_ARCH:TECHNIK_EIGEN;
  try{ localStorage.setItem("gb-planung",PLANUNG); }catch(e){} }
planungSetzen((()=>{ try{ return localStorage.getItem("gb-planung"); }catch(e){ return null; } })());
const istArch = () => PLANUNG==="architekt";
/* Einrichtung aus der eigenen Planung auf die Architektenplanung übertragen (nur Anzeige):
   Bühne/Saal rücken um ARCH_DX nach links, Esstische und Buffet in die zweite Begegnungsstätte */
function objekteFuerPlanung(liste){
  if(!istArch()) return liste||[];
  const slots=[]; for(const x of [41.4,43.8,46.2]) for(let y=1.9;y<=18.2;y+=2.35) slots.push([x,+y.toFixed(2)]);
  let n=0;
  return (liste||[]).map(o=>{
    if(o.x>=21.2) return {...o,x:Math.max(9.4,+(o.x+ARCH_DX).toFixed(2))};
    if(o.typ==="esstisch"){ const s=slots[n++]; return s?{...o,x:s[0],y:s[1],rot:90}:null; }
    if(o.typ==="buffet") return {...o,x:43.8,y:19.05,rot:0};
    return {...o,x:+(40.6+(o.x-9.0)*0.55).toFixed(2)};
  }).filter(Boolean); }

const OBJEKTE = {
  stuhlreihe:{n:"Stuhlreihe (10)",w:5.0,d:0.55,h:0.9,farbe:"#2b4fa0",plaetze:10},
  stuhl:{n:"Stuhl",w:0.5,d:0.5,h:0.9,farbe:"#2b4fa0",plaetze:1},
  rundtisch:{n:"Rundtisch Ø 1,6",w:1.6,d:1.6,h:0.75,farbe:"#8a5a2b",rund:true,plaetze:8},
  tisch:{n:"Tisch 1,6 × 0,8",w:1.6,d:0.8,h:0.75,farbe:"#8a5a2b",plaetze:6},
  garnitur:{n:"Biertisch-Garnitur",w:2.2,d:1.7,h:0.75,farbe:"#9a6a35",plaetze:8},
  buffet:{n:"Buffet",w:3.0,d:0.8,h:0.9,farbe:"#be185d"},
  pult:{n:"Rednerpult",w:0.6,d:0.7,h:1.15,farbe:"#14254f"},
  esstisch:{n:"Esstisch mit 6 Stühlen",w:1.6,d:0.8,h:0.75,farbe:"#9a6a35",plaetze:6,stuehle:6},
  schlagzeug:{n:"Schlagzeug",w:1.6,d:1.8,h:1.1,farbe:"#8f2d2d"},
  piano:{n:"Piano / Keyboard",w:0.6,d:1.5,h:1.0,farbe:"#1c1c1c"},
  bass:{n:"Bassgitarre + Verstärker",w:0.7,d:0.9,h:1.2,farbe:"#2f3a4f"},
  lautsprecher:{n:"Lautsprecher",w:0.5,d:0.5,h:1.9,farbe:"#222"},
  regie:{n:"Regieplatz (Ton/Licht)",w:2.4,d:1.0,h:1.0,farbe:"#334155"},
  spielecke:{n:"Spielecke",w:3.0,d:3.0,h:0.05,farbe:"#16a34a"}
};

/* ---------- 2D-Grundriss als SVG ---------- */
function planSvg(objekte, opt={}){
  const S=20, R=40, W=HALLE.L*S+R*2, H=HALLE.B*S+R*2;  // 20 px pro Meter
  const p = v => (v*S+R).toFixed(1);
  const sel = opt.auswahl;
  let s = `<svg class="plan-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Grundriss der Halle, 47,40 × 19,90 m Innenmaß">
  <defs>
    <pattern id="gp" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="var(--text3)"/></pattern>
    <pattern id="sch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="var(--text3)" stroke-width="1.2"/></pattern>
    <pattern id="m1" width="${S}" height="${S}" patternUnits="userSpaceOnUse" x="${R}" y="${R}"><path d="M ${S} 0 L 0 0 0 ${S}" fill="none" stroke="var(--raster)" stroke-width="1"/></pattern>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="var(--flaeche)"/>
  <rect x="${R}" y="${R}" width="${HALLE.L*S}" height="${HALLE.B*S}" fill="url(#m1)"/>`;
  RAEUME.forEach(r=>{ s+=`<rect x="${p(r.x)}" y="${p(r.y)}" width="${(r.w*S).toFixed(1)}" height="${(r.h*S).toFixed(1)}" fill="${r.haupt?'var(--blau-weich)':'var(--flaeche2)'}" opacity="${r.haupt?.55:.8}"/>`; });
  const arch=istArch();
  { s+=`<rect x="${p(TECHNIK.x)}" y="${p(TECHNIK.y)}" width="${TECHNIK.w*S}" height="${TECHNIK.h*S}" fill="url(#gp)" stroke="var(--text3)" stroke-width="1"/>`;
  { const tx=p(TECHNIK.x+TECHNIK.w/2), ty=p(TECHNIK.y+TECHNIK.h/2);
    s+=`<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-family="var(--f-titel)" font-weight="700" font-size="12" letter-spacing="1" fill="var(--tinte)" paint-order="stroke" stroke="var(--flaeche)" stroke-width="3" transform="rotate(-90 ${tx} ${ty})">TECHNIK</text>`; }
  s+=`<rect x="${p(BUEHNE.x)}" y="${p(BUEHNE.y)}" width="${BUEHNE.w*S}" height="${BUEHNE.h*S}" fill="url(#sch)" stroke="var(--tinte)" stroke-width="1.5"/>`;
  s+=`<line x1="${p(LED.wand-0.08)}" y1="${p(LED.y1)}" x2="${p(LED.wand-0.08)}" y2="${p(LED.y2)}" stroke="var(--flamme)" stroke-width="6" stroke-linecap="round"/>`; }
  // Außenwand
  s+=`<rect x="${R-HALLE.wand*S/2}" y="${R-HALLE.wand*S/2}" width="${HALLE.L*S+HALLE.wand*S}" height="${HALLE.B*S+HALLE.wand*S}" fill="none" stroke="var(--tinte)" stroke-width="${HALLE.wand*S}"/>`;
  TUEREN_AUSSEN.forEach(t=>{ s+=`<line x1="${p(t.x1)}" y1="${p(t.y)}" x2="${p(t.x2)}" y2="${p(t.y)}" stroke="var(--flaeche)" stroke-width="${HALLE.wand*S+2}"/>`; });
  WAENDE.forEach(([x1,y1,x2,y2,a])=>{
    if(a==="abriss"){ s+=`<line x1="${p(x1)}" y1="${p(y1)}" x2="${p(x2)}" y2="${p(y2)}" stroke="var(--glut)" stroke-width="4.5" stroke-dasharray="7 5" opacity=".9"/>`; return; }
    const c=istNeu(a)?"var(--gold)":"var(--text2)";
    s+=`<line x1="${p(x1)}" y1="${p(y1)}" x2="${p(x2)}" y2="${p(y2)}" stroke="${c}" stroke-width="${istNeu(a)?6:4.5}" stroke-linecap="square"/>`;
    if(a==="neu-ra") s+=`<line x1="${p(x1)}" y1="${p(y1)}" x2="${p(x2)}" y2="${p(y2)}" stroke="var(--tinte)" stroke-width="1.6" stroke-dasharray="10 6"/>`; });
  // Beschriftung Rückbau + Ringanker
  if(!arch){ s+=`<text x="${p(40.2)-6}" y="${p(2.1)}" text-anchor="end" font-family="var(--f-text)" font-weight="700" font-size="9.5" fill="var(--glut)">✕ Rückbau</text>`;
  s+=`<text x="${p(40.2)-6}" y="${p(17.8)}" text-anchor="end" font-family="var(--f-text)" font-weight="700" font-size="9.5" fill="var(--glut)">✕ Rückbau</text>`;
  [[46.7,13,2.6],[21.2,13,11.6]].forEach(([wx,dx,wy])=>{ const rx=p(wx)+dx, ry=p(wy); s+=`<text x="${rx}" y="${ry}" text-anchor="middle" font-family="var(--f-text)" font-weight="700" font-size="9" fill="var(--tinte)" paint-order="stroke" stroke="var(--flaeche)" stroke-width="3" transform="rotate(90 ${rx} ${ry})">RINGANKER</text>`; }); }
  // Beschriftung
  RAEUME.forEach(r=>{ const cx=p(r.x+r.w/2), cy=p(r.ly!=null?r.y+r.ly:r.y+r.h/2); const fs=r.haupt?15:r.klein?8.5:10;
    s+=`<text x="${cx}" y="${cy}" text-anchor="middle" font-family="var(--f-titel)" font-weight="600" font-size="${fs}" fill="var(--tinte)">${r.n}</text>`;
    if(r.m2) s+=`<text x="${cx}" y="${(+cy+fs+2).toFixed(1)}" text-anchor="middle" font-family="var(--f-mass)" font-size="9.5" fill="var(--text2)">${arch?"":"NGF "}${r.m2} m²</text>`; });
  buehnenTreppen().forEach(tr=>{ s+=`<rect x="${p(tr.x)}" y="${p(tr.y)}" width="${(tr.w*S).toFixed(1)}" height="${(tr.h*S).toFixed(1)}" fill="var(--flaeche)" stroke="var(--tinte)" stroke-width="1.2"/>`;
    for(let i=1;i<TREPPE_STUFEN;i++) s+=`<line x1="${p(tr.x+i*TREPPE_AUFTRITT)}" y1="${p(tr.y)}" x2="${p(tr.x+i*TREPPE_AUFTRITT)}" y2="${p(tr.y+tr.h)}" stroke="var(--tinte)" stroke-width=".8"/>`; });
  s+=`<text x="${p(BUEHNE.x+BUEHNE.w/2)}" y="${p(BUEHNE.y+BUEHNE.h/2)}" text-anchor="middle" font-family="var(--f-titel)" font-weight="700" font-size="13" fill="var(--tinte)" transform="rotate(-90 ${p(BUEHNE.x+BUEHNE.w/2)} ${p(BUEHNE.y+BUEHNE.h/2)})">BÜHNE · LED-Wand 10 × 3 m</text>`;
  // Umgebung
  const ue=(x,y,t,rot)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--f-text)" font-weight="600" font-size="11" letter-spacing="1.2" fill="var(--text3)" ${rot?`transform="rotate(${rot} ${x} ${y})"`:''}>${t}</text>`;
  s+=ue(W/2,R-16,"HOF KINDER-SPIEL")+ue(W/2,H-12,"HOF EINGANG · PFLASTER")+ue(16,H/2,"KONZSTRASSE · PARKPLÄTZE",-90)+ue(W-14,H/2,"INDUSTRIESTRASSE",90);
  if(arch) TUEREN_AUSSEN.forEach(t=>{ const unten=t.y>0; s+=`<text x="${p((t.x1+t.x2)/2)}" y="${unten?p(HALLE.B)+18:p(0)-8}" text-anchor="middle" font-size="9.5" font-weight="600" fill="${t.n==="Notausgang"?"var(--ok)":"var(--flamme)"}">${unten?"▲ ":"▼ "}${t.n}</text>`; });
  else s+=`<text x="${p((TUEREN_AUSSEN[0].x1+TUEREN_AUSSEN[0].x2)/2)}" y="${p(HALLE.B)+18}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--flamme)">▲ Haupteingang</text>`;
  // Maßkette
  s+=`<g font-family="var(--f-mass)" font-size="10" fill="var(--text2)"><text x="${R+6}" y="${R-4}">0</text><text x="${p(HALLE.L)-30}" y="${R-4}">47,40 m</text></g>`;
  // Treppen
  TREPPEN.forEach(tr=>{ s+=`<rect x="${p(tr.x)}" y="${p(tr.y)}" width="${(tr.w*S).toFixed(1)}" height="${(tr.h*S).toFixed(1)}" fill="var(--flaeche)" stroke="var(--text2)" stroke-width="1"/>`;
    for(let i=1;i<6;i++) s+=`<line x1="${p(tr.x)}" y1="${p(tr.y+tr.h*i/6)}" x2="${p(tr.x+tr.w)}" y2="${p(tr.y+tr.h*i/6)}" stroke="var(--text2)" stroke-width=".8"/>`; });
  // Seitenplätze an der Bühne (rote Bezüge)
  if(opt.seiten){ s+=`<g fill="${STUHL.rot}">`; seitenPositionen().forEach(c=>{ const sw=(STUHL.breite-0.06)*S, sd=(STUHL.tiefe-0.04)*S; s+=`<rect x="${(c.x*S+R-sw/2).toFixed(1)}" y="${(c.y*S+R-sd/2).toFixed(1)}" width="${sw.toFixed(1)}" height="${sd.toFixed(1)}" rx="1.5"/>`; }); s+=`</g>`;
    SEITEN.forEach(g=>{ s+=`<text x="${p(BUEHNE.x+BUEHNE.w/2)}" y="${p(typeof g.text==="function"?g.text():g.text)}" text-anchor="middle" font-family="var(--f-text)" font-weight="700" font-size="9" fill="${STUHL.rot}">${g.n}</text>`; }); }
  // Bestuhlung (umschaltbar)
  if(opt.bestuhlung){ const sw=(STUHL.breite-0.06)*S, sd=(STUHL.tiefe-0.04)*S; s+=`<g fill="${STUHL.farbe}">`;
    stuhlPositionen(opt.bestuhlung).forEach(c=>{ s+=`<rect x="${(c.x*S+R-sd/2).toFixed(1)}" y="${(c.y*S+R-sw/2).toFixed(1)}" width="${sd.toFixed(1)}" height="${sw.toFixed(1)}" rx="1.5"/>`; }); s+=`</g>`; }
  // Planobjekte
  objekteFuerPlanung(objekte).forEach(o=>{ const k=OBJEKTE[o.typ]; if(!k) return; const cx=p(o.x), cy=p(o.y), w=k.w*S, d=k.d*S;
    const aktiv = sel===o.id;
    s+=`<g data-obj="${o.id}" transform="translate(${cx} ${cy}) rotate(${o.rot||0})" style="cursor:${opt.bearbeiten?'grab':'default'}">`;
    if(k.rund) s+=`<circle r="${w/2}" fill="${k.farbe}" fill-opacity=".85" stroke="${aktiv?'var(--flamme)':'#fff'}" stroke-width="${aktiv?3:1}"/>`;
    else if(o.typ==="esstisch"){ s+=`<rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" rx="2" fill="${k.farbe}" stroke="${aktiv?'var(--flamme)':'#fff'}" stroke-width="${aktiv?3:1}"/>`;
      [-0.5,0,0.5].forEach(dx=>[-1,1].forEach(sy=>{ s+=`<rect x="${(dx*S-4.5).toFixed(1)}" y="${(sy*(d/2+4)-4.5).toFixed(1)}" width="9" height="9" rx="2" fill="${STUHL.farbe}"/>`; })); }
    else if(["schlagzeug","piano","bass","pult"].includes(o.typ)){ s+=`<rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" rx="${o.typ==="schlagzeug"?12:2}" fill="${k.farbe}" stroke="${aktiv?'var(--flamme)':'#fff'}" stroke-width="${aktiv?3:1}"/>`;
      s+=`<text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-size="7" font-weight="700" fill="#fff" transform="rotate(${-(o.rot||0)})">${({schlagzeug:"Drums",piano:"Piano",bass:"Bass",pult:"Pult"})[o.typ]}</text>`; }
    else if(o.typ==="stuhlreihe"){ s+=`<rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" fill="transparent" stroke="${aktiv?'var(--flamme)':'none'}" stroke-width="2.5"/>`;
      for(let i=0;i<10;i++) s+=`<rect x="${-w/2+i*0.5*S+1}" y="${-d/2+1}" width="${0.5*S-2}" height="${d-2}" rx="2" fill="${k.farbe}"/>`; }
    else s+=`<rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" rx="2" fill="${k.farbe}" fill-opacity=".85" stroke="${aktiv?'var(--flamme)':'#fff'}" stroke-width="${aktiv?3:1}"/>`;
    s+=`</g>`; });
  s+=`</svg>`;
  return s;
}

/* Bestuhlung Gottesdienstraum: 3 Blöcke, Blick zur Bühne. Stuhlbreite 0,50 m. */
const STUHL = {breite:0.5, tiefe:0.48, farbe:"#33508f", rot:"#a3262a"};
/* Seitenplätze neben der Bühne: je 2 Reihen à 7, Blick zur Bühnenmitte; Lobpreisteam bei den Pianos, Pastoren gegenüber */
const SEITEN = [
  {n:"Lobpreisteam", reihen:[1.5, 0.6], blick:1,  text:()=>BUEHNE_Y0()-0.45},                 // an der Außenwand (Tobi, 08.10.)
  {n:"Pastoren",     reihen:[HALLE.B-1.5, HALLE.B-0.6], blick:-1, text:()=>BUEHNE_Y1()+0.75}];
/* Treppen an den beiden vorderen Ecken der Bühne: 4 Stufen à 15 cm, Auftritt 30 cm, 1,5 m breit */
const TREPPE_STUFEN=4, TREPPE_AUFTRITT=0.3, TREPPE_BREITE=1.5;
function buehnenTreppen(){ const l=TREPPE_STUFEN*TREPPE_AUFTRITT;
  return [{x:BUEHNE.x-l,y:BUEHNE.y+0.3,w:l,h:TREPPE_BREITE},{x:BUEHNE.x-l,y:BUEHNE.y+BUEHNE.h-0.3-TREPPE_BREITE,w:l,h:TREPPE_BREITE}]; }
function BUEHNE_Y0(){ return BUEHNE.y; } function BUEHNE_Y1(){ return BUEHNE.y+BUEHNE.h; }
function seitenPositionen(){ const out=[]; SEITEN.forEach(g=>g.reihen.forEach(y=>{ for(let i=0;i<7;i++) out.push({x:BUEHNE.x+0.4+i*STUHL.breite, y, theta:g.blick>0?-Math.PI/2:Math.PI/2, rot:true}); })); return out; }
const BESTUHLUNG = {
  300:{bloecke:[8,10,8],  abstand:0.95, gang:1.5, vorne:5.0},
  400:{bloecke:[9,12,9],  abstand:0.95, gang:1.2, vorne:4.5},
  500:{bloecke:[9,12,9],  abstand:0.85, gang:1.2, vorne:3.4}   // 0,85 m = 0,45 Sitz + 0,40 Durchgang (Minimum)
};
function bestuhlungInfo(n){ const b=BESTUHLUNG[n]; if(!b) return null; const proReihe=b.bloecke.reduce((s,x)=>s+x,0);
  const breite=proReihe*STUHL.breite+2*b.gang; const reihen=Math.ceil(n/proReihe);
  return {...b, proReihe, reihen, rand:(HALLE.B-breite)/2, erste:BUEHNE.x-b.vorne, letzte:BUEHNE.x-b.vorne-(reihen-1)*b.abstand}; }
function stuhlPositionen(n){
  const i=bestuhlungInfo(n); if(!i) return [];
  const out=[]; let rest=n;
  // y-Startpunkte der Blöcke
  const starts=[]; let y=i.rand; i.bloecke.forEach((b,k)=>{ starts.push(y); y+=b*STUHL.breite+(k<2?i.gang:0); });
  for(let r=0;r<i.reihen&&rest>0;r++){ const x=i.erste-r*i.abstand; let anz=i.bloecke.slice();
    if(rest<i.proReihe){ // letzte Reihe: zuerst Mittelblock, dann gleichmäßig außen – jeweils am Gang
      const m=Math.min(rest,anz[1]); const aussen=rest-m; anz=[Math.ceil(aussen/2),m,Math.floor(aussen/2)]; }
    anz.forEach((a,k)=>{ const voll=i.bloecke[k]; const off= k===0? voll-a : k===2? 0 : Math.floor((voll-a)/2);
      for(let s=0;s<a;s++) out.push({x, y:starts[k]+(off+s+0.5)*STUHL.breite}); });
    rest-=anz.reduce((s,x)=>s+x,0); }
  return out;
}
/* Grundeinrichtung: Rednerpult vorne Mitte, Instrumente hinten im Halbkreis, Esstische im Gemeinschaftsraum */
function grundeinrichtung(){
  const BUEHNE=BUEHNE_EIGEN;   // gespeichert wird immer in der eigenen Planung
  const mitte=BUEHNE.y+BUEHNE.h/2, o=[];
  o.push({typ:"pult",x:+(BUEHNE.x+0.45).toFixed(2),y:mitte,rot:0,label:"Rednerpult"});
  // hinten im Halbkreis: Pianos nebeneinander (um 90° gedreht, Spieler blickt zur Kanzel), Schlagzeug Mitte, Bass rechts
  const hinten=BUEHNE.x+BUEHNE.w;
  o.push({typ:"piano",x:+(hinten-2.95).toFixed(2),y:+(BUEHNE.y+1.7).toFixed(2),rot:90,label:"Piano 1"});
  o.push({typ:"piano",x:+(hinten-1.35).toFixed(2),y:+(BUEHNE.y+1.7).toFixed(2),rot:90,label:"Piano 2"});
  o.push({typ:"schlagzeug",x:+(hinten-1.0).toFixed(2),y:mitte,rot:0,label:"Schlagzeug"});
  o.push({typ:"bass",x:+(hinten-1.1).toFixed(2),y:+(mitte+3.4).toFixed(2),rot:-30,label:"Bassgitarre"});
  // Gemeinschaftsraum: 4 × 4 Esstische, Buffet an der Küche
  [11.0,13.9,16.8,19.7].forEach(x=>[7.0,9.8,12.6,15.4].forEach(y=>o.push({typ:"esstisch",x,y,rot:0,label:"Esstisch"})));
  o.push({typ:"buffet",x:12.6,y:4.75,rot:0,label:"Buffet"});
  return o;
}
/* (alt) Bestuhlung als verschiebbare Reihen */
function bestuhlungVorschlag(){
  const reihen=[], abstand=0.95, mitte=(BUEHNE.y+BUEHNE.y+BUEHNE.h)/2;
  for(let x=BUEHNE.x-3.8; x>TECHNIK.x+TECHNIK.w+1.6; x-=abstand){
    reihen.push({typ:"stuhlreihe",x:+x.toFixed(2),y:+(mitte-0.75-2.5).toFixed(2),rot:90});
    reihen.push({typ:"stuhlreihe",x:+x.toFixed(2),y:+(mitte+0.75+2.5).toFixed(2),rot:90});
  }
  return reihen;
}

/* ---------- 3D (Three.js) ---------- */
function halle3d(container, objekte, opt={}){
  const THREE = window.THREE; if(!THREE){ container.innerHTML='<div class="leer">3D konnte nicht geladen werden.</div>'; return {stop(){}}; }
  const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  container.prepend(renderer.domElement);
  const szene=new THREE.Scene(); szene.background=new THREE.Color("#c9d6ea"); szene.fog=new THREE.Fog("#c9d6ea",60,140);
  const kam=new THREE.PerspectiveCamera(68,1,0.05,300);
  szene.add(new THREE.HemisphereLight("#ffffff","#8a8f99",0.85));
  const sonne=new THREE.DirectionalLight("#fff6e8",0.55); sonne.position.set(-20,40,-10); szene.add(sonne);
  [[12,10],[33,10],[44,10]].forEach(([x,z])=>{ const l=new THREE.PointLight("#fff3dd",0.35,30); l.position.set(x,3.4,z); szene.add(l); });
  const M=(farbe,extra={})=>new THREE.MeshLambertMaterial({color:farbe,...extra});
  const box=(w,h,d,mat,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); szene.add(m); return m; };
  // Boden + Außenflächen
  const boden=new THREE.Mesh(new THREE.PlaneGeometry(HALLE.L,HALLE.B),M("#b9b4aa")); boden.rotation.x=-Math.PI/2; boden.position.set(HALLE.L/2,0,HALLE.B/2); szene.add(boden);
  const aussen=new THREE.Mesh(new THREE.PlaneGeometry(140,100),M("#7b8f6a")); aussen.rotation.x=-Math.PI/2; aussen.position.set(HALLE.L/2,-0.02,HALLE.B/2); szene.add(aussen);
  // Bodenraster (1 m) für Maßgefühl
  { const pkt=[]; for(let x=1;x<HALLE.L;x++) pkt.push(x,0.006,0, x,0.006,HALLE.B); for(let z=1;z<HALLE.B;z++) pkt.push(0,0.006,z, HALLE.L,0.006,z);
    const gg=new THREE.BufferGeometry(); gg.setAttribute("position",new THREE.Float32BufferAttribute(pkt,3));
    szene.add(new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:"#a39e93"}))); }
  // Wandhöhe am Ort y (Satteldach über die Breite)
  const hoehe=y=>HALLE.traufe+(HALLE.first-HALLE.traufe)*(1-Math.abs(y-HALLE.B/2)/(HALLE.B/2));
  const wandMat=M("#ece8df"), neuMat=M("#f2c14e"), bestandMat=M("#d9d4ca");
  // Längswände
  const t=HALLE.wand;
  const laengs=(z)=>{ const mesh=box(HALLE.L+t*2,HALLE.traufe,t,wandMat,HALLE.L/2,HALLE.traufe/2,z); return mesh; };
  // Südwand mit Türöffnung Haupteingang
  { const oeff=TUEREN_AUSSEN.filter(o=>o.y>HALLE.B-0.01).sort((a,b)=>a.x1-b.x1); let von=-t;
    const glas=new THREE.MeshLambertMaterial({color:"#a9c8e6",transparent:true,opacity:.45});
    oeff.forEach(o=>{ if(o.x1>von) box(o.x1-von,HALLE.traufe,t,wandMat,(von+o.x1)/2,HALLE.traufe/2,HALLE.B+t/2);
      const w=o.x2-o.x1, mx=(o.x1+o.x2)/2; box(w,HALLE.traufe-2.5,t,wandMat,mx,2.5+(HALLE.traufe-2.5)/2,HALLE.B+t/2);
      box(w,2.5,0.05,glas,mx,1.25,HALLE.B+t/2); for(let x=o.x1+0.9;x<o.x2-0.3;x+=1.85) box(0.08,2.5,0.1,M("#3a4150"),x,1.25,HALLE.B+t/2); von=o.x2; });
    box(HALLE.L+t-von,HALLE.traufe,t,wandMat,(von+HALLE.L+t)/2,HALLE.traufe/2,HALLE.B+t/2); }
  laengs(-t/2);
  // Fensterband Nordwand
  for(let x=10.5;x<44;x+=2.3){ const f=box(1.6,1.5,0.06,new THREE.MeshLambertMaterial({color:"#9ec3e6",emissive:"#4a6d8f",emissiveIntensity:.35}),x,1.9,0.01); }
  // Giebelwände
  const giebel=(x)=>{ const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(HALLE.B,0); s.lineTo(HALLE.B,HALLE.traufe); s.lineTo(HALLE.B/2,HALLE.first); s.lineTo(0,HALLE.traufe); s.lineTo(0,0);
    const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false}); const m=new THREE.Mesh(g,wandMat); m.rotation.y=-Math.PI/2; m.position.set(x+t/2,0,0); szene.add(m); };
  giebel(-t/2); giebel(HALLE.L+t/2);
  // Dach (Unterseite sichtbar), halbtransparent für den Blick von oben
  const dachMat=new THREE.MeshLambertMaterial({color:"#8d97a8",side:THREE.DoubleSide,transparent:true,opacity:0.92});
  const dachBreite=Math.hypot(HALLE.B/2,HALLE.first-HALLE.traufe)+0.35;   // mit kleinem Überstand an der Traufe
  const neig=Math.atan2(HALLE.first-HALLE.traufe,HALLE.B/2);
  const dach=[];
  // Satteldach nach Schnitt A-A: Traufe 3,70 m an den Längsseiten, First 5,09 m in der Mitte (läuft in Längsrichtung)
  [[HALLE.B/4,-neig],[HALLE.B*3/4,neig]].forEach(([z,r])=>{ const d=new THREE.Mesh(new THREE.PlaneGeometry(HALLE.L+0.6,dachBreite),dachMat); d.rotation.x=-Math.PI/2+r; d.position.set(HALLE.L/2,(HALLE.traufe+HALLE.first)/2,z); szene.add(d); dach.push(d); });
  // Innenwände
  const neueWaende=[];
  WAENDE.forEach(([x1,y1,x2,y2,a])=>{ const len=Math.hypot(x2-x1,y2-y1); if(len<0.05) return;
    if(a==="abriss") return;   // wird entfernt – im Zielzustand nicht mehr da
    const mx=(x1+x2)/2, my=(y1+y2)/2; const h=istNeu(a)&&(x1===x2)&&len>15 ? Math.min(hoehe(my),HALLE.traufe+0.6) : 3.0;
    const mat=istNeu(a)?neuMat:bestandMat;
    const m=box(x1===x2?0.2:len, h, x1===x2?len:0.2, mat, mx, h/2, my); if(istNeu(a)) neueWaende.push(m);
    if(a==="neu-ra") box(0.24,0.25,len,M("#8a8f99"),mx,h-0.125,my); });
  const arch=istArch();
  // Bühne + LED-Wand
  box(BUEHNE.w,BUEHNE.hoehe,BUEHNE.h,M("#3b2f2a"),BUEHNE.x+BUEHNE.w/2,BUEHNE.hoehe/2,BUEHNE.y+BUEHNE.h/2);
  buehnenTreppen().forEach(tr=>{ for(let i=0;i<TREPPE_STUFEN;i++){ const hh=BUEHNE.hoehe*(i+1)/TREPPE_STUFEN;
    box(TREPPE_AUFTRITT,hh,tr.h,M(i%2?"#46382f":"#4d3e34"),tr.x+i*TREPPE_AUFTRITT+TREPPE_AUFTRITT/2,hh/2,tr.y+tr.h/2); } });
  const ledCanvas=document.createElement("canvas"); ledCanvas.width=1600; ledCanvas.height=480;
  const g=ledCanvas.getContext("2d"); const grad=g.createLinearGradient(0,0,1600,480); grad.addColorStop(0,"#0b1a45"); grad.addColorStop(.55,"#1d3f94"); grad.addColorStop(1,"#e2641a");
  g.fillStyle=grad; g.fillRect(0,0,1600,480);
  g.fillStyle="#ffffff"; g.textAlign="center"; g.font="600 96px Fraunces, Georgia, serif"; g.fillText("TABERNACLE CHURCH",860,262);
  g.globalAlpha=.85; g.font="500 34px Inter, Arial, sans-serif"; g.fillText("Konzstraße 9 · Mannheim",860,326); g.globalAlpha=1;
  const ledTex=new THREE.CanvasTexture(ledCanvas);
  if(opt.logo){ const li=new Image(); li.onload=()=>{ const h=320, w=li.width*h/li.height; g.drawImage(li,150,80,w,h); ledTex.needsUpdate=true; }; li.src=opt.logo; }
  const led=new THREE.Mesh(new THREE.PlaneGeometry(LED.y2-LED.y1,LED.oben-LED.unten),new THREE.MeshBasicMaterial({map:ledTex}));
  led.rotation.y=-Math.PI/2; led.position.set(LED.wand-0.12,(LED.unten+LED.oben)/2,(LED.y1+LED.y2)/2); szene.add(led);
  { box(0.06,LED.oben-LED.unten+0.12,LED.y2-LED.y1+0.12,M("#111"),LED.wand-0.07,(LED.unten+LED.oben)/2,(LED.y1+LED.y2)/2);
  // Technikbereich: Podest + Pult mit Blick zur Bühne
  box(TECHNIK.w,0.15,TECHNIK.h,M("#4b5568"),TECHNIK.x+TECHNIK.w/2,0.075,TECHNIK.y+TECHNIK.h/2);
  box(0.8,0.95,3.2,M("#1f2937"),TECHNIK.x+TECHNIK.w*0.62,0.15+0.475,TECHNIK.y+TECHNIK.h/2);
  box(0.05,0.35,0.6,new THREE.MeshBasicMaterial({color:"#3b82f6"}),TECHNIK.x+TECHNIK.w*0.62+0.1,1.3,TECHNIK.y+TECHNIK.h/2-0.7);
  box(0.05,0.35,0.6,new THREE.MeshBasicMaterial({color:"#3b82f6"}),TECHNIK.x+TECHNIK.w*0.62+0.1,1.3,TECHNIK.y+TECHNIK.h/2+0.7); }
  // Stuhlbezug: blauer Stoff mit gesticktem Logo (Foto vom Bezug)
  const stoffMat=M(STUHL.farbe);
  const logoTex=opt.stoff?new THREE.TextureLoader().load(opt.stoff):null;
  const logoMat=logoTex?new THREE.MeshLambertMaterial({map:logoTex}):stoffMat;
  // Bestuhlung (InstancedMesh, bis 500 Stühle) + rote Seitenplätze an der Bühne
  const rotMat=M(STUHL.rot), gestell=M("#2b2f36");
  const stuhlGruppe=new THREE.Group(); szene.add(stuhlGruppe);
  const seitenGruppe=new THREE.Group(); szene.add(seitenGruppe);
  function stuehleSetzen(gruppe,pos,stoff,logo){
    while(gruppe.children.length){ const c=gruppe.children[0]; gruppe.remove(c); c.geometry.dispose(); }
    if(!pos.length) return;
    const teile=[ // [Geometrie, Material, dx, y, dz, Logo] – Grundform blickt nach +x, Lehne hinten (−x), Logo vorne an der Lehne
      [new THREE.BoxGeometry(0.46,0.07,0.46),stoff,0.02,0.46,0],
      [new THREE.BoxGeometry(0.06,0.5,0.46),stoff,-0.2,0.74,0],
      [new THREE.BoxGeometry(0.42,0.42,0.025),gestell,0.02,0.21,-0.21],
      [new THREE.BoxGeometry(0.42,0.42,0.025),gestell,0.02,0.21,0.21]];
    if(logo) teile.push([new THREE.PlaneGeometry(0.44,0.37),logo,-0.168,0.77,0,true]);
    const dummy=new THREE.Object3D();
    teile.forEach(([geo,mat,dx,y,dz,istLogo])=>{
      const inst=new THREE.InstancedMesh(geo,mat,pos.length);
      pos.forEach((c,i)=>{ const th=c.theta||0, co=Math.cos(th), si=Math.sin(th);
        dummy.position.set(c.x+dx*co+dz*si,y,c.y-dx*si+dz*co); dummy.rotation.set(0,th+(istLogo?Math.PI/2:0),0); dummy.updateMatrix(); inst.setMatrixAt(i,dummy.matrix); });
      gruppe.add(inst); });
  }
  const bestuhlungZeichnen=n=>stuehleSetzen(stuhlGruppe,stuhlPositionen(n),stoffMat,logoMat);
  const seitenZeichnen=an=>stuehleSetzen(seitenGruppe,an?seitenPositionen():[],rotMat,null);
  seitenZeichnen(!!opt.seiten);
  bestuhlungZeichnen(opt.bestuhlung||0);
  // Planobjekte
  const objGruppe=new THREE.Group(); szene.add(objGruppe);
  function objekteZeichnen(liste){
    while(objGruppe.children.length) objGruppe.remove(objGruppe.children[0]);
    objekteFuerPlanung(liste).forEach(o=>{ const k=OBJEKTE[o.typ]; if(!k) return; const grp=new THREE.Group();
      const aufB=o.x>BUEHNE.x&&o.x<BUEHNE.x+BUEHNE.w&&o.y>BUEHNE.y&&o.y<BUEHNE.y+BUEHNE.h;
      grp.position.set(o.x,aufB?BUEHNE.hoehe:0,o.y); grp.rotation.y=-(o.rot||0)*Math.PI/180;
      const mat=(o.typ==="stuhl"||o.typ==="stuhlreihe")?stoffMat:M(k.farbe); const add=(geo,m,x,y,z,rx,ry,rz)=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); if(rx) me.rotation.x=rx; if(ry) me.rotation.y=ry; if(rz) me.rotation.z=rz; grp.add(me); return me; };
      if(o.typ==="stuhlreihe"||o.typ==="stuhl"){ const n=o.typ==="stuhl"?1:10;
        for(let i=0;i<n;i++){ const cx=-k.w/2+0.25+i*0.5; const sitz=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.06,0.44),mat); sitz.position.set(cx,0.45,0);
          const lehne=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.45,0.05),mat); lehne.position.set(cx,0.68,0.2); grp.add(sitz,lehne);
          const bein=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.45,0.04),M("#333")); bein.position.set(cx,0.22,0); grp.add(bein); } }
      else if(o.typ==="esstisch"){ add(new THREE.BoxGeometry(k.w,0.04,k.d),mat,0,0.74,0); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>add(new THREE.BoxGeometry(0.05,0.72,0.05),M("#333"),a*(k.w/2-0.08),0.36,b*(k.d/2-0.08)));
        [-0.5,0,0.5].forEach(dx=>[-1,1].forEach(sz=>{ add(new THREE.BoxGeometry(0.44,0.06,0.42),stoffMat,dx,0.45,sz*(k.d/2+0.3)); add(new THREE.BoxGeometry(0.44,0.42,0.05),stoffMat,dx,0.68,sz*(k.d/2+0.5)); })); }
      else if(o.typ==="schlagzeug"){ const kessel=M("#8f2d2d"), chrom=M("#c9ccd2"), fell=M("#efe9dc");
        add(new THREE.CylinderGeometry(0.28,0.28,0.4,24),kessel,0.15,0.3,0,0,0,Math.PI/2); add(new THREE.CylinderGeometry(0.27,0.27,0.02,24),fell,-0.06,0.3,0,0,0,Math.PI/2);
        [[-0.2,0.72,-0.25,0.12],[-0.2,0.72,0.25,0.12],[0.25,0.5,0.55,0.2],[-0.35,0.6,-0.6,0.18]].forEach(([x,y,z,rr])=>{ add(new THREE.CylinderGeometry(rr,rr,0.18,20),kessel,x,y,z); add(new THREE.CylinderGeometry(0.012,0.012,y,6),chrom,x,y/2,z); });
        [[-0.1,1.15,-0.75,0.22],[-0.05,1.25,0.7,0.25],[0.3,1.05,-0.45,0.18]].forEach(([x,y,z,rr])=>{ add(new THREE.CylinderGeometry(rr,rr,0.01,24),M("#c8a24a"),x,y,z); add(new THREE.CylinderGeometry(0.01,0.01,y,6),chrom,x,y/2,z); });
        add(new THREE.CylinderGeometry(0.17,0.17,0.06,16),M("#222"),0.65,0.5,0); }
      else if(o.typ==="piano"){ add(new THREE.BoxGeometry(0.34,0.08,1.4),mat,0,0.86,0); add(new THREE.BoxGeometry(0.16,0.012,1.3),M("#f4f4f2"),-0.08,0.905,0);
        add(new THREE.BoxGeometry(0.05,0.82,0.05),M("#444"),0,0.41,-0.55); add(new THREE.BoxGeometry(0.05,0.82,0.05),M("#444"),0,0.41,0.55); add(new THREE.BoxGeometry(0.3,0.5,0.35),M("#222"),-0.55,0.25,0); }
      else if(o.typ==="bass"){ add(new THREE.BoxGeometry(0.4,0.6,0.55),mat,0.12,0.3,0.15); add(new THREE.BoxGeometry(0.02,0.45,0.45),M("#555"),-0.09,0.3,0.15);
        add(new THREE.BoxGeometry(0.06,0.42,0.28),M("#6b2f1a"),-0.1,0.55,-0.3); add(new THREE.BoxGeometry(0.03,0.62,0.05),M("#3b2414"),-0.1,1.05,-0.3); }
      else if(k.rund){ const p=new THREE.Mesh(new THREE.CylinderGeometry(k.w/2,k.w/2,0.05,32),mat); p.position.y=k.h; const f=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,k.h,8),M("#333")); f.position.y=k.h/2; grp.add(p,f); }
      else { const m=new THREE.Mesh(new THREE.BoxGeometry(k.w,k.h,k.d),mat); m.position.y=k.h/2; grp.add(m); }
      objGruppe.add(grp); });
  }
  objekteZeichnen(objekte);
  // Steuerung (Ich-Perspektive)
  const blick=arch?{x:12,z:9.95,gier:-Math.PI/2,nick:-0.02,auge:1.65,oben:false}:{x:30,z:15.5,gier:-Math.PI*0.62,nick:-0.04,auge:1.65,oben:false};
  const ansichten={eingang:{x:36.3,z:18.6,gier:Math.PI*1.0,nick:-0.03},buehne:{x:44.2,z:12.2,gier:Math.PI/2-0.25,nick:-0.12,auge:2.25},vorn:{x:37.5,z:9.85,gier:-Math.PI/2,nick:0.02},
    raum:{x:26,z:9.85,gier:-Math.PI/2,nick:-0.02},gemein:{x:9.9,z:16.9,gier:-0.9,nick:-0.06},oben:{oben:true},aussen:{oben:true,aussen:true},
    a_eingang:{x:10.9,z:18.8,gier:-Math.PI*0.25,nick:-0.03},a_halle:{x:12,z:9.95,gier:-Math.PI/2,nick:-0.02},a_tor:{x:32.5,z:18.6,gier:Math.PI*0.1,nick:-0.02},a_vorn:{x:30.8,z:9.85,gier:-Math.PI/2,nick:0.02},a_buehne:{x:37.5,z:12.2,gier:Math.PI/2-0.25,nick:-0.12,auge:2.25},a_neben:{x:41.2,z:17.5,gier:-Math.PI*0.75,nick:-0.04}};
  function setze(n){ const a=ansichten[n]; if(!a) return; if(a.oben){ blick.oben=true; blick.aussen=!!a.aussen; } else { Object.assign(blick,{oben:false,aussen:false,auge:1.65},a); } }
  const taste={}; const ab=e=>{ if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return; taste[e.key.toLowerCase()]=e.type==="keydown"; if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase())&&e.type==="keydown"&&container.matches(":hover")) e.preventDefault(); };
  window.addEventListener("keydown",ab); window.addEventListener("keyup",ab);
  let zieh=null; const el=renderer.domElement;
  el.addEventListener("pointerdown",e=>{ zieh={x:e.clientX,y:e.clientY,id:e.pointerId}; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove",e=>{ if(!zieh||zieh.id!==e.pointerId) return; blick.gier-=(e.clientX-zieh.x)*0.005; blick.nick=Math.max(-1.2,Math.min(1.0,blick.nick-(e.clientY-zieh.y)*0.004)); zieh.x=e.clientX; zieh.y=e.clientY; });
  el.addEventListener("pointerup",()=>zieh=null); el.addEventListener("pointercancel",()=>zieh=null);
  el.addEventListener("wheel",e=>{ e.preventDefault(); if(blick.oben) return; const v=-Math.sign(e.deltaY)*0.8;
    const nx=blick.x-Math.sin(blick.gier)*v, nz=blick.z-Math.cos(blick.gier)*v; if(frei(nx,nz)){ blick.x=nx; blick.z=nz; } },{passive:false});
  // Joystick (Touch)
  const joy=container.querySelector(".joy"); let joyV={x:0,y:0};
  if(joy){ const knopf=joy.querySelector("i"); let jid=null;
    const bew=e=>{ const r=joy.getBoundingClientRect(); let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); const m=Math.hypot(dx,dy), max=r.width/2-12; if(m>max){dx*=max/m;dy*=max/m;}
      knopf.style.transform=`translate(${dx}px,${dy}px)`; joyV={x:dx/max,y:dy/max}; };
    joy.addEventListener("pointerdown",e=>{ jid=e.pointerId; joy.setPointerCapture(jid); bew(e); e.stopPropagation(); });
    joy.addEventListener("pointermove",e=>{ if(e.pointerId===jid) bew(e); });
    const los=()=>{ jid=null; joyV={x:0,y:0}; knopf.style.transform=""; }; joy.addEventListener("pointerup",los); joy.addEventListener("pointercancel",los); }
  // Kollision: Außenhülle + lange Wände
  function frei(x,z){ if(blick.oben) return true; if(x<0.3||x>HALLE.L-0.3||z<0.3||z>HALLE.B-0.3) return false;
    for(const [x1,y1,x2,y2,a] of WAENDE){ if(a==="abriss") continue; const r=0.28; const minx=Math.min(x1,x2)-r, maxx=Math.max(x1,x2)+r, miny=Math.min(y1,y2)-r, maxy=Math.max(y1,y2)+r;
      if(x>minx&&x<maxx&&z>miny&&z<maxy) return false; } return true; }
  let zuletzt=performance.now(), laeuft=true;
  function bild(jetzt){ if(!laeuft) return; const dt=Math.min(0.05,(jetzt-zuletzt)/1000); zuletzt=jetzt;
    const sch=(taste["shift"]?6:3.2)*dt; let vor=0, seit=0;
    if(taste["w"]||taste["arrowup"]) vor+=1; if(taste["s"]||taste["arrowdown"]) vor-=1; if(taste["a"]) seit-=1; if(taste["d"]) seit+=1;
    if(taste["arrowleft"]) blick.gier+=1.8*dt; if(taste["arrowright"]) blick.gier-=1.8*dt;
    vor+=-joyV.y; seit+=joyV.x;
    if(vor||seit){ const fx=-Math.sin(blick.gier), fz=-Math.cos(blick.gier), rx=Math.cos(blick.gier), rz=-Math.sin(blick.gier);
      const nx=blick.x+(fx*vor+rx*seit)*sch, nz=blick.z+(fz*vor+rz*seit)*sch;
      if(frei(nx,blick.z)) blick.x=nx; if(frei(blick.x,nz)) blick.z=nz; }
    // Auge auf Bühne höher
    const aufBuehne=blick.x>BUEHNE.x&&blick.x<BUEHNE.x+BUEHNE.w&&blick.z>BUEHNE.y&&blick.z<BUEHNE.y+BUEHNE.h;
    const auge=aufBuehne?BUEHNE.hoehe+1.65:1.65;
    if(blick.oben&&blick.aussen){ kam.position.set(-9,11,36); kam.lookAt(HALLE.L/2-6,2,HALLE.B/2); dach.forEach(d=>d.visible=true); }
    else if(blick.oben){ kam.position.set(HALLE.L/2,48,HALLE.B/2+18); kam.lookAt(HALLE.L/2,0,HALLE.B/2); dach.forEach(d=>d.visible=false); }
    else { dach.forEach(d=>d.visible=true); kam.position.set(blick.x,auge,blick.z); kam.rotation.order="YXZ"; kam.rotation.set(blick.nick,blick.gier,0); }
    renderer.render(szene,kam); requestAnimationFrame(bild); }
  function groesse(){ const w=container.clientWidth, h=container.clientHeight; renderer.setSize(w,h,false); kam.aspect=w/h; kam.updateProjectionMatrix(); }
  const ro=new ResizeObserver(groesse); ro.observe(container); groesse(); requestAnimationFrame(bild);
  return { stop(){ laeuft=false; ro.disconnect(); window.removeEventListener("keydown",ab); window.removeEventListener("keyup",ab); renderer.dispose(); },
    ansicht:setze, objekte:objekteZeichnen, bestuhlung:bestuhlungZeichnen, seiten:seitenZeichnen, neueHervorheben(an){ neueWaende.forEach(m=>m.material=an?neuMat:bestandMat); } };
}
