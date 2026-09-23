import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createJobTrackerWidget, setJobTrackerWidgetHost, openResumePanel, disconnectWidgetViewportObserver, type JobTrackerWidgetHost } from '../src/job-portal-tracker-widget';
import { SIDEBAR_SHELL_CSS } from '../src/job-portal-sidebar-shell';
const { JSDOM } = createRequire(resolve('package.json'))('jsdom');

function withWidget(run: (root: HTMLElement, win: Window) => void, minimized = false) {
  const dom = new JSDOM('<!doctype html><body></body>', {url:'https://example.com/jobs/test',pretendToBeVisual:true});
  const win = dom.window;
  const frames: Array<() => void> = [];
  const overrides = {
    window:win, document:win.document, location:win.location, sessionStorage:win.sessionStorage,
    HTMLElement:win.HTMLElement, getComputedStyle:win.getComputedStyle.bind(win),
    requestAnimationFrame:(cb: () => void) => frames.push(cb),
    ResizeObserver:class { observe() {} disconnect() {} },
    chrome:{runtime:{getURL:(path: string)=>'https://example.com/'+path,sendMessage:()=>{}},storage:{local:{get:async()=>({}),set:async()=>{}}}},
  };
  const old = Object.fromEntries(Object.keys(overrides).map(key=>[key,(globalThis as any)[key]]));
  Object.assign(globalThis,overrides);
  const noop = () => {};
  setJobTrackerWidgetHost({trackWidgetAnalyticsOnce:noop,trackWidgetAnalytics:noop,
    getArtifactStaleReason:()=>null,generatedResumeFor:()=>undefined,
    reconcileArtifactAvailabilityOnWidgetMount:async()=>{},paintGuidedStateUi:noop,
    trackerApplicationIdFor:()=>undefined,
    rememberTrackerApplicationId:noop,
  } as unknown as JobTrackerWidgetHost);
  try {
    const root=createJobTrackerWidget({role_title:'Engineer',company_name:'Example',job_url:'https://example.com/jobs/test'},minimized?'minimized':'expanded');
    win.document.body.append(root);
    frames.splice(0).forEach(cb=>cb());
    run(root,win);
  } finally {
    disconnectWidgetViewportObserver();
    win.close();
    Object.assign(globalThis,old);
  }
}

const button = (root: HTMLElement, label: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

test('sidebar shell keeps reference dimensions, a full frame, and reduced motion',()=>{
  assert.match(SIDEBAR_SHELL_CSS,/width:min\(360px,calc\(100vw - 32px\)\)/);
  assert.match(SIDEBAR_SHELL_CSS,/height:calc\(100dvh - 32px\)/);
  assert.match(SIDEBAR_SHELL_CSS,/border:1px solid/);
  assert.match(SIDEBAR_SHELL_CSS,/border-radius:14px/);
  assert.doesNotMatch(SIDEBAR_SHELL_CSS,/border-right:none/);
  assert.match(SIDEBAR_SHELL_CSS,/prefers-reduced-motion:reduce/);
});

test('expanded rail is inset and stays flex with separate scrolling body and footer',()=>withWidget(root=>{
  assert.equal(root.style.top,'16px');assert.equal(root.style.right,'16px');
  assert.equal(root.querySelector<HTMLElement>('.tmo-job-widget-card')!.style.display,'flex');
  const body=root.querySelector<HTMLElement>('.tmo-job-widget-scroll-body')!;
  assert.equal(body.style.overflowY,'auto');assert.equal(parseFloat(body.style.minHeight),0);
  assert.equal(root.querySelector('.tmo-job-widget-footer')!.parentElement,body.parentElement);
  assert.equal(body.contains(root.querySelector('.tmo-job-widget-footer')),false);
  assert.match(root.querySelector('img')!.src,/icons\/logo.gif$/);
}));

test('collapse and keyboard reopen preserve launcher position and inset geometry',()=>withWidget((root,win)=>{
  win.sessionStorage.setItem('tmo_job_widget_pos',JSON.stringify({top:180}));
  button(root,'Minimize panel').click();
  const open=button(root,'Open or vertically move TrackMyOPT job assistant');
  assert.equal(root.style.right,'0px');assert.equal(root.style.top,'180px');
  assert.equal(win.document.activeElement,open);assert.equal(open.getAttribute('aria-expanded'),'false');
  open.click();
  assert.equal(root.style.right,'16px');assert.equal(root.style.top,'16px');
  assert.equal(open.getAttribute('aria-expanded'),'true');
  assert.equal(win.document.activeElement,button(root,'Minimize panel'));
  win.dispatchEvent(new (win as any).Event('resize'));
  assert.equal(root.style.right,'16px');
  assert.equal(JSON.parse(win.sessionStorage.getItem('tmo_job_widget_pos')!).top,180);
}));

test('Settings retains minimize; Escape returns to tools then collapses with focus',()=>withWidget((root,win)=>{
  button(root,'Settings').click();
  assert.equal(win.document.activeElement,button(root,'Back'));
  assert.equal(button(root,'Minimize panel').style.display,'flex');
  root.dispatchEvent(new (win as any).KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(win.document.activeElement,button(root,'Settings'));
  assert.equal(root.dataset.collapsed,'false');
  root.dispatchEvent(new (win as any).KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(root.dataset.collapsed,'true');
}));

test('minimized default opens the same inset rail',()=>withWidget(root=>{
  assert.equal(root.dataset.collapsed,'true');
  button(root,'Open or vertically move TrackMyOPT job assistant').click();
  assert.equal(root.style.right,'16px');assert.equal(root.dataset.collapsed,'false');
},true));

test('generated resume results mount inside scroll area, not below fixed footer',()=>withWidget(root=>{
  const card=root.querySelector<HTMLElement>('.tmo-job-widget-card')!;
  openResumePanel(card,{role_title:'Engineer',company_name:'Example',job_url:'https://example.com/jobs/test'},'resume','tech','Synthetic description');
  const panel=card.querySelector('.tmo-resume-panel');
  assert.ok(panel);
  assert.equal(panel.parentElement,card.querySelector('.tmo-job-widget-scroll-body'));
}));

test('application help is keyboard reachable and Escape dismisses help without minimizing',()=>withWidget((root,win)=>{
  const help=button(root,'About application tools');
  const detail=win.document.getElementById(help.getAttribute('aria-controls')!)!;
  assert.equal(detail.hidden,true);
  help.focus();
  assert.equal(detail.hidden,false);
  assert.equal(help.getAttribute('aria-expanded'),'true');
  help.dispatchEvent(new (win as any).KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(detail.hidden,true);
  assert.equal(root.dataset.collapsed,'false');
  help.click();assert.equal(detail.hidden,false);
  help.click();assert.equal(detail.hidden,true);
}));

test('private answers explain inclusion in Prefill without a separate approval step',()=>withWidget(root=>{
  const toggle=button(root,'Private answers (included in Prefill)');
  const body=root.querySelector<HTMLElement>('#tmo-private-answers-body')!;
  assert.equal(toggle.getAttribute('aria-expanded'),'false');
  assert.equal(body.hidden,true);
  toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(body.hidden,false);
  toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(body.hidden,true);
}));

test('tracker status distinguishes Wishlist and Applied, keeping the button label truthful',()=>withWidget((root,win)=>{
  for(const status of ['Wishlist','Applied']) {
    root.dispatchEvent(new (win as any).CustomEvent('tmo-tracker-saved',{detail:{jobUrl:'https://example.com/jobs/test',status,id:'mock'}}));
    assert.match(root.querySelector('.tmo-sidebar-job')!.textContent!,new RegExp(status));
    assert.match(root.querySelector('.tmo-sidebar-tracker')!.textContent!,/View in tracker/);
  }
}));

test('job title gets a full-width heading; decorative gradients do not compete with Prefill',()=>withWidget(root=>{
  assert.equal(root.querySelector('[role="heading"]')?.textContent,'Engineer');
  assert.doesNotMatch(root.querySelector('.tmo-sidebar-tracker')!.getAttribute('style')!,/gradient/);
  assert.equal(root.querySelector<HTMLElement>('.tmo-prefill-button .tmo-action-sublabel')!.style.display,'none');
  for(const action of root.querySelectorAll('.tmo-sidebar-action')) assert.doesNotMatch(action.innerHTML,/gradient/);
}));
