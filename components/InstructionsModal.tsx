import React, { useState, useEffect } from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onApiKeySave: (key: string) => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose, currentApiKey, onApiKeySave }) => {
  const [apiKeyInput, setApiKeyInput] = useState(currentApiKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKeyInput(currentApiKey);
  }, [currentApiKey]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onApiKeySave(apiKeyInput);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-modal-title"
    >
      <div
        className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
          <h2 id="instructions-modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">
            사용 안내 및 API 키 설정
          </h2>
        </header>
        <main className="p-6 sm:p-8 overflow-y-auto space-y-8 text-slate-700 dark:text-slate-300">
          
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">🔑 API 키 설정</h3>
            <p className="text-sm mb-3">
              이 앱을 사용하려면 본인의 Google Gemini API 키가 필요합니다. 아래에 키를 입력하고 저장해주세요.
            </p>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="여기에 API 키를 붙여넣으세요"
                className="w-full p-3 pr-20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">📜 API 키 발급 방법</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
                <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Google AI Studio</a>에 접속하여 구글 계정으로 로그인합니다.</li>
                <li>'Create API key' 버튼을 클릭하여 새 API 키를 생성합니다.</li>
                <li>생성된 키를 복사하여 위 입력창에 붙여넣고 '저장' 버튼을 누릅니다.</li>
                <li className="text-xs text-slate-500 dark:text-slate-400">참고: API 사용은 Google의 정책에 따라 과금될 수 있습니다.</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">🚀 앱 사용 방법</h3>
            <ul className="space-y-4 text-sm">
                <li>
                    <strong className="text-slate-800 dark:text-slate-100">1. 가게 정보 입력:</strong> 가게 이름, 대표 메뉴, 글자 수 제한 등 기본 정보를 입력합니다. (대표 메뉴를 비워두면 AI가 리뷰 사진을 보고 분석합니다.)
                </li>
                 <li>
                    <strong className="text-slate-800 dark:text-slate-100">2. 리뷰 이미지 업로드:</strong> '리뷰 추가하기' 버튼으로 슬롯을 추가하고, 각 슬롯에 리뷰 스크린샷을 업로드합니다. (최대 10개)
                </li>
                 <li>
                    <strong className="text-slate-800 dark:text-slate-100">3. 답글 생성:</strong> 하단의 '답글 N개 생성' 버튼을 클릭하면 AI가 각 리뷰에 맞는 답글을 자동으로 작성해줍니다.
                </li>
                 <li>
                    <strong className="text-slate-800 dark:text-slate-100">4. 개선점 분석:</strong> 답글 생성 후 '개선점 분석' 버튼을 누르면, 업로드된 리뷰들을 종합하여 가게의 강점과 개선점을 AI가 분석해줍니다.
                </li>
            </ul>
          </div>

        </main>
        <footer className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            저장
          </button>
        </footer>
      </div>
    </div>
  );
};
