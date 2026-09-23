// Production prefill engine + synthetic Greenhouse-shaped controls. No network
// calls, saved profile changes, application submissions, or personal data.
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const { outputFiles } = await build({
  stdin: { loader: 'ts', resolveDir: fileURLToPath(new URL('../src', import.meta.url)), contents: `
    import { runPrefill } from './easy-apply-engine';
    const result = document.querySelector('#result');
    const country = document.querySelector('#country');
    const city = document.querySelector('#city');
    let running = false, active = true;
    function render(control, labels, id) {
      document.getElementById(id)?.remove();
      const list = document.createElement('div'); list.id = id; list.setAttribute('role', 'listbox');
      for (const label of labels) {
        const option = document.createElement('div'); option.setAttribute('role', 'option'); option.textContent = label;
        option.onclick = () => {
          const selected = document.createElement('div'); selected.className = 'select__single-value'; selected.textContent = label;
          control.closest('.select__value-container').prepend(selected); control.value = ''; control.setAttribute('aria-expanded', 'false'); list.remove();
        };
        list.append(option);
      }
      control.closest('.select__control').append(list);
    }
    country.onmousedown = () => { country.setAttribute('aria-expanded', 'true'); render(country, ['Canada +1', 'United States +1', 'India +91'], 'countries'); };
    city.onmousedown = () => city.setAttribute('aria-expanded', 'true');
    city.oninput = () => {
      document.getElementById('cities')?.remove();
      if (city.value === 'Worcester') setTimeout(() => {
        if (city.value !== 'Worcester') return;
        const mismatch = document.querySelector('#mismatch').checked;
        render(city, mismatch ? ['Worcester, England, United Kingdom'] : ['Worcester, England, United Kingdom', 'Worcester, Massachusetts, United States'], 'cities');
      }, 250);
    };
    document.querySelector('#prefill').onclick = async () => {
      if (running) return; running = true; active = true; result.textContent = 'Filling…';
      try {
        await runPrefill({ profileFallback: { firstName: 'Test', country: 'United States', city: 'Worcester', state: 'MA', phone: '' }, quietResultToast: true, shouldContinue: () => active, featureFlags: { historyFields: false } });
        const selected = [...document.querySelectorAll('.select__single-value')].map(el => el.textContent);
        result.textContent = 'Selected: ' + (selected.join(' | ') || 'none') + '. City search: ' + (city.value || '(empty)');
      } catch (error) { result.textContent = 'ERROR: ' + error.message; }
      finally { running = false; }
    };
    document.querySelector('#cancel').onclick = () => { active = false; };
    document.querySelector('#reset').onclick = () => {
      if (running) return;
      document.querySelectorAll('.select__single-value,[role="listbox"]').forEach(el => el.remove());
      city.value = ''; country.value = ''; result.textContent = 'Ready';
    };
  ` }, bundle: true, write: false, platform: 'browser', format: 'iife', define: { 'process.env': '{}' },
});
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Country & City Prefill Regression</title><style>
body{font:16px/1.6 system-ui;color:#172b4d;max-width:650px;margin:48px auto;background:#f7f9fc}fieldset{border:0;padding:0;margin:0}label,legend{display:block;font-weight:600}.select__control{border:1px solid #9cabc0;background:white;border-radius:8px;margin:6px 0 24px;padding:12px}input[role=combobox]{border:0;font:inherit;width:100%;outline:0}button{padding:10px 18px;margin:6px;border:1px solid #9cabc0;border-radius:8px}#prefill{background:#1460df;color:white}#result{display:block;padding:18px;background:#e8f1ff;margin:24px 0}[role=option]{padding:6px;cursor:pointer}[role=option]:hover{background:#e8f1ff}.select__single-value{color:#075d32}
</style></head><body><h1>Country & City Prefill</h1><p>Local test · production engine · synthetic profile · no submission</p><form id="application-form"><fieldset><legend>Phone</legend><label id="country-label" for="country">Country</label><div class="select__control"><div class="select__value-container"><div class="select__input-container"><input id="country" role="combobox" aria-labelledby="country-label" aria-controls="countries" aria-expanded="false"></div></div></div></fieldset><label for="city">Location (City)</label><div class="select__control"><div class="select__value-container"><div class="select__input-container"><input id="city" role="combobox" aria-autocomplete="list" aria-controls="cities" aria-expanded="false"></div></div></div></form><label><input type="checkbox" id="mismatch">Only return a wrong-country city</label><button id="prefill">Run prefill</button><button id="reset">Reset test</button><button id="cancel">Cancel prefill</button><output id="result" role="status">Ready</output><script src="/bundle.js"></script></body></html>`;
const server = createServer((req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'unsafe-inline'; connect-src 'none'");
  res.setHeader('Content-Type', req.url === '/bundle.js' ? 'text/javascript' : 'text/html; charset=utf-8');
  res.end(req.url === '/bundle.js' ? outputFiles[0].text : html);
});
server.listen(0, '127.0.0.1', () => console.log('Location prefill preview: http://127.0.0.1:' + server.address().port));
