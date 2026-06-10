import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useRef, useCallback } from 'react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'header': 3 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'bold', 'italic', 'underline',
  'header',
  'list',
  'link'
];

export default function HtmlEditor({ value, onChange, placeholder = 'Enter content...' }: HtmlEditorProps) {
  // Track the last value to prevent infinite loops
  const lastValueRef = useRef(value);

  const handleChange = useCallback((newValue: string) => {
    // Only call onChange if the value actually changed
    // This prevents infinite loops when Quill re-renders
    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      onChange(newValue);
    }
  }, [onChange]);

  // Update ref when value prop changes externally
  if (value !== lastValueRef.current) {
    lastValueRef.current = value;
  }

  return (
    <div className="html-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      <style>{`
        .html-editor .ql-container {
          min-height: 120px;
          font-size: 14px;
        }
        .html-editor .ql-editor {
          min-height: 120px;
        }
        .html-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f9fafb;
        }
        .html-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      `}</style>
    </div>
  );
}
