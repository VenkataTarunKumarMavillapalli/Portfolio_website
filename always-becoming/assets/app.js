/* UI, accessibility and deterministic demonstrations. No network calls. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const D=window.PORTFOLIO,E=window.Experience;
  if(!D||!E){console.error('Portfolio content or motion engine is unavailable.');return;}
  const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines=s=>esc(s).replace(/\n/g,'<br>');
  let toastTimer;
  function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),4600);}
  function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
  // Scroll navigation remains native. No wheel interception or scroll-jacking.
  let scrollQueued=false;
  function scrollUpdate(){scrollQueued=false;const y=window.scrollY,max=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.width=(max?Math.min(100,y/max*100):0)+'%';$('#header').classList.toggle('scrolled',y>30);}
  window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(scrollUpdate);}},{passive:true});scrollUpdate();
  const visibleReveal=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('awaiting');visibleReveal.unobserve(e.target);}});},{threshold:.08});
  $$('.reveal').forEach(el=>{el.classList.add('awaiting');visibleReveal.observe(el);});
  const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-20% 0px -55% 0px'});
  $$('main>section').forEach(s=>navObserver.observe(s));
  function closeMenu(){ $('#mobileNav').hidden=true;$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label','Open navigation');}
  $('#menuToggle').addEventListener('click',()=>{const open=$('#mobileNav').hidden;$('#mobileNav').hidden=!open;$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  $$('#mobileNav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
  function motionUI(){const on=E.motion;$('#motionToggle').setAttribute('aria-pressed',String(on));$('#motionToggle').setAttribute('aria-label',on?'Pause ambient motion':'Enable ambient motion');$('#motionLabel').textContent=on?'Motion on':'Motion off';}
  document.addEventListener('experience:motion',motionUI);motionUI();
  $('#motionToggle').addEventListener('click',()=>{if(E.systemReduced&&!E.motion){toast('Your device prefers reduced motion. Ambient animation stays off; every interaction remains available.');return;}E.setMotion(!E.motion);if(!E.motion)stopChapterPlayback();});
  const formNames=['A THREAD, NEVER A STRAIGHT LINE.','MANY PERSPECTIVES. ONE PERSON.','THE NEXT FORM IS STILL EMERGING.'];
  $$('[data-form]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.form);E.setForm(i);$$('[data-form]').forEach(a=>{a.classList.toggle('active',a===b);a.setAttribute('aria-pressed',String(a===b));});$('#formCaption').textContent=formNames[i];}));
  if(matchMedia('(pointer:fine)').matches){
    $$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!E.motion)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.10}px,${(e.clientY-r.top-r.height/2)*.13}px)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});
  }
  // Life chapters: semantic tabs, keyboard navigation, optional playback and local narration.
  let chapterIndex=0,chapterTimer=null,narrating=false,utterance=null;
  $('#chapterTabs').innerHTML=D.chapters.map((c,i)=>`<button id="chapter-tab-${i}" role="tab" aria-controls="chapterPanel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-chapter="${i}"><span>${String(i+1).padStart(2,'0')} / ${esc(c.year)}</span><b>${esc(c.short)}</b></button>`).join('');
  function stopNarration(){if('speechSynthesis'in window)speechSynthesis.cancel();narrating=false;utterance=null;$('#narrateButton').innerHTML='<span aria-hidden="true">◖))</span> Listen';$('#narrateButton').setAttribute('aria-pressed','false');}
  function selectChapter(index,{manual=true,announce=true,focus=false}={}){
    chapterIndex=(index+D.chapters.length)%D.chapters.length;const c=D.chapters[chapterIndex];
    if(manual)stopChapterPlayback();stopNarration();
    $$('#chapterTabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===chapterIndex));b.tabIndex=i===chapterIndex?0:-1;});
    $('#chapterPanel').setAttribute('aria-labelledby','chapter-tab-'+chapterIndex);
    $('#chapterLargeYear').textContent=c.year;$('#chapterVisualLocation').textContent=c.place.toUpperCase();$('#chapterVisual').style.background=c.color;
    $('#chapterKicker').textContent=c.kicker;$('#chapterCount').textContent=String(chapterIndex+1).padStart(2,'0')+' / 07';$('#chapterTitle').innerHTML=lines(c.title);$('#chapterText').textContent=c.text;$('#chapterDetail').textContent=c.detail;
    $('#chapterMilestones').innerHTML=c.milestones.map(m=>`<div class="milestone"><span>${esc(m[0])}</span><div><strong>${esc(m[1])}</strong><p>${esc(m[2])}</p></div></div>`).join('');
    $('#chapterReflection').textContent=c.reflection;
    const content=$('.chapter-content');content.classList.remove('changing');void content.offsetWidth;content.classList.add('changing');
    const active=$('#chapter-tab-'+chapterIndex);if(focus)active.focus({preventScroll:true});
    // Horizontal visibility without unexpectedly moving the page.
    const rail=$('#chapterTabs'),left=active.offsetLeft-rail.offsetLeft;
    if(left<rail.scrollLeft)rail.scrollLeft=left;else if(left+active.offsetWidth>rail.scrollLeft+rail.clientWidth)rail.scrollLeft=left+active.offsetWidth-rail.clientWidth;
    E.setChapter(chapterIndex);if(announce)$('#storyStatus').textContent=`Chapter ${chapterIndex+1}: ${c.short}, ${c.range}.`;
  }
  $$('#chapterTabs button').forEach((b,i)=>{b.addEventListener('click',()=>selectChapter(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=chapterIndex+1;if(e.key==='ArrowLeft')next=chapterIndex-1;if(e.key==='Home')next=0;if(e.key==='End')next=D.chapters.length-1;if(next!==undefined){e.preventDefault();selectChapter(next,{focus:true});}});});
  $('#prevChapter').addEventListener('click',()=>selectChapter(chapterIndex-1));$('#nextChapter').addEventListener('click',()=>selectChapter(chapterIndex+1));
  function stopChapterPlayback(){clearInterval(chapterTimer);chapterTimer=null;$('#playChapters').innerHTML='<span aria-hidden="true">▷</span> Play chapters';$('#playChapters').setAttribute('aria-pressed','false');}
  $('#playChapters').addEventListener('click',()=>{if(chapterTimer){stopChapterPlayback();return;}if(!E.motion){toast('Chapter playback is paused with motion. Use the arrows or chapter tabs to explore at your own pace.');return;}$('#playChapters').innerHTML='<span aria-hidden="true">Ⅱ</span> Pause chapters';$('#playChapters').setAttribute('aria-pressed','true');chapterTimer=setInterval(()=>{if(chapterIndex===D.chapters.length-1){stopChapterPlayback();return;}selectChapter(chapterIndex+1,{manual:false});},11000);});
  $('#narrateButton').setAttribute('aria-pressed','false');
  $('#narrateButton').addEventListener('click',()=>{
    if(narrating){stopNarration();return;}
    if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){toast('Narration is not available in this browser. All chapter text is available on the page.');return;}
    const voices=speechSynthesis.getVoices().filter(v=>v.localService&&/^en\b/i.test(v.lang));
    if(!voices.length){toast('No local English voice is available on this device. This site does not send the text to an external voice service.');return;}
    const c=D.chapters[chapterIndex];utterance=new SpeechSynthesisUtterance(`${c.short}. ${c.range.replace('—','to')}. ${c.title.replace('\n',' ')} ${c.text} ${c.detail}`);utterance.voice=voices.find(v=>v.lang==='en-GB')||voices[0];utterance.rate=.94;utterance.pitch=1;narrating=true;$('#narrateButton').innerHTML='<span aria-hidden="true">■</span> Stop voice';$('#narrateButton').setAttribute('aria-pressed','true');utterance.onend=stopNarration;utterance.onerror=stopNarration;speechSynthesis.speak(utterance);
  });
  if('speechSynthesis'in window)speechSynthesis.getVoices();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopChapterPlayback();stopNarration();}});
  selectChapter(0,{announce:false});
  // Globe selection has an accessible text equivalent and links to the matching chapter.
  let cityIndex=0;
  $('#cityList').innerHTML=D.cities.map((c,i)=>`<button class="city-button ${i===0?'active':''}" data-city="${i}" aria-pressed="${i===0}"><span>${esc(c.name)}</span><small>${esc(c.country.toUpperCase())}</small></button>`).join('');
  function selectCity(i){cityIndex=i;const c=D.cities[i];$$('[data-city]').forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i));});$('#cityCountry').textContent=c.country.toUpperCase();$('#cityTitle').textContent=c.name;$('#cityNote').textContent=c.note;E.selectCity(i);}
  $$('[data-city]').forEach((b,i)=>b.addEventListener('click',()=>selectCity(i)));
  document.addEventListener('experience:city',e=>selectCity(e.detail));
  $('#cityChapter').addEventListener('click',()=>{selectChapter(D.cities[cityIndex].chapter);document.getElementById('story').scrollIntoView({behavior:E.motion?'smooth':'instant'});});
  $('#rotateLeft').addEventListener('click',()=>E.rotateGlobe(-25));$('#rotateRight').addEventListener('click',()=>E.rotateGlobe(25));
  // Native dialogs provide modal keyboard containment and background inertness.
  const modalMap={profile:$('#profileDialog'),about:$('#aboutDialog')};
  let previousFocus=null,demoCleanup=()=>{};
  function openDialog(dialog){stopChapterPlayback();stopNarration();closeMenu();$$('dialog[open]').forEach(d=>d.close());previousFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');}
  function closeDialog(dialog){dialog.close();}
  $$('dialog').forEach(d=>{
    d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');if(d.id==='projectDialog'){demoCleanup();demoCleanup=()=>{};}if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
    d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
  });
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.closest('dialog'))));
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>{const d=modalMap[b.dataset.open];if(d)openDialog(d);}));
  // A succinct professional view, using high-level public-facing descriptions only.
  const experience=[
    ['JUL 2026–','AI Consultant','World Food Programme · Office of Inspector General'],
    ['2025–2026','AI Engineer Intern','WFP · Integration & Investigative Technologies · October 2025–June 2026'],
    ['2024–2025','Data Officer Trainee','European Food Safety Authority · November 2024–October 2025'],
    ['2024','Research & applied learning','University of Naples Federico II research internship; Italdesign / Ideneers Academy'],
    ['2021–2022','Associate Salesforce Developer','Neuraflash · February 2021–August 2022'],
    ['2019','Website & Database Development Intern','A.J. Drexel Autism Institute · May–July 2019']
  ];
  const education=[
    ['2022–2025','MSc · Data Science','University of Naples Federico II · September 2022–May 2025'],
    ['2023–2024','Apple Developer Academy','Digital product development · September 2023–June 2024'],
    ['2016–2020','BTech · Computer Science Engineering','Amity University · Three-Continental Program, including study experiences with Birkbeck and Adelphi']
  ];
  const entries=arr=>arr.map(a=>`<div class="profile-entry"><span>${esc(a[0])}</span><div><h3>${esc(a[1])}</h3><p>${esc(a[2])}</p></div></div>`).join('');
  $('#profileContent').innerHTML=`<div class="profile-intro"><div><h2 id="profileTitle">Venkata.<br><span class="serif accent">In the making.</span></h2><p class="profile-role">${esc(D.name)}<br>${esc(D.role)} · ${esc(D.organization)}</p><p class="eyebrow">ENGINEERING · DATA · APPLIED AI · PUBLIC SERVICE</p></div><span class="profile-v" aria-hidden="true">v·</span></div><div class="profile-timeline">${entries(experience)}</div><h3 style="margin-top:30px">Education & development</h3><div class="profile-timeline" style="margin-top:15px">${entries(education)}</div><div class="profile-actions"><a class="button button-lime" href="mailto:${esc(D.email)}">Send a note <span aria-hidden="true">↗</span></a><button class="text-button" id="downloadBio">Download overview ↓</button><button class="text-button" id="printBio">Print / save PDF ↗</button></div><p class="profile-disclaimer">An independently maintained personal overview. Dates reflect the biography supplied for the 2026 edition. Study and work periods may overlap. Contributions were made in team environments; no institutional endorsement is implied.</p>`;
  function bioText(){return `${D.name}\n${D.role} | ${D.organization}\n\nPERSONAL PROFESSIONAL OVERVIEW — 2026 EDITION\n\nEXPERIENCE\n${experience.map(a=>a.join(' | ')).join('\n\n')}\n\nEDUCATION & DEVELOPMENT\n${education.map(a=>a.join(' | ')).join('\n\n')}\n\nFIELDS OF WORK\nApplied AI, knowledge retrieval, data engineering, analytical reporting, workflow automation and responsible enterprise systems.\n\nCONTACT\n${D.email}\n\nIndependent personal overview. Not an official publication of or endorsed by the United Nations, WFP or EFSA. No confidential institutional information is included.\n`;}
  $('#downloadBio').addEventListener('click',()=>download('Venkata-Professional-Overview.txt',bioText()));
  function printDocument(){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Venkata — Professional overview</title><style>body{font:14px Arial,sans-serif;color:#172016;max-width:780px;margin:50px auto;padding:0 28px;line-height:1.7}h1{font-size:37px;line-height:1.2;letter-spacing:-1px}h2{font-size:18px;border-bottom:1px solid #b8c5ac;padding-bottom:9px;margin-top:30px}section>div{margin:19px 0}small{color:#596b4c}p{margin:5px 0}footer{font-size:11px;margin-top:35px;border-top:1px solid #bbc7af;padding-top:20px}@media print{body{margin:10mm auto;font-size:11px}h1{font-size:28px}h2{font-size:16px}section>div{break-inside:avoid;margin:14px 0}}</style></head><body><small>INDEPENDENT PERSONAL OVERVIEW · 2026 EDITION</small><h1>${esc(D.name)}</h1><p>${esc(D.role)} · ${esc(D.organization)}</p><section><h2>Experience</h2>${experience.map(a=>`<div><small>${esc(a[0])}</small><p><strong>${esc(a[1])}</strong></p><p>${esc(a[2])}</p></div>`).join('')}</section><section><h2>Education & development</h2>${education.map(a=>`<div><small>${esc(a[0])}</small><p><strong>${esc(a[1])}</strong></p><p>${esc(a[2])}</p></div>`).join('')}</section><h2>Contact</h2><p>${esc(D.email)}</p><footer>Personal overview. Not an official publication of or endorsed by the United Nations, WFP or EFSA. Dates reflect the supplied biography for the 2026 edition; study and work periods may overlap.</footer></body></html>`;}
  $('#printBio').addEventListener('click',()=>{const win=window.open('','_blank');if(!win){toast('Your browser blocked the print window. Download the overview instead.');return;}win.opener=null;win.document.open();win.document.write(printDocument());win.document.close();win.addEventListener('load',()=>setTimeout(()=>win.print(),200),{once:true});});
  $('#emailLink').href='mailto:'+D.email;
  const socials=[['LinkedIn',D.linkedin],['GitHub',D.github]].filter(([,url])=>/^https:\/\//i.test(url));
  $('#socialLinks').innerHTML=socials.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('');
  // Procedural card illustrations, independent of the working demonstrations.
  function projectArt(type,color){
    let shapes='';
    if(type==='graph'){
      const nodes=[[250,111,15],[145,67,8],[130,155,7],[365,65,7],[366,157,9],[246,38,5],[250,194,5],[85,110,4],[422,108,4]];
      [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,5],[2,6],[3,5],[4,6],[1,7],[2,7],[3,8],[4,8],[1,2],[3,4]].forEach(([a,b],i)=>{shapes+=`<line class="${i%3===0?'graph-line':''}" x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="${color}" stroke-opacity=".3"/>`;});
      nodes.forEach(([x,y,r],i)=>{shapes+=`<circle cx="${x}" cy="${y}" r="${r+7}" fill="none" stroke="${color}" stroke-opacity=".1"/><circle class="svg-pulse" cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="${i===0?.85:.35}"/>`;});
      shapes+='<text x="250" y="116" fill="#11190b" font-size="13" text-anchor="middle">✳</text>';
    }else if(type==='chart'){
      for(let y=42;y<190;y+=35)shapes+=`<line x1="85" y1="${y}" x2="420" y2="${y}" stroke="${color}" stroke-opacity=".09"/>`;
      [50,76,64,108,93,132,151].forEach((v,i)=>{shapes+=`<rect class="chart-column" x="${105+i*43}" y="${190-v}" width="22" height="${v}" rx="1" fill="${color}" fill-opacity="${.25+i*.09}" style="animation-delay:-${i*.47}s"/>`;});
      shapes+=`<path d="M105 145Q160 158 190 116T276 87T395 39" fill="none" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 6"/><circle class="svg-pulse" cx="395" cy="39" r="4" fill="${color}"/>`;
    }else if(type==='timeline'){
      shapes+=`<path d="M70 130H170V80H265V145H430" fill="none" stroke="${color}" stroke-opacity=".5" stroke-width="1.1" class="graph-line"/>`;
      [[95,130],[170,80],[265,145],[390,145]].forEach(([x,y],i)=>{shapes+=`<circle cx="${x}" cy="${y}" r="6" fill="#151b12" stroke="${color}"/><circle class="svg-pulse" cx="${x}" cy="${y}" r="2.5" fill="${color}"/><rect x="${x-27}" y="${y-48}" width="54" height="25" rx="2" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-opacity=".25"/><line x1="${x-16}" y1="${y-38}" x2="${x+15}" y2="${y-38}" stroke="${color}" stroke-opacity=".55"/><line x1="${x-16}" y1="${y-31}" x2="${x+6}" y2="${y-31}" stroke="${color}" stroke-opacity=".25"/>`;});
      shapes+=`<line x1="70" y1="189" x2="430" y2="189" stroke="${color}" stroke-opacity=".15"/>`;
      for(let x=70;x<=430;x+=15)shapes+=`<line x1="${x}" y1="185" x2="${x}" y2="193" stroke="${color}" stroke-opacity=".25"/>`;
    }else{
      for(let i=0;i<4;i++){const x=102+i*99;shapes+=`<rect x="${x-29}" y="83" width="58" height="58" rx="8" fill="${color}" fill-opacity="${i===3?.17:.05}" stroke="${color}" stroke-opacity=".5"/><circle class="svg-pulse" cx="${x}" cy="112" r="${i===3?12:7}" fill="${color}" fill-opacity=".65"/>`;if(i<3)shapes+=`<path d="M${x+32} 112H${x+67}" class="graph-line" fill="none" stroke="${color}" stroke-opacity=".6"/><path d="M${x+61} 108l6 4-6 4" fill="none" stroke="${color}" stroke-opacity=".5"/>`;}
      shapes+=`<path d="M399 146V177H102V147" fill="none" stroke="${color}" stroke-opacity=".17" stroke-dasharray="4 5"/><text x="250" y="204" fill="${color}" fill-opacity=".6" font-family="monospace" font-size="7" text-anchor="middle" letter-spacing="2">A HUMAN STAYS IN THE LOOP.</text>`;
    }
    return `<svg viewBox="0 0 500 230" fill="none" aria-hidden="true">${shapes}</svg>`;
  }
  $('#projectGrid').innerHTML=D.projects.map(p=>`<button class="project-card" data-project="${esc(p.id)}" style="--card-color:${p.color}" aria-label="Explore ${esc(p.title.replace('\n',' '))}"><span class="project-top"><span>${p.number} / ${esc(p.tag)}</span><span>OPEN EXPERIMENT ↗</span></span><span class="project-art">${projectArt(p.type,p.color)}</span><span class="project-bottom"><span><h3>${lines(p.title)}</h3><p>${esc(p.subtitle)}</p></span><span class="project-open" aria-hidden="true">↗</span></span></button>`).join('');
  $$('.project-card').forEach(card=>{card.addEventListener('click',()=>openProject(card.dataset.project));card.addEventListener('pointermove',e=>{if(!E.motion)return;const r=card.getBoundingClientRect();card.style.setProperty('--mx',e.clientX-r.left+'px');card.style.setProperty('--my',e.clientY-r.top+'px');});});
  function openProject(id){
    const p=D.projects.find(x=>x.id===id);if(!p)return;demoCleanup();
    $('#projectModalTag').textContent=p.number+' / '+p.tag;
    $('#projectModalContent').innerHTML=`<div class="project-modal-head"><h2 id="projectModalTitle">${lines(p.title)}</h2><span class="synthetic-label"><i></i> SYNTHETIC INTERACTIVE DEMO</span></div><p class="project-modal-overview">${esc(p.overview)}</p><div class="demo-stage" id="demoStage"></div><div class="project-details"><div><h3>The contribution</h3><p>${esc(p.contribution)}</p></div><div><h3>The approach</h3>${p.method.map((m,i)=>`<div class="method-step"><span>0${i+1}</span>${esc(m)}</div>`).join('')}</div></div><p class="project-boundary">${esc(p.boundary)}</p>`;
    openDialog($('#projectDialog'));
    const mount={knowledge:knowledgeDemo,analytics:analyticsDemo,evidence:evidenceDemo,agents:agentDemo}[id];demoCleanup=mount?mount($('#demoStage'))||(()=>{}):()=>{};
  }
  function knowledgeDemo(stage){
    const records=[
      {q:'What is the pilot plan?',answer:'The fictional Orion pilot runs in three stages: prepare a sample collection, test retrieval with reviewers, and decide whether to expand after the review.',source:'ORION-001 · Pilot plan · section 2',quote:'The pilot begins with a curated sample. Reviewers assess the retrieval results. Expansion requires a documented review decision.'},
      {q:'Who reviews the output?',answer:'A designated human reviewer checks the source material and decides whether the output is suitable. The assistant does not approve its own work.',source:'ORION-002 · Review checklist · section 1',quote:'The reviewer examines source references, checks completeness and records a decision. Machine-generated suggestions are not approval.'},
      {q:'How are sources kept?',answer:'Each excerpt retains its document identifier and section reference so that the user can inspect the underlying material.',source:'ORION-003 · Information notes · section 4',quote:'Store the document identifier, section and excerpt alongside the result. Preserve the link between the answer and the source.'}
    ];
    stage.innerHTML=`<span class="eyebrow">A QUESTION → A GROUNDED ANSWER → ITS SOURCE</span><div class="demo-controls">${records.map((r,i)=>`<button data-query="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}">${esc(r.q)}</button>`).join('')}</div><div class="demo-answer" id="knowledgeAnswer" aria-live="polite"></div><button class="text-button" id="inspectSource" aria-expanded="false" aria-controls="sourceCard">Inspect the source ↗</button><div class="source-card" id="sourceCard" hidden></div><p class="demo-footnote">Local, predefined example. Not a live model or search service. All documents are fictional.</p>`;
    function show(i){const r=records[i];stage.querySelectorAll('[data-query]').forEach((b,j)=>{b.classList.toggle('active',i===j);b.setAttribute('aria-pressed',String(i===j));});$('#knowledgeAnswer').innerHTML=esc(r.answer)+`<span class="demo-citation">SOURCE: ${esc(r.source)}</span>`;$('#sourceCard').innerHTML=`<strong>${esc(r.source)}</strong>${esc(r.quote)}`;$('#sourceCard').hidden=true;$('#inspectSource').setAttribute('aria-expanded','false');}
    stage.querySelectorAll('[data-query]').forEach((b,i)=>b.addEventListener('click',()=>show(i)));
    $('#inspectSource').addEventListener('click',()=>{const hidden=!$('#sourceCard').hidden;$('#sourceCard').hidden=hidden;$('#inspectSource').setAttribute('aria-expanded',String(!hidden));});show(0);
  }
  function analyticsDemo(stage){
    const rows={Atlas:{received:[14,19,21,15,23,27],completed:[11,16,18,14,20,24]},Nova:{received:[12,14,17,20,18,23],completed:[10,12,13,17,17,20]}};
    let filter='All',received=[],completed=[];
    stage.innerHTML=`<span class="eyebrow">A FICTIONAL SIX-PERIOD WORKFLOW DATASET</span><div class="demo-controls">${['All','Atlas','Nova'].map((t,i)=>`<button data-team="${t}" class="${i===0?'active':''}" aria-pressed="${i===0}">${t==='All'?'All teams':'Team '+t}</button>`).join('')}</div><div class="demo-metrics" aria-live="polite"><div class="demo-metric"><strong id="receivedMetric"></strong><span>ITEMS RECEIVED</span></div><div class="demo-metric"><strong id="completedMetric"></strong><span>ITEMS COMPLETED</span></div><div class="demo-metric"><strong id="differenceMetric"></strong><span>REMAINING IN SAMPLE</span></div></div><div class="demo-chart" id="analyticsChart" role="img" aria-label="Items completed across six fictional periods"></div><p class="demo-footnote" id="chartDescription"></p><button class="text-button" id="downloadCsv">Download this view as CSV ↓</button><p class="demo-footnote">Synthetic sample only. Opening balance is zero; remaining = received − completed. No institutional metrics.</p>`;
    function update(team){filter=team;const active=team==='All'?Object.values(rows):[rows[team]];received=Array(6).fill(0);completed=Array(6).fill(0);active.forEach(r=>r.received.forEach((v,i)=>{received[i]+=v;completed[i]+=r.completed[i];}));const totalR=received.reduce((a,b)=>a+b,0),totalC=completed.reduce((a,b)=>a+b,0);$('#receivedMetric').textContent=totalR;$('#completedMetric').textContent=totalC;$('#differenceMetric').textContent=totalR-totalC;stage.querySelectorAll('[data-team]').forEach(b=>{const on=b.dataset.team===team;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});const max=Math.max(...completed);$('#analyticsChart').innerHTML=completed.map((v,i)=>`<div class="demo-bar" style="height:${v/max*86}%"><b>${v}</b><span>P${i+1}</span></div>`).join('');$('#chartDescription').textContent='Completed items: '+completed.map((v,i)=>`P${i+1}: ${v}`).join(' · ')+'.';}
    stage.querySelectorAll('[data-team]').forEach(b=>b.addEventListener('click',()=>update(b.dataset.team)));
    $('#downloadCsv').addEventListener('click',()=>{let text='Dataset,Team,Period,Received,Completed,Remaining in period\r\n';received.forEach((v,i)=>{text+=`Synthetic demonstration,${filter},P${i+1},${v},${completed[i]},${v-completed[i]}\r\n`;});download(`synthetic-analytics-${filter.toLowerCase()}.csv`,text,'text/csv;charset=utf-8');});update('All');
  }
  function evidenceDemo(stage){
    const events=[
      {time:'09:10',type:'NOTE',title:'A request is recorded',body:'A fictional project coordinator records a request to review a sample document collection. This event is an entry in the demonstration timeline, not evidence of misconduct.',source:'DEMO-E01 / sample-notes.txt / line 4'},
      {time:'10:35',type:'DOCUMENT',title:'A draft is uploaded',body:'A synthetic draft is added to the sample workspace. The event references the draft identifier so that its origin remains visible.',source:'DEMO-E02 / sample-draft.txt / revision 1'},
      {time:'13:20',type:'REVIEW',title:'A reviewer adds context',body:'The fictional reviewer notes that the draft needs a source check. A sequence of events helps explain what happened; it does not itself establish an allegation.',source:'DEMO-E03 / review-note.txt / line 7'},
      {time:'15:45',type:'REVISION',title:'A revision is recorded',body:'A revised synthetic draft is linked to the previous version. The original reference is retained. Select any event to inspect its context and source label.',source:'DEMO-E04 / sample-draft.txt / revision 2'}
    ];
    stage.innerHTML=`<span class="eyebrow">ONE FICTIONAL DAY · FOUR SOURCE-LINKED EVENTS</span><div class="evidence-layout"><div class="evidence-events">${events.map((e,i)=>`<button class="evidence-event ${i===0?'active':''}" data-event="${i}" aria-pressed="${i===0}"><small>${e.time} / ${e.type}</small>${esc(e.title)}</button>`).join('')}</div><div class="evidence-detail" id="evidenceDetail" aria-live="polite"></div></div><p class="demo-footnote">Every record is fictional. Chronology and association are not findings of wrongdoing.</p>`;
    function select(i){const e=events[i];stage.querySelectorAll('[data-event]').forEach((b,j)=>{b.classList.toggle('active',i===j);b.setAttribute('aria-pressed',String(i===j));});$('#evidenceDetail').innerHTML=`<span class="eyebrow">${e.time} / ${e.type}</span><h4>${esc(e.title)}</h4><p>${esc(e.body)}</p><div class="demo-source-code">SOURCE: ${esc(e.source)}</div>`;}
    stage.querySelectorAll('[data-event]').forEach((b,i)=>b.addEventListener('click',()=>select(i)));select(0);
  }
  function agentDemo(stage){
    let step=-1,timer=null;
    const labels=['Understand','Retrieve','Check','Human review'];
    const statuses=['The request is organised into a small, defined task.','Fictional source snippets are selected for the task.','A deterministic check confirms that the sample draft includes source references.','PAUSED FOR A PERSON. The workflow cannot approve itself.','Human review recorded. The illustrative workflow is complete.'];
    stage.innerHTML=`<span class="eyebrow">AN ILLUSTRATIVE WORKFLOW · NOT A LIVE AI AGENT</span><div class="workflow-track">${labels.map((l,i)=>`<div class="workflow-step" data-step="${i}"><span>${i===3?'◎':'0'+(i+1)}</span>${l}</div>`).join('')}</div><div class="workflow-status" id="workflowStatus" role="status">Ready. Start the demonstration or step through it manually.</div><div class="workflow-actions"><button class="button button-lime" id="workflowStart">Run demonstration <span>▷</span></button><button class="text-button" id="workflowNext">Next step →</button><button class="button button-lime" id="workflowApprove" hidden>Approve as reviewer ✓</button><button class="text-button" id="workflowReset">Reset ↺</button></div><p class="demo-footnote">Timed state changes only. No tools, model calls or real-world actions. Approval exists only in this demonstration.</p>`;
    function stop(){clearInterval(timer);timer=null;}
    function render(){stage.querySelectorAll('[data-step]').forEach((el,i)=>{el.classList.toggle('active',i===Math.min(step,3));el.classList.toggle('done',i<step);});$('#workflowStatus').textContent=step<0?'Ready. Start the demonstration or step through it manually.':statuses[step];$('#workflowApprove').hidden=step!==3;$('#workflowNext').hidden=step>=3;$('#workflowStart').disabled=step>=0;}
    function next(){step=Math.min(step+1,3);render();if(step===3)stop();}
    $('#workflowStart').addEventListener('click',()=>{next();if(E.motion)timer=setInterval(next,1400);else toast('Motion is off. Use “Next step” to advance the demonstration manually.');});
    $('#workflowNext').addEventListener('click',()=>{stop();next();});
    $('#workflowApprove').addEventListener('click',()=>{stop();step=4;render();});
    $('#workflowReset').addEventListener('click',()=>{stop();step=-1;render();});
    const onMotion=()=>{if(!E.motion)stop();};document.addEventListener('experience:motion',onMotion);render();
    return ()=>{stop();document.removeEventListener('experience:motion',onMotion);};
  }
  // Local, deterministic biographical guide. User text is never inserted as HTML.
  $('#guideSuggestions').innerHTML=D.guide.slice(0,4).map((q,i)=>`<button data-guide="${i}">${esc(q.topic)}</button>`).join('');
  function guideMessage(question,record){
    const messages=$('#guideMessages'),q=document.createElement('div');q.className='guide-message question';q.textContent=question;messages.append(q);
    const a=document.createElement('div');a.className='guide-message';const p=document.createElement('p');p.textContent=record?record.answer:'That detail is not included in the approved biography. Try asking about education, earlier experience, the WFP chapter, projects or contact. This local guide will not invent a missing answer.';a.append(p);
    if(record){const link=document.createElement('a');link.href=record.anchor;link.textContent='Explore this part of the story ↗';link.addEventListener('click',()=>closeDialog($('#guideDialog')));a.append(link);}
    messages.append(a);messages.scrollTop=messages.scrollHeight;
  }
  $$('[data-guide]').forEach((b,i)=>b.addEventListener('click',()=>guideMessage(D.guide[i].topic,D.guide[i])));
  $('#guideTrigger').addEventListener('click',()=>openDialog($('#guideDialog')));
  $('#guideForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#guideInput'),question=input.value.trim();if(!question){input.focus();return;}const words=question.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);let best=null,score=0;D.guide.forEach(g=>{const points=g.words.reduce((n,w)=>n+(words.includes(w)?1:0),0);if(points>score){score=points;best=g;}});guideMessage(question,best);input.value='';input.focus();});
  window.PortfolioApp={selectChapter,selectCity,openProject,profileText:bioText,profileHTML:printDocument,get chapter(){return chapterIndex;},get city(){return cityIndex;}};
})();
