import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    // After processing, reset the input value.
    // This allows the onChange event to fire even if the user selects the same file again.
    event.currentTarget.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e, false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onImageUpload(file);
      }
  }, [onImageUpload, handleDragEvents]);

  const uploaderClasses = `
    border-2 border-dashed rounded-xl cursor-pointer
    transition-all duration-300 ease-in-out
    flex flex-col items-center justify-center p-6 text-center h-64
    ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
  `;

  return (
    <div 
      className={uploaderClasses}
      onClick={handleClick}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {imagePreviewUrl ? (
        <img src={imagePreviewUrl} alt="Review screenshot preview" className="max-h-full max-w-full object-contain rounded-md" />
      ) : (
        <div className="space-y-2 text-slate-500 dark:text-slate-400">
          <UploadIcon />
          <p className="font-semibold">클릭하거나 파일을 드래그해서</p>
          <p className="text-sm">리뷰 스크린샷을 업로드하세요</p>
        </div>
      )}
    </div>
  );
};