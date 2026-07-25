// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  runGuidedNavigation,
} from '../../../extension/src/guided-autopilot';

describe('Guided Autopilot navigation boundary', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clicks an exact safe Next control', () => {
    document.body.innerHTML = '<button type="button">Next</button>';
    const button = document.querySelector('button')!;
    const clicked = vi.fn();
    button.addEventListener('click', clicked);

    expect(runGuidedNavigation(document)).toMatchObject({
      outcome: 'advanced',
      label: 'Next',
    });
    expect(clicked).toHaveBeenCalledOnce();
  });

  it('does not click an ambiguous submit-typed Next control', () => {
    document.body.innerHTML = '<form><button type="submit">Next</button></form>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);

    expect(runGuidedNavigation(document).outcome).toBe('no_safe_control');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('never clicks final Submit controls', () => {
    document.body.innerHTML =
      '<main><h1>Review and submit</h1><button type="submit">Submit application</button></main>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);

    expect(runGuidedNavigation(document).outcome).toBe('stopped_final_step');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('stops at Review instead of clicking it', () => {
    document.body.innerHTML = '<button type="button">Review application</button>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);

    expect(runGuidedNavigation(document).outcome).toBe('stopped_review_step');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('pauses while a visible required answer is empty', () => {
    document.body.innerHTML =
      '<label>Why us?<textarea required></textarea></label><button>Next</button>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);

    expect(runGuidedNavigation(document)).toMatchObject({
      outcome: 'blocked_required_fields',
      unansweredRequiredCount: 1,
    });
    expect(clicked).not.toHaveBeenCalled();
  });

  it('clicks a non-submit Done control inside a form', () => {
    document.body.innerHTML =
      '<form><button type="button">Done</button></form>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);

    expect(runGuidedNavigation(document).outcome).toBe('advanced');
    expect(clicked).toHaveBeenCalledOnce();
  });

  it('does not click a submit-typed Done control', () => {
    document.body.innerHTML =
      '<form><button type="submit">Done</button></form>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);

    expect(runGuidedNavigation(document).outcome).toBe('stopped_final_step');
    expect(clicked).not.toHaveBeenCalled();
  });
});
