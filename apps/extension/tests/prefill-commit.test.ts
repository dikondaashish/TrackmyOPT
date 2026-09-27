import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyNativeCommit } from '../src/prefill-commit';
import { contactValueSource } from '../src/prefill-contact-source';
import type { ResumeAutofillSnapshotV1 } from '../src/resume-autofill-contract';

for (const condition of ['stable','rejected','remounted','cancelled'] as const) {
  test(`native commit verification handles ${condition} without rewriting`, async () => {
    let calls=0; let current=true;
    const element = {value:'Ada',isConnected:true,ownerDocument:{defaultView:{setTimeout(resolve:()=>void) {
      calls++;
      if(calls===2){if(condition==='rejected')element.value='';if(condition==='remounted')element.isConnected=false;if(condition==='cancelled')current=false;}
      resolve();
    }}}} as unknown as HTMLInputElement;
    assert.equal(await verifyNativeCommit(element,'Ada',()=>current),condition==='stable');
    assert.equal(element.value,condition==='rejected'?'':'Ada');
  });
}
test('source labels reflect resume precedence, fallback, and defaults',()=>{
  const snapshot={contact:{firstName:'Ada',lastName:'',email:'ada@example.test',city:'Boston'}} as ResumeAutofillSnapshotV1;
  assert.equal(contactValueSource(snapshot,'firstName'),'resume');
  assert.equal(contactValueSource(snapshot,'lastName'),'profile');
  assert.equal(contactValueSource(snapshot,'fullName'),'profile_and_resume');
  assert.equal(contactValueSource(snapshot,'location'),'profile_and_resume');
  assert.equal(contactValueSource(snapshot,'postalCode'),'profile');
  assert.equal(contactValueSource(snapshot,'phoneDeviceType'),'default');
});
