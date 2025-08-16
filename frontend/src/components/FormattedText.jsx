import React from 'react';

const FormattedText = ({ text }) => {
  const formatText = (text) => {
    if (!text || typeof text !== 'string') return [];

    // Split by double newlines to separate major sections
    const sections = text.split(/\n\s*\n/);
    
    return sections.map((section, sectionIndex) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;

      // 1. Handle Headers (lines starting with # or ending with :)
      if (isHeader(trimmedSection)) {
        return renderHeader(trimmedSection, sectionIndex);
      }

      // 2. Handle Code Blocks (```...```)
      if (isCodeBlock(trimmedSection)) {
        return renderCodeBlock(trimmedSection, sectionIndex);
      }

      // 3. Handle Tables (markdown-style)
      if (isTable(trimmedSection)) {
        return renderTable(trimmedSection, sectionIndex);
      }

      // 4. Handle Numbered Lists (multiline or inline)
      if (isNumberedList(trimmedSection)) {
        return renderNumberedList(trimmedSection, sectionIndex);
      }

      // 5. Handle Bullet Lists
      if (isBulletList(trimmedSection)) {
        return renderBulletList(trimmedSection, sectionIndex);
      }

      // 6. Handle Definition Lists (Term: Definition)
      if (isDefinitionList(trimmedSection)) {
        return renderDefinitionList(trimmedSection, sectionIndex);
      }

      // 7. Handle Blockquotes (lines starting with >)
      if (isBlockquote(trimmedSection)) {
        return renderBlockquote(trimmedSection, sectionIndex);
      }

      // 8. Handle Q&A Format (Q: ... A: ...)
      if (isQAFormat(trimmedSection)) {
        return renderQAFormat(trimmedSection, sectionIndex);
      }

      // 9. Handle Step-by-step Instructions
      if (isStepByStep(trimmedSection)) {
        return renderStepByStep(trimmedSection, sectionIndex);
      }

      // 10. Handle Section with Colon Headers
      if (hasColonHeaders(trimmedSection)) {
        return renderColonHeaders(trimmedSection, sectionIndex);
      }

      // 11. Handle Mixed Content (paragraphs with embedded lists)
      if (hasMixedContent(trimmedSection)) {
        return renderMixedContent(trimmedSection, sectionIndex);
      }

      // 12. Handle Regular Paragraphs with Inline Formatting
      return renderParagraph(trimmedSection, sectionIndex);
    }).filter(Boolean);
  };

  // Helper Functions for Detection
  const isHeader = (text) => {
    const lines = text.split('\n');
    if (lines.length === 1) {
      return /^#{1,6}\s+/.test(text) || 
             (/^[A-Z][^.!?]*:?\s*$/.test(text) && text.length < 100) ||
             /^[^\n]+:\s*$/.test(text);
    }
    return false;
  };

  const isCodeBlock = (text) => {
    return /^```[\s\S]*```$/m.test(text) || 
           /^`[^`\n]+`$/m.test(text) ||
           text.split('\n').every(line => line.startsWith('    ') || line.trim() === '');
  };

  const isTable = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.length >= 2 && 
           lines.some(line => line.includes('|')) &&
           lines.some(line => /^\|?[\s\-\|:]+\|?$/.test(line));
  };

  const isNumberedList = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 1) {
      // Inline numbered list: "1. First 2. Second 3. Third"
      return /(\d+\.[\s\S]*?)(?=\d+\.|$)/g.test(text) && 
             (text.match(/\d+\./g) || []).length > 1;
    }
    // Multiline numbered list
    return lines.length > 1 && 
           lines.every(line => /^\s*\d+[\.\)]\s+/.test(line) || line.trim() === '');
  };

  const isBulletList = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.length > 1 && 
           lines.every(line => /^\s*[-•*+]\s+/.test(line) || line.trim() === '');
  };

  const isDefinitionList = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.length > 1 && 
           lines.some(line => /^[^:\n]+:\s*.+/.test(line)) &&
           !lines.every(line => /^\s*\d+[\.\)]\s+/.test(line));
  };

  const isBlockquote = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.every(line => /^\s*>\s*/.test(line));
  };

  const isQAFormat = (text) => {
    return /(?:^|\n)\s*[Qq](?:uestion)?[\s\d]*[:.]/.test(text) && 
           /(?:^|\n)\s*[Aa](?:nswer)?[\s\d]*[:.]/.test(text);
  };

  const isStepByStep = (text) => {
    return /(?:step\s*\d+|phase\s*\d+|stage\s*\d+)/i.test(text) ||
           /(?:first|second|third|fourth|fifth|next|then|finally)[\s,:]/i.test(text);
  };

  const hasColonHeaders = (text) => {
    const lines = text.split('\n');
    return lines.some(line => /^[A-Za-z][^:\n]*:\s*$/.test(line.trim())) ||
           lines.some(line => /^[A-Za-z][^:\n]*:\s+\S/.test(line.trim()));
  };

  const hasMixedContent = (text) => {
    return text.includes('\n') && 
           (/\d+\./.test(text) || /[-•*]/.test(text)) && 
           !isNumberedList(text) && !isBulletList(text);
  };

  // Rendering Functions
  const renderHeader = (text, index) => {
    let content = text;
    let level = 3;

    if (/^#{1,6}\s+/.test(text)) {
      const match = text.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        level = Math.min(match[1].length + 1, 6);
        content = match[2];
      }
    } else {
      content = text.replace(/:?\s*$/, '');
      level = text.length > 50 ? 4 : 3;
    }

    const Tag = `h${level}`;
    const sizeClasses = {
      1: 'text-3xl',
      2: 'text-2xl', 
      3: 'text-xl',
      4: 'text-lg',
      5: 'text-base',
      6: 'text-sm'
    };

    return React.createElement(Tag, {
      key: index,
      className: `${sizeClasses[level]} font-bold text-gray-800 mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-200`
    }, content);
  };

  const renderCodeBlock = (text, index) => {
    let content = text;
    let language = '';

    if (text.startsWith('```')) {
      const match = text.match(/^```(\w+)?\n?([\s\S]*?)\n?```$/);
      if (match) {
        language = match[1] || '';
        content = match[2];
      }
    } else if (text.startsWith('`') && text.endsWith('`')) {
      content = text.slice(1, -1);
      return (
        <code key={index} className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">
          {content}
        </code>
      );
    }

    return (
      <div key={index} className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
        {language && (
          <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">
            {language}
          </div>
        )}
        <pre className="text-sm font-mono whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>
    );
  };

  const renderTable = (text, index) => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows = lines.filter(line => !line.match(/^\|?[\s\-\|:]+\|?$/));
    
    const parseRow = (row) => {
      return row.split('|')
        .map(cell => cell.trim())
        .filter((cell, idx, arr) => idx !== 0 && idx !== arr.length - 1 || cell !== '');
    };

    const headers = parseRow(rows[0]);
    const dataRows = rows.slice(1).map(parseRow);

    return (
      <div key={index} className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-sm text-gray-700 border-b">
                    {renderInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNumberedList = (text, index) => {
    let items = [];
    
    if (text.split('\n').length === 1) {
      // Inline numbered list
      items = text.match(/\d+\.\s*[^.]*?(?=\d+\.|$)/g) || [];
      items = items.map(item => item.replace(/^\d+\.\s*/, '').trim());
    } else {
      // Multiline numbered list
      const lines = text.split('\n').filter(line => line.trim());
      items = lines
        .filter(line => /^\s*\d+[\.\)]\s+/.test(line))
        .map(line => line.replace(/^\s*\d+[\.\)]\s*/, '').trim());
    }

    return (
      <ol key={index} className="list-decimal list-inside space-y-2 mb-6 pl-4">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-700 leading-relaxed">
            <span className="ml-2">{renderInlineFormatting(item)}</span>
          </li>
        ))}
      </ol>
    );
  };

  const renderBulletList = (text, index) => {
    const lines = text.split('\n').filter(line => line.trim());
    const items = lines
      .filter(line => /^\s*[-•*+]\s+/.test(line))
      .map(line => line.replace(/^\s*[-•*+]\s*/, '').trim());

    return (
      <ul key={index} className="list-disc list-inside space-y-2 mb-6 pl-4">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-700 leading-relaxed">
            <span className="ml-2">{renderInlineFormatting(item)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderDefinitionList = (text, index) => {
    const lines = text.split('\n').filter(line => line.trim());
    const definitions = [];
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        definitions.push({
          term: match[1].trim(),
          definition: match[2].trim()
        });
      }
    }

    return (
      <dl key={index} className="space-y-4 mb-6">
        {definitions.map((def, idx) => (
          <div key={idx} className="border-l-4 border-blue-500 pl-4">
            <dt className="font-semibold text-gray-800 mb-1">
              {renderInlineFormatting(def.term)}
            </dt>
            <dd className="text-gray-700 leading-relaxed">
              {renderInlineFormatting(def.definition)}
            </dd>
          </div>
        ))}
      </dl>
    );
  };

  const renderBlockquote = (text, index) => {
    const content = text
      .split('\n')
      .map(line => line.replace(/^\s*>\s*/, ''))
      .join('\n')
      .trim();

    return (
      <blockquote key={index} className="border-l-4 border-gray-400 pl-6 py-2 mb-6 bg-gray-50 rounded-r-lg">
        <div className="text-gray-700 italic leading-relaxed">
          {renderInlineFormatting(content)}
        </div>
      </blockquote>
    );
  };

  const renderQAFormat = (text, index) => {
    const qaPattern = /(?:^|\n)\s*([Qq](?:uestion)?[\s\d]*[:.])\s*(.*?)(?=\n\s*[Aa](?:nswer)?[\s\d]*[:.]\s*|\n\s*[Qq](?:uestion)?[\s\d]*[:.]|$)/gs;
    const answerPattern = /(?:^|\n)\s*([Aa](?:nswer)?[\s\d]*[:.])\s*(.*?)(?=\n\s*[Qq](?:uestion)?[\s\d]*[:.]|$)/gs;
    
    const questions = [...text.matchAll(qaPattern)];
    const answers = [...text.matchAll(answerPattern)];
    
    const pairs = [];
    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      pairs.push({
        question: questions[i][2].trim(),
        answer: answers[i][2].trim()
      });
    }

    return (
      <div key={index} className="space-y-6 mb-6">
        {pairs.map((pair, idx) => (
          <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="mb-3">
              <span className="font-semibold text-blue-800">Q{idx + 1}: </span>
              <span className="text-gray-800">{renderInlineFormatting(pair.question)}</span>
            </div>
            <div>
              <span className="font-semibold text-green-800">A: </span>
              <span className="text-gray-700">{renderInlineFormatting(pair.answer)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStepByStep = (text, index) => {
    const stepPattern = /(?:step\s*\d+|phase\s*\d+|stage\s*\d+|first|second|third|fourth|fifth|next|then|finally)[\s,:]/gi;
    
    if (stepPattern.test(text)) {
      const sentences = text.split(/[.!]\s+/).filter(s => s.trim());
      const steps = sentences.filter(s => stepPattern.test(s));
      
      if (steps.length > 1) {
        return (
          <div key={index} className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Step-by-Step Process:</h4>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    {renderInlineFormatting(step.trim())}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    return renderParagraph(text, index);
  };

  const renderColonHeaders = (text, index) => {
    const lines = text.split('\n');
    const elements = [];
    let currentContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (/^[A-Za-z][^:\n]*:\s*$/.test(trimmedLine)) {
        // Standalone header line
        if (currentContent.length > 0) {
          elements.push({ type: 'content', text: currentContent.join('\n') });
          currentContent = [];
        }
        elements.push({ 
          type: 'header', 
          text: trimmedLine.replace(':', '') 
        });
      } else if (/^[A-Za-z][^:\n]*:\s+\S/.test(trimmedLine)) {
        // Header with content on same line
        if (currentContent.length > 0) {
          elements.push({ type: 'content', text: currentContent.join('\n') });
          currentContent = [];
        }
        const [header, ...contentParts] = trimmedLine.split(':');
        elements.push({ type: 'header', text: header.trim() });
        elements.push({ type: 'content', text: contentParts.join(':').trim() });
      } else {
        currentContent.push(trimmedLine);
      }
    }

    if (currentContent.length > 0) {
      elements.push({ type: 'content', text: currentContent.join('\n') });
    }

    return (
      <div key={index} className="mb-6">
        {elements.map((element, idx) => {
          if (element.type === 'header') {
            return (
              <h4 key={idx} className="font-semibold text-gray-800 mb-2 text-lg mt-4 first:mt-0">
                {element.text}
              </h4>
            );
          } else {
            return (
              <div key={idx} className="text-gray-700 leading-relaxed mb-3 pl-4">
                {renderInlineFormatting(element.text)}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderMixedContent = (text, index) => {
    const lines = text.split('\n');
    const elements = [];
    let currentParagraph = [];
    let currentList = [];
    let listType = null;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push({
          type: 'paragraph',
          content: currentParagraph.join('\n')
        });
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push({
          type: listType,
          items: currentList
        });
        currentList = [];
        listType = null;
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (/^\s*\d+[\.\)]\s+/.test(line)) {
        flushParagraph();
        if (listType !== 'numbered') {
          flushList();
          listType = 'numbered';
        }
        currentList.push(line.replace(/^\s*\d+[\.\)]\s*/, '').trim());
      } else if (/^\s*[-•*+]\s+/.test(line)) {
        flushParagraph();
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        currentList.push(line.replace(/^\s*[-•*+]\s*/, '').trim());
      } else {
        flushList();
        if (trimmedLine) {
          currentParagraph.push(trimmedLine);
        } else if (currentParagraph.length > 0) {
          flushParagraph();
        }
      }
    }

    flushParagraph();
    flushList();

    return (
      <div key={index} className="space-y-4 mb-6">
        {elements.map((element, idx) => {
          if (element.type === 'paragraph') {
            return (
              <p key={idx} className="text-gray-700 leading-relaxed">
                {renderInlineFormatting(element.content)}
              </p>
            );
          } else if (element.type === 'numbered') {
            return (
              <ol key={idx} className="list-decimal list-inside space-y-1 pl-4">
                {element.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-gray-700 leading-relaxed">
                    <span className="ml-2">{renderInlineFormatting(item)}</span>
                  </li>
                ))}
              </ol>
            );
          } else if (element.type === 'bullet') {
            return (
              <ul key={idx} className="list-disc list-inside space-y-1 pl-4">
                {element.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-gray-700 leading-relaxed">
                    <span className="ml-2">{renderInlineFormatting(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const renderParagraph = (text, index) => {
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-4">
        {renderInlineFormatting(text)}
      </p>
    );
  };

  // Enhanced inline formatting function
  const renderInlineFormatting = (text) => {
    if (!text) return '';
    
    // Handle various inline formats
    let formatted = text;
    
    // Bold (**text** or __text__)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic (*text* or _text_)
    formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    formatted = formatted.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
    
    // Strikethrough (~~text~~)
    formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Inline code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Links ([text](url) or just URLs)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Highlight (==text==)
    formatted = formatted.replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return <div className="formatted-text">{formatText(text)}</div>;
};

export default FormattedText;