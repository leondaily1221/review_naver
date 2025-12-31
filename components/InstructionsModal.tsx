
import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

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
            사용 안내
          </h2>
        </header>
        <main className="p-6 sm:p-8 overflow-y-auto space-y-8 text-slate-700 dark:text-slate-300">
          
          {/* 배포 및 광고 섹션 (최상단 추가) */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 text-sm leading-relaxed">
            <p className="mb-4">
              이 앱은 <span className="font-bold text-slate-900 dark:text-white underline decoration-indigo-500 underline-offset-4">AI마케팅 + 가맹거래사 마케팅에이전시 이지스비즈니스그룹</span>에서 소상공인들을 위하여 무료 배포 되고 있는 웹앱서비스 입니다.
            </p>
            <p className="mb-4 font-semibold text-red-600 dark:text-red-400">
              무료서비스인 만큼 당 서비스는 예고없이 중단될 수 있습니다.
            </p>
            <div className="space-y-3 pt-4 border-t border-indigo-200 dark:border-indigo-800/50">
              <p className="font-bold text-slate-800 dark:text-slate-100">
                개발 운영 : 이지스비즈니스그룹 마케팅브랜딩팀 (📞 1660-0952)
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <li>브랜드 마케팅, 플레이스 마케팅 등 브랜드 성장을 위한 마케팅이 필요한 경우</li>
                <li>AI 답변에 내 브랜드가 채택되는 GEO, AEO 등의 AI 마케팅이 필요한 경우</li>
              </ul>
              <p className="mt-3 text-indigo-700 dark:text-indigo-300 font-bold">
                언제든지 위 전화번호로 연락주시면 정성껏 상담드리겠습니다.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">🔑 API 키 관리 (중요)</h3>
            <p className="text-sm mb-3">
              이 앱은 보안을 위해 API 키를 서버나 브라우저에 영구 저장하지 않습니다.
            </p>
            <p className="text-sm">
              우측 상단의 열쇠 아이콘(<span className="inline-block align-text-bottom"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg></span>)을 클릭하여 <strong>API 키 매니저</strong>를 실행하세요.
              API 키를 암호화된 파일로 내 컴퓨터에 안전하게 저장하고, 필요할 때마다 불러와서 사용할 수 있습니다.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">📜 API 키 발급 방법</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
                <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Google AI Studio</a>에 접속하여 구글 계정으로 로그인합니다.</li>
                <li>'Create API key' 버튼을 클릭하여 새 API 키를 생성합니다.</li>
                <li>API 키 매니저에서 '새 키 파일 생성'을 선택하고 키를 등록하세요.</li>
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
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            확인
          </button>
        </footer>
      </div>
    </div>
  );
};
