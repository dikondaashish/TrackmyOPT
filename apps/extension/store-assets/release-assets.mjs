// Render real packaged tour components with fictional data in Store artboards.
// Open the local page and click Export all. No account data or external requests.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const requireExtension = createRequire(new URL('../package.json', import.meta.url));
const requireWeb = createRequire(new URL('../../web/package.json', import.meta.url));
const { build } = requireExtension('esbuild');
const sharp = requireWeb('sharp');
const output = new URL('./output/0.2.1/', import.meta.url);
await mkdir(output, { recursive: true });
const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const bundled = await build({stdin:{contents:`import {chapterMarkup} from './tour-content'; window.chapterMarkup=chapterMarkup;`,resolveDir:sourceRoot,loader:'ts'},bundle:true,write:false,format:'iife'});
const css = await readFile(new URL('../public/tour.css',import.meta.url),'utf8');
const tokens = await readFile(new URL('../dist/tokens.css',import.meta.url),'utf8');
const logo = 'data:image/png;base64,'+(await readFile(new URL('../public/icons/icon128.png',import.meta.url))).toString('base64');
const names=['01-overview.png','02-prefill.png','03-resume.png','04-job-tracker.png','05-opt-timeline.png','promo-small-440x280.png','promo-marquee-1400x560.png'];
const html = `<!doctype html><html><head><meta charset="utf-8"><title>TrackMyOPT release graphics</title><style id="design">${tokens}\n${css}
body{margin:0;background:#e9eef6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}#controls{padding:18px;position:sticky;top:0;background:#f3f6fb;z-index:10}#controls button{padding:12px 20px;background:#174da8;color:#f8fbff;border:0;border-radius:9px;font:600 16px system-ui}#controls a{margin-left:20px}#status{margin-left:20px}.asset{position:relative;isolation:isolate;width:1280px;height:800px;overflow:hidden;background:#edf3fc;color:#122441;padding:54px;box-sizing:border-box;margin:25px 0;contain:layout}.store-brand{display:flex;gap:14px;align-items:center;font:700 25px system-ui;color:#204b89}.store-brand img{width:42px;height:42px}.store-copy{position:absolute;top:160px;left:54px;width:420px}.store-copy h1{font:750 59px/1.06 system-ui;letter-spacing:-2.8px;margin:0}.store-copy p{font:400 23px/1.5 system-ui;color:#485e7c;margin-top:25px;max-width:370px}.store-tag{display:block;color:#24756d;font:650 16px system-ui;margin-top:32px}.store-ui{position:absolute;left:517px;top:121px;width:710px;height:605px;background:#f8fafd;border:1px solid #cbd9ea;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px #203d6720}.store-bar{height:43px;padding:12px 18px;background:#dfe9f7;font:500 13px system-ui;color:#58708b;box-sizing:border-box}.store-stage{padding:24px}.store-stage h2{font-size:28px!important;line-height:1.2!important}.store-stage .application-layout{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}.store-stage .application-layout form{padding:12px}.store-stage .application-layout .fields{grid-template-columns:1fr}.store-stage .application-layout .wide{grid-column:auto}.store-stage .application-layout h2{font-size:23px!important}.store-stage .application-layout .sample-note{margin-top:8px}.store-stage .application-layout .fields input{height:37px}.store-stage .application-layout .fields{gap:8px}.store-stage .application-note{margin-top:12px}.store-stage .application-note p,.store-stage .sample-note{font-size:14px!important}.store-stage .application-note .badge{display:none}.store-stage input{height:46px;font-size:16px}.store-stage .fields{gap:12px}.store-stage .primary{font-size:15px;padding:12px 18px}.store-stage .resume-layout{grid-template-columns:1fr 1fr;gap:18px}.store-stage .resume-paper{padding:22px}.store-stage .resume-paper p{font-size:15px;line-height:1.6}.store-stage .resume-controls h2{font-size:23px!important}.store-stage .resume-controls p{font-size:16px}.store-footer{position:absolute;bottom:28px;left:54px;right:54px;display:flex;justify-content:space-between;font:500 14px system-ui;color:#56718f}.overview .store-copy{width:405px}.overview .store-copy h1{font-size:61px}.overview .welcome-demo{min-height:440px;background:#e4eefc}.overview .welcome-demo h2{font-size:46px!important}.overview .journey p{font-size:19px!important}.asset.promo{padding:32px;color:#f5f8ff;background:#164997}.promo .store-brand{color:#f5f8ff}.promo h1{font:750 38px/1.07 system-ui;letter-spacing:-1.4px;color:#f5f8ff;margin:24px 0 0}.promo p{margin-top:18px;font:500 15px system-ui;color:#d3e3fc}.promo-small{width:440px;height:280px}.promo-small .store-brand{font-size:19px}.promo-small .store-brand img{width:36px;height:36px}.promo-marquee{width:1400px;height:560px;padding:58px!important}.promo-marquee h1{font-size:70px;width:700px;margin-top:64px}.promo-marquee p{font-size:23px}.orbit{position:absolute;right:70px;top:145px;width:330px;height:280px;border:2px solid #83b3e8;border-radius:28px;transform:rotate(-5deg);background:#edf4ff;color:#174780;padding:35px;box-sizing:border-box}.orbit span{display:block;font:700 30px system-ui;margin:13px}.orbit b{font:500 17px system-ui;color:#4c6c92}
</style></head><body><div id="controls"><button id="export">Export all 7 PNGs</button><span id="status">Real tour UI; fictional examples; no live service calls.</span></div><main id="assets"></main><script>${bundled.outputFiles[0].text}</script><script>
const names=${JSON.stringify(names)};
const stories=[
 ['Your job search.<br>Your OPT timeline.','Bring application prep, job tracking, and OPT tools into your browser.','One place to start',0,'overview'],
 ['Less typing.<br>More control.','Prefill supported empty fields, then review every answer before continuing.','You review. You submit.',1,''],
 ['A resume for<br>the role ahead.','Prepare a job-specific resume from your experience and the job description.','Review facts before using AI output',2,''],
 ['Save the role.<br>Keep the context.','Keep job details together and follow your application progress in TrackMyOPT.','Saving a job does not apply for it',3,''],
 ['Keep your<br>timeline in view.','Use OPT and STEM tools with the dates and employment history you save.','Confirm requirements with your DSO',4,'']
];
const logo=${JSON.stringify(logo)};
stories.forEach(([title,copy,tag,chapter,cls],i)=>{
 const a=document.createElement('section');a.className='asset '+cls;a.dataset.name=names[i];
 a.innerHTML='<div class="store-brand"><img src="'+logo+'" alt="">TrackMyOPT</div><div class="store-copy"><h1>'+title+'</h1><p>'+copy+'</p><span class="store-tag">'+tag+'</span></div><div class="store-ui"><div class="store-bar">TrackMyOPT · Product tour · Sample data</div><div class="store-stage">'+window.chapterMarkup(chapter)+'</div></div><div class="store-footer"><span>Chrome extension · Account required · Plan limits apply</span><span>0'+(i+1)+' / 05</span></div>';
 document.querySelector('#assets').append(a);
 if(i===1){const vals=['Alex','Taylor','alex@example.test','Boston'];a.querySelectorAll('input').forEach((el,j)=>{el.value=vals[j]||'';el.setAttribute('value',el.value);});a.querySelector('select').value='United States';a.querySelectorAll('option').forEach(o=>{if(o.textContent==='United States')o.setAttribute('selected','selected');else o.removeAttribute('selected')});}
 if(i===3){a.querySelector('#job-stage').textContent='Wishlist';a.querySelector('#demo-action').textContent='Mark sample as Applied';}
});
['small','marquee'].forEach((size,j)=>{const a=document.createElement('section');a.className='asset promo promo-'+size;a.dataset.name=names[5+j];a.innerHTML='<div class="store-brand"><img src="'+logo+'" alt="">TrackMyOPT</div><h1>Less repetition.<br>More possibility.</h1><p>Your application companion in Chrome.</p>'+(j?'<div class="orbit"><b>YOUR NEXT STEP</b><span>Prepare</span><span>Review</span><span>Track</span></div>':'');document.querySelector('#assets').append(a)});
document.querySelector('#export').onclick=async()=>{try{
 const css=document.querySelector('#design').textContent;
 for(const a of document.querySelectorAll('.asset')){
  const w=a.offsetWidth,h=a.offsetHeight;
  const clone=a.cloneNode(true);clone.style.margin='0';
  const xml=new XMLSerializer().serializeToString(clone);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>'+css+'</style>'+xml+'</div></foreignObject></svg>';
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#edf3fc';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0);
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
  const response=await fetch('/save/'+a.dataset.name,{method:'POST',body:blob});if(!response.ok)throw new Error('Save failed');
 }
 document.querySelector('#status').textContent='Export complete: 7 opaque PNGs saved at required dimensions.';
}catch(e){document.querySelector('#status').textContent='Export error: '+e.message}};
</script></body></html>`;
const server=createServer(async(req,res)=>{
 if(req.method==='POST' && req.url.startsWith('/save/')){const name=req.url.slice(6);if(!names.includes(name)){res.writeHead(400);res.end();return}const chunks=[];for await(const c of req)chunks.push(c);await sharp(Buffer.concat(chunks)).flatten({background:'#edf3fc'}).removeAlpha().png().toFile(fileURLToPath(new URL(name,output)));res.end('ok');return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
});
server.listen(59766,'127.0.0.1',()=>console.log('Store artboards: http://127.0.0.1:59766'));
