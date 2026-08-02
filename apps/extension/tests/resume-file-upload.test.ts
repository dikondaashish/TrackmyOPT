import assert from 'node:assert/strict';
import {
    MAX_RESUME_FILE_SIZE_BYTES,
    arrayBufferToBase64,
    describeOversizedResumeFile,
    describeUnsupportedResumeFile,
    isResumeFileSizeAllowed,
    isSupportedResumeFileName,
} from '../src/resume-file-upload';

/* -------------------------------------------------------------- file type */

for (const name of ['resume.pdf', 'Resume.PDF', 'my-resume.docx', 'notes.txt']) {
    assert.ok(isSupportedResumeFileName(name), `${name} should be supported`);
}
for (const name of ['resume.doc', 'resume.pages', 'resume.rtf', 'resume', '']) {
    assert.ok(!isSupportedResumeFileName(name), `${name} should not be supported`);
}
// A stray "not.pdf.txt" style name is legitimately a .txt file — extension
// checks only the suffix, matching the backend's own filename-based routing.
assert.ok(isSupportedResumeFileName('archive.pdf.txt'));

assert.match(describeUnsupportedResumeFile('resume.doc'), /resume\.doc/);
assert.match(describeUnsupportedResumeFile('resume.doc'), /PDF, DOCX, or TXT/);

/* -------------------------------------------------------------- file size */

assert.ok(isResumeFileSizeAllowed(1));
assert.ok(isResumeFileSizeAllowed(MAX_RESUME_FILE_SIZE_BYTES));
assert.ok(!isResumeFileSizeAllowed(0), 'an empty file is not a usable upload');
assert.ok(!isResumeFileSizeAllowed(MAX_RESUME_FILE_SIZE_BYTES + 1));
assert.ok(!isResumeFileSizeAllowed(-5));

assert.match(describeOversizedResumeFile(11 * 1024 * 1024), /11\.0MB/);
assert.match(describeOversizedResumeFile(11 * 1024 * 1024), /maximum is 10MB/);

/* -------------------------------------------------------------- encoding */

// Node's test bundle runs without a browser btoa unless the runtime provides
// one; Node 18+ (this repo targets node18 in scripts/run-unit-tests.mjs)
// exposes a global btoa, matching what Chrome gives sidepanel.ts.
{
    const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const encoded = arrayBufferToBase64(bytes.buffer);
    assert.equal(encoded, Buffer.from(bytes).toString('base64'));
    assert.equal(Buffer.from(encoded, 'base64').toString('utf-8'), 'Hello');
}

// A buffer larger than the chunk size must round-trip correctly — this is the
// exact bug class the chunked loop exists to avoid (String.fromCharCode with
// a huge spread argument overflows the call stack).
{
    const size = 200_000;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i += 1) bytes[i] = i % 256;
    const encoded = arrayBufferToBase64(bytes.buffer);
    const roundTripped = new Uint8Array(Buffer.from(encoded, 'base64'));
    assert.equal(roundTripped.length, size);
    assert.deepEqual(Array.from(roundTripped.slice(0, 10)), Array.from(bytes.slice(0, 10)));
    assert.deepEqual(roundTripped.slice(-10), bytes.slice(-10));
}

console.log('resume-file-upload: type/size validation and base64 round-trip verified');
