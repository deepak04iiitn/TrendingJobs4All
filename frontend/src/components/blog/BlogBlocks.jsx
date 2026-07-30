import { Fragment } from 'react';
import hljs from 'highlight.js';
import { Hash, Quote } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseInline, renderRuns } from '../../lib/blog-blocks';
import 'highlight.js/styles/github.css';

function Heading({ block, chapterNumber }) {
  const { id, level, text } = block;

  const copyLink = () => {
    if (!id) return;
    navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#${id}`);
    toast.success('Section link copied');
  };

  if (level === 3) {
    return (
      <h3 id={id} className="font-display mt-7 scroll-mt-28 text-xl font-semibold text-[#1C1917]">
        {renderRuns(parseInline(text))}
      </h3>
    );
  }

  return (
    <h2 id={id} className="group relative mt-14 mb-5 flex scroll-mt-28 items-start gap-4">
      {chapterNumber !== undefined && (
        <span className="mt-1 shrink-0 font-mono text-sm font-bold tabular-nums text-[#C4A574]/70">
          {String(chapterNumber).padStart(2, '0')}
        </span>
      )}
      <span className="font-display flex-1 text-2xl font-semibold text-[#1C1917]">
        {renderRuns(parseInline(text))}
      </span>
      <button
        type="button"
        aria-label="Copy link to section"
        onClick={copyLink}
        className="mt-2 shrink-0 text-[#78716C] opacity-0 transition-opacity hover:text-[#C4A574] group-hover:opacity-100"
      >
        <Hash className="h-4 w-4" />
      </button>
    </h2>
  );
}

function CodeBlock({ lang, code }) {
  let html;
  try {
    html = hljs.getLanguage(lang)
      ? hljs.highlight(code, { language: lang }).value
      : hljs.highlightAuto(code).value;
  } catch {
    html = code;
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E5DCCE] bg-[#F7F3EC] px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#78716C]">{lang}</span>
      </div>
      <pre className="m-0 overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

export default function BlogBlocks({ blocks = [] }) {
  const chapterNumbers = [];
  let n = 0;
  for (const block of blocks) {
    chapterNumbers.push(block.type === 'heading' && block.level === 2 ? (n += 1) : 0);
  }
  const firstParagraphIndex = blocks.findIndex((b) => b.type === 'paragraph');

  return (
    <div
      className="prose prose-neutral max-w-none
      prose-headings:font-display prose-headings:text-[#1C1917]
      prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-[#57534E]
      prose-a:text-[#C4A574] prose-a:no-underline hover:prose-a:underline
      prose-strong:font-semibold prose-strong:text-[#2C241B]
      prose-table:text-[14px] prose-th:bg-[#F7F3EC] prose-th:font-semibold prose-td:text-[#57534E]
      prose-ul:list-disc prose-ol:list-decimal
      prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-[#57534E] prose-li:marker:text-[#C4A574]/50
      prose-hr:my-8 prose-hr:border-[#E5DCCE]"
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Heading
                key={i}
                block={block}
                chapterNumber={block.level === 2 ? chapterNumbers[i] : undefined}
              />
            );
          case 'paragraph': {
            const isFirst = i === firstParagraphIndex;
            return (
              <p
                key={i}
                className={
                  isFirst
                    ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-[#C4A574]'
                    : undefined
                }
              >
                {renderRuns(parseInline(block.text))}
              </p>
            );
          }
          case 'bullets':
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderRuns(parseInline(item))}</li>
                ))}
              </ul>
            );
          case 'numbered':
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderRuns(parseInline(item))}</li>
                ))}
              </ol>
            );
          case 'code':
            return <CodeBlock key={i} lang={block.lang} code={block.code} />;
          case 'quote':
            return (
              <blockquote
                key={i}
                className="not-prose relative my-8 rounded-r-xl border-l-4 border-[#C4A574] bg-[#F7F3EC]/80 py-5 pl-8 pr-5"
              >
                <Quote className="absolute left-3 top-4 h-5 w-5 rotate-180 text-[#C4A574]/40" />
                <div className="text-[15px] italic leading-relaxed text-[#57534E]">
                  <p className="my-0">{renderRuns(parseInline(block.text))}</p>
                </div>
              </blockquote>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((h, j) => (
                        <th key={j}>{renderRuns(parseInline(h))}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k}>{renderRuns(parseInline(cell))}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'divider':
            return <hr key={i} />;
          default:
            return <Fragment key={i} />;
        }
      })}
    </div>
  );
}
