import React from 'react';
import { Loader } from './Loader';
import type { AnalysisResult } from '../App';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, result, error }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-modal-title"
    >
      <div
        className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
          <h2 id="analysis-modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">
            가게 개선점 분석 결과
          </h2>
        </header>
        <main className="p-6 sm:p-8 overflow-y-auto">
          {isLoading && <Loader />}
          {error && <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">{error}</div>}
          {result && !isLoading && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">💡 개선이 필요한 점</h3>
                {result.improvementPoints.length > 0 ? (
                  <div className="space-y-4">
                    {result.improvementPoints.map((point, index) => (
                      <div key={`imp-${index}`} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{point.title}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm leading-6">{point.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center text-slate-600 dark:text-slate-300">
                    <p>특별한 개선점은 발견되지 않았습니다. 고객들이 만족한 점을 확인해보세요!</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">⭐ 고객들이 만족한 점</h3>
                {result.strengths.length > 0 ? (
                  <div className="space-y-4">
                    {result.strengths.map((point, index) => (
                      <div key={`str-${index}`} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{point.title}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm leading-6">{point.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center text-slate-600 dark:text-slate-300">
                    <p>아직 칭찬 리뷰가 부족해요. 꾸준히 고객님들께 좋은 경험을 선사해주세요!</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">✨ 총평</h3>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
                  <p className="text-indigo-800 dark:text-indigo-200 font-medium">{result.summary}</p>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end sticky bottom-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  );
};