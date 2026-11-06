/**
 * Optional Playwright validation. Serve and inspect dist/ in one foreground process.
 * Startup uses genuine Sepolia/wheel responses. Later scenarios use an explicitly
 * synthetic EIP-6963 provider and RPC fixtures. Never signs or broadcasts anything.
 * Random accounts and transaction hashes exist only inside this test process.
 * Timers are captured in the test page so controlled states do not race polling.
 */
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {start,bridge,shots} from './browser-support.mjs';
const RAID='0x77240d974bb7a4ccb85021ff2c40ca0324f57896';
const addr=()=>`0x${randomBytes(20).toString('hex')}`;
const accounts=[addr(),addr(),addr()];
const hash=`0x${randomBytes(32).toString('hex')}`;
const word=v=>BigInt(v).toString(16).padStart(64,'0');
const dyn=t=>typeof t!=='string'||t==='s';
function tuple(types,values){let tail='',head='';const bytes=types.length*32;for(let i=0;i<types.length;i++){const t=types[i],v=values[i];if(dyn(t)){head+=word(bytes+tail.length/2);tail+=value(t,v)}else head+=t==='a'?v.slice(2).padStart(64,'0'):word(v)}return head+tail}
function value(t,v){if(t==='s'){const h=Buffer.from(v).toString('hex');return word(h.length/2)+h.padEnd(Math.ceil(h.length/64)*64,'0')}if(Array.isArray(t))return word(v.length)+tuple(v.map(()=>t[0]),v);if(t.arr)return word(v.length)+tuple(v.map(()=>t.arr),v);return tuple(t.t,v)}
const encode=(types,values)=>'0x'+tuple(types,values);
const B={t:['n','s','u','n','n','n','n','n','n','n','n','n']};
const R={t:['a','n','n','n','n','n','n','n','n',['n']]};
const bvals=b=>[b.id,b.name,b.seed,b.level,b.maxHp,b.damage,b.hpLeft,b.spawn,b.end,b.flee,b.strikes,b.fate];
const rvals=(a,i=0)=>[a,[100,150,125][i],fixture.lastCharge,3,2,0,[1000,600,250][i],0,[1000,600,250][i],[]];
const results=[];const pass=(name,detail='')=>{results.push({name,passed:true,detail});console.log('PASS:',name,detail)};
const {browser,base,close}=await start();
let fixture={enabled:false,round:0,lastCharge:0,queued:false,claims:new Set(),requests:[],hideNewest:false};
const errors=[];
let originalBoss,originalArt,originalArtHex;
try{
 const context=await browser.newContext({viewport:{width:1280,height:940},deviceScaleFactor:1});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>{
   window.setInterval=(fn,ms,...args)=>{if(ms===1000)window.__testRender=fn;return 0};
 });
 const failures=await bridge(page,async(route,req)=>{
  if(!fixture.enabled||req.method()!=='POST')return false;
  const j=req.postDataJSON();if(!j.method)return false;
  let result;
  const data=j.params?.[0]?.data||'';const sel=data.slice(0,10);const args=[];for(let i=10;i<data.length;i+=64)args.push(Number(BigInt('0x'+data.slice(i,i+64))));
  if(j.method==='eth_call'){
   switch(sel){
    case'0x8a19c8bc':result='0x'+word(fixture.round);break;
    case'0x83d0e1d7':result='0x'+word(fixture.round-1);break;
    case'0x24e2c53a':result='0x'+word(52);break;
    case'0x856f8c35':result=encode([B],[bvals({...originalBoss,id:51,strikes:3,flee:fixture.round+1008})]);break;
    case'0xbc3ac875':result=encode(['n','n','n','n','b'],[3,375,0,0,0]);break;
    case'0x9f0c3101':result=encode([['n'],['n'],['n']],fixture.queued?[[fixture.round-2],[3],[375]]:[[],[],[]]);break;
    case'0xbb857152':result='0x'+word(200);break;
    case'0x862950b7':result=encode([R],[rvals(accounts[0])]);break;
    case'0x9f237e6c':result='0x'+word(3);break;
    case'0x1b53eea8':result=encode([{arr:R}],[accounts.map((a,i)=>rvals(a,i))]);break;
    case'0x140f72fa':result=originalArtHex;break;
    case'0x36b36c9f':{
      const[from,n]=args;fixture.requests.push([from,n]);const bosses=[];
      for(let id=from;id>=0&&bosses.length<n;id--){const standing=id===51||(fixture.hideNewest&&id>=28);const fate=standing?0:id%3===0?2:1;bosses.push(bvals({...originalBoss,id,fate,damage:fate===1?4000:2000,hpLeft:fate===1?0:2000,end:fixture.round-3,flee:fixture.round+1000,strikes:12}));}
      result=encode([{arr:B}],[bosses]);break;
    }
    case'0xfaa437e9':result='0x'+word(fixture.claims.has(args[0])?1:0);break;
    case'0xc87b56dd':result=encode(['s'],['data:application/json;base64,'+Buffer.from(JSON.stringify({name:'Gold trophy: '+originalBoss.name,image:originalArt})).toString('base64')]);break;
    case'0xa7f0b3de':result='0x'+word(1793735400);break;
    case'0xf7cb789a':result='0x'+word(600);break;
    default:result='0x';break;
   }
  }else if(j.method==='eth_getTransactionReceipt'){
   const tx=await page.evaluate(()=>window.__walletMock.lastTx);
   if(tx?.data==='0x55161913')fixture.lastCharge=fixture.round;
   if(tx?.data?.startsWith('0x71d6ddd6'))fixture.queued=false;
   if(tx?.data?.startsWith('0x379607f5'))fixture.claims.add(Number(BigInt('0x'+tx.data.slice(10))));
   result={status:'0x1',logs:[]};
  }else if(j.method==='eth_estimateGas')result='0x120000';
  else if(j.method==='eth_blockNumber')result='0xb88000';
  else if(j.method==='eth_getLogs')result=[];
  else return false;
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({jsonrpc:'2.0',id:j.id,result})});return true;
 });
 // Genuine reads, before any fixture is enabled.
 const rootResponse=await page.request.get(new URL('/',base).href);assert.equal(rootResponse.status(),200);assert((await rootResponse.text()).includes('<title>Wheel Raid</title>'));
 for(const path of ['','og.png','card.png','favicon.svg']){const response=await page.request.get(base+path);assert.equal(response.status(),200);if(path.endsWith('.png'))assert.match(response.headers()['content-type'],/image\/png/)}
 await page.goto(base,{waitUntil:'load'});
 await page.waitForFunction(()=>window.__testRender&&window.__raid?.S.boss&&document.querySelector('#bossArt img'),null,{timeout:55000});
 await page.evaluate(()=>document.fonts.ready);
 const live=await page.evaluate(()=>({name:bossName.textContent,hp:hpTxt.textContent,round:rNow.textContent,boss:{...__raid.S.boss,seed:__raid.S.boss.seed.toString()},art:document.querySelector('#bossArt img').src,board:board.innerText,log:feed.innerText,hall:hall.innerText,deployed:__raid.S.deployed,hallN:__raid.S.hallN,feedErr:__raid.S.feedErr}));
 assert(live.deployed&&!live.feedErr);assert.equal(live.hallN,24);assert.match(live.hp,/[\d,]+ \/ [\d,]+/);assert(live.name.length>0);originalBoss=live.boss;originalArt=live.art;
 const svg=decodeURIComponent(originalArt.split(',').slice(1).join(','));originalArtHex=encode(['s'],[svg]);
 fixture.round=Number(live.round.replaceAll(',',''));
 pass('Live Sepolia and wheel startup',`${live.name}; ${live.hp} HP; round ${live.round}; board, log and hall loaded`);
 pass('Static HTTP assets','/ and PNG/SVG assets return 200 under /preview/');
 await shots(page,'final-1280');
 await page.setViewportSize({width:390,height:844});await shots(page,'final-390');
 const action=await page.locator('#actions .btn.charge').boundingBox();assert(action.y+action.height<=844);pass('390 first screen','Primary charge/connect action is entirely visible');
 await page.getByRole('button',{name:'Connect wallet',exact:true}).click();
 for(const name of ['MetaMask','OKX Wallet','Trust Wallet','Coinbase Wallet'])assert(await page.getByRole('link',{name:'Open in '+name,exact:true}).isVisible());
 await shots(page,'wallet-phone');await page.getByRole('button',{name:'Back',exact:true}).click();pass('No-wallet recovery','Four existing wallet-app links and Back work');
 await page.evaluate(({accounts,hash})=>{
  const mock=window.__walletMock={chain:'0x1',requests:[],cancelConnect:true,rejectSend:false,switchNeedsAdd:true,lastTx:null};
  const provider={on(){},async request(q){mock.requests.push(q);switch(q.method){case'eth_requestAccounts':if(mock.cancelConnect){mock.cancelConnect=false;throw Object.assign(new Error('cancelled'),{code:4001})}return[accounts[0]];case'eth_accounts':return[accounts[0]];case'eth_chainId':return mock.chain;case'wallet_switchEthereumChain':if(mock.switchNeedsAdd){mock.switchNeedsAdd=false;throw Object.assign(new Error('unknown chain'),{code:4902})}mock.chain=q.params[0].chainId;return null;case'wallet_addEthereumChain':mock.chain=q.params[0].chainId;return null;case'wallet_revokePermissions':return null;case'eth_sendTransaction':if(mock.rejectSend){mock.rejectSend=false;throw Object.assign(new Error('cancelled'),{code:4001})}mock.lastTx=q.params[0];return hash;default:throw new Error('Unrecognized validation wallet request '+q.method)}}};
  window.__validationProvider=provider;
  const announce=(uuid,name)=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info:{uuid,name,rdns:uuid,icon:''},provider}}));
  window.__announceValidationWallet=announce;announce('validation.a','Validation wallet A');
 },{accounts,hash});
 await page.getByRole('button',{name:'Connect wallet',exact:true}).click();await page.waitForFunction(()=>wState.textContent.includes('Connection cancelled'));
 pass('Connection rejection','Cancellation returns to an enabled Connect wallet control');
 await page.evaluate(()=>__announceValidationWallet('validation.b','Validation wallet B'));
 await page.getByRole('button',{name:'Connect wallet',exact:true}).click();
 assert(await page.getByRole('button',{name:'Validation wallet A',exact:true}).isVisible());assert(await page.getByRole('button',{name:'Validation wallet B',exact:true}).isVisible());
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.getByRole('button',{name:'Connect wallet',exact:true}).click();await page.getByRole('button',{name:'Validation wallet A',exact:true}).click();
 await page.waitForFunction(()=>__raid.Wal.addr&&__raid.Wal.chain==='0xaa36a7'&&!__raid.Wal.busy);
 const walletCalls=await page.evaluate(()=>__walletMock.requests.map(r=>r.method));assert(walletCalls.includes('wallet_switchEthereumChain')&&walletCalls.includes('wallet_addEthereumChain'));
 pass('EIP-6963 selection and network recovery','Named choices, Cancel, connect, switch and add-Sepolia paths work with a synthetic provider');
 fixture.enabled=true;
 await page.evaluate(()=>__raid.refresh(true));
 await page.waitForFunction(()=>__raid.S.boss?.id===51);
 await page.evaluate(()=>__raid.refresh(true));
 await page.waitForFunction(()=>__raid.S.boss?.id===51&&document.querySelectorAll('#board tr').length===3&&document.querySelectorAll('#hall .card').length===23,null,{timeout:30000});
 assert.equal(await page.locator('#board tr').count(),3);assert.equal(await page.locator('.rank.r1,.rank.r2,.rank.r3').count(),3);
 assert.equal(await page.locator('#hall .card').count(),23);assert.match(await page.locator('#hallMore').innerText(),/28 more/);
 pass('Populated board and hall','Three medal ranks, fallen/fled plaques, claim controls and paging button render');
 await page.setViewportSize({width:1280,height:940});
 await page.evaluate(()=>{__raid.S.past=__raid.S.past.slice(0,3);__testRender()});await shots(page,'populated-1280');
 await page.setViewportSize({width:390,height:844});await page.locator('#hall').scrollIntoViewIfNeeded();await shots(page,'plaques-390',false);
 const table=await page.locator('.tablebox').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));assert(table.scroll>table.client);await page.locator('.tablebox').evaluate(el=>el.scrollLeft=0);await page.locator('.tablebox').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('.tablebox').scrollLeft>0);
 pass('Phone leaderboard','All columns remain in an independently scrollable, focusable region');
 await page.evaluate(()=>scrollTo(0,0));
 await page.setViewportSize({width:1280,height:940});
 await page.mouse.move(400,350);await page.waitForTimeout(60);assert(await page.locator('#arena').evaluate(el=>el.style.getPropertyValue('--scene-x')));await page.mouse.move(0,0);assert.equal(await page.locator('#arena').evaluate(el=>el.style.getPropertyValue('--scene-x')),'');
 pass('Mouse parallax','Fine-pointer movement offsets scenery and leaving resets it');
 await page.evaluate(()=>{__raid.S.status={measurement:{rpmMilli:0,freshness:'fresh'}};__raid.S.lastStatusAt=Date.now();__testRender()});
 assert.equal(await page.locator('.wheelspin').evaluate(el=>el.getAnimations().length),0);
 await page.evaluate(()=>{__raid.S.status.measurement.rpmMilli=76000;__raid.S.lastStatusAt=Date.now();__testRender()});
 assert(await page.locator('#arena').evaluate(el=>el.classList.contains('running')));assert.equal(await page.locator('.wheelspin').evaluate(el=>el.getAnimations().length),1);
 pass('Wheel state','Wheel and legs animate only with a fresh running status');
 for(let i=0;i<2;i++){
  await page.evaluate(()=>{__raid.S.boss.damage+=125;__testRender()});await page.waitForFunction(()=>arena.classList.contains('impact'));assert(await page.locator('#pops .pop').count()>0);
  if(i===0){await page.waitForTimeout(110);await shots(page,'hit-effect',false)}
  await page.waitForFunction(()=>!arena.classList.contains('impact'));
  assert.equal(await page.locator('#arena').evaluate(el=>el.getAnimations().filter(a=>a.animationName==='enter'&&a.playState==='running').length),0,'arena entrance must not replay after a hit');
 }
 pass('Repeated hit feedback','Both strikes restart short shake, slash, sparks and damage numbers, without replaying the entrance');
 await page.evaluate(()=>{__raid.S.status.measurement.rpmMilli=0;__raid.S.lastStatusAt=Date.now();__testRender()});assert.match(await page.locator('#chargeHint').innerText(),/He's resting/);
 await page.evaluate(()=>{__raid.S.lastStatusAt=Date.now()-46000;__testRender()});assert.match(await page.locator('#chargeHint').innerText(),/Wheel status unavailable/);
 await page.evaluate(()=>{__raid.S.status.measurement.rpmMilli=76000;__testRender()});assert(!(await page.locator('#arena').evaluate(el=>el.classList.contains('running'))));
 pass('45-second status expiry','Cached readings become unknown, refresh the resting hint and stop the wheel');
 await page.evaluate(()=>{__raid.S.lastStatusAt=Date.now();__testRender()});
 await page.locator('#actions .btn.charge').click();await page.waitForFunction(()=>__raid.S.busy);assert(await page.locator('#actions .btn.charge').isDisabled());await page.waitForFunction(()=>!__raid.S.busy&&document.querySelector('#actions .done'),null,{timeout:20000});
 const tx=await page.evaluate(()=>__walletMock.lastTx);assert.equal(tx.to,RAID);assert.equal(tx.data,'0x55161913');assert.equal(tx.chainId,'0xaa36a7');assert.equal(tx.value,'0x0');
 pass('Charge interaction','Correct contract, chain and calldata; pending lock and confirmed charged state (mock wallet/receipt)');
 fixture.lastCharge=0;await page.evaluate(()=>{__walletMock.rejectSend=true;return __raid.refresh()});
 await page.locator('#actions .btn.charge').click();await page.waitForFunction(()=>toast.textContent==='Cancelled in the wallet.'&&!__raid.S.busy);pass('Transaction rejection','Readable cancellation toast and enabled retry');
 fixture.queued=true;await page.evaluate(()=>__raid.refresh());await page.waitForFunction(()=>__raid.S.incoming>0&&__raid.S.applyable===1&&parseFloat(hpGhost.style.width)>parseFloat(hpFill.style.width));
 const bars=await page.evaluate(()=>({ghost:parseFloat(hpGhost.style.width),fill:parseFloat(hpFill.style.width)}));assert(bars.ghost>bars.fill&&bars.fill>0);
 await page.getByRole('button',{name:'Apply 1 settled hit',exact:true}).click();await page.waitForFunction(()=>!__raid.S.busy&&__raid.S.applyable===0,null,{timeout:20000});assert.equal((await page.evaluate(()=>__walletMock.lastTx)).data,'0x71d6ddd6'+word(48));
 pass('Apply settled hits and HP ghost','Striped incoming segment remains exposed; correct advance(48) request and confirmed refresh');
 await page.evaluate(()=>__raid.refresh(true));
 await page.locator('#hall .card:has(.f1) .btn').first().click();await page.waitForFunction(()=>!__raid.S.busy&&toast.textContent==='Claim confirmed',null,{timeout:20000});assert((await page.evaluate(()=>__walletMock.lastTx)).data.startsWith('0x379607f5'));assert(fixture.claims.size===1);
 await page.waitForFunction(()=>document.getElementById('hall').textContent.includes('· yours'));pass('Claim trophy','Eligible plaque sends the correct claim selector and boss id, then refreshes owned state');
 await page.evaluate(()=>__raid.refresh(true));fixture.requests=[];
 await page.locator('#hallMore').click();await page.waitForFunction(()=>document.querySelectorAll('#hall .card').length===47);assert.equal(await page.locator('#hall .card').count(),47);assert.match(await page.locator('#hallMore').innerText(),/4 more/);assert.deepEqual(fixture.requests.slice(-2),[[51,24],[27,24]]);
 fixture.requests=[];await page.locator('#hallMore').click();await page.waitForFunction(()=>document.querySelectorAll('#hall .card').length===51);assert.equal(await page.locator('#hall .card').count(),51);assert.equal(await page.locator('#hallMore').count(),0);assert.deepEqual(fixture.requests.slice(-3),[[51,24],[27,24],[3,4]]);
 pass('Show older bosses','24 → 48 → 72, newest-first 24/24/4 RPC pages, all 51 past bosses reachable, button ends');
 fixture.hideNewest=true;await page.evaluate(()=>{__raid.S.hallN=24;return __raid.refresh(true)});await page.waitForFunction(()=>document.querySelectorAll('#hall .card').length===0&&document.getElementById('hallMore'));assert.equal(await page.locator('#hall .card').count(),0);assert.equal(await page.locator('#hallMore').count(),1);assert(!((await page.locator('#hall').innerText()).includes('No boss has fallen')));await page.locator('#hallMore').click();await page.waitForFunction(()=>document.querySelectorAll('#hall .card').length===24);assert.equal(await page.locator('#hall .card').count(),24);
 pass('Empty newest hall page','Older history remains reachable when the newest page has no completed bosses');
 await page.evaluate(()=>{__walletMock.chain='0x1';__raid.Wal.chain='0x1';__testRender()});await page.getByRole('button',{name:'Switch to Sepolia',exact:true}).click();await page.waitForFunction(()=>__raid.Wal.chain==='0xaa36a7');assert.equal(await page.evaluate(()=>__raid.Wal.chain),'0xaa36a7');
 await page.getByRole('button',{name:'Disconnect',exact:true}).click();await page.waitForFunction(()=>!__raid.Wal.addr);pass('Wrong-chain and disconnect','Switch control recovers and disconnect returns to Connect');
 await page.evaluate(()=>scrollTo(0,0));await page.keyboard.press('Tab');await page.locator('#wBtns .btn').focus();await page.keyboard.press('Tab');
 const focused=await page.evaluate(()=>({tag:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outlineWidth}));assert.notEqual(focused.outline,'0px');await shots(page,'keyboard-focus',false);pass('Keyboard focus','Native controls participate in Tab order with a visible 3px ring');
 // Width checks on populated content, not just the empty initial page.
 for(const width of [320,390,800,1280,1440]){await page.setViewportSize({width,height:844});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow,`overflow at ${width}`)}pass('Responsive widths','No page overflow at 320, 390, 800, 1280 or 1440; populated content');
 await page.setViewportSize({width:1280,height:940});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),1280);await page.evaluate(()=>document.documentElement.style.fontSize='');pass('200% text enlargement','1280 px viewport reflows without horizontal scroll (text resize, not browser-native zoom)');
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{__raid.S.status.measurement.rpmMilli=76000;__raid.S.lastStatusAt=Date.now();__testRender()});
 assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);await page.mouse.move(400,400);assert.equal(await page.locator('#arena').evaluate(el=>el.style.getPropertyValue('--scene-x')),'');pass('Reduced motion','Zero running animations and no parallax, including a running wheel');
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});const touchPage=await touch.newPage();await bridge(touchPage);await touchPage.goto(base,{waitUntil:'load'});await touchPage.locator('#arena').dispatchEvent('pointermove',{pointerType:'mouse',clientX:300,clientY:300});assert.equal(await touchPage.locator('#arena').evaluate(el=>el.style.getPropertyValue('--scene-x')),'');await touch.close();pass('Touch parallax guard','Scenery remains still on a coarse-pointer phone context');
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);pass('Console and remote resources','No page errors, error console messages or failed live requests');
 await writeFile('test/scratch/interaction-results.json',JSON.stringify({live:{...live,boss:undefined,art:undefined},results,errors,failures},null,2));
 await context.close();
}finally{await close()}
