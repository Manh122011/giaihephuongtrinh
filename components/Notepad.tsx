
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { getGeminiFeedbackForNotes } from '../services/geminiService';
import { Part } from '@google/genai';
import html2canvas from 'html2canvas';


const Notepad: React.FC = () => {
  const [geminiResponse, setGeminiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [contentEditable][data-placeholder]:empty::before {
        content: attr(data-placeholder);
        color: #64748b; /* slate-500 */
        pointer-events: none;
        display: block;
      }
    `;
    document.head.appendChild(style);

    const editor = editorRef.current;
    if (!editor) return;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // Handle plain text
      const text = clipboardData.getData('text/plain');
      if (text) {
        document.execCommand('insertText', false, text);
      }

      // Handle images
      if (clipboardData.files.length > 0) {
        Array.from(clipboardData.files).forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (!dataUrl) return;

              // Use the original data URL directly, preserving the original format
              document.execCommand('insertHTML', false, `<img src="${dataUrl}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`);
              handleInput({ currentTarget: editor } as React.FormEvent<HTMLDivElement>);
            };
            reader.readAsDataURL(file);
          }
        });
      }
    };
    
    editor.addEventListener('paste', handlePaste);

    return () => {
      document.head.removeChild(style);
      if (editor) {
        editor.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const hasText = target.innerText.trim().length > 0;
    const hasImage = !!target.querySelector('img');
    setIsEmpty(!hasText && !hasImage);
  };

  const handleAskGemini = async () => {
    if (!editorRef.current) return;

    setIsLoading(true);
    setGeminiResponse('');

    const parts: Part[] = [];
    const content = editorRef.current.cloneNode(true) as HTMLElement;
    
    const images = Array.from(content.getElementsByTagName('img'));
    for (const imgElement of images) {
      const src = imgElement.src;
      if (src.startsWith('data:image/')) {
        const [mimePart, base64Part] = src.split(',');
        if (mimePart && base64Part) {
          const mimeType = mimePart.split(':')[1]?.split(';')[0];
          if (mimeType) {
            parts.push({
              inlineData: {
                mimeType,
                data: base64Part,
              },
            });
          }
        }
      }
      imgElement.remove();
    }

    const textContent = content.textContent || "";
    if (textContent.trim()) {
      parts.unshift({ text: textContent.trim() });
    }

    const response = await getGeminiFeedbackForNotes(parts);
    setGeminiResponse(response);
    setIsLoading(false);
  };

  const handleExportAsPng = () => {
    if (exportRef.current) {
      html2canvas(exportRef.current, {
        backgroundColor: '#1e293b',
        ignoreElements: (element) => element.classList.contains('no-export'),
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'gemini-notepad.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div ref={exportRef} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in-down">
      <div
        ref={editorRef}
        contentEditable="true"
        onInput={handleInput}
        data-placeholder="Nhập ghi chú của bạn, dán hình ảnh hoặc đặt câu hỏi... Ví dụ: giải hệ phương trình trong ảnh."
        className="w-full min-h-64 bg-slate-900 border-2 border-slate-700 rounded-lg p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors overflow-y-auto"
        aria-label="Notepad"
      />
      <div className="mt-4 text-center no-export">
        <Button onClick={handleAskGemini} disabled={isLoading || isEmpty}>
          {isLoading ? 'Đang xử lý...' : 'Hỏi Gemini'}
        </Button>
      </div>

      {(isLoading || geminiResponse) && (
        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-indigo-400">Phản hồi của Gemini:</h3>
            {geminiResponse && !isLoading && (
              <Button onClick={handleExportAsPng} variant="secondary" className="no-export">
                Lưu PNG
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            </div>
          ) : (
            <div className="text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto prose prose-invert prose-p:my-2">
              {geminiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notepad;
