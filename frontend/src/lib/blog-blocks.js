import { createElement, Fragment } from 'react';

export const BLOG_BLOCK_TYPES = [
  'heading', 'paragraph', 'bullets', 'numbered', 'code', 'quote', 'table', 'divider',
];

/**
 * Tiny inline formatter — **bold**, *italic*, `code`, [link](url)
 */
export function parseInline(text) {
  const runs = [];
  const pattern = /\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((.+?)\)|\*(.+?)\*/g;
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index) });
    if (match[1] !== undefined) runs.push({ text: match[1], bold: true });
    else if (match[2] !== undefined) runs.push({ text: match[2], code: true });
    else if (match[3] !== undefined) runs.push({ text: match[3], href: match[4] });
    else if (match[5] !== undefined) runs.push({ text: match[5], italic: true });
    last = pattern.lastIndex;
  }

  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs;
}

export function renderRuns(runs) {
  return createElement(
    Fragment,
    null,
    ...runs.map((run, i) => {
      let node = run.text;
      if (run.bold) node = createElement('strong', { key: `b-${i}` }, node);
      if (run.italic) node = createElement('em', { key: `i-${i}` }, node);
      if (run.code) {
        node = createElement(
          'code',
          {
            key: `c-${i}`,
            className: 'rounded bg-[#F7F3EC] px-1.5 py-0.5 font-mono text-[13px] text-[#6B5A48]',
          },
          node,
        );
      }
      if (run.href) {
        node = createElement(
          'a',
          {
            key: `a-${i}`,
            href: run.href,
            className: 'text-[#C4A574] underline-offset-2 hover:underline',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          node,
        );
      }
      return createElement(Fragment, { key: i }, node);
    }),
  );
}

export function createEmptyBlock(type) {
  switch (type) {
    case 'heading':
      return { type: 'heading', level: 2, text: '' };
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'bullets':
      return { type: 'bullets', items: [''] };
    case 'numbered':
      return { type: 'numbered', items: [''] };
    case 'code':
      return { type: 'code', lang: 'javascript', code: '' };
    case 'quote':
      return { type: 'quote', text: '' };
    case 'table':
      return { type: 'table', headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'divider':
      return { type: 'divider' };
    default:
      return { type: 'paragraph', text: '' };
  }
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
