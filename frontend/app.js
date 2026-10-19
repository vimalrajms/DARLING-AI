const form=document.querySelector('#form');
const input=document.querySelector('#input');
const messages=document.querySelector('#messages');
const replies={
 greeting:['Vanakkam nanba! 👋 Eppadi irukka?','Hey nanba! Darling inga ready-ah irukken. 😊','Hi! Sollu nanba, enna pesalam?'],
 joke:['Teacher: Why are you late? Student: The sign said “School Ahead, Go Slow!” 😄','Programmer-ku favourite place edhu? The Foo Bar! 😂','Computer-ku cold pudicha enna pannum? Windows close pannum! 😆'],
 riddle:['I have keys but no locks, space but no room. What am I? 🤔 Hint: typing-ku use pannuva!','What gets wetter as it dries? Think pannitu sollu nanba!'],
 motivation:['Small steps every day, nanba. Consistency dhaan real superpower. ⚡','Mistake-na failure illa; adhu next attempt-ku lesson. Keep learning! 💚','Un goal-ah perusa vechikko, daily practice-ah chinnadha start pannu.']
};
function pick(x){return Array.isArray(x)?x[Math.floor(Math.random()*x.length)]:x}
function calculate(t){const m=t.match(/(-?\d+(?:\.\d+)?)\s*([+*/x-])\s*(-?\d+(?:\.\d+)?)/);if(!m)return null;const a=+m[1],b=+m[3];if(m[2]==='/'&&b===0)return 'Zero-voda divide panna mudiyadhu, nanba.';return 'Answer: '+({'+' :a+b,'-':a-b,'*':a*b,'x':a*b,'/':a/b})[m[2]]}
function reply(raw){const t=raw.toLowerCase().replace(/[^a-z0-9\u0b80-\u0bff+*/().\s-]/g,' ').replace(/\s+/g,' ').trim();const math=calculate(t);if(math!==null)return math;
if(/\b(hi|hello|hey|vanakkam|hii|hai)\b|வணக்கம்/.test(t))return pick(replies.greeting);
if(/un peru|your name|who are you|nee yaar|per enna|name sollu/.test(t))return 'En peru Darling Robot, nanba. 🤖';
if(/creator|owner|who made|yaaru create|vimal/.test(t))return 'En creator Vimal MS. Namma project-ah step-by-step build pannuvom!';
if(/thank|thanks|nandri|நன்றி|tnx/.test(t))return pick(['You’re welcome, nanba! 💚','Paravalla nanba, anytime!','Happy to help!']);
if(/joke|funny|sirippu|comedy|சிரிப்பு/.test(t))return pick(replies.joke);
if(/riddle|puzzle|puthir|புதிர்/.test(t))return pick(replies.riddle);
if(/motivat|positive|encourage|confidence|tired|sad|kastam/.test(t))return pick(replies.motivation);
if(/what can you do|help|features|enna pannuva|enna theriyum|capabilit/.test(t))return 'Ippo naan basic chat, jokes, riddles, motivation, and simple calculations help pannuren. Real AI, voice, and ESP32 connection later add pannalam.';
if(/how are you|eppadi irukka|epdi iruka/.test(t))return pick(['Naan super-ah irukken nanba! Nee eppadi?','System ready! 😄 Nee sollu nanba, eppadi irukka?']);
if(/music|song|paatu|பாட்டு/.test(t))return 'Music feature-ah next update-la add pannalam nanba.';
if(/esp32|oled|robot connect|connect robot/.test(t))return 'ESP32 connection next phase-la add pannuvom. Ippo indha page browser demo mattum; hardware-ku firmware and connection setup venum.';
if(/tamil|tanglish|தமிழ்/.test(t))return 'Tamil/Tanglish-la pesalam nanba! Un message-ah purinjikka try pannuren.';
return 'Puriyudhu nu nenaikkiren, nanba. 😊 Innum konjam different-ah sollu. Ippo naan basic rule-based version; real AI-ah later connect pannuvom.'}
function add(text,who){const row=document.createElement('div');row.className='message '+who;const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent=who==='user'?'V':'D';const wrap=document.createElement('div');const label=document.createElement('label');label.textContent=who==='user'?'YOU':'DARLING';const p=document.createElement('p');p.textContent=text;const time=document.createElement('small');time.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}).toUpperCase();wrap.append(label,p,time);row.append(avatar,wrap);messages.append(row);messages.scrollTop=messages.scrollHeight}
function send(text){if(!text.trim())return;add(text.trim(),'user');input.value='';input.focus();setTimeout(()=>add(reply(text),'bot'),250)}
form.addEventListener('submit',e=>{e.preventDefault();send(input.value)});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.prompt)));
document.querySelector('#clear').addEventListener('click',()=>{messages.replaceChildren();add('Chat cleared, nanba. 💚 Fresh-ah start pannalam!','bot')});
