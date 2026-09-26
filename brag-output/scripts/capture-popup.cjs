const fs=require('fs'),path=require('path');
const base=process.cwd(), out=path.join(base,'brag-output'), assets=path.join(out,'composition/assets');
fs.mkdirSync(assets,{recursive:true});
for(const name of ['icon128.png','logo.gif'])fs.copyFileSync(path.join(base,'apps/extension/public/icons',name),path.join(assets,name));
const skill=path.join(base,'.agents/skills/brag');
fs.copyFileSync(path.join(skill,'assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3'),path.join(assets,'music.mp3'));
fs.copyFileSync(path.join(skill,'assets/sfx/interface/click_003.ogg'),path.join(assets,'click.ogg'));
fs.copyFileSync(path.join(skill,'assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json'),path.join(assets,'music-cues.json'));
const os=require('os');
const cache=path.join(os.homedir(),'.npm/_npx');
const modules=fs.readdirSync(cache).map(d=>path.join(cache,d,'node_modules')).find(d=>fs.existsSync(path.join(d,'hyperframes/package.json')) && fs.existsSync(path.join(d,'esbuild/package.json')));
if(!modules)throw new Error('Run npx hyperframes doctor first to cache the CLI dependencies.');
const browserCache=path.join(os.homedir(),'.cache/puppeteer/chrome-headless-shell');
const browserBinary=process.env.CHROME_PATH || fs.readdirSync(browserCache).filter(d=>d.startsWith('mac_arm-')).sort().reverse().map(d=>path.join(browserCache,d,'chrome-headless-shell-mac-arm64/chrome-headless-shell')).find(p=>fs.existsSync(p));
const esbuild=require(path.join(modules,'esbuild'));
const puppeteer=require(path.join(modules,'puppeteer-core'));
(async()=>{
 const result=await esbuild.build({stdin:{contents:`import {renderHome} from './apps/extension/src/home.ts'; import {buildThemeCss} from './apps/extension/src/design/theme-css.ts'; window.buildThemeCss=buildThemeCss; window.renderHome=renderHome;`,resolveDir:base},define:{'process.env.EXT_TARGET':'"demo"'},bundle:true,write:false,format:'iife',platform:'browser'});
 const browser=await puppeteer.launch({executablePath:browserBinary,headless:true,args:['--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage();page.on('pageerror',e=>console.log('PAGEERROR',e.message));await page.setViewport({width:360,height:900,deviceScaleFactor:3});
 await page.setContent('<html data-tmo-theme="light"><head></head><body><div id="root"></div></body></html>');
 await page.evaluate((logo)=>{
 window.chrome={runtime:{getURL:()=>logo,sendMessage:async()=>({ok:true})},storage:{sync:{get:async()=>({theme:'light'}),set:async()=>{}},local:{get:async()=>({}),set:async()=>{}}},tabs:{query:async()=>[]}};
 window.fetch=async(url)=>({ok:true,json:async()=>String(url).includes('case-status')?{data:{receipt_number:'DEMO CASE',filing_category:'opt',current_status:'Case Was Received'},cases:[{}]}:String(url).includes('status')?{isPremium:true,planName:'pro'}:{}});
 },'data:image/png;base64,'+fs.readFileSync(path.join(assets,'icon128.png')).toString('base64'));
 await page.addScriptTag({content:result.outputFiles[0].text});
 await page.addStyleTag({content:await page.evaluate(()=>window.buildThemeCss())});
 await page.addStyleTag({content:fs.readFileSync(path.join(base,'apps/extension/public/popup.css'),'utf8')});
 await page.evaluate(async()=>{await window.renderHome(document.getElementById('root'),()=>{}); document.querySelectorAll('.page-panel,.compliance,.foot').forEach(e=>e.remove());});
 await page.screenshot({path:path.join(assets,'popup.png'),clip:await page.evaluate(()=>({x:0,y:0,width:360,height:Math.ceil(document.getElementById('root').getBoundingClientRect().bottom+14)}))});

 console.log('Captured actual renderHome popup using fictional case status; no account access.');
 }finally{await browser.close();}
})();
