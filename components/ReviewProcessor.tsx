import React from 'react';
import type { ReviewSlot } from '../App';
import { ImageUploader } from './ImageUploader';
import { ReplyDisplay } from './ReplyDisplay';
import { Loader } from './Loader';

interface ReviewProcessorProps {
  slotData: ReviewSlot;
  onImageUpload: (file: File) => void;
  index: number;
}

export const ReviewProcessor: React.FC<ReviewProcessorProps> = ({ slotData, onImageUpload, index }) => {
  const { imageBase64, generatedReply, isLoading, error } = slotData;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 h-full flex flex-col">
      <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">리뷰 #{index + 1}</h3>
      
      <div className="flex-grow">
        <ImageUploader onImageUpload={onImageUpload} imagePreviewUrl={imageBase64} />
      </div>
      
      {isLoading && <Loader />}

      {error && <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
      
      {generatedReply && !isLoading && (
        <div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">생성된 답글:</h4>
            <ReplyDisplay replyText={generatedReply} />
        </div>
      )}
    </div>
  );
};