let PROJECTS=[];
try{PROJECTS=await(await fetch("/api/projects")).json()}catch(e){console.error("Could not load projects",e)}
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tags=["All",...new Set(PROJECTS.map(p=>p.tag))];
const fEl=document.getElementById("filters"),pEl=document.getElementById("proj");
pEl.innerHTML=PROJECTS.map(p=>`<article class="card" data-tag="${esc(p.tag)}"><div class="thumb" style="--c1:${p.c1};--c2:${p.c2}">${esc(p.tag)}</div><div class="in"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><div class="chips">${p.stack.map(s=>`<span>${esc(s)}</span>`).join("")}</div><div class="links">${p.demo?`<a class="lnk" href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo</a>`:""}${p.link?`<a class="lnk" href="${esc(p.link)}" target="_blank" rel="noopener">${p.demo?"Code":"View on GitHub"}</a>`:""}</div></div></article>`).join("");
fEl.innerHTML=tags.map((t,i)=>`<button type="button" aria-pressed="${i==0}" data-t="${esc(t)}">${esc(t)}</button>`).join("");
fEl.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 fEl.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));
 pEl.querySelectorAll(".card").forEach(c=>c.hidden=!(b.dataset.t==="All"||c.dataset.tag===b.dataset.t));});

// theme toggle (storage is optional)
const root=document.documentElement;
try{const t=localStorage.getItem("theme");if(t)root.dataset.theme=t}catch(e){}
document.getElementById("theme").onclick=()=>{
 const dark=root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
 root.dataset.theme=dark?"light":"dark";try{localStorage.setItem("theme",root.dataset.theme)}catch(e){}};

// interactive network hero
(function(){
 const cv=document.getElementById("net"),cx=cv.getContext("2d"),hero=cv.parentElement;
 const still=matchMedia("(prefers-reduced-motion:reduce)").matches;
 let W,H,N=[],m={x:-999,y:-999},D=window.devicePixelRatio||1;
 const col=n=>getComputedStyle(root).getPropertyValue(n).trim();
 function size(){W=hero.clientWidth;H=hero.clientHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);
  const n=Math.round(Math.min(70,W*H/14000));N=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}));}
 function draw(){const nc=col("--node"),ac=col("--accent2");cx.clearRect(0,0,W,H);
  for(const a of N){
   if(!still){a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>W)a.vx*=-1;if(a.y<0||a.y>H)a.vy*=-1;}
   const dm=Math.hypot(a.x-m.x,a.y-m.y);
   if(dm<150){cx.strokeStyle=ac;cx.globalAlpha=1-dm/150;cx.lineWidth=1.6;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(m.x,m.y);cx.stroke();}
  }
  cx.lineWidth=1;
  for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const a=N[i],b=N[j],d=Math.hypot(a.x-b.x,a.y-b.y);
   if(d<130){cx.strokeStyle=nc;cx.globalAlpha=(1-d/130)*.5;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();}}
  cx.globalAlpha=1;cx.fillStyle=nc;for(const a of N){cx.beginPath();cx.arc(a.x,a.y,2.6,0,6.3);cx.fill();}
  if(!still)requestAnimationFrame(draw);}
 hero.addEventListener("pointermove",e=>{const r=hero.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top;if(still)draw();});
 hero.addEventListener("pointerleave",()=>{m.x=m.y=-999;if(still)draw();});
 addEventListener("resize",()=>{size();if(still)draw();});
 size();draw();
})();

// profile picture: fall back to initials if /images/profile.jpg is missing
const av=document.querySelector(".avatar"),im=av&&av.querySelector("img");
if(im){const miss=()=>av.classList.add("noimg");im.addEventListener("error",miss);if(im.complete&&!im.naturalWidth)miss();}

// contact form -> POST /api/contact
const form=document.getElementById("cform"),st=document.getElementById("status");
form.addEventListener("submit",async e=>{e.preventDefault();
 const btn=form.querySelector("button");btn.disabled=true;st.className="";st.textContent="Sending...";
 try{const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not send.");
  st.className="ok";st.textContent="Thanks! Your message was sent.";form.reset();
 }catch(err){st.className="err";st.textContent=err.message}
 btn.disabled=false;});
