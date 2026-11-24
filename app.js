
(function(){
"use strict";

/* ============================================================
   DATA
   ============================================================ */
var KEY = "schoolGames.v1";

function sampleData(){
  return {
    settings:{ school:"Westview High School", edition:74, districts:6 },
    tributes:[
      {id:"t1", name:"Avery Vale",    district:"D1", emoji:"🏹", points:1240, wins:5, kos:4, status:"active", bio:"Quiet, precise, and never misses a target.", stats:{speed:7,strategy:9,strength:6}},
      {id:"t2", name:"Jonas Reed",    district:"D1", emoji:"🛡️", points:980,  wins:3, kos:5, status:"active", bio:"The wall nobody can get past.", stats:{speed:5,strategy:7,strength:10}},
      {id:"t3", name:"Mira Solis",    district:"D2", emoji:"💨", points:1110, wins:4, kos:3, status:"active", bio:"Fastest legs in the corridor.", stats:{speed:10,strategy:6,strength:5}},
      {id:"t4", name:"Caleb Voss",    district:"D2", emoji:"🧠", points:870,  wins:3, kos:2, status:"active", bio:"Plans three moves ahead of everyone else.", stats:{speed:6,strategy:10,strength:5}},
      {id:"t5", name:"Nia Brooks",    district:"D3", emoji:"🥊", points:1050, wins:4, kos:6, status:"active", bio:"Fearless in every close-quarters challenge.", stats:{speed:7,strategy:6,strength:9}},
      {id:"t6", name:"Theo Marsh",    district:"D3", emoji:"🎯", points:760,  wins:2, kos:3, status:"active", bio:"Lucky shot, unlucky opponent.", stats:{speed:6,strategy:8,strength:6}},
      {id:"t7", name:"Sana Iqbal",    district:"D4", emoji:"🌪️", points:990,  wins:4, kos:4, status:"active", bio:"Chaos in human form. Loves the relay.", stats:{speed:9,strategy:7,strength:6}},
      {id:"t8", name:"Liam Foster",   district:"D4", emoji:"🦅", points:690,  wins:2, kos:2, status:"active", bio:"Watches everything from above.", stats:{speed:7,strategy:8,strength:5}},
      {id:"t9", name:"Zara Quinn",    district:"D5", emoji:"⚡", points:840,  wins:3, kos:5, status:"active", bio:"Fast starts, faster finishes.", stats:{speed:9,strategy:5,strength:7}},
      {id:"t10",name:"Owen Blaze",    district:"D5", emoji:"🔥", points:620,  wins:2, kos:1, status:"active", bio:"All heart, all hustle.", stats:{speed:6,strategy:5,strength:9}},
      {id:"t11",name:"Elena Cruz",    district:"D6", emoji:"🦊", points:910,  wins:3, kos:3, status:"active", bio:"Cunning, charming, and very hard to catch.", stats:{speed:8,strategy:9,strength:4}},
      {id:"t12",name:"Ravi Patel",    district:"D6", emoji:"🐺", points:540,  wins:1, kos:2, status:"out",    bio:"Fought hard until the final round.", stats:{speed:7,strategy:6,strength:7}}
    ],
    events:[
      {id:"e1",name:"The Reaping Ceremony", date:"2026-11-20", loc:"Main Hall",     points:0,   status:"complete"},
      {id:"e2",name:"Track & Field Trials",  date:"2026-11-21", loc:"Sports Field",  points:150, status:"complete"},
      {id:"e3",name:"Cornucopia Dash",       date:"2026-11-24", loc:"The Quad",      points:250, status:"live"},
      {id:"e4",name:"Archery Accuracy Round",date:"2026-11-27", loc:"Gymnasium",     points:200, status:"upcoming"},
      {id:"e5",name:"The Great Bake-Off",    date:"2026-12-01", loc:"Cafeteria",     points:120, status:"upcoming"},
      {id:"e6",name:"Final Gauntlet",        date:"2026-12-05", loc:"The Arena",     points:500, status:"upcoming"}
    ],
    announcements:[
      {id:"a1",text:"The Cornucopia Dash is LIVE. All tributes report to the Quad.", time:"Today · 08:00", author:"Head Gamemaker"},
      {id:"a2",text:"Congratulations to D1 Avery Vale for taking the Track & Field crown.", time:"Nov 21 · 16:20", author:"Capitol News"},
      {id:"a3",text:"Reminder: no real weapons, no running in the halls, and kindness is mandatory.", time:"Nov 20 · 09:00", author:"Game Control"},
      {id:"a4",text:"The reaping has begun. Let the games begin!", time:"Nov 20 · 08:00", author:"Head Gamemaker"}
    ],
    bracket:{ seeds:["t1","t3","t5","t7","t2","t4","t9","t11"], winners:{} }
  };
}

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(parsed && parsed.tributes && parsed.events && parsed.settings) return parsed;
    }
  }catch(e){}
  return sampleData();
}
var state = load();
var ui = { tab:"overview", admin:false, filter:"all", search:"", sort:"points", zone:"gym", zoom:1 };

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }
  catch(e){ toast("Could not save locally"); }
}

/* ============================================================
   UTILITIES
   ============================================================ */
