/* ===== Halle: Grundriss (Maße Architekt, Aufteilung „aktueller Plan") + Planen + 3D ===== */
/* Koordinaten in Metern, Innenmaß. x: von der Konzstraße (links) zur Industriestraße (rechts); y: vom Hof Kinder-Spiel (oben) zum Hof Eingang (unten). */
const HALLE = { L:47.40, B:19.90, traufe:3.70, first:5.09, wand:0.24 };

// Wände: [x1,y1,x2,y2, art]   art: bestand | neu (gelb im Plan) | rot (rot im Plan)
const WAENDE = [
  // linker Block (Bestand)
  [9.0,0,9.0,3.0,"bestand"],[9.0,4.0,9.0,7.0,"bestand"],[9.0,8.1,9.0,16.0,"bestand"],[9.0,17.0,9.0,19.9,"bestand"],
  [0,4.0,4.3,4.0,"bestand"],[4.3,0,4.3,3.0,"bestand"],[4.6,0,4.6,5.3,"bestand"],[4.6,5.3,7.7,5.3,"bestand"],[8.5,5.3,9.0,5.3,"bestand"],
  [0,9.8,4.4,9.8,"bestand"],[4.4,9.8,4.4,10.8,"bestand"],[4.4,11.7,4.4,14.5,"bestand"],[0,14.5,3.2,14.5,"bestand"],[4.0,14.5,4.4,14.5,"bestand"],
  [4.6,7.4,9.0,7.4,"bestand"],[4.6,7.4,4.6,16.1,"bestand"],[4.6,16.1,6.4,16.1,"bestand"],[7.3,16.1,9.0,16.1,"bestand"],
  [4.4,16.4,4.4,19.9,"bestand"],[0,12.2,2.4,12.2,"bestand"],
  // Küche + WC-Block (neu, gelb)
  [9.0,3.9,11.9,3.9,"neu"],[12.8,3.9,14.4,3.9,"neu"],[14.4,0,14.4,3.9,"neu"],
  [15.7,0,15.7,3.9,"neu"],[15.7,3.9,16.8,3.9,"neu"],[17.7,3.9,21.2,3.9,"neu"],
  // Lange Trennwand Gemeinschaftsraum | Gottesdienstraum (Ytong + Ringanker)
  [21.2,0,21.2,4.3,"neu"],[21.2,5.2,21.2,18.2,"neu"],[21.2,19.1,21.2,19.9,"neu"],
  // Wand unten im Gemeinschaftsraum (11 m)
  [10.4,17.7,21.2,17.7,"neu"],
  // Lange Wand hinter der Bühne (Ytong + Ringanker)
  [46.7,0,46.7,19.9,"neu"],
  // Bühnenseiten (rot im Plan)
  [40.5,0,40.5,4.2,"rot"],[40.5,15.3,46.7,15.3,"rot"],[40.5,15.3,40.5,19.9,"rot"]
];
const RAEUME = [
  {n:"Gottesdienstraum",x:21.2,y:0,w:25.5,h:19.9,m2:"528,97",haupt:true,ly:1.6},
  {n:"Gemeinschaftsraum",x:9.0,y:3.9,w:12.2,h:13.8,m2:"209,21",haupt:true},
  {n:"Küche",x:9.0,y:0,w:5.4,h:3.9,m2:"20,96"},{n:"WC-Block",x:15.7,y:0,w:5.5,h:3.9,m2:"20,96"},
  {n:"Bad / Waschraum",x:0,y:0,w:4.3,h:4.0},{n:"Stillraum",x:4.6,y:0,w:4.4,h:5.3},{n:"Kinderraum",x:0,y:4.0,w:4.4,h:5.8},
  {n:"WC · Pastor-Bad",x:0,y:9.8,w:4.4,h:4.7,klein:true},{n:"Jugendraum",x:4.6,y:7.4,w:4.4,h:8.7},
  {n:"Pastor-Büro",x:0,y:14.5,w:4.4,h:5.4},{n:"Warteraum",x:4.6,y:16.4,w:4.4,h:3.5},{n:"Flur & Eingang",x:9.0,y:17.7,w:12.2,h:2.2,klein:true}
];
const BUEHNE = {x:43.8,y:4.9,w:2.9,h:9.9,hoehe:0.6};
const LED = {y1:4.9,y2:14.8,unten:0.9,oben:3.9};     // 10 m × 3 m an der Wand hinter der Bühne
const GEPUNKTET = {x:22.2,y:6.6,w:2.3,h:6.1};          // im Plan gepunktete Fläche
const TUEREN_AUSSEN = [{x1:32.6,x2:40.0,y:19.9,n:"Haupteingang"},{x1:40.9,x2:41.9,y:0,n:"Notausgang"}];

const OBJEKTE = {
  stuhlreihe:{n:"Stuhlreihe (10)",w:5.0,d:0.55,h:0.9,farbe:"#2b4fa0",plaetze:10},
  stuhl:{n:"Stuhl",w:0.5,d:0.5,h:0.9,farbe:"#2b4fa0",plaetze:1},
  rundtisch:{n:"Rundtisch Ø 1,6",w:1.6,d:1.6,h:0.75,farbe:"#8a5a2b",rund:true,plaetze:8},
  tisch:{n:"Tisch 1,6 × 0,8",w:1.6,d:0.8,h:0.75,farbe:"#8a5a2b",plaetze:6},
  garnitur:{n:"Biertisch-Garnitur",w:2.2,d:1.7,h:0.75,farbe:"#9a6a35",plaetze:8},
  buffet:{n:"Buffet",w:3.0,d:0.8,h:0.9,farbe:"#be185d"},
  pult:{n:"Kanzel / Pult",w:0.7,d:0.55,h:1.15,farbe:"#14254f"},
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
  s+=`<rect x="${p(GEPUNKTET.x)}" y="${p(GEPUNKTET.y)}" width="${GEPUNKTET.w*S}" height="${GEPUNKTET.h*S}" fill="url(#gp)" stroke="var(--text3)" stroke-width="1"/>`;
  s+=`<rect x="${p(BUEHNE.x)}" y="${p(BUEHNE.y)}" width="${BUEHNE.w*S}" height="${BUEHNE.h*S}" fill="url(#sch)" stroke="var(--tinte)" stroke-width="1.5"/>`;
  s+=`<line x1="${p(46.7-0.08)}" y1="${p(LED.y1)}" x2="${p(46.7-0.08)}" y2="${p(LED.y2)}" stroke="var(--flamme)" stroke-width="6" stroke-linecap="round"/>`;
  // Außenwand
  s+=`<rect x="${R-HALLE.wand*S/2}" y="${R-HALLE.wand*S/2}" width="${HALLE.L*S+HALLE.wand*S}" height="${HALLE.B*S+HALLE.wand*S}" fill="none" stroke="var(--tinte)" stroke-width="${HALLE.wand*S}"/>`;
  TUEREN_AUSSEN.forEach(t=>{ s+=`<line x1="${p(t.x1)}" y1="${p(t.y)}" x2="${p(t.x2)}" y2="${p(t.y)}" stroke="var(--flaeche)" stroke-width="${HALLE.wand*S+2}"/>`; });
  WAENDE.forEach(([x1,y1,x2,y2,a])=>{ const c=a==="neu"?"var(--gold)":a==="rot"?"var(--glut)":"var(--text2)";
    s+=`<line x1="${p(x1)}" y1="${p(y1)}" x2="${p(x2)}" y2="${p(y2)}" stroke="${c}" stroke-width="${a==="neu"?6:4.5}" stroke-linecap="square"/>`; });
  // Beschriftung
  RAEUME.forEach(r=>{ const cx=p(r.x+r.w/2), cy=p(r.ly!=null?r.y+r.ly:r.y+r.h/2); const fs=r.haupt?15:r.klein?8.5:10;
    s+=`<text x="${cx}" y="${cy}" text-anchor="middle" font-family="var(--f-titel)" font-weight="600" font-size="${fs}" fill="var(--tinte)">${r.n}</text>`;
    if(r.m2) s+=`<text x="${cx}" y="${(+cy+fs+2).toFixed(1)}" text-anchor="middle" font-family="var(--f-mass)" font-size="9.5" fill="var(--text2)">NGF ${r.m2} m²</text>`; });
  s+=`<text x="${p(BUEHNE.x+BUEHNE.w/2)}" y="${p(BUEHNE.y+BUEHNE.h/2)}" text-anchor="middle" font-family="var(--f-titel)" font-weight="700" font-size="13" fill="var(--tinte)" transform="rotate(-90 ${p(BUEHNE.x+BUEHNE.w/2)} ${p(BUEHNE.y+BUEHNE.h/2)})">BÜHNE · LED-Wand 10 × 3 m</text>`;
  // Umgebung
  const ue=(x,y,t,rot)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--f-text)" font-weight="600" font-size="11" letter-spacing="1.2" fill="var(--text3)" ${rot?`transform="rotate(${rot} ${x} ${y})"`:''}>${t}</text>`;
  s+=ue(W/2,R-16,"HOF KINDER-SPIEL")+ue(W/2,H-12,"HOF EINGANG · PFLASTER")+ue(16,H/2,"KONZSTRASSE · PARKPLÄTZE",-90)+ue(W-14,H/2,"INDUSTRIESTRASSE",90);
  s+=`<text x="${p((TUEREN_AUSSEN[0].x1+TUEREN_AUSSEN[0].x2)/2)}" y="${p(HALLE.B)+18}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--flamme)">▲ Haupteingang</text>`;
  // Maßkette
  s+=`<g font-family="var(--f-mass)" font-size="10" fill="var(--text2)"><text x="${R+6}" y="${R-4}">0</text><text x="${p(HALLE.L)-30}" y="${R-4}">47,40 m</text></g>`;
  // Planobjekte
  (objekte||[]).forEach(o=>{ const k=OBJEKTE[o.typ]; if(!k) return; const cx=p(o.x), cy=p(o.y), w=k.w*S, d=k.d*S;
    const aktiv = sel===o.id;
    s+=`<g data-obj="${o.id}" transform="translate(${cx} ${cy}) rotate(${o.rot||0})" style="cursor:${opt.bearbeiten?'grab':'default'}">`;
    if(k.rund) s+=`<circle r="${w/2}" fill="${k.farbe}" fill-opacity=".85" stroke="${aktiv?'var(--flamme)':'#fff'}" stroke-width="${aktiv?3:1}"/>`;
    else if(o.typ==="stuhlreihe"){ s+=`<rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" fill="transparent" stroke="${aktiv?'var(--flamme)':'none'}" stroke-width="2.5"/>`;
      for(let i=0;i<10;i++) s+=`<rect x="${-w/2+i*0.5*S+1}" y="${-d/2+1}" width="${0.5*S-2}" height="${d-2}" rx="2" fill="${k.farbe}"/>`; }
    else s+=`<rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" rx="2" fill="${k.farbe}" fill-opacity=".85" stroke="${aktiv?'var(--flamme)':'#fff'}" stroke-width="${aktiv?3:1}"/>`;
    s+=`</g>`; });
  s+=`</svg>`;
  return s;
}

