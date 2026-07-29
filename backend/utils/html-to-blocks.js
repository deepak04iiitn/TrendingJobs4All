import * as cheerio from 'cheerio';

function stripInlineHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(strong|b|em|i|u|span|a)[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function extractListItems($, el) {
  const items = [];
  $(el)
    .find('> li')
    .each((_, li) => {
      const text = stripInlineHtml($(li).html() || '');
      if (text) items.push(text);
    });
  return items;
}

function extractTable($, el) {
  const headers = [];
  const rows = [];

  $(el)
    .find('thead tr:first-child th, thead tr:first-child td, tr:first-child th')
    .each((_, cell) => {
      headers.push(stripInlineHtml($(cell).html() || ''));
    });

  const bodyRows = $(el).find('tbody tr').length
    ? $(el).find('tbody tr')
    : $(el).find('tr').slice(headers.length ? 1 : 0);

  bodyRows.each((_, row) => {
    const cells = [];
    $(row)
      .find('td, th')
      .each((__, cell) => {
        cells.push(stripInlineHtml($(cell).html() || ''));
      });
    if (cells.length) rows.push(cells);
  });

  if (!headers.length && rows.length) {
    return { headers: rows[0], rows: rows.slice(1) };
  }

  return { headers, rows };
}

function pushParagraph(blocks, text) {
  const trimmed = text.trim();
  if (trimmed) blocks.push({ type: 'paragraph', text: trimmed });
}

/**
 * Best-effort HTML → BlogBlock[] conversion for legacy Quill posts.
 */
export function htmlToBlocks(html) {
  if (!html || typeof html !== 'string') {
    return [{ type: 'paragraph', text: '' }];
  }

  const trimmed = html.trim();
  if (!trimmed.includes('<')) {
    return trimmed.split(/\n\n+/).filter(Boolean).map((p) => ({ type: 'paragraph', text: p.trim() }));
  }

  const $ = cheerio.load(trimmed, { decodeEntities: true });
  $('script, style, iframe, object, embed').remove();

  const blocks = [];

  const walk = (nodes) => {
    nodes.each((_, node) => {
      if (node.type === 'text') {
        const text = (node.data || '').replace(/\s+/g, ' ').trim();
        if (text) pushParagraph(blocks, text);
        return;
      }

      if (node.type !== 'tag') return;

      const tag = node.tagName?.toLowerCase();
      const el = node;

      switch (tag) {
        case 'h1':
        case 'h2':
          blocks.push({
            type: 'heading',
            level: 2,
            text: stripInlineHtml($(el).html() || ''),
          });
          break;
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          blocks.push({
            type: 'heading',
            level: 3,
            text: stripInlineHtml($(el).html() || ''),
          });
          break;
        case 'p':
          pushParagraph(blocks, stripInlineHtml($(el).html() || ''));
          break;
        case 'ul': {
          const items = extractListItems($, el);
          if (items.length) blocks.push({ type: 'bullets', items });
          break;
        }
        case 'ol': {
          const items = extractListItems($, el);
          if (items.length) blocks.push({ type: 'numbered', items });
          break;
        }
        case 'pre': {
          const codeEl = $(el).find('code').first();
          const code = codeEl.length ? codeEl.text() : $(el).text();
          const klass = codeEl.attr('class') || '';
          const langMatch = klass.match(/language-(\w+)/);
          blocks.push({
            type: 'code',
            lang: langMatch ? langMatch[1] : 'plaintext',
            code: code.trim(),
          });
          break;
        }
        case 'blockquote':
          blocks.push({
            type: 'quote',
            text: stripInlineHtml($(el).html() || ''),
          });
          break;
        case 'table': {
          const table = extractTable($, el);
          if (table.headers.length || table.rows.length) {
            blocks.push({
              type: 'table',
              headers: table.headers,
              rows: table.rows,
            });
          }
          break;
        }
        case 'hr':
          blocks.push({ type: 'divider' });
          break;
        case 'img':
          pushParagraph(blocks, `[image: ${$(el).attr('alt') || $(el).attr('src') || 'embedded image'}]`);
          break;
        case 'div':
        case 'section':
        case 'article':
        case 'body':
          walk($(el).contents());
          break;
        default:
          if ($(el).children().length) {
            walk($(el).contents());
          } else {
            const text = stripInlineHtml($(el).html() || '');
            if (text) pushParagraph(blocks, text);
          }
      }
    });
  };

  const roots = $('body').length ? $('body').contents() : $.root().contents();
  walk(roots);

  if (!blocks.length) {
    const fallback = stripInlineHtml(trimmed);
    if (fallback) return [{ type: 'paragraph', text: fallback }];
    return [{ type: 'paragraph', text: '' }];
  }

  return blocks;
}

/** Strip trailing Mongo ObjectId suffix from legacy slugs */
export function normalizeSlug(slug) {
  if (!slug) return slug;
  return slug.replace(/-[0-9a-f]{24}$/i, '').replace(/-\d{13,}$/, '');
}
