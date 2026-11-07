const $=id=>document.getElementById(id), KEY='greyrock.case02.v01';
const people={
 butcher:['肉舖店員','最近生意也不好，來買肉的人少了。',['生意變差','顧客'],8,43],
 baker:['麵包坊店員','今天麵包賣得很好。你想問些什麼？',['顧客','價格'],42,43],
 brewer:['酒坊老闆','最近客人突然變少了。到底是怎麼回事？',['生意變差','顧客'],76,43],
 a:['顧客 A','最近我常來買麵包，比以前更常買。',['顧客','價格'],7,63],
 b:['顧客 B','我在看看今天要買什麼；最近買麵包的人真多。',['顧客','價格'],70,63],
 cart:['無主手推車','街上停著一台無人看管的手推車，堆著大量小麥袋和牛奶罐。看不出貨主或目的地。',['小麥','牛奶','大量原料'],33,78],
 meat:['肉舖店面','櫥窗展示肉品。只能調查店面，沒有進入後場的必要。',[],5,29],
 bread:['麵包坊店面','展示窗放著麵包，店員在門口接待顧客。沒有標示過去的售價。',[],38,29],
 wine:['釀酒坊店面','招牌掛在門上，門邊放著展示酒桶。無須進入後場。',[],72,29],
 street:['石板街道','普通的石板街道，沒有額外告示或可追查的痕跡。',[],3,87]
};
const evidence={
 difference:['營業差異','酒坊與肉舖的店員都說客人減少，麵包坊店員則說銷售很好。','三店初次訪談'],
 uses:['小麥的不同用途','酒坊老闆說釀酒也可能使用小麥，目前不缺原料；供應充足不代表客人會增加。','酒坊老闆 × 小麥'],
 milk:['牛奶與麵包','麵包坊店員確認部分麵包會用牛奶。這提供調查方向，不能確認車上貨物屬於麵包坊。','麵包坊店員 × 牛奶'],
 supply:['原料供應','顧客 B 說最近麵粉等材料容易買到。這是他的採買見聞，不能單憑此判定產量或價格。','顧客 B × 小麥／大量原料'],
 cost:['材料與售價','麵包坊店員：「最近麵粉、牛奶等材料便宜了很多，我們也把麵包售價調低了。」','麵包坊店員 × 價格'],
 preference:['購買偏好','顧客 A：「同樣的錢現在能買更多麵包，所以我最近比較願意買麵包。」','顧客 A × 價格'],
 choice:['顧客的選擇','顧客 B：「最近麵包便宜，我今天也打算多買一些。這只是我自己的選擇。」','顧客 B × 價格'],
 cart:['車上的貨物','觀察到大量小麥與牛奶；貨主、去向與購入價格未知。大量貨物不能直接證明價格下跌。','手推車觀察']
};
let state={visited:[],words:['生意變差','顧客'],clues:[],draft:['','',''],note:'',closed:false},selected=null,focusBack=null,storageOK=true;
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&Array.isArray(s.visited)&&Array.isArray(s.words)&&Array.isArray(s.clues)&&Array.isArray(s.draft)){state={...state,...s};state.visited=state.visited.filter(k=>people[k]);state.clues=state.clues.filter(k=>evidence[k]);}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}const status=$('saveStatus');if(status)status.textContent=storageOK?'已自動儲存在此瀏覽器':'此瀏覽器無法存檔，請保持頁面開啟';}
function button(text,fn,cls='secondary'){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;return b;}
function close(){for(const id of ['shade','detail','popover','book'])$(id).hidden=true;$('message').setAttribute('aria-expanded','false');}
function addClue(k){if(!state.clues.includes(k)){state.clues.push(k);$('bookDot').hidden=false;}save();}
function words(items){for(const w of items)if(!state.words.includes(w))state.words.push(w);save();}
function inspect(id){close();selected=id;if(!state.visited.includes(id))state.visited.push(id);words(people[id][2]);if(id==='cart')addClue('cart');if(['butcher','baker','brewer'].every(k=>state.visited.includes(k)))addClue('difference');document.querySelectorAll('[data-object]').forEach(b=>b.classList.toggle('selected',b.dataset.object===id));$('summary').textContent=people[id][1];save();}
function detail(){close();$('detail').hidden=false;$('shade').hidden=false;$('message').setAttribute('aria-expanded','true');$('objectTitle').textContent=selected?people[selected][0]:'調查委託';$('description').textContent=selected?people[selected][1]:'商店街最近生意有些奇怪。可以從任一店家、顧客或手推車開始，點選對象，再展開下方描述。';$('actions').replaceChildren();if(selected)$('actions').append(button('用關鍵字調查 →',choose,'primary'));$('collapse').focus();}
function choose(){$('actions').replaceChildren();const h=document.createElement('h3');h.textContent='選擇已有關鍵字';const box=document.createElement('div');box.className='keywords';state.words.forEach(w=>box.append(button(w,()=>investigate(w))));$('actions').append(h,box,button('← 返回描述',detail));box.querySelector('button')?.focus();}
function investigate(w){let key=null,reply='';
if(selected==='brewer'&&w==='小麥')key='uses';
if(selected==='baker'&&w==='牛奶')key='milk';
if(selected==='b'&&['小麥','大量原料'].includes(w))key='supply';
if(selected==='baker'&&w==='價格')key='cost';
if(selected==='a'&&w==='價格')key='preference';
if(selected==='b'&&w==='價格')key='choice';
if(key){addClue(key);reply=evidence[key][1];}
else if(w==='生意變差'&&['baker','butcher','brewer'].includes(selected))reply=people[selected][1]+' 可以比較其他店家的說法。';
else if(w==='顧客'&&['baker','a','b'].includes(selected)){words(['價格']);reply=selected==='baker'?'「最近買麵包的人多了。想比較的話，可以問問顧客為什麼來買。」':'「最近比較常選麵包，你可以問我價格。」';}
else if(selected==='baker'&&['小麥','大量原料'].includes(w)){words(['價格']);reply='「小麥能磨粉做麵包，牛奶也是部分麵包的材料。若想知道最近的變化，可以問我價格。車上的貨物是誰的，我不清楚。」';}
else if(selected==='brewer'&&w==='牛奶')reply='「牛奶不是我這裡釀酒使用的材料。那台車是誰的，我不知道。」這條詢問沒有帶來新線索。';
else if(selected==='brewer'&&w==='大量原料')reply='「我這裡目前不缺原料，但客人仍然少。車上的貨不能說明我的銷量。」';
else if(selected==='butcher'&&w==='顧客')reply='「來買肉的人少了。至於每個人改買什麼，還是問他們本人吧。」';
else if(selected==='cart')reply='貨物沒有留下價格、貨主或去向的資訊。繼續查看這裡，無法確認這個問題；可以帶著關鍵字詢問店家或顧客。';
else reply='這個對象沒有提供關於「'+w+'」的新資訊。這次詢問暫時到此，可以換個對象交叉調查。';
$('description').textContent=reply;$('actions').replaceChildren();if(key){const p=document.createElement('p');p.className='badge';p.textContent='已記入手帳：'+evidence[key][0];$('actions').append(p);}$('actions').append(button('換一個關鍵字',choose,'primary'),button('查看手帳',openBook));save();}
const stages=[['營業差異','我如何理解三間店的生意？',['暫時保留','麵包坊較熱鬧，酒坊與肉舖較冷清','三間店的生意都變好了']],['購買偏好','我如何理解顧客的選擇？',['暫時保留','顧客近期更願意買麵包','只看車上貨物，還不知道顧客如何選擇']],['變化原因','我如何理解目前的原因？',['暫時保留','目前還不能說明原因','材料變便宜、麵包降價，吸引顧客','貨物很多就足以證明價格下跌']]];
function openBook(){focusBack=document.activeElement;close();$('book').hidden=false;$('bookDot').hidden=true;const book=$('book');book.replaceChildren();const row=document.createElement('div');row.className='row';const h=document.createElement('h2');h.textContent='案件手帳';const exit=button('×',()=>{close();$('bookBtn').focus();},'close');exit.setAttribute('aria-label','關閉手帳');row.append(h,exit);book.append(row);const intro=document.createElement('p');intro.className='subtle';intro.textContent='事實紀錄與你的推論分開保存。可隨時以部分理解結案，也可重新調查。';book.append(intro);
for(const id of state.clues){const e=document.createElement('article');e.className='entry';const title=document.createElement('h3');title.textContent=evidence[id][0];const source=document.createElement('p');source.className='badge';source.textContent='觀察／證詞 · '+evidence[id][2];const body=document.createElement('p');body.textContent=evidence[id][1];e.append(title,source,body);book.append(e);}if(!state.clues.length){const p=document.createElement('p');p.textContent='還沒有交叉調查紀錄；可以先訪談或觀察。';book.append(p);}
const label=document.createElement('label');label.textContent='我的整理（自由筆記／推論）';const note=document.createElement('textarea');note.value=state.note;note.oninput=()=>{state.note=note.value;save();};label.append(note);book.append(label);
stages.forEach((stage,i)=>{const wrap=document.createElement('section');wrap.className='entry';const l=document.createElement('label');l.textContent=stage[1];const select=document.createElement('select');select.setAttribute('aria-label',stage[0]);const available=i!==2||state.clues.includes('cost');stage[2].filter((_,j)=>i!==2||(j!==2&&j!==3)||available).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;select.append(o);});select.disabled=state.closed;select.value=state.draft[i]||stage[2][0];select.onchange=()=>{state.draft[i]=select.value;save();};l.append(select);wrap.append(l);book.append(wrap);});
if(state.closed){const result=document.createElement('section');result.className='entry';const title=document.createElement('h3');title.textContent='本次結案紀錄（你的理解）';result.append(title);state.draft.forEach((v,i)=>{const p=document.createElement('p');p.textContent=stages[i][0]+'：'+(v||'暫時保留');result.append(p);});const feedback=document.createElement('p');feedback.textContent=state.draft[2]==='貨物很多就足以證明價格下跌'?'仍待查證：數量本身不能證明價格。可以帶著這個疑問重新調查。':state.draft[2]==='材料變便宜、麵包降價，吸引顧客'?(state.clues.includes('preference')||state.clues.includes('choice')?'你的說明串起了店員的價格證詞與顧客的購買選擇；對整條街的影響仍是根據訪談作出的推論。':'你記下了價格變化；顧客是否因此選擇麵包，還可向本人確認。'):'你可以保留目前的理解。未解的原因不會在此自動揭曉，隨時可以回來調查。';result.append(feedback);book.append(result,button('重新調查（保留線索與筆記）',()=>{state.closed=false;save();close();}));}
else book.append(button('以目前理解結案',()=>{state.draft=stages.map((s,i)=>book.querySelectorAll('select')[i].value);state.closed=true;save();openBook();},'primary'));
const status=document.createElement('p');status.id='saveStatus';status.className='save';book.append(status,button('← 返回商店街',()=>{close();$('bookBtn').focus();}));save();exit.focus();}
function pop(hint){close();$('shade').hidden=false;$('popover').hidden=false;const el=$('popover');el.replaceChildren();const h=document.createElement('h2');h.textContent=hint?'調查提示':'案件選單';el.append(h);if(hint){const p=document.createElement('p');p.textContent='點選店家、顧客或手推車，展開底部訊息，再選已有關鍵字。把同一關鍵字帶給不同對象；手帳可以整理與保留尚未理解的部分。';el.append(p);}else{const l=document.createElement('label');const c=document.createElement('input');c.type='checkbox';c.checked=!$('scene').classList.contains('hidden-marks');c.onchange=()=>$('scene').classList.toggle('hidden-marks',!c.checked);l.append(c,' 顯示物件標記');el.append(l,button('重置本案存檔',()=>{el.replaceChildren();const p=document.createElement('p');p.textContent='清除本案的線索、筆記與結案紀錄？';el.append(p,button('確認重置本案',()=>{state={visited:[],words:['生意變差','顧客'],clues:[],draft:['','',''],note:'',closed:false};selected=null;save();close();$('summary').textContent='酒坊老闆：「最近客人突然少了……」';document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));$('bookDot').hidden=true;}),button('取消',()=>pop(false)));}));}el.append(button('返回場景',close));el.querySelector('button').focus();}
// Scene coordinates are percentages of the uncropped original (1672 × 941).
const regions={meat:[7,17,31,20],bread:[43,19,26,20],wine:[72,17,16,21],butcher:[21,39,8,19],baker:[49,43,8,14],brewer:[76,40,8,17],a:[57,44,8,29],b:[88,44,7,24],cart:[61,62,23,25],street:[27,86,29,12]};
for(const [id,o]of Object.entries(people)){const b=button('',()=>inspect(id),'hotspot street-point');b.dataset.object=id;b.setAttribute('aria-label','調查'+o[0]);const [x,y,w,h]=regions[id];b.style.cssText=`left:${x}%;top:${y}%;width:${w}%;height:${h}%`;b.title=o[0];const s=document.createElement('span');s.className='mark';s.textContent='＋ '+o[0];b.append(s);$('scene').append(b);}
$('message').onclick=detail;$('collapse').onclick=()=>{close();$('message').focus();};$('shade').onclick=close;$('bookBtn').onclick=openBook;$('menuBtn').onclick=()=>pop(false);$('hintBtn').onclick=()=>pop(true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();$('message').focus();}if(e.key==='Tab'){const layer=['book','popover','detail'].map($).find(el=>!el.hidden);if(!layer)return;const f=[...layer.querySelectorAll('button:not(:disabled),a,input,select:not(:disabled),textarea')];if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus();}}});save();

// Presentation only: keep the original case data and save key unchanged.
const sceneWindow=$('sceneWindow');
function fitScene(){const mobile=matchMedia('(max-width: 700px)').matches;$('scene').style.width=mobile?Math.max(sceneWindow.clientWidth,sceneWindow.clientHeight*1672/941)+'px':Math.min(sceneWindow.clientWidth,sceneWindow.clientHeight*1672/941)+'px';}
new ResizeObserver(fitScene).observe(sceneWindow);fitScene();
$('panLeft').onclick=()=>sceneWindow.scrollBy({left:-sceneWindow.clientWidth*.7,behavior:'smooth'});
$('panRight').onclick=()=>sceneWindow.scrollBy({left:sceneWindow.clientWidth*.7,behavior:'smooth'});
function panStatus(){$('panLeft').disabled=sceneWindow.scrollLeft<2;$('panRight').disabled=sceneWindow.scrollLeft+sceneWindow.clientWidth>=sceneWindow.scrollWidth-2;}
sceneWindow.addEventListener('scroll',panStatus,{passive:true});new ResizeObserver(panStatus).observe($('scene'));panStatus();
