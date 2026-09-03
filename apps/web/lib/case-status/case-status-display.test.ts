import assert from "node:assert/strict";
import {
  getServiceCenterLabel,
  getServiceCenterLocation,
} from "./case-status-display";

assert.equal(getServiceCenterLabel("IOE9138644807"), "National Benefits Center");
assert.equal(getServiceCenterLocation("IOE9138644807"), "Lee's Summit, MO");
assert.equal(getServiceCenterLabel("YSC1234567890"), "Potomac Service Center");
assert.equal(getServiceCenterLocation("YSC1234567890"), "Arlington, VA");
assert.equal(getServiceCenterLocation("ZZZ1234567890"), null);
