import { describe, expect, it, vi } from 'vitest';
import { compileLatexWithRepair } from './compile-latex-with-repair';

describe('compileLatexWithRepair', () => {
    it('repairs up to two times before succeeding', async () => {
        const compile = vi
            .fn()
            .mockResolvedValueOnce({ ok: false, error: 'first' })
            .mockResolvedValueOnce({ ok: false, error: 'second' })
            .mockResolvedValueOnce({ ok: true, pdf: new ArrayBuffer(8), compiler: 'test' });
        const repair = vi
            .fn()
            .mockResolvedValueOnce('fixed-1')
            .mockResolvedValueOnce('fixed-2');

        const result = await compileLatexWithRepair({
            initialLatex: 'broken',
            maxRepairs: 2,
            compile,
            repair,
        });

        expect(result.ok).toBe(true);
        expect(result.finalLatex).toBe('fixed-2');
        expect(result.repaired).toBe(true);
        expect(result.repairAttempts).toBe(2);
        expect(compile).toHaveBeenCalledTimes(3);
    });

    it('stops after max repairs when compile still fails', async () => {
        const compile = vi.fn().mockResolvedValue({ ok: false, error: 'still broken' });
        const repair = vi.fn().mockResolvedValue('fixed');

        const result = await compileLatexWithRepair({
            initialLatex: 'broken',
            maxRepairs: 2,
            compile,
            repair,
        });

        expect(result.ok).toBe(false);
        expect(result.repairAttempts).toBe(2);
        expect(compile).toHaveBeenCalledTimes(3);
    });
});
