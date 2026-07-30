export const BLOG_BLOCK_TYPES = [
  'heading', 'paragraph', 'bullets', 'numbered', 'code', 'quote', 'table', 'divider',
];

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function blockText(block) {
  switch (block.type) {
    case 'heading':
      return block.text || '';
    case 'paragraph':
      return block.text || '';
    case 'quote':
      return block.text || '';
    case 'bullets':
      return (block.items || []).join(' ');
    case 'numbered':
      return (block.items || []).join(' ');
    case 'table':
      return [...(block.headers || []), ...(block.rows || []).flat()].join(' ');
    case 'code':
      return '';
    case 'divider':
      return '';
    default:
      return '';
  }
}

export function calcReadingTime(blocks) {
  const words = blocks
    .map(blockText)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function buildTocAndIds(blocks) {
  const seen = {};
  const toc = [];

  const nextBlocks = blocks.map((block) => {
    if (block.type !== 'heading') return block;

    let id = slugify(block.text || '');
    if (seen[id] !== undefined) {
      seen[id] += 1;
      id = `${id}-${seen[id]}`;
    } else {
      seen[id] = 0;
    }

    toc.push({ id, text: block.text, level: block.level });
    return { ...block, id };
  });

  return { blocks: nextBlocks, toc };
}

function isValidBlock(block) {
  if (!block || typeof block !== 'object' || !BLOG_BLOCK_TYPES.includes(block.type)) {
    return false;
  }

  switch (block.type) {
    case 'heading':
      return typeof block.text === 'string' && [2, 3].includes(block.level);
    case 'paragraph':
    case 'quote':
      return typeof block.text === 'string';
    case 'bullets':
    case 'numbered':
      return Array.isArray(block.items) && block.items.every((i) => typeof i === 'string');
    case 'code':
      return typeof block.code === 'string' && typeof block.lang === 'string';
    case 'table':
      return (
        Array.isArray(block.headers) &&
        block.headers.every((h) => typeof h === 'string') &&
        Array.isArray(block.rows) &&
        block.rows.every((row) => Array.isArray(row) && row.every((c) => typeof c === 'string'))
      );
    case 'divider':
      return true;
    default:
      return false;
  }
}

/** Validates content blocks. Returns error message or null. */
export function validateBlocks(content) {
  if (!Array.isArray(content)) return 'Invalid content: expected an array of typed blocks';
  if (content.length === 0) return 'Content must contain at least one block';

  for (let i = 0; i < content.length; i += 1) {
    if (!isValidBlock(content[i])) {
      return `Invalid block at index ${i}`;
    }
  }

  return null;
}

/** Validates + normalises content, computing toc/readingTime. Returns error or null. */
export function prepareContent(data) {
  const error = validateBlocks(data.content);
  if (error) return error;

  const { blocks, toc } = buildTocAndIds(data.content);
  data.content = blocks;
  data.toc = toc;
  data.readingTime = calcReadingTime(blocks);
  data.contentVersion = 2;
  return null;
}
