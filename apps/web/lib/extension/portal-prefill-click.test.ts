import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { prefillSavedPortalLogin } from '../../../extension/src/portal-login-prefill';
import { fillJobPortalLogin } from '../../../extension/src/job-portal-login';

const { JSDOM } = createRequire(import.meta.url)('jsdom');
const credential = {
  email: 'candidate@example.test',
  password: 'Only-for-tests!9A',
};
const markup = `<h1>Create your candidate account</h1><form>
  <label>Email Address<input id="email" type="email"></label>
  <label>Password<input id="password" type="password" autocomplete="new-password"></label>
  <label>Verify New Password<input id="confirm" type="password" autocomplete="new-password"></label>
  <button type="submit">Create Account</button></form>`;
function fixture(
  url = 'https://acme.wd5.myworkdayjobs.com/en-US/jobs/apply',
  html = markup
) {
  const dom = new JSDOM(html, { url });
  const root = dom.window.document as Document;
  return {
    dom,
    root,
    value: (id: string) =>
      root.querySelector<HTMLInputElement>(`#${id}`)!.value,
  };
}

describe('one-click portal login prefill', () => {
  it.each([
    'acme.wd5.myworkdayjobs.com',
    'jobs.ashbyhq.com',
    'jobs.lever.co',
    'careers.example.test',
  ])(
    'fills registration and confirmation on %s without submitting',
    async (host) => {
      const f = fixture(`https://${host}/careers/apply`);
      try {
        const submit = vi.fn((e: Event) => e.preventDefault());
        f.root.querySelector('form')!.addEventListener('submit', submit);
        const requestCredential = vi
          .fn()
          .mockResolvedValue({ ok: true, credential });
        expect(
          (await prefillSavedPortalLogin({ root: f.root, requestCredential }))
            .status
        ).toBe('filled');
        expect([
          f.value('email'),
          f.value('password'),
          f.value('confirm'),
        ]).toEqual([
          credential.email,
          credential.password,
          credential.password,
        ]);
        expect(requestCredential).toHaveBeenCalledTimes(1);
        expect(submit).not.toHaveBeenCalled();
        expect(f.root.querySelector('#tmo-job-portal-login-review')).toBeNull();
      } finally {
        f.dom.window.close();
      }
    }
  );

  it.each([
    'http://careers.example.test/apply',
    'https://www.trackmyopt.com/careers/apply',
    'https://bank.example.test/login',
  ])('does not request a password for %s', async (url) => {
    const f = fixture(
      url,
      markup.replace('Create your candidate account', 'Sign in')
    );
    try {
      const requestCredential = vi.fn();
      await prefillSavedPortalLogin({ root: f.root, requestCredential });
      expect(requestCredential).not.toHaveBeenCalled();
      expect(f.value('password')).toBe('');
    } finally {
      f.dom.window.close();
    }
  });

  it('discards a response after SPA navigation', async () => {
    const f = fixture();
    try {
      const requestCredential = async () => {
        f.dom.window.history.pushState({}, '', '/other');
        return { ok: true, credential };
      };
      expect(
        (await prefillSavedPortalLogin({ root: f.root, requestCredential }))
          .status
      ).toBe('stopped');
      expect(f.value('password')).toBe('');
    } finally {
      f.dom.window.close();
    }
  });

  it('discards a response when the run is stopped', async () => {
    const f = fixture();
    let allowed = true;
    try {
      const requestCredential = async () => {
        allowed = false;
        return { ok: true, credential };
      };
      expect(
        (
          await prefillSavedPortalLogin({
            root: f.root,
            requestCredential,
            shouldContinue: () => allowed,
          })
        ).status
      ).toBe('stopped');
      expect(f.value('password')).toBe('');
    } finally {
      f.dom.window.close();
    }
  });

  it('rejects changed form destinations and replaced forms while loading', async () => {
    for (const mutate of [
      (root: Document) =>
        root
          .querySelector('form')!
          .setAttribute('action', 'https://other.example.test/collect'),
      (root: Document) => {
        root.body.innerHTML = markup;
      },
    ]) {
      const f = fixture();
      try {
        await prefillSavedPortalLogin({
          root: f.root,
          requestCredential: async () => {
            mutate(f.root);
            return { ok: true, credential };
          },
        });
        expect(f.value('password')).toBe('');
      } finally {
        f.dom.window.close();
      }
    }
  });

  it('honors labels within open shadow roots', () => {
    const f = fixture(undefined, '<div id="host"></div>');
    try {
      const shadow = f.root
        .querySelector('#host')!
        .attachShadow({ mode: 'open' });
      shadow.innerHTML =
        '<form><label for="e">Email</label><input id="e" type="email"><label for="p">Password</label><input id="p" type="password"></form>';
      expect(
        fillJobPortalLogin(f.root, credential, f.dom.window.location.hostname)
          .totalFilled
      ).toBe(2);
    } finally {
      f.dom.window.close();
    }
  });

  it('never pairs a password with an email changed by a form event handler', () => {
    const f = fixture();
    try {
      f.root.querySelector('#email')!.addEventListener('change', () => {
        f.root.querySelector<HTMLInputElement>('#email')!.value =
          'other@example.test';
      });
      fillJobPortalLogin(f.root, credential, f.dom.window.location.hostname);
      expect(f.value('password')).toBe('');
    } finally {
      f.dom.window.close();
    }
  });

  it('Escape during loading stops the run without displaying secret values', async () => {
    const f = fixture();
    try {
      const result = await prefillSavedPortalLogin({
        root: f.root,
        requestCredential: async () => {
          f.root.dispatchEvent(
            new f.dom.window.KeyboardEvent('keydown', {
              key: 'Escape',
              bubbles: true,
            })
          );
          return { ok: true, credential };
        },
      });
      expect(result.status).toBe('stopped');
      expect(f.value('password')).toBe('');
      expect(f.root.body.textContent).not.toContain(credential.password);
    } finally {
      f.dom.window.close();
    }
  });

  it.each(['email', 'password'])(
    'does not pair a saved credential with a different existing %s',
    (id) => {
      const f = fixture();
      try {
        f.root.querySelector<HTMLInputElement>(`#${id}`)!.value =
          'someone-else';
        expect(
          fillJobPortalLogin(f.root, credential, f.dom.window.location.hostname)
            .totalFilled
        ).toBe(0);
        expect(f.value('confirm')).toBe('');
      } finally {
        f.dom.window.close();
      }
    }
  );

  it('skips hidden ancestors, disabled fieldsets, and password-reset forms', () => {
    const f = fixture(
      undefined,
      `<div hidden>${markup}</div><fieldset disabled>${markup}</fieldset><form><h2>Reset password</h2><input type="email"><label>New password<input type="password"></label></form>`
    );
    try {
      expect(
        fillJobPortalLogin(f.root, credential, f.dom.window.location.hostname)
          .totalFilled
      ).toBe(0);
    } finally {
      f.dom.window.close();
    }
  });

  it('recognizes Workday password controls by autocomplete and ignores OTP', () => {
    const f = fixture(
      undefined,
      '<form><input type="email"><input id="p1" type="password" autocomplete="new-password"><input id="p2" type="password" autocomplete="new-password"><label>OTP<input id="otp" type="password" autocomplete="new-password"></label></form>'
    );
    try {
      expect(
        fillJobPortalLogin(f.root, credential, f.dom.window.location.hostname)
          .passwordFilled
      ).toBe(2);
      expect(f.value('otp')).toBe('');
    } finally {
      f.dom.window.close();
    }
  });

  it('fails safely when no login is saved or the request fails', async () => {
    const f = fixture();
    try {
      expect(
        (
          await prefillSavedPortalLogin({
            root: f.root,
            requestCredential: async () => ({ ok: true, credential: null }),
          })
        ).status
      ).toBe('empty');
      expect(
        (
          await prefillSavedPortalLogin({
            root: f.root,
            requestCredential: async () => {
              throw new Error('network');
            },
          })
        ).status
      ).toBe('unavailable');
      expect(f.value('password')).toBe('');
    } finally {
      f.dom.window.close();
    }
  });
});
