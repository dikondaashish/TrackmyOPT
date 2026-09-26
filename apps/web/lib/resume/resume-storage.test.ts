import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { createResumeStorage } from './resume-storage';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe('restricted resume storage', () => {
    it('hydrates and edits without throwing when accessing localStorage is denied', () => {
        vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
            throw new DOMException('Access to storage is not allowed', 'SecurityError');
        });
        const storage = createResumeStorage<{ text: string }>();
        const store = createStore(persist(() => ({ text: '' }), { name: 'test-resume', storage }));
        expect(store.persist.hasHydrated()).toBe(true);
        expect(() => store.setState({ text: 'draft' })).not.toThrow();
        expect(storage.getItem('test-resume')).toMatchObject({ state: { text: 'draft' } });
        storage.removeItem('test-resume');
        expect(storage.getItem('test-resume')).toBeNull();
    });

    it('hydrates despite a damaged saved draft', () => {
        localStorage.setItem('test-resume', '{broken');
        const store = createStore(persist(() => ({ text: '' }), {
            name: 'test-resume', storage: createResumeStorage<{ text: string }>(),
        }));
        expect(store.persist.hasHydrated()).toBe(true);
        store.setState({ text: 'new draft' });
        expect(JSON.parse(localStorage.getItem('test-resume')!).state.text).toBe('new draft');
    });
});
