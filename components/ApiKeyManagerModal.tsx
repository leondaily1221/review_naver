
import React, { useState, useRef } from 'react';
import { encryptData, decryptData } from '../utils/crypto';
import { validateApiKey } from '../services/geminiService';
import { Loader } from './Loader';
import { KeyIcon, CheckIcon, UploadIcon } from './Icons';

interface ApiKeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyLoaded: (apiKey: string) => void;
}

type Tab = 'load' | 'create';

export const ApiKeyManagerModal: React.FC<ApiKeyManagerModalProps> = ({ isOpen, onClose, onApiKeyLoaded }) => {
  const [activeTab, setActiveTab] = useState<Tab>('load');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setApiKeyInput('');
    setPassword('');
    setStatus('idle');
    setStatusMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    resetState();
  };

  const handleCreateFile = async () => {
    if (!apiKeyInput.trim() || !password.trim()) {
      setStatus('error');
      setStatusMessage('API 키와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setStatus('processing');
    setStatusMessage('API 키 연결 테스트 중...');

    const isValid = await validateApiKey(apiKeyInput.trim());
    if (!isValid) {
      setStatus('error');
      setStatusMessage('유효하지 않은 API 키입니다. 구글 AI Studio에서 키를 확인해주세요.');
      return;
    }

    try {
      setStatusMessage('파일 암호화 중...');
      const encryptedData = await encryptData(apiKeyInput.trim(), password);
      
      const blob = new Blob([encryptedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gemini-api-key.enc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('success');
      setStatusMessage('암호화된 키 파일이 다운로드되었습니다. 이 파일을 안전하게 보관하세요.');
      onApiKeyLoaded(apiKeyInput.trim());
      setTimeout(onClose, 2000);
    } catch (e) {
      setStatus('error');
      setStatusMessage('파일 생성 중 오류가 발생했습니다.');
    }
  };

  const handleLoadFile = async () => {
    if (!selectedFile || !password.trim()) {
      setStatus('error');
      setStatusMessage('키 파일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setStatus('processing');
    setStatusMessage('파일 복호화 중...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const encryptedContent = e.target?.result as string;
        const decryptedApiKey = await decryptData(encryptedContent, password);

        setStatusMessage('API 키 연결 테스트 중...');
        const isValid = await validateApiKey(decryptedApiKey);
        
        if (isValid) {
          setStatus('success');
          setStatusMessage('API 키 인증 성공! 안전하게 연결되었습니다.');
          onApiKeyLoaded(decryptedApiKey);
          setTimeout(onClose, 1500);
        } else {
          setStatus('error');
          setStatusMessage('복호화된 키가 유효하지 않습니다. 키가 만료되었거나 취소되었을 수 있습니다.');
        }
      } catch (error) {
        setStatus('error');
        setStatusMessage('비밀번호가 틀리거나 파일이 손상되었습니다.');
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'load' ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            onClick={() => handleTabChange('load')}
          >
            키 불러오기
          </button>
          <button
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'create' ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            onClick={() => handleTabChange('create')}
          >
            새 키 파일 생성
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center mb-4">
            <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
              <KeyIcon />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {activeTab === 'load' ? 'API 키 불러오기' : '보안 키 파일 생성'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'load' 
                ? '저장된 암호화 파일(.enc)을 업로드하여 키를 사용합니다.' 
                : 'API 키를 암호화하여 로컬 파일로 저장합니다.'}
            </p>
          </div>

          {activeTab === 'create' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AI Studio에서 발급받은 키 입력"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">파일 암호 설정 (비밀번호)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="파일을 보호할 비밀번호 입력"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleCreateFile}
                disabled={status === 'processing'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {status === 'processing' ? <Loader /> : '연결 테스트 및 파일 저장'}
              </button>
            </>
          ) : (
            <>
               <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-32 ${selectedFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                  accept=".enc" 
                  className="hidden" 
                />
                <UploadIcon />
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {selectedFile ? selectedFile.name : 'gemini-api-key.enc 파일 선택'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">파일 비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="암호화 시 설정한 비밀번호"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleLoadFile}
                disabled={status === 'processing'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {status === 'processing' ? <Loader /> : '복호화 및 연결'}
              </button>
            </>
          )}

          {status !== 'idle' && (
            <div className={`p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2 ${
              status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {status === 'success' && <CheckIcon />}
              {statusMessage}
            </div>
          )}

          <div className="flex justify-center mt-2">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm underline">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
