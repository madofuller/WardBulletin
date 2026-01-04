import React, { useState } from 'react';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Code, Eye, Edit2 } from 'lucide-react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function HtmlEditor({ value, onChange, placeholder = 'Enter content...' }: HtmlEditorProps) {
  const [showSource, setShowSource] = useState(false);

  const sanitizedValue = sanitizeHtml(value || '');

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (!textarea || textarea.tagName !== 'TEXTAREA') return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end);
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + openTag.length + selectedText.length + closeTag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const wrapSelection = (openTag: string, closeTag: string) => {
    insertTag(openTag, closeTag);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2 py-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => wrapSelection('<strong>', '</strong>')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<em>', '</em>')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<u>', '</u>')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => {
              const textarea = document.activeElement as HTMLTextAreaElement;
              if (textarea && textarea.tagName === 'TEXTAREA') {
                const start = textarea.selectionStart;
                const newValue = value.substring(0, start) + '<p></p>' + value.substring(start);
                onChange(newValue);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 3, start + 3);
                }, 0);
              }
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-medium"
            title="Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<h3>', '</h3>')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-medium"
            title="Heading"
          >
            H3
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => {
              const textarea = document.activeElement as HTMLTextAreaElement;
              if (textarea && textarea.tagName === 'TEXTAREA') {
                const start = textarea.selectionStart;
                const newValue = value.substring(0, start) + '<ul><li></li></ul>' + value.substring(start);
                onChange(newValue);
                setTimeout(() => {
                  textarea.focus();
                  const newPos = start + 8;
                  textarea.setSelectionRange(newPos, newPos);
                }, 0);
              }
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Unordered List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const textarea = document.activeElement as HTMLTextAreaElement;
              if (textarea && textarea.tagName === 'TEXTAREA') {
                const start = textarea.selectionStart;
                const newValue = value.substring(0, start) + '<ol><li></li></ol>' + value.substring(start);
                onChange(newValue);
                setTimeout(() => {
                  textarea.focus();
                  const newPos = start + 8;
                  textarea.setSelectionRange(newPos, newPos);
                }, 0);
              }
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => {
              const textarea = document.activeElement as HTMLTextAreaElement;
              if (textarea && textarea.tagName === 'TEXTAREA') {
                const start = textarea.selectionStart;
                const newValue = value.substring(0, start) + '<br>' + value.substring(start);
                onChange(newValue);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 4, start + 4);
                }, 0);
              }
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Line Break"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSource(!showSource)}
            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
            title={showSource ? "Show Preview" : "Show HTML Source"}
          >
            {showSource ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
            <span>{showSource ? 'Preview' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex" style={{ minHeight: '200px' }}>
        {/* Edit Pane - Always show textarea, but hide preview when showing source */}
        <div className={`${showSource ? 'hidden' : 'flex-1'} border-r border-gray-200`}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-3 resize-none border-0 focus:outline-none text-sm"
            style={{ minHeight: '200px' }}
          />
        </div>

        {/* Preview Pane */}
        <div className={`${showSource ? 'w-full' : 'flex-1'} bg-gray-50 p-3 overflow-auto`} style={{ minHeight: '200px' }}>
          {showSource ? (
            <textarea
              value={value}
              readOnly
              className="w-full h-full p-3 resize-none border-0 focus:outline-none font-mono text-xs bg-white"
              style={{ minHeight: '200px' }}
            />
          ) : sanitizedValue ? (
            <div
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: sanitizedValue
                  .replace(/<ul>/g, '<ul style="list-style-type: disc; list-style-position: inside; margin-left: 1rem; margin-bottom: 0.5rem;">')
                  .replace(/<ol>/g, '<ol style="list-style-type: decimal; list-style-position: inside; margin-left: 1rem; margin-bottom: 0.5rem;">')
                  .replace(/<li>/g, '<li style="margin-left: 0.5rem; display: list-item;">')
              }}
            />
          ) : (
            <div className="text-gray-400 italic">{placeholder}</div>
          )}
        </div>
      </div>
    </div>
  );
}

