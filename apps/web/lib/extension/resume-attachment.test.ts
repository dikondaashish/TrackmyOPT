import { afterEach, describe, expect, it } from 'vitest';

import { attachGeneratedResume } from '../../../extension/src/easy-apply-engine';

const originalDataTransfer = globalThis.DataTransfer;

class FakeDataTransfer {
  files: File[] = [];
  items = {
    add: (file: File) => {
      this.files.push(file);
    },
  };
}

afterEach(() => {
  document.body.textContent = '';
  Object.defineProperty(globalThis, 'DataTransfer', {
    value: originalDataTransfer,
    configurable: true,
  });
});

function installDataTransfer(): void {
  Object.defineProperty(globalThis, 'DataTransfer', {
    value: FakeDataTransfer,
    configurable: true,
  });
}

const attachment = {
  filename: 'TrackMyOPT-resume.pdf',
  pdfBase64: 'JVBERi0xLjQK',
};

describe('generated resume attachment DOM boundary', () => {
  it('attaches only to an empty Resume/CV PDF input', () => {
    installDataTransfer();
    const form = document.createElement('form');
    form.innerHTML = [
      '<label for="resume">Resume/CV</label><input id="resume" type="file" accept="application/pdf">',
      '<label for="cover">Cover letter</label><input id="cover" type="file" accept="application/pdf">',
    ].join('');
    const resume = form.querySelector('#resume') as HTMLInputElement;
    Object.defineProperty(resume, 'files', {
      value: [],
      writable: true,
      configurable: true,
    });

    expect(attachGeneratedResume(form, attachment)).toBe('attached');
    expect(resume.files).toHaveLength(1);
    expect(resume.files?.[0]?.name).toBe('TrackMyOPT-resume.pdf');
    expect(
      (form.querySelector('#cover') as HTMLInputElement).files
    ).toHaveLength(0);
  });

  it('leaves an existing Resume/CV upload unchanged', () => {
    installDataTransfer();
    const form = document.createElement('form');
    form.innerHTML =
      '<label for="resume">Resume/CV</label><input id="resume" type="file" accept="application/pdf">';
    const resume = form.querySelector('#resume') as HTMLInputElement;
    const existing = new File(['existing'], 'existing-resume.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(resume, 'files', {
      value: [existing],
      writable: true,
      configurable: true,
    });

    expect(attachGeneratedResume(form, attachment)).toBe('already_present');
    expect(resume.files).toHaveLength(1);
    expect(resume.files?.[0]).toBe(existing);
  });

  it('does not attach a PDF when the Resume/CV input rejects PDF files', () => {
    installDataTransfer();
    const form = document.createElement('form');
    form.innerHTML =
      '<label for="resume">Resume/CV</label><input id="resume" type="file" accept="image/png">';
    const resume = form.querySelector('#resume') as HTMLInputElement;
    Object.defineProperty(resume, 'files', {
      value: [],
      writable: true,
      configurable: true,
    });

    expect(attachGeneratedResume(form, attachment)).toBe('unsupported');
    expect(resume.files).toHaveLength(0);
  });

  it('attaches to a single unlabeled PDF file input near Add Resume', () => {
    installDataTransfer();
    const form = document.createElement('form');
    form.innerHTML = [
      '<div class="form-field">',
      '<label>Add Resume*</label>',
      '<button type="button">Select</button>',
      '<input id="resume-file" type="file" accept=".pdf,.doc,.docx" style="display:none">',
      '</div>',
    ].join('');
    const resume = form.querySelector('#resume-file') as HTMLInputElement;
    Object.defineProperty(resume, 'files', {
      value: [],
      writable: true,
      configurable: true,
    });

    expect(attachGeneratedResume(form, attachment)).toBe('attached');
    expect(resume.files).toHaveLength(1);
    expect(resume.files?.[0]?.name).toBe('TrackMyOPT-resume.pdf');
  });

  it('attaches when the form has exactly one PDF upload and no resume label', () => {
    installDataTransfer();
    const form = document.createElement('form');
    form.innerHTML =
      '<input id="upload" type="file" accept="application/pdf">';
    const resume = form.querySelector('#upload') as HTMLInputElement;
    Object.defineProperty(resume, 'files', {
      value: [],
      writable: true,
      configurable: true,
    });

    expect(attachGeneratedResume(form, attachment)).toBe('attached');
    expect(resume.files).toHaveLength(1);
  });
});
