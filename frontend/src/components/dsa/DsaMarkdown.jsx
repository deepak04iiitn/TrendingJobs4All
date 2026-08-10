import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

/** Renders problem statements / solution write-ups as real markdown (headings, bold,
 * lists, inline code, fenced code blocks with syntax highlighting) instead of raw text. */
export default function DsaMarkdown({ children, className = '' }) {
  return (
    <div className={`prose prose-sm max-w-none prose-headings:font-display prose-headings:text-[#1C1917] prose-p:text-[#57534E] prose-li:text-[#57534E] prose-strong:text-[#2C241B] prose-code:text-[#6B5A48] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#F7F3EC] prose-pre:border prose-pre:border-[#E5DCCE] ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}
