import {
  ORACLE_TEXT_MAX_TOKEN_LENGTH,
  oracleDescriptionSourceText,
  oracleDescriptionText,
} from './oracle-job-data-helpers';

describe('oracleDescriptionText', () => {
  const blob =
    'kX7DWIkIMMMnhAzeufIZ+DJakTASRk5ziVbKMOhAmTkEcSIOCWZ8I+crkdC3fbFUIiIkQplUg4pgbQIHE';

  it('drops lexer tokens longer than the Oracle Text token limit', () => {
    const text = oracleDescriptionText(
      `<p>Senior Engineer</p><img src="data:image/png;base64,${blob}/${blob}==">`,
    );
    expect(text).not.toContain(blob.toLowerCase().slice(0, 40));
    expect(text).toContain('senior engineer');
    expect(text).toContain('data:image/png;base64,');
  });

  it('treats normalized punctuation as part of the token it joins', () => {
    const joined = `${'a'.repeat(40)}.${'b'.repeat(40)}`;
    expect(oracleDescriptionText(joined).trim()).toBe('');
  });

  it('keeps tokens at the limit and ordinary job text unchanged', () => {
    const atLimit = 'x'.repeat(ORACLE_TEXT_MAX_TOKEN_LENGTH);
    expect(oracleDescriptionText(`${atLimit} c++ m.s. full-time`)).toBe(
      `${atLimit} c++ m+s+ full+time`,
    );
    expect(oracleDescriptionText(null)).toBe('');
  });

  it('leaves the exact-match source text intact', () => {
    expect(oracleDescriptionSourceText(`A ${blob}`)).toBe(
      `a ${blob.toLowerCase()}`,
    );
  });
});