function $(id){ return document.getElementById(id); }
function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function uid(p){ return (p||"x") + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function byId(id){ return state.tributes.filter(function(t){return t.id===id;})[0]; }
function sortedTributes(){
  var list = state.tributes.slice();
  var key = ui.sort;
  list.sort(function(a,b){
    if(key==="name") return a.name.localeCompare(b.name);
    if(key==="district") return a.district.localeCompare(b.district) || b.points-a.points;
    if(key==="wins") return b.wins-a.wins || b.points-a.points;
    if(key==="kos") return b.kos-a.kos || b.points-a.points;
    return b.points-a.points;
  });
  return list;
}
function activeTributes(){ return state.tributes.filter(function(t){return t.status!=="out";}); }
function toast(msg){
  var d=document.createElement("div"); d.className="toast"; d.textContent=msg;
  $("toastRoot").appendChild(d);
  setTimeout(function(){ d.style.opacity="0"; d.style.transition="opacity .3s"; setTimeout(function(){d.remove();},320); },2400);
}
function announce(text,author){
  state.announcements.unshift({id:uid("a"),text:text,time:"Just now",author:author||"Game Control"});
  state.announcements=state.announcements.slice(0,25);
  save();
}
function fmtDate(dateStr){
  var parts=String(dateStr||"").split("-");
  if(parts.length!==3) return {d:"--",m:"???"};
  var months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return {d:parts[2],m:months[parseInt(parts[1],10)-1]||"???"};
}
function ordinal(n){ var s=["th","st","nd","rd"],v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }

var COPY = {
  capitol:{
    brand:"The School Games",
    tagline:"MAY THE ODDS BE EVER IN YOUR FAVOR",
    heroTop:"THE 74TH ANNUAL",
    heroMain:"SCHOOL GAMES",
    heroSub:"HUNGER GAMES EDITION",
    btnA:"ENTER THE ARENA",
    btnB:"THE REAPING",
    kickerOverview:"Capitol Command Center",
    overviewDesc:"Live standings, tournament status, and the latest bulletins from the arena.",
    modeLabel:"Capitol Mode",
    ritual:"THE REAPING",
    reapingKicker:"THE REAPING HAS CHOSEN"
  },
  district:{
    brand:"The School Games",
    tagline:"SPIRIT · STRATEGY · SCHOOL PRIDE",
    heroTop:"WELCOME TO THE",
    heroMain:"SCHOOL GAMES",
    heroSub:"FRIENDLY COMPETITION EDITION",
    btnA:"EXPLORE THE ARENA",
    btnB:"RANDOM TRIBUTE",
    kickerOverview:"Tournament Hub",
    overviewDesc:"Follow the standings, cheer on your district, and see what's happening next.",
    modeLabel:"District Mode",
    ritual:"RANDOM TRIBUTE",
    reapingKicker:"THE LUCKY TRIBUTE IS"
  }
};
function c(key){ return (COPY[document.body.dataset.mode]||COPY.capitol)[key]; }

/* ============================================================
   RENDER: HEADER + OVERVIEW
   ============================================================ */
function renderHeader(){
  $("brandTitle").textContent = c("brand");
  $("brandSub").textContent = state.settings.school + " · " + ordinal(state.settings.edition) + " Edition";
  $("modeLabel").textContent = c("modeLabel");
  document.body.classList.toggle("admin", ui.admin);
  var btn = document.querySelector('[data-action="toggle-admin"]');
  btn.setAttribute("aria-pressed", ui.admin ? "true" : "false");
  btn.textContent = ui.admin ? "✓ Game Control ON" : "⚙ Game Control";
}

function nextEvent(){
  var now = new Date(); now.setHours(0,0,0,0);
  var list = state.events.filter(function(e){ return e.status!=="complete" && new Date(e.date+"T00:00:00")>=now; });
  list.sort(function(a,b){ return a.date.localeCompare(b.date); });
  return list[0]||null;
}
function countdownMarkup(){
  var ev = nextEvent();
  var html = '<div class="panel countdown"><label>'+(ev?esc(ev.name):"No upcoming events")+'</label><div class="clock">';
  if(ev){
    var diff = new Date(ev.date+"T09:00:00").getTime()-Date.now();
    if(diff<0) diff=0;
    var days=Math.floor(diff/86400000), hrs=Math.floor(diff/3600000)%24, mins=Math.floor(diff/60000)%60;
    html += '<div><b id="cdD">'+String(days).padStart(2,"0")+'</b><span>Days</span></div><i>:</i>';
    html += '<div><b id="cdH">'+String(hrs).padStart(2,"0")+'</b><span>Hrs</span></div><i>:</i>';
    html += '<div><b id="cdM">'+String(mins).padStart(2,"0")+'</b><span>Min</span></div>';
  } else {
    html += '<div><b>—</b><span>Season complete</span></div>';
  }
  return html+'</div></div>';
}
function tickCountdown(){
  var ev=nextEvent(); if(!ev) return;
  var diff=new Date(ev.date+"T09:00:00").getTime()-Date.now(); if(diff<0) diff=0;
  var d=Math.floor(diff/86400000), h=Math.floor(diff/3600000)%24, m=Math.floor(diff/60000)%60;
  var a=$("cdD"),b=$("cdH"),cc=$("cdM");
  if(a) a.textContent=String(d).padStart(2,"0");
  if(b) b.textContent=String(h).padStart(2,"0");
  if(cc) cc.textContent=String(m).padStart(2,"0");
}

function renderOverview(){
  var top=sortedTributes().filter(function(t){return t.status!=="out";}).slice(0,3);
  var totalPts=state.tributes.reduce(function(s,t){return s+(+t.points||0);},0);
  var done=state.events.filter(function(e){return e.status==="complete";}).length;
  var out=state.tributes.filter(function(t){return t.status==="out";}).length;
  var active=activeTributes().length;
  var podium=["second","first","third"];
  var order=[top[1],top[0],top[2]];

  var html =
  '<div class="hero">'+
    '<div class="hero-inner">'+
      '<p class="eyebrow">'+esc(c("heroTop"))+' · '+esc(state.settings.school)+'</p>'+
      '<h2>'+esc(c("heroMain"))+'<em>'+esc(c("heroSub"))+'</em></h2>'+
      '<p class="tagline">'+esc(c("tagline"))+'</p>'+
      '<div class="hero-actions">'+
        '<button class="btn primary" data-tab-go="map">'+esc(c("btnA"))+'</button>'+
        '<button class="btn" data-action="reaping">✦ '+esc(c("btnB"))+'</button>'+
      '</div>'+
    '</div>'+ countdownMarkup() +
  '</div>'+

  '<div class="stat-grid">'+
    statCard("Tributes Remaining",active,out+" eliminated",active?Math.round(active/state.tributes.length*100):0)+
    statCard("Total Points",totalPts.toLocaleString(),"Across all districts",Math.min(100,totalPts/100))+
    statCard("Challenges Held",done,"of "+state.events.length+" scheduled",state.events.length?Math.round(done/state.events.length*100):0)+
    statCard("Districts Competing",state.settings.districts,"In this tournament",100)+
  '</div>'+

  '<div class="two-col">'+
    '<div class="panel"><h3 class="panel-title">'+esc(c("kickerOverview"))+' <span class="hint">Live</span></h3>'+
      '<div class="podium">'+ order.map(function(t,i){
        if(!t) return '<div class="podium-slot"><div class="block">'+(i+1)+'</div></div>';
        return '<div class="podium-slot '+podium[i]+'">'+
          '<div class="avatar">'+esc(t.emoji||"✦")+'</div>'+
          '<div class="p-name">'+esc(t.name)+'</div>'+
          '<div class="p-pts">'+(+t.points).toLocaleString()+' pts</div>'+
          '<div class="block">'+(i===1?"♛":i===0?"Ⅱ":"Ⅲ")+'</div></div>';
      }).join("") +'</div>'+
      '<div style="padding:0 20px 18px;text-align:center"><button class="btn ghost small" data-tab-go="scoreboard">VIEW FULL SCOREBOARD →</button></div>'+
    '</div>'+
    '<div class="panel"><h3 class="panel-title">Capitol Bulletins <span class="hint">Latest '+Math.min(4,state.announcements.length)+'</span></h3>'+
      '<ul class="feed">'+ state.announcements.slice(0,4).map(function(a){
        return '<li><span class="feed-icon">✦</span><div><div class="feed-text">'+esc(a.text)+'</div><div class="feed-time">'+esc(a.time)+' · '+esc(a.author)+'</div></div></li>';
      }).join("") +'</ul>'+
    '</div>'+
  '</div>';
  $("view-overview").innerHTML=html;
}
function statCard(label,value,sub,pct){
  return '<div class="panel stat-card"><div class="label">'+esc(label)+'</div><div class="value">'+esc(value)+'</div><div class="sub">'+esc(sub)+'</div><div class="bar"><i style="width:'+Math.max(4,Math.min(100,pct||0))+'%"></i></div></div>';
}

/* ============================================================
   RENDER: TRIBUTES
   ============================================================ */
function renderTributes(){
  var q=ui.search.trim().toLowerCase();
  var list=sortedTributes().filter(function(t){
    if(ui.filter==="active" && t.status==="out") return false;
    if(ui.filter==="out" && t.status!=="out") return false;
    if(q && (t.name+" "+t.district+" "+(t.bio||"")).toLowerCase().indexOf(q)<0) return false;
    return true;
  });
  var html='<div class="section-head"><div><p class="kicker">District Rosters</p><h2>The Tributes</h2>'+
    '<p>Meet the competitors representing every district. Click a card for the full profile.</p></div>'+
    (ui.admin?'<button class="btn primary small" data-action="open-drawer">+ Add Tribute</button>':'')+'</div>'+

    '<div class="toolbar">'+
      '<input class="search" id="tributeSearch" placeholder="Search by name, district, or bio..." value="'+esc(ui.search)+'" />'+
      '<div class="filter-group">'+
        ['all','active','out'].map(function(f){
          return '<button class="filter-btn '+(ui.filter===f?'active':'')+'" data-action="filter" data-value="'+f+'">'+
            (f==="all"?"All":f==="active"?"Active":"Fallen")+'</button>';
        }).join("")+
      '</div>'+
      '<select class="select" id="sortSelect"><option value="points">Sort: Points</option><option value="wins">Sort: Wins</option><option value="kos">Sort: Eliminations</option><option value="name">Sort: Name</option><option value="district">Sort: District</option></select>'+
    '</div>';

  if(!list.length){
    html+='<div class="panel panel-body" style="text-align:center;color:var(--muted)">No tributes match those filters.</div>';
  }else{
    html+='<div class="tribute-grid">'+list.map(function(t){
      var out=t.status==="out";
      return '<article class="panel tribute-card '+(out?'is-out':'')+'">'+
        (out?'<div class="ribbon">Fallen</div>':'')+
        '<div class="tribute-top">'+
          '<div class="avatar">'+esc(t.emoji||"✦")+'</div>'+
          '<div><h3 class="tribute-name">'+esc(t.name)+'</h3><div class="tribute-meta">'+esc(t.district)+' · '+(out?'Fallen':'Active')+'</div></div>'+
          '<div class="tribute-score"><b>'+(+t.points).toLocaleString()+'</b><span>Points</span></div>'+
        '</div>'+
        statBar("Speed",t.stats.speed)+statBar("Strategy",t.stats.strategy)+statBar("Strength",t.stats.strength)+
        '<div class="card-stats"><div><b>'+t.wins+'</b><span>Wins</span></div><div><b>'+t.kos+'</b><span>Elims</span></div><div><b>'+esc(t.district)+'</b><span>District</span></div></div>'+
        '<div class="card-actions">'+
          '<button class="btn small" data-action="profile" data-id="'+t.id+'">Profile</button>'+
          (ui.admin?
            '<button class="btn small ghost" data-action="toggle-out" data-id="'+t.id+'">'+(out?'Restore':'Eliminate')+'</button>'+
            '<button class="btn small ghost" data-action="edit-tribute" data-id="'+t.id+'">Edit</button>'+
            '<button class="btn small danger" data-action="delete-tribute" data-id="'+t.id+'">✕</button>':'')+
        '</div>'+
      '</article>';
    }).join("")+'</div>';
  }
  $("view-tributes").innerHTML=html;
  $("sortSelect").value=ui.sort;
  var s=$("tributeSearch");
  s.addEventListener("input",function(){ui.search=this.value;var pos=this.selectionStart;renderTributes();var n=$("tributeSearch");n.focus();n.setSelectionRange(pos,pos);});
  $("sortSelect").addEventListener("change",function(){ui.sort=this.value;renderTributes();});
}
function statBar(label,val){
  return '<div class="stat-row"><span style="width:62px">'+label+'</span><span class="track"><i style="width:'+Math.min(100,(+val||0)*10)+'%"></i></span><span>'+esc(val)+'</span></div>';
}

/* ============================================================
   RENDER: SCOREBOARD
   ============================================================ */
function renderScoreboard(){
  var list=sortedTributes();
  var h='<div class="section-head"><div><p class="kicker">Rankings</p><h2>The Scoreboard</h2><p>Points are awarded at every challenge. '+(ui.admin?'Use the + / − buttons to adjust scores live.':'Turn on Game Control to adjust scores.')+'</p></div></div>'+
  '<div class="panel"><h3 class="panel-title">Overall Standings <span class="hint">'+list.length+' tributes · click headers to sort</span></h3><div class="table-wrap"><table><thead><tr>'+
    '<th data-action="sort" data-value="points">#</th><th data-action="sort" data-value="name">Tribute</th><th data-action="sort" data-value="district">District</th><th data-action="sort" data-value="points">Points</th><th data-action="sort" data-value="wins">Wins</th><th data-action="sort" data-value="kos">Elims</th><th>Status</th></tr></thead><tbody>';
  list.forEach(function(t,i){
    h+='<tr class="'+(i<3?'top'+(i+1):'')+'">'+
      '<td class="rank">'+ordinal(i+1)+'</td>'+
      '<td><div class="name-cell"><span class="avatar">'+esc(t.emoji||"✦")+'</span><b>'+esc(t.name)+'</b></div></td>'+
      '<td><span class="chip">'+esc(t.district)+'</span></td>'+
      '<td><div class="points-cell">'+(ui.admin?'<span class="stepper"><button data-action="adjust" data-id="'+t.id+'" data-delta="-10">−</button><button data-action="adjust" data-id="'+t.id+'" data-delta="10">+</button></span>':'')+'<b>'+(+t.points).toLocaleString()+'</b></div></td>'+
      '<td>'+t.wins+'</td><td>'+t.kos+'</td>'+
      '<td><span class="chip '+(t.status==="out"?'out':'active')+'">'+(t.status==="out"?"Fallen":"Active")+'</span></td></tr>';
  });
  h+='</tbody></table></div></div>';
  $("view-scoreboard").innerHTML=h;
}

/* ============================================================
   RENDER: EVENTS + BRACKET
   ============================================================ */
function renderEvents(){
  var evs=state.events.slice().sort(function(a,b){return a.date.localeCompare(b.date);});
  var h='<div class="section-head"><div><p class="kicker">The Schedule</p><h2>Events &amp; Bracket</h2><p>Every challenge, its point value, and the road to the crown.</p></div>'+
    (ui.admin?'<button class="btn primary small" data-action="open-drawer">+ Add Event</button>':'')+'</div>'+
    '<div class="panel"><h3 class="panel-title">Challenge Schedule <span class="hint">'+(ui.admin?'Click a status to advance it':'Click a completed event for details')+'</span></h3><ul class="event-list">';
  evs.forEach(function(e){
    var d=fmtDate(e.date);
    h+='<li class="event-item"><div class="event-date"><b>'+d.d+'</b><span>'+d.m+'</span></div>'+
      '<div class="event-info"><h4>'+esc(e.name)+'</h4><p>📍 '+esc(e.loc||"TBA")+(e.points?' · '+e.points+' points':'')+'</p></div>'+
      '<div class="event-right">'+
        '<span class="chip '+e.status+'">'+(e.status==="live"?"● LIVE":e.status==="complete"?"Complete":e.status==="upcoming"?"Upcoming":e.status)+'</span>'+
        '<button class="btn small ghost" data-action="event-info" data-id="'+e.id+'">Details</button>'+
      '</div></li>';
  });
  h+='</ul></div>';
  h+= bracketMarkup();
  $("view-events").innerHTML=h;
}

function bracketMarkup(){
  var b=state.bracket;
  if(!b || !b.seeds || b.seeds.length<8){
    return '<div class="panel panel-body" style="margin-top:20px;text-align:center;color:var(--muted)">Bracket needs 8 seeded tributes. Turn on Game Control to reseed.</div>';
  }
  function slotText(id,fallback){
    var t=byId(id);
    return t? esc(t.emoji||"✦")+' '+esc(t.name) : fallback;
  }
  function matchHtml(mid,a,bb){
    var w=b.winners[mid];
    function s(id,seed,fallback){
      var selected = w===id && !!id;
      return '<button class="slot '+(selected?'winner':'')+' '+(!id?'tbd':'')+'" data-action="pick-winner" data-match="'+mid+'" data-id="'+(id||"")+'" '+(ui.admin?'':'disabled')+'>'+
        '<span class="seed">'+seed+'</span><span class="emoji">'+(id?(byId(id)?esc(byId(id).emoji||"✦"):"✦"):"·")+'</span>'+
        '<span>'+slotText(id,fallback)+'</span>'+(selected?'<span style="margin-left:auto;color:var(--accent)">✓</span>':'')+'</button>';
    }
    return '<div class="match">'+s(a,"1","TBD")+s(bb,"2","TBD")+'</div>';
  }
  function participants(mid,src1,src2){
    var a=b.winners[src1]||b.seeds[0], bb=b.winners[src2]||b.seeds[1];
    return {a:a,b:bb};
  }
  var q=[["q1",0,1],["q2",2,3],["q3",4,5],["q4",6,7]];
  var s1=participants("s1","q1","q2"), s2=participants("s2","q3","q4");
  var f1=participants("f","s1","s2");
  var champ=byId(b.winners.f);
  function round(label,matches){
    return '<div class="bracket-round"><div class="round-label">'+label+'</div>'+matches.join("")+'</div>';
  }
  return '<div class="panel" style="margin-top:20px"><h3 class="panel-title">The Bracket <span class="hint">'+(ui.admin?'Click a tribute to pick the winner':'Champion is crowned through the rounds')+'</span></h3>'+
    '<div class="bracket-scroll"><div class="bracket">'+
      round("Quarterfinals",q.map(function(m){return matchHtml(m[0],b.seeds[m[1]],b.seeds[m[2]]);}))+
      round("Semifinals",[matchHtml("s1",s1.a,s1.b),matchHtml("s2",s2.a,s2.b)])+
      round("Final",[matchHtml("f",f1.a,f1.b)])+
      '<div class="champion-box"><div class="crown">♛</div><div style="font-family:var(--font-cond);font-size:10px;letter-spacing:.24em;color:var(--muted)">CHAMPION</div>'+
      '<div class="who">'+(champ?esc(champ.emoji||"✦")+"<br>"+esc(champ.name):"Awaiting the final")+'</div></div>'+
    '</div></div>'+
    (ui.admin?'<div style="padding:0 18px 18px"><button class="btn small ghost" data-action="reseed">↻ Reseed from leaderboard</button></div>':'')+
  '</div>';
}

/* ============================================================
   RENDER: MAP + RULES
   ============================================================ */
var MAP_IMG="assets/tlc-map.webp";
var ZONES={
  gym:{name:"Gymnasium",danger:"HIGH",desc:"The main arena for the archery rounds and the final gauntlet. Echoing cheers can rattle even the steadiest hand.",event:"Archery Accuracy Round",note:"Bring your focus — aim for the bullseye.",pin:[69,64]},
  library:{name:"Library",danger:"LOW",desc:"Quiet halls, tall shelves, and perfect hiding spots. Strategy lives between these stacks.",event:"Strategy Round",note:"A good plan is sharper than any blade.",pin:[63,20]},
  technology:{name:"Technology",danger:"MEDIUM",desc:"Workshops, computing suites and construction tech. Puzzles and build challenges happen here.",event:"Puzzle Chamber",note:"Think before you touch.",pin:[52,17]},
  science:{name:"Science",danger:"MEDIUM",desc:"Biology, chemistry and physics labs. Only the cleverest tribute leaves this wing with points.",event:"Science Challenge",note:"Measure twice, win once.",pin:[20,55]},
  performing:{name:"Performing Arts",danger:"MEDIUM",desc:"Drama studio, music rooms and the stage. Perform under pressure and win over the crowd.",event:"Showstopper Challenge",note:"The crowd is your judge.",pin:[57,56]},
  admin:{name:"Administration & Reception",danger:"LOW",desc:"Capitol headquarters: student services, senior help desk and the reaping announcement stage.",event:"The Reaping Ceremony",note:"May the odds be ever in your favor.",pin:[45,60]},
  food:{name:"Food Technology",danger:"LOW",desc:"The kitchens where the safest zone in the arena turns seriously competitive.",event:"The Great Bake-Off",note:"Bring your best recipe.",pin:[34,70]},
  activity:{name:"Activity Centre",danger:"MEDIUM",desc:"Years 7–8 hub and multipurpose spaces. Fast, loud and perfect for team challenges.",event:"Track & Field Trials",note:"The fastest tribute sets the pace.",pin:[81,25]},
  outdoors:{name:"Carpark & Outdoors",danger:"HIGH",desc:"Open ground and golden supply drops. Everyone arrives at once — grab what you need and move.",event:"Cornucopia Dash",note:"Speed beats hesitation.",pin:[89,33]},
  workshop:{name:"Property Services",danger:"MEDIUM",desc:"Workshop, uniform shop and recycling station. Build, repair and navigate your way to points.",event:"Build Challenge",note:"Use what you find.",pin:[5,14]}
};
function setZoom(v){
  ui.zoom=Math.max(1,Math.min(3,Math.round(v*4)/4));
  var stage=$("mapStage"); if(stage) stage.style.width=(ui.zoom*100)+"%";
  var lab=$("zoomLabel"); if(lab) lab.textContent=Math.round(ui.zoom*100)+"%";
}
function renderMap(){
  var z=ZONES[ui.zone]||ZONES.gym;
  var pins=Object.keys(ZONES).map(function(k){
    var q=ZONES[k],sel=(ui.zone===k);
    return '<button class="map-pin '+(sel?'selected':'')+'" style="left:'+q.pin[0]+'%;top:'+q.pin[1]+'%" data-zone="'+k+'" title="'+esc(q.name)+'" aria-label="'+esc(q.name)+'">✦</button>'+
      (sel?'<span class="map-pin-label" style="left:'+q.pin[0]+'%;top:'+q.pin[1]+'%">'+esc(q.name)+'</span>':'');
  }).join("");
  var h='<div class="section-head"><div><p class="kicker">Arena Overview</p><h2>The Arena</h2><p>Your real school map, turned into the game board. Pick a zone for its challenge intel.</p></div></div>'+
  '<div class="map-layout"><div class="panel map-canvas">'+
    '<div class="map-toolbar">'+
      '<span class="chip gold">TLC Buildings Map</span>'+
      '<button class="btn small ghost" data-action="zoom-out" aria-label="Zoom out">−</button>'+
      '<span class="chip" id="zoomLabel">'+Math.round(ui.zoom*100)+'%</span>'+
      '<button class="btn small ghost" data-action="zoom-in" aria-label="Zoom in">+</button>'+
      '<button class="btn small ghost" data-action="zoom-reset">Reset</button>'+
      '<button class="btn small" data-action="expand-map">⤢ Full View</button>'+
    '</div>'+
    '<div class="map-viewport" id="mapViewport"><div class="map-stage" id="mapStage" style="width:'+(ui.zoom*100)+'%">'+
      '<img src="'+MAP_IMG+'" alt="TLC school buildings map" draggable="false" />'+pins+
    '</div></div>'+
    '<div class="map-caption">Tap a ✦ locator to inspect a zone · zoom and scroll to explore · locator pins are approximate</div>'+
  '</div>'+
  '<div><div class="panel"><h3 class="panel-title">Zone Intel</h3><div class="zone-detail">'+
    '<h3>'+esc(z.name)+'</h3><span class="chip '+('HIGH'===z.danger?'out':'')+'">Threat: '+esc(z.danger)+'</span>'+
    '<p class="desc">'+esc(z.desc)+'</p>'+
    '<div class="detail-row"><span>Hosted challenge</span><b>'+esc(z.event)+'</b></div>'+
    '<div class="detail-row"><span>Gamemaker note</span><b style="max-width:60%;text-align:right">'+esc(z.note)+'</b></div>'+
  '</div></div>'+
  '<div class="panel" style="margin-top:16px"><h3 class="panel-title">All Zones</h3><ul class="zone-list">'+
    Object.keys(ZONES).map(function(k){return '<li><button class="'+(ui.zone===k?'selected':'')+'" data-zone="'+k+'"><span>'+esc(ZONES[k].name)+'</span><span class="danger">'+esc(ZONES[k].danger)+'</span></button></li>';}).join("")+
  '</ul></div></div></div>';
  $("view-map").innerHTML=h;
}

var RULES=[
  {t:"School First",d:"This is a fictional game. All challenges must be school-approved, supervised, and safe. No real weapons, ever."},
  {t:"Earn Your Points",d:"Points come from challenges, wins, and good sportsmanship. Game Control records every result."},
  {t:"Respect the Fallen",d:"When a tribute is eliminated, they become a spectator and a legend. No taunting, just cheers."},
  {t:"District Loyalty",d:"Represent your district with pride. Help your teammates, even when you're competing against them."},
  {t:"The Arena Is Shared",d:"Treat every zone, prop, and piece of equipment with care. You break it, your district fixes it."},
  {t:"May the Odds Be Fair",d:"Judges' decisions are final, but appeals can be made to Game Control with a smile and a good argument."}
];
function renderRules(){
  var lore=document.body.dataset.mode==="capitol"
    ? "In a year of ordinary hallways and ordinary Tuesdays, the Capitol decided that school spirit needed a little more spectacle. Twelve tributes were chosen. Six districts stood ready. One golden crown waited at the end of the final gauntlet. The announcements crackled over the loudspeaker, the doors swung open, and the games began.<br><br>They say the arena is only as fierce as the cheering crowd. So bring your loudest voice, your sharpest mind, and your best sportsmanship. The whole school is watching."
    : "Every year, our school turns its hallways into a playground of friendly competition. Twelve tributes. Six districts. A season of challenges built on teamwork, courage, and a whole lot of school pride.<br><br>There are no real battles here — just games, puzzles, races, and cheering crowds. Everyone who takes part is a winner, and the crown goes to the tribute who plays hardest and lifts others up along the way. Let's make this the best season yet!";
  var h='<div class="section-head"><div><p class="kicker">The Rulebook</p><h2>Rules &amp; Lore</h2><p>How the games work, and the story behind them.</p></div></div>'+
  '<div class="rule-grid">'+RULES.map(function(r,i){return '<div class="panel rule"><div class="num">'+String(i+1).padStart(2,"0")+'</div><h4>'+esc(r.t)+'</h4><p>'+esc(r.d)+'</p></div>';}).join("")+'</div>'+
  '<div class="panel" style="margin-top:20px"><h3 class="panel-title">The Story</h3><div class="lore"><span class="drop">I</span><p>'+lore+'</p></div></div>'+

  '<div class="panel" style="margin-top:20px"><h3 class="panel-title">All Bulletins <span class="hint">'+state.announcements.length+' posts</span></h3><ul class="feed">'+
    state.announcements.map(function(a){return '<li><span class="feed-icon">✦</span><div><div class="feed-text">'+esc(a.text)+'</div><div class="feed-time">'+esc(a.time)+' · '+esc(a.author)+'</div></div></li>';}).join("")+
  '</ul></div>';
  $("view-rules").innerHTML=h;
}

/* ============================================================
   RENDER DISPATCH
   ============================================================ */
function render(){
  renderHeader();
  renderOverview();
  renderTributes();
  renderScoreboard();
  renderEvents();
  renderMap();
  renderRules();
  tickCountdown();
}
function go(tab){
  ui.tab=tab;
  var tabs=document.querySelectorAll(".tab");
  for(var i=0;i<tabs.length;i++) tabs[i].classList.toggle("active",tabs[i].dataset.tab===tab);
  var views=document.querySelectorAll(".view");
  for(var j=0;j<views.length;j++) views[j].classList.toggle("active",views[j].id==="view-"+tab);
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ============================================================
   MODALS
   ============================================================ */
function openModal(title,html,wide){
  $("modalTitle").textContent=title;
  $("modalBody").innerHTML=html;
  $("modalWrap").querySelector(".modal").classList.toggle("wide",!!wide);
  $("modalWrap").classList.add("show");
  $("backdrop").classList.add("show");
}
function closeModal(){
  $("modalWrap").classList.remove("show");
  $("modalWrap").querySelector(".modal").classList.remove("wide");
  if(!$("drawer").classList.contains("open")) $("backdrop").classList.remove("show");
}
function profileModal(id){
  var t=byId(id); if(!t) return;
  var h='<div class="profile-hero"><div class="avatar">'+esc(t.emoji||"✦")+'</div><div><h4>'+esc(t.name)+'</h4><div class="tribute-meta">'+esc(t.district)+' · '+(t.status==="out"?"Fallen":"Active Tribute")+'</div></div>'+
    (ui.admin?'<div style="margin-left:auto"><button class="btn small ghost" data-action="edit-tribute" data-id="'+t.id+'">Edit</button></div>':'')+'</div>'+
    '<div class="profile-grid"><div><b>'+(+t.points).toLocaleString()+'</b><span>Points</span></div><div><b>'+t.wins+'</b><span>Challenge Wins</span></div><div><b>'+t.kos+'</b><span>Eliminations</span></div></div>'+
    statBar("Speed",t.stats.speed)+statBar("Strategy",t.stats.strategy)+statBar("Strength",t.stats.strength)+
    '<p class="bio">"'+esc(t.bio||"No words recorded.")+'"</p>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<button class="btn small ghost" data-action="close-modal">Close</button>'+
      (ui.admin?'<button class="btn small danger" data-action="toggle-out" data-id="'+t.id+'">'+(t.status==="out"?"Restore tribute":"Mark as fallen")+'</button>':'')+
    '</div>';
  openModal("Tribute Profile",h);
}
function editTributeModal(id){
  var t=byId(id); if(!t) return;
  var h='<form id="editTribForm">'+
    '<div class="form-grid"><div class="form-row"><label>Name</label><input name="name" value="'+esc(t.name)+'" required></div><div class="form-row"><label>District</label><input name="district" value="'+esc(t.district)+'" required></div></div>'+
    '<div class="form-grid"><div class="form-row"><label>Emoji</label><input name="emoji" value="'+esc(t.emoji||"")+'" maxlength="4"></div><div class="form-row"><label>Points</label><input name="points" type="number" value="'+t.points+'"></div></div>'+
    '<div class="form-grid"><div class="form-row"><label>Wins</label><input name="wins" type="number" min="0" value="'+t.wins+'"></div><div class="form-row"><label>Eliminations</label><input name="kos" type="number" min="0" value="'+t.kos+'"></div></div>'+
    '<div class="form-row"><label>Bio</label><input name="bio" value="'+esc(t.bio||"")+'"></div>'+
    '<div class="form-grid"><div class="form-row"><label>Speed (1–10)</label><input name="speed" type="number" min="1" max="10" value="'+t.stats.speed+'"></div><div class="form-row"><label>Strategy (1–10)</label><input name="strategy" type="number" min="1" max="10" value="'+t.stats.strategy+'"></div><div class="form-row"><label>Strength (1–10)</label><input name="strength" type="number" min="1" max="10" value="'+t.stats.strength+'"></div></div>'+
    '<div style="display:flex;gap:8px;margin-top:8px"><button class="btn primary small" type="submit">Save Tribute</button><button class="btn ghost small" type="button" data-action="close-modal">Cancel</button></div>'+
  '</form>';
  openModal("Edit Tribute",h);
  $("editTribForm").addEventListener("submit",function(e){
    e.preventDefault();
    var f=new FormData(e.target);
    t.name=f.get("name").trim()||t.name;
    t.district=f.get("district").trim()||t.district;
    t.emoji=f.get("emoji").trim()||"✦";
    t.points=+f.get("points")||0; t.wins=+f.get("wins")||0; t.kos=+f.get("kos")||0;
    t.bio=f.get("bio").trim();
    t.stats={speed:clampStat(f.get("speed")),strategy:clampStat(f.get("strategy")),strength:clampStat(f.get("strength"))};
    save(); render(); closeModal(); toast("Tribute updated");
  });
}
function clampStat(v){ return Math.max(1,Math.min(10,+v||5)); }

/* ============================================================
   ACTIONS
   ============================================================ */
function toggleMode(){
  document.body.dataset.mode = document.body.dataset.mode==="capitol"?"district":"capitol";
  saveMode(); render();
}
function saveMode(){
  try{
    var s=load();
    s.uiMode=document.body.dataset.mode;
    localStorage.setItem(KEY,JSON.stringify(s));
  }catch(e){}
}
function toggleAdmin(){
  ui.admin=!ui.admin;
  renderHeader(); renderTributes(); renderScoreboard(); renderEvents(); renderMap();
  toast(ui.admin?"Game Control enabled":"Game Control disabled");
}
function openDrawer(){
  $("setSchool").value=state.settings.school;
  $("setEdition").value=state.settings.edition;
  $("setDistricts").value=state.settings.districts;
  if(!$("newEventDate").value) $("newEventDate").value=new Date().toISOString().slice(0,10);
  $("drawer").classList.add("open");
  $("backdrop").classList.add("show");
}
function closeAll(){
  $("drawer").classList.remove("open");
  closeModal();
  $("reaping").classList.remove("show","spin");
  $("backdrop").classList.remove("show");
}
function pickWinner(match,id){
  if(!ui.admin) return;
  if(!id){ toast("Choose a tribute first"); return; }
  state.bracket.winners[match]=state.bracket.winners[match]===id?null:id;
  save(); renderEvents();
}
function reseed(){
  var seeds=sortedTributes().filter(function(t){return t.status!=="out";}).slice(0,8).map(function(t){return t.id;});
  while(seeds.length<8) seeds.push(null);
  state.bracket={seeds:seeds,winners:{}};
  save(); renderEvents(); toast("Bracket reseeded from leaderboard");
}
function doReaping(){
  var pool=activeTributes(); if(!pool.length){toast("No active tributes left");return;}
  var chosen=pool[Math.floor(Math.random()*pool.length)];
  var r=$("reaping");
  r.classList.add("show","spin");
  $("reapDistrict").textContent="";
  var start=Date.now();
  var timer=setInterval(function(){
    var t=pool[Math.floor(Math.random()*pool.length)];
    $("reapName").textContent=t.name;
    $("reapDistrict").textContent=t.district+" · "+t.points+" points";
    if(Date.now()-start>1700){
      clearInterval(timer);
      r.classList.remove("spin");
      $("reapKicker").textContent=c("reapingKicker");
      $("reapName").textContent=chosen.name;
      $("reapDistrict").textContent=chosen.district+" · "+chosen.points+" points";
      announce(chosen.name+" has been selected by "+(document.body.dataset.mode==="capitol"?"the reaping":"the random draw")+".", "Game Control");
      renderOverview(); renderRules();
    }
  },90);
}
function exportData(){
  var blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=state.settings.school.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-games.json";
  a.click();URL.revokeObjectURL(a.href);toast("Export downloaded");
}
function importData(file){
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var data=JSON.parse(reader.result);
      if(!data.tributes||!data.events||!data.settings) throw new Error("bad");
      state=data; save(); render(); closeAll(); toast("Tournament imported");
    }catch(e){ toast("Invalid tournament file"); }
  };
  reader.readAsText(file);
}

