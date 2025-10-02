
import React from 'react';

// Simple Rich Text Editor Component
export const SimpleRichTextEditor = ({ value, onChange, placeholder, className }) => {
  const textareaRef = React.useRef(null);

  const insertFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Kalın (Bold)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="İtalik (Italic)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('# ', '')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Başlık 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('## ', '')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Başlık 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('### ', '')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Başlık 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('- ', '')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Liste"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('[', '](url)')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('![alt](', ')')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Resim"
        >
          🖼️
        </button>
      </div>
      
      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 border-none resize-none focus:outline-none ${className}`}
        rows={12}
      />
      
      {/* Preview Help */}
      <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <strong>Markdown desteklenir:</strong> **kalın**, *italik*, # başlık, - liste, [link](url), ![resim](url)
      </div>
    </div>
  );
};