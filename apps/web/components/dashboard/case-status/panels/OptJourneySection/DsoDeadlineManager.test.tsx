import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { DsoDeadlineManager } from './DsoDeadlineManager';
const task = {id:'stem-final-evaluation',title:'Final evaluation',description:'Review with DSO',dueDate:'2027-01-01',status:'open' as const,sourceHref:'https://studyinthestates.dhs.gov/form-i-983-overview'};
const saved={id:'notice-1',source_key:'stem-final-evaluation:2027-01-01',due_date:'2027-01-01',completed_at:'2026-12-30',reminder_state:'cancelled'};
const fetchMock=vi.fn();
beforeEach(()=>{vi.stubGlobal('fetch',fetchMock);fetchMock.mockReset();});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('loads saved completion into the journey after reload',async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({notices:[saved]})});
  render(<DsoDeadlineManager tasks={[task]} caseId="case-1" isPro/>);
  await screen.findByText('0 open · 1 done');
  expect(screen.queryByRole('button',{name:'Save confirmed task'})).not.toBeInTheDocument();
});
it('a changed source date needs new confirmation, not an old completion',async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({notices:[saved]})});
  render(<DsoDeadlineManager tasks={[{...task,dueDate:'2027-02-01'}]} caseId="case-1" isPro/>);
  await waitFor(()=>expect(screen.getByRole('button',{name:'Save confirmed task'})).toBeEnabled());
  expect(screen.getByText('1 open · 0 done')).toBeInTheDocument();
});
it('saves the confirmed task and opt-in reminder through the same organizer',async()=>{
  let notices:unknown[]=[];
  fetchMock.mockImplementation(async(_url,options)=>{
    if(options?.method==='POST') { const body=JSON.parse(options.body);const notice={...body,id:'notice-2',completed_at:null,reminder_state:'pending'};notices=[notice];return {ok:true,json:async()=>({notice})}; }
    return {ok:true,json:async()=>({notices})};
  });
  render(<DsoDeadlineManager tasks={[task]} caseId="case-1" isPro/>);
  await waitFor(()=>expect(screen.getByRole('button',{name:'Save confirmed task'})).toBeEnabled());
  fireEvent.click(screen.getByLabelText('I confirmed this deadline with my DSO'));
  fireEvent.click(screen.getByLabelText('Email me near this deadline'));
  fireEvent.click(screen.getByRole('button',{name:'Save confirmed task'}));
  await screen.findByRole('button',{name:'Mark completed'});
  const post=fetchMock.mock.calls.find(([,o])=>o?.method==='POST');
  expect(JSON.parse(post![1].body)).toMatchObject({source_key:'stem-final-evaluation:2027-01-01',deadline_confirmed:true,email_reminder:true,case_id:'case-1'});
});