/* ============================================================
   EVENT DELEGATION
   ============================================================ */
document.addEventListener("click",function(e){
  var zoneTarget=e.target.closest("[data-zone]");
  if(zoneTarget){ ui.zone=zoneTarget.dataset.zone; renderMap(); return; }

  var tabGo=e.target.closest("[data-tab-go]");
  if(tabGo){ go(tabGo.dataset.tabGo); return; }

  var tab=e.target.closest(".tab");
  if(tab){ go(tab.dataset.tab); return; }

  var el=e.target.closest("[data-action]");
  if(!el) return;
  var a=el.dataset.action, id=el.dataset.id;

  switch(a){
    case "toggle-mode": toggleMode(); break;
    case "toggle-admin": toggleAdmin(); break;
    case "open-drawer": openDrawer(); break;
    case "close-all": closeAll(); break;
    case "close-modal": closeModal(); break;
    case "close-reaping": $("reaping").classList.remove("show","spin"); break;
    case "reaping": doReaping(); break;
    case "filter": ui.filter=el.dataset.value; renderTributes(); break;
    case "sort": ui.sort=el.dataset.value; renderScoreboard(); break;
    case "profile": profileModal(id); break;
    case "edit-tribute": editTributeModal(id); break;
    case "toggle-out":{
      var t=byId(id); if(!t) break;
      t.status=t.status==="out"?"active":"out";
      save(); render(); closeModal();
      toast(t.name+(t.status==="out"?" has fallen":" has returned"));
      break;
    }
    case "delete-tribute":{
      var t2=byId(id); if(!t2) break;
      if(!confirm("Remove "+t2.name+" from the tournament?")) break;
      state.tributes=state.tributes.filter(function(x){return x.id!==id;});
      save(); render(); toast("Tribute removed");
      break;
    }
    case "adjust":{
      var t3=byId(id); if(!t3) break;
      t3.points=Math.max(0,(+t3.points||0)+ +el.dataset.delta);
      save(); renderScoreboard(); renderTributes(); renderOverview();
      break;
    }
    case "event-info":{
      var ev=state.events.filter(function(x){return x.id===id;})[0]; if(!ev) break;
      openModal("Challenge Details",
        '<h3 style="font-family:var(--font-display);color:var(--accent-2);margin:0 0 6px">'+esc(ev.name)+'</h3>'+
        '<p style="color:var(--muted);margin:0 0 18px">'+esc(ev.loc||"Location TBA")+' · '+fmtDate(ev.date).m+' '+fmtDate(ev.date).d+'</p>'+
        '<div class="profile-grid"><div><b>'+(ev.points||0)+'</b><span>Points</span></div><div><b>'+esc(ev.status).toUpperCase()+'</b><span>Status</span></div><div><b>'+esc(ev.date)+'</b><span>Date</span></div></div>'+
        (ui.admin?'<button class="btn small primary" data-action="cycle-event" data-id="'+id+'">Advance Status →</button>':'')+
        '<button class="btn small ghost" data-action="close-modal">Close</button>');
      break;
    }
    case "cycle-event":{
      var ev2=state.events.filter(function(x){return x.id===id;})[0]; if(!ev2) break;
      var order=["upcoming","live","complete"];
      ev2.status=order[(order.indexOf(ev2.status)+1)%order.length];
      save(); renderEvents(); renderOverview(); closeModal();
      toast(ev2.name+" → "+ev2.status);
      break;
    }
    case "pick-winner": pickWinner(el.dataset.match,id); break;
    case "reseed": reseed(); break;
    case "zoom-in": setZoom(ui.zoom+0.25); break;
    case "zoom-out": setZoom(ui.zoom-0.25); break;
    case "zoom-reset": setZoom(1); break;
    case "expand-map": openModal("TLC Buildings Map",'<img src="'+MAP_IMG+'" alt="TLC school buildings map, full view" />',true); break;
    case "save-settings":{
      state.settings.school=$("setSchool").value.trim()||state.settings.school;
      state.settings.edition=Math.max(1,+$("setEdition").value||74);
      state.settings.districts=Math.max(1,+$("setDistricts").value||6);
      save(); render(); toast("Settings saved");
      break;
    }
    case "add-tribute":{
      var name=$("newTribName").value.trim();
      if(!name){toast("Enter a tribute name");$("newTribName").focus();break;}
      state.tributes.push({
        id:uid("t"),name:name,district:$("newTribDistrict").value.trim()||"D1",
        emoji:$("newTribEmoji").value.trim()||"✦",points:0,wins:0,kos:0,status:"active",
        bio:$("newTribBio").value.trim()||"A new tribute enters the arena.",
        stats:{speed:5,strategy:5,strength:5}
      });
      ["newTribName","newTribDistrict","newTribEmoji","newTribBio"].forEach(function(x){$(x).value="";});
      save(); render(); toast(name+" has entered the games");
      break;
    }
    case "add-event":{
      var en=$("newEventName").value.trim();
      if(!en){toast("Enter an event name");$("newEventName").focus();break;}
      state.events.push({id:uid("e"),name:en,date:$("newEventDate").value||new Date().toISOString().slice(0,10),
        loc:$("newEventLoc").value.trim()||"TBA",points:+$("newEventPts").value||0,status:$("newEventStatus").value});
      ["newEventName","newEventLoc"].forEach(function(x){$(x).value="";});
      save(); render(); toast("Event added");
      break;
    }
    case "add-announcement":{
      var txt=$("newAnnText").value.trim();
      if(!txt){toast("Write a bulletin first");$("newAnnText").focus();break;}
      announce(txt,"Game Control"); $("newAnnText").value=""; render(); toast("Bulletin posted");
      break;
    }
    case "export": exportData(); break;
    case "import": $("importFile").click(); break;
    case "reset":{
      if(!confirm("Reset everything to the sample tournament? This cannot be undone.")) break;
      state=sampleData(); save(); render(); closeAll(); toast("Sample tournament restored");
      break;
    }
  }
});

$("importFile").addEventListener("change",function(){ if(this.files[0]) importData(this.files[0]); });
document.addEventListener("keydown",function(e){
  if(e.key==="Escape") closeAll();
});
document.addEventListener("input",function(e){
  if(e.target && e.target.id==="tributeSearch"){ /* handled locally in renderTributes */ }
});

/* ============================================================
   INIT
   ============================================================ */
try{
  var saved=JSON.parse(localStorage.getItem(KEY)||"{}");
  if(saved.uiMode==="district") document.body.dataset.mode="district";
}catch(e){}
render();
setInterval(tickCountdown,30000);
})();
