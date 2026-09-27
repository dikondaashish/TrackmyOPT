import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const commands = manifest.commands;
assert.deepEqual(Object.keys(commands), ['_execute_action'], 'only the safe popup action receives a shortcut');
assert.equal(commands._execute_action.suggested_key.default, 'Ctrl+Shift+Y');
assert.equal(commands._execute_action.suggested_key.mac, 'Command+Shift+Y');
assert.equal(manifest.action.default_popup, 'popup.html');
assert.ok(!manifest.permissions.includes('commands'), 'the commands manifest key needs no extra permission');
