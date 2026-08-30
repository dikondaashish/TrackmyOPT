import { Fragment, type ReactNode } from 'react';

const HEADING_OPEN = '\uE000';
const ITEM_OPEN = '\uE001';
const BLOCK_CLOSE = '\uE002';
const STRONG_OPEN = '\uE003';
const STRONG_CLOSE = '\uE004';

type InlinePart = {
  text: string;
  strong: boolean;
};

type DescriptionBlock =
  | { type: 'heading'; content: InlinePart[] }
  | { type: 'paragraph'; content: InlinePart[] }
  | { type: 'list'; items: InlinePart[][] };

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  bull: '•',
  gt: '>',
  hellip: '…',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  rdquo: '”',
  rsquo: '’',
};

const commonHeadings = [
  "What You'll Do",
  'What You’ll Do',
  "What You'll Bring",
  'What You’ll Bring',
  'Responsibilities',
  'Key Responsibilities',
  'Qualifications',
  'Minimum Qualifications',
  'Preferred Qualifications',
  'Requirements',
  'Skills and Experience',
  'Compensation',
  'Salary',
  'Perks & Benefits',
  'Benefits',
] as const;

function decodeEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const hexadecimal = code[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return namedEntities[code.toLowerCase()] ?? entity;
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function markHeading(text: string, headingPattern: string) {
  return text.replace(
    new RegExp(`(^|\\s)(${headingPattern})(?=\\s|$)`, 'g'),
    (_, prefix: string, heading: string) => `${prefix}\n${HEADING_OPEN}${heading}${BLOCK_CLOSE}\n`,
  );
}

function markPlainTextHeadings(value: string) {
  const exactHeadings = [...commonHeadings]
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|');
  const employerHeading = String.raw`(?:About|Why)\s+[A-Z][A-Za-z0-9&'’, -]{0,48}\.`;
  return markHeading(value, `(?:${exactHeadings}|${employerHeading})`);
}

function inlineParts(value: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let strong = false;

  for (const token of value.split(new RegExp(`(${STRONG_OPEN}|${STRONG_CLOSE})`, 'g'))) {
    if (token === STRONG_OPEN) {
      strong = true;
      continue;
    }
    if (token === STRONG_CLOSE) {
      strong = false;
      continue;
    }
    const text = token.replace(/\s+/g, ' ').trim();
    if (text) parts.push({ text, strong });
  }

  return parts;
}

function descriptionBlocks(description: string | null): DescriptionBlock[] {
  if (!description?.trim()) {
    return [{
      type: 'paragraph',
      content: [{ text: 'The employer has not provided a job description on this authorized board.', strong: false }],
    }];
  }

  const withoutUnsafeContent = decodeEntities(description)
    .replace(/<!--[^]*?-->/g, ' ')
    .replace(/<\s*(script|style|noscript|iframe|object|embed|form|button|textarea|select)\b[^>]*>[^]*?<\s*\/\s*\1\s*>/gi, ' ');
  const hasHtml = /<\/?[a-z][^>]*>/i.test(withoutUnsafeContent);
  let normalized = withoutUnsafeContent.replace(/\r\n?/g, '\n');

  if (hasHtml) {
    normalized = normalized.replace(/\s+/g, ' ');
  } else {
    normalized = markPlainTextHeadings(normalized.replace(/\s+/g, ' '));
  }

  normalized = normalized
    .replace(/<\s*h[1-6]\b[^>]*>/gi, `\n${HEADING_OPEN}`)
    .replace(/<\s*\/\s*h[1-6]\s*>/gi, `${BLOCK_CLOSE}\n`)
    .replace(/<\s*li\b[^>]*>/gi, `\n${ITEM_OPEN}`)
    .replace(/<\s*\/\s*li\s*>/gi, `${BLOCK_CLOSE}\n`)
    .replace(/<\s*(strong|b)\b[^>]*>/gi, STRONG_OPEN)
    .replace(/<\s*\/\s*(strong|b)\s*>/gi, STRONG_CLOSE)
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/?\s*(p|div|section|article|ul|ol|blockquote|table|thead|tbody|tr)\b[^>]*>/gi, '\n')
    .replace(/<\s*\/?\s*(td|th)\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');

  const blocks: DescriptionBlock[] = [];
  let listItems: InlinePart[][] = [];
  const flushList = () => {
    if (listItems.length) blocks.push({ type: 'list', items: listItems });
    listItems = [];
  };

  for (const line of normalized.split('\n').map((part) => part.trim()).filter(Boolean)) {
    if (line.startsWith(HEADING_OPEN)) {
      flushList();
      const content = inlineParts(line.slice(HEADING_OPEN.length).replace(BLOCK_CLOSE, ''));
      if (content.length) blocks.push({ type: 'heading', content });
      continue;
    }
    if (line.startsWith(ITEM_OPEN)) {
      const content = inlineParts(line.slice(ITEM_OPEN.length).replace(BLOCK_CLOSE, ''));
      if (content.length) listItems.push(content);
      continue;
    }
    flushList();
    const content = inlineParts(line.replaceAll(BLOCK_CLOSE, ''));
    if (content.length) blocks.push({ type: 'paragraph', content });
  }
  flushList();

  return blocks.length ? blocks : [{ type: 'paragraph', content: [{ text: description.trim(), strong: false }] }];
}

function InlineContent({ parts }: { parts: InlinePart[] }) {
  return parts.map((part, index) => {
    const followsWithoutSpace = /^[,.;:!?%)\]}]/.test(part.text);
    const content: ReactNode = index === 0 || followsWithoutSpace ? part.text : ` ${part.text}`;
    return part.strong
      ? <strong key={`${part.text}-${index}`} className="font-semibold text-slate-900 dark:text-slate-100">{content}</strong>
      : <Fragment key={`${part.text}-${index}`}>{content}</Fragment>;
  });
}

export function JobDescriptionContent({ description }: { description: string | null }) {
  const blocks = descriptionBlocks(description);

  return (
    <div className="max-w-[72ch] text-sm leading-6 text-slate-700 dark:text-slate-300">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <h4 key={`heading-${index}`} className="mb-2 mt-6 text-[0.9375rem] font-semibold leading-6 text-slate-950 first:mt-0 dark:text-white"><InlineContent parts={block.content} /></h4>;
        }
        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="mb-4 list-disc space-y-1.5 pl-5 marker:text-slate-400">
              {block.items.map((item, itemIndex) => <li key={`item-${itemIndex}`} className="pl-0.5"><InlineContent parts={item} /></li>)}
            </ul>
          );
        }
        return <p key={`paragraph-${index}`} className="mb-4 last:mb-0"><InlineContent parts={block.content} /></p>;
      })}
    </div>
  );
}