/* Bestuhlung Gottesdienstraum automatisch: zwei Blöcke à 10 Stühle mit Mittelgang, Blick zur Bühne */
function bestuhlungVorschlag(){
  const reihen=[], abstand=0.95, mitte=(BUEHNE.y+BUEHNE.y+BUEHNE.h)/2;
  for(let x=BUEHNE.x-3.8; x>GEPUNKTET.x+GEPUNKTET.w+1.6; x-=abstand){
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
  const wandMat=M("#ece8df"), neuMat=M("#f2c14e"), rotMat=M("#a8432c"), bestandMat=M("#d9d4ca");
  // Längswände
  const t=HALLE.wand;
  const laengs=(z)=>{ const mesh=box(HALLE.L+t*2,HALLE.traufe,t,wandMat,HALLE.L/2,HALLE.traufe/2,z); return mesh; };
  // Südwand mit Türöffnung Haupteingang
  [[-t,32.6],[40.0,HALLE.L+t]].forEach(([a,b])=>box(b-a,HALLE.traufe,t,wandMat,(a+b)/2,HALLE.traufe/2,HALLE.B+t/2));
  box(40.0-32.6,HALLE.traufe-2.5,t,wandMat,36.3,2.5+(HALLE.traufe-2.5)/2,HALLE.B+t/2);
  box(40.0-32.6,2.5,0.05,new THREE.MeshLambertMaterial({color:"#a9c8e6",transparent:true,opacity:.45}),36.3,1.25,HALLE.B+t/2);
  [33.5,35.35,37.2,39.05].forEach(x=>box(0.08,2.5,0.1,M("#3a4150"),x,1.25,HALLE.B+t/2));
  laengs(-t/2);
  // Fensterband Nordwand
  for(let x=10.5;x<44;x+=2.3){ const f=box(1.6,1.5,0.06,new THREE.MeshLambertMaterial({color:"#9ec3e6",emissive:"#4a6d8f",emissiveIntensity:.35}),x,1.9,0.01); }
  // Giebelwände
  const giebel=(x)=>{ const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(HALLE.B,0); s.lineTo(HALLE.B,HALLE.traufe); s.lineTo(HALLE.B/2,HALLE.first); s.lineTo(0,HALLE.traufe); s.lineTo(0,0);
    const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false}); const m=new THREE.Mesh(g,wandMat); m.rotation.y=-Math.PI/2; m.position.set(x+t/2,0,0); szene.add(m); };
  giebel(-t/2); giebel(HALLE.L+t/2);
  // Dach (Unterseite sichtbar), halbtransparent für den Blick von oben
  const dachMat=new THREE.MeshLambertMaterial({color:"#8d97a8",side:THREE.DoubleSide,transparent:true,opacity:0.92});
  const dachBreite=Math.hypot(HALLE.B/2,HALLE.first-HALLE.traufe);
  const neig=Math.atan2(HALLE.first-HALLE.traufe,HALLE.B/2);
  const dach=[];
  [[HALLE.B/4,neig],[HALLE.B*3/4,-neig]].forEach(([z,r])=>{ const d=new THREE.Mesh(new THREE.PlaneGeometry(HALLE.L+0.6,dachBreite),dachMat); d.rotation.x=-Math.PI/2+r; d.position.set(HALLE.L/2,(HALLE.traufe+HALLE.first)/2,z); szene.add(d); dach.push(d); });
  // Innenwände
  const neueWaende=[];
  WAENDE.forEach(([x1,y1,x2,y2,a])=>{ const len=Math.hypot(x2-x1,y2-y1); if(len<0.05) return;
    const mx=(x1+x2)/2, my=(y1+y2)/2; const h=a==="neu"&&(x1===x2)&&len>15 ? Math.min(hoehe(my),HALLE.traufe+0.6) : 3.0;
    const mat=a==="neu"?neuMat:a==="rot"?rotMat:bestandMat;
    const m=box(x1===x2?0.2:len, h, x1===x2?len:0.2, mat, mx, h/2, my); if(a==="neu") neueWaende.push(m); });
  // Bühne + LED-Wand
  box(BUEHNE.w,BUEHNE.hoehe,BUEHNE.h,M("#3b2f2a"),BUEHNE.x+BUEHNE.w/2,BUEHNE.hoehe/2,BUEHNE.y+BUEHNE.h/2);
  const ledCanvas=document.createElement("canvas"); ledCanvas.width=1600; ledCanvas.height=480;
  const g=ledCanvas.getContext("2d"); const grad=g.createLinearGradient(0,0,1600,480); grad.addColorStop(0,"#0b1a45"); grad.addColorStop(.55,"#1d3f94"); grad.addColorStop(1,"#e2641a");
  g.fillStyle=grad; g.fillRect(0,0,1600,480);
  g.fillStyle="#ffffff"; g.textAlign="center"; g.font="700 104px 'Barlow Condensed', 'Arial Narrow', sans-serif"; g.fillText("TABERNACLE CHURCH",860,262);
  g.globalAlpha=.85; g.font="500 36px Barlow, Arial, sans-serif"; g.fillText("Konzstraße 9 · Mannheim",860,326); g.globalAlpha=1;
  const ledTex=new THREE.CanvasTexture(ledCanvas);
  if(opt.logo){ const li=new Image(); li.onload=()=>{ const h=320, w=li.width*h/li.height; g.drawImage(li,150,80,w,h); ledTex.needsUpdate=true; }; li.src=opt.logo; }
  const led=new THREE.Mesh(new THREE.PlaneGeometry(LED.y2-LED.y1,LED.oben-LED.unten),new THREE.MeshBasicMaterial({map:ledTex}));
  led.rotation.y=-Math.PI/2; led.position.set(46.7-0.12,(LED.unten+LED.oben)/2,(LED.y1+LED.y2)/2); szene.add(led);
  box(0.06,LED.oben-LED.unten+0.12,LED.y2-LED.y1+0.12,M("#111"),46.7-0.07,(LED.unten+LED.oben)/2,(LED.y1+LED.y2)/2);
  // gepunktete Fläche als Bodenmarkierung
  const gp=new THREE.Mesh(new THREE.PlaneGeometry(GEPUNKTET.w,GEPUNKTET.h),M("#9aa3b5")); gp.rotation.x=-Math.PI/2; gp.position.set(GEPUNKTET.x+GEPUNKTET.w/2,0.01,GEPUNKTET.y+GEPUNKTET.h/2); szene.add(gp);
  // Planobjekte
  const objGruppe=new THREE.Group(); szene.add(objGruppe);
  function objekteZeichnen(liste){
    while(objGruppe.children.length) objGruppe.remove(objGruppe.children[0]);
    (liste||[]).forEach(o=>{ const k=OBJEKTE[o.typ]; if(!k) return; const grp=new THREE.Group(); grp.position.set(o.x,0,o.y); grp.rotation.y=-(o.rot||0)*Math.PI/180;
      const mat=M(k.farbe);
      if(o.typ==="stuhlreihe"||o.typ==="stuhl"){ const n=o.typ==="stuhl"?1:10;
        for(let i=0;i<n;i++){ const cx=-k.w/2+0.25+i*0.5; const sitz=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.06,0.44),mat); sitz.position.set(cx,0.45,0);
          const lehne=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.45,0.05),mat); lehne.position.set(cx,0.68,0.2); grp.add(sitz,lehne);
          const bein=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.45,0.04),M("#333")); bein.position.set(cx,0.22,0); grp.add(bein); } }
      else if(k.rund){ const p=new THREE.Mesh(new THREE.CylinderGeometry(k.w/2,k.w/2,0.05,32),mat); p.position.y=k.h; const f=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,k.h,8),M("#333")); f.position.y=k.h/2; grp.add(p,f); }
      else { const m=new THREE.Mesh(new THREE.BoxGeometry(k.w,k.h,k.d),mat); m.position.y=k.h/2; grp.add(m); }
      objGruppe.add(grp); });
  }
  objekteZeichnen(objekte);
  // Steuerung (Ich-Perspektive)
  const blick={x:30,z:15.5,gier:-Math.PI*0.62,nick:-0.04,auge:1.65,oben:false};
  const ansichten={eingang:{x:36.3,z:18.6,gier:Math.PI*1.0,nick:-0.03},buehne:{x:45.2,z:9.85,gier:Math.PI/2,nick:-0.08,auge:2.25},
    raum:{x:26,z:9.85,gier:-Math.PI/2,nick:-0.02},gemein:{x:15,z:15,gier:-Math.PI*0.75,nick:-0.04},oben:{oben:true}};
  function setze(n){ const a=ansichten[n]; if(!a) return; if(a.oben){ blick.oben=true; } else { Object.assign(blick,{oben:false,auge:1.65},a); } }
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
    for(const [x1,y1,x2,y2] of WAENDE){ const r=0.28; const minx=Math.min(x1,x2)-r, maxx=Math.max(x1,x2)+r, miny=Math.min(y1,y2)-r, maxy=Math.max(y1,y2)+r;
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
    if(blick.oben){ kam.position.set(HALLE.L/2,48,HALLE.B/2+18); kam.lookAt(HALLE.L/2,0,HALLE.B/2); dach.forEach(d=>d.visible=false); }
    else { dach.forEach(d=>d.visible=true); kam.position.set(blick.x,auge,blick.z); kam.rotation.order="YXZ"; kam.rotation.set(blick.nick,blick.gier,0); }
    renderer.render(szene,kam); requestAnimationFrame(bild); }
  function groesse(){ const w=container.clientWidth, h=container.clientHeight; renderer.setSize(w,h,false); kam.aspect=w/h; kam.updateProjectionMatrix(); }
  const ro=new ResizeObserver(groesse); ro.observe(container); groesse(); requestAnimationFrame(bild);
  return { stop(){ laeuft=false; ro.disconnect(); window.removeEventListener("keydown",ab); window.removeEventListener("keyup",ab); renderer.dispose(); },
    ansicht:setze, objekte:objekteZeichnen, neueHervorheben(an){ neueWaende.forEach(m=>m.material=an?neuMat:bestandMat); } };
}
