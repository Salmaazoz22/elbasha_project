// Tiny templating helpers: escaped-by-default HTML, NEEDS_CLIENT markers, icons, plurals.
import { icons } from './icons.mjs';

class Raw {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

export const raw = (value) => new Raw(String(value));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

function render(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(render).join('');
  if (value instanceof Raw) return value.value;
  return esc(value);
}

/** Tagged template: interpolations are HTML-escaped unless wrapped in raw() or produced by html``. */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Raw(out);
}

export const isMarker = (value) => typeof value === 'string' && value.includes('[[NEEDS_CLIENT');

/**
 * Render `content` only when every value is real client data.
 * Production: missing data → nothing (the block is omitted and logged).
 * Drafts: missing data → a visible, labelled marker slot.
 */
export function needs(ctx, values, content, { inline = false } = {}) {
  const missing = [values].flat().filter(isMarker);
  if (!missing.length) return typeof content === 'function' ? content() : content;
  for (const m of missing) ctx.report.add(m);
  if (!ctx.drafts) return '';
  const tag = inline ? 'span' : 'div';
  return html`<${raw(tag)} class="needs-client${inline ? ' needs-client--inline' : ''}" role="note">${missing.map((m) => html`<span>${m}</span>`)}</${raw(tag)}>`;
}

/** A marker that never has real content yet (e.g. a slot awaiting a photo). */
export const slot = (ctx, marker, opts) => needs(ctx, marker, '', opts);

export function icon(name, { size = 24, className = '' } = {}) {
  const def = icons[name];
  if (!def) throw new Error(`Unknown icon: ${name}`);
  const attrs = def.stroke
    ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    : 'fill="currentColor"';
  return raw(`<svg class="icon${className ? ` ${className}` : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" ${attrs} aria-hidden="true" focusable="false">${def.body}</svg>`);
}

export function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

/** Arabic has one/two/few (3-10)/many (11+) forms; English one/other. */
export function plural(forms, n, lang) {
  let key;
  if (lang === 'ar') key = n === 1 ? 'one' : n === 2 ? 'two' : n % 100 >= 3 && n % 100 <= 10 ? 'few' : 'many';
  else key = n === 1 ? 'one' : 'other';
  return interpolate(forms[key] ?? forms.other ?? forms.many, { n });
}

/** Wrap phone numbers etc. so they keep left-to-right order inside RTL text. */
export const ltr = (text) => html`<bdi dir="ltr">${text}</bdi>`;

/** Phone number in LTR with non-breaking spaces so it never wraps mid-number. */
export const phone = (display) => html`<bdi dir="ltr">${raw(esc(display).replace(/ /g, '&nbsp;'))}</bdi>`;

/** Email address in LTR with a line-break opportunity after the @ (long addresses on small screens). */
export function email(address) {
  const [local, domain] = String(address).split('@');
  return html`<bdi dir="ltr">${local}@<wbr>${domain}</bdi>`;
}
