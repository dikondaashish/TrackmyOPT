// Shared behaviours for portal-shaped fixtures. Mirrors how real ATS widgets
// behave so the extension is exercised against dynamic markup, not static HTML.
window.fixture = {
  addRows(fieldsetSelector, rowHtml) {
    const group = document.querySelector(fieldsetSelector);
    const add = group.querySelector('[data-add]');
    add.addEventListener('click', () => {
      const row = document.createElement('div');
      row.setAttribute('data-record-index', String(group.querySelectorAll('[data-record-index]').length));
      row.innerHTML = rowHtml;
      group.insertBefore(row, add);
    });
  },
  cascade(parentSelector, childSelector, optionsFor, delay = 120) {
    const parent = document.querySelector(parentSelector);
    parent.addEventListener('change', () => setTimeout(() => {
      const child = document.querySelector(childSelector);
      child.innerHTML = '<option value="">Select</option>' +
        optionsFor(parent.value).map(text => `<option>${text}</option>`).join('');
      child.disabled = false;
    }, delay));
  },
  typeahead(input, all) {
    const list = document.createElement('ul');
    list.id = `${input.id}-list`;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    input.setAttribute('aria-controls', list.id);
    input.after(list);
    input.addEventListener('input', () => setTimeout(() => {
      const query = input.value.toLowerCase();
      list.innerHTML = '';
      for (const text of all.filter(item => query && item.toLowerCase().includes(query))) {
        const option = document.createElement('li');
        option.setAttribute('role', 'option');
        option.textContent = text;
        option.addEventListener('click', () => {
          input.value = '';
          input.setAttribute('aria-valuetext', text);
          list.hidden = true;
          input.setAttribute('aria-expanded', 'false');
        });
        list.append(option);
      }
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }, 150));
  },
  phoneMask(input) {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length === 10) input.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    });
  },
};
