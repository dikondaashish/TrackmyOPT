import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldActivatePortal } from '../src/portal-activation';
test('unrelated matched board pages stay light while application and unknown paths retain support',()=>{
  for(const path of ['/about','/privacy-policy','/help/article']) assert.equal(shouldActivatePortal('known-job-board:indeed.com',path),false);
  for(const path of ['/viewjob','/jobs','/rc/clk','/unrecognized']) assert.equal(shouldActivatePortal('known-job-board:indeed.com',path),true);
  assert.equal(shouldActivatePortal('ats-portal:lever.co','/example/about'),true);
  assert.equal(shouldActivatePortal(null,'/jobs'),false);
});
