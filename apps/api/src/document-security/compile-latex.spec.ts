import { extractMainLatex } from './compile-latex';

describe('extractMainLatex', () => {
  it('reads the main resource content', () => {
    expect(
      extractMainLatex([{ main: true, content: '\\documentclass{article}' }]),
    ).toBe('\\documentclass{article}');
  });

  it('rejects missing or oversized content', () => {
    expect(extractMainLatex([])).toBeNull();
    expect(extractMainLatex([{ main: true, content: '   ' }])).toBeNull();
    expect(
      extractMainLatex([{ main: true, content: 'x'.repeat(200_001) }]),
    ).toBeNull();
  });
});
