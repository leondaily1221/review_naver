
import React, { useState, useCallback, useEffect } from 'react';
import { Loader } from './components/Loader';
import { generateReviewReply, analyzeReviewsForImprovements } from './services/geminiService';
import { StoreInfoForm, StoreInfo } from './components/StoreInfoForm';
import { ReviewProcessor } from './components/ReviewProcessor';
import { AnalysisModal } from './components/AnalysisModal';
import { ThemeToggle } from './components/ThemeToggle';
import { InstructionsModal } from './components/InstructionsModal';
import { ApiKeyManagerModal } from './components/ApiKeyManagerModal';
import { KeyIcon, QuestionMarkCircleIcon } from './components/Icons';


export interface ReviewSlot {
  id: number;
  imageFile: File | null;
  imageBase64: string | null;
  generatedReply: string;
  isLoading: boolean;
  error: string | null;
}

export interface AnalysisPoint {
  title: string;
  description: string;
}

export interface AnalysisResult {
  improvementPoints: AnalysisPoint[];
  strengths: AnalysisPoint[];
  summary: string;
}

type GenerationSuccess = { id: number; success: true; reply: string; };
type GenerationFailure = { id: number; success: false; error: string; };
type GenerationResult = GenerationSuccess | GenerationFailure;


const DAILY_LIMIT = 20;

const getKSTDateString = (): string => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const kstDate = new Date(utc + KST_OFFSET);
    return kstDate.toISOString().split('T')[0];
};


const App: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '',
    menuItems: '',
    charLimit: '',
  });
  const [reviewSlots, setReviewSlots] = useState<ReviewSlot[]>([{
    id: 1,
    imageFile: null,
    imageBase64: null,
    generatedReply: '',
    isLoading: false,
    error: null,
  }]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);


  useEffect(() => {
    try {
        const todayKST = getKSTDateString();
        const storedDate = localStorage.getItem('usageDate');
        const storedCount = localStorage.getItem('usageCount');
        // Removed: localStorage for apiKey
        
        if (storedDate === todayKST && storedCount) {
            setUsageCount(Number(storedCount));
        } else {
            localStorage.setItem('usageDate', todayKST);
            localStorage.setItem('usageCount', '0');
            setUsageCount(0);
        }
    } catch (error) {
        console.warn("Could not access localStorage. Usage counting will not be persisted.", error);
        setUsageCount(0);
    }
  }, []);

  const handleApiKeyLoaded = (key: string) => {
    setApiKey(key);
    // Remove error messages related to missing API keys
    setReviewSlots(prev => prev.map(slot => slot.error && slot.error.includes('API 키') ? { ...slot, error: null } : slot));
  };

  const handleStoreInfoChange = useCallback((field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddSlot = () => {
    if (reviewSlots.length < 10) {
      setReviewSlots(prev => [...prev, {
        id: Date.now(),
        imageFile: null,
        imageBase64: null,
        generatedReply: '',
        isLoading: false,
        error: null,
      }]);
    }
  };
  
  const handleImageUpload = (id: number, file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          setReviewSlots(prevSlots => prevSlots.map(slot => 
              slot.id === id 
              ? { ...slot, imageFile: file, imageBase64: reader.result as string, error: null, generatedReply: '' } 
              : slot
          ));
      };
      reader.onerror = () => {
          setReviewSlots(prevSlots => prevSlots.map(slot => 
              slot.id === id 
              ? { ...slot, error: '이미지 파일을 읽는 중 오류가 발생했습니다.' } 
              : slot
          ));
      };
  };

  const handleGenerateAll = useCallback(async () => {
      if (!apiKey) {
        setIsApiKeyManagerOpen(true);
        setReviewSlots(prev => prev.map((slot, index) => index === 0 ? {...slot, error: 'API 키가 로드되지 않았습니다. 우측 상단 열쇠 아이콘을 클릭하여 키를 불러와주세요.'} : slot));
        return;
      }

      if (!storeInfo.name.trim()) {
          setReviewSlots(prev => prev.map((slot, index) => index === 0 ? {...slot, error: '가게 이름을 입력해주세요.'} : slot));
          return;
      }

      const slotsToProcess = reviewSlots.filter(slot => slot.imageBase64 && !slot.generatedReply);
      if (slotsToProcess.length === 0) return;

      if (usageCount + slotsToProcess.length > DAILY_LIMIT) {
          const errorMessage = `오늘 사용량(${usageCount}/${DAILY_LIMIT})을 초과하여 ${slotsToProcess.length}개를 생성할 수 없습니다.`;
          const firstEmptySlotId = reviewSlots.find(s => !s.generatedReply)?.id || reviewSlots[0].id;
          setReviewSlots(prev => prev.map(slot => slot.id === firstEmptySlotId ? {...slot, error: errorMessage} : slot));
          return;
      }

      setIsGeneratingAll(true);
      
      const processingIds = new Set(slotsToProcess.map(s => s.id));
      setReviewSlots(prev => prev.map(s => processingIds.has(s.id) ? { ...s, isLoading: true, error: null } : s));

      const generationPromises = slotsToProcess.map(async (slot): Promise<GenerationResult> => {
          try {
              const base64Data = slot.imageBase64!.split(',')[1];
              const mimeType = slot.imageFile?.type || 'image/png';
              const limit = storeInfo.charLimit ? parseInt(storeInfo.charLimit, 10) : null;
              const reply = await generateReviewReply(base64Data, mimeType, storeInfo, limit, apiKey);
              return { id: slot.id, success: true, reply };
          } catch (err) {
              const message = err instanceof Error ? err.message : '알 수 없는 오류 발생';
              return { id: slot.id, success: false, error: message };
          }
      });

      const results: GenerationResult[] = await Promise.all(generationPromises);
      
      setReviewSlots(prevSlots => {
        const resultsMap = new Map(results.map(r => [r.id, r]));
        return prevSlots.map(slot => {
            const result = resultsMap.get(slot.id);
            if (!result) {
                return slot;
            }

            switch (result.success) {
              case true:
                return { ...slot, isLoading: false, generatedReply: result.reply, error: null };
              case false:
                return { ...slot, isLoading: false, error: result.error };
            }
        });
      });

      const successfulResults = results.filter((r): r is GenerationSuccess => r.success);
      if (successfulResults.length > 0) {
          const newUsageCount = usageCount + successfulResults.length;
          setUsageCount(newUsageCount);
          try {
            localStorage.setItem('usageCount', String(newUsageCount));
            const todayKST = getKSTDateString();
            localStorage.setItem('usageDate', todayKST);
          } catch (error) {
             console.warn("Could not write to localStorage. Usage counting may be inaccurate.", error);
          }
      }
      
      setIsGeneratingAll(false);

  }, [reviewSlots, storeInfo, usageCount, apiKey]);

  const handleAnalyzeImprovements = useCallback(async () => {
    if (!apiKey) {
        setIsApiKeyManagerOpen(true);
        setAnalysisError("API 키가 로드되지 않았습니다. 우측 상단 열쇠 아이콘을 클릭하여 키를 불러와주세요.");
        setIsAnalysisModalOpen(true);
        return;
    }
      
    const reviewsToAnalyze = reviewSlots.filter(slot => slot.imageBase64 && slot.imageFile);
    
    if (reviewsToAnalyze.length === 0) {
        setAnalysisError("분석할 리뷰가 없습니다. 리뷰 이미지를 먼저 업로드해주세요.");
        setIsAnalysisModalOpen(true);
        return;
    }

    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
        const reviewData = reviewsToAnalyze.map(slot => ({
            imageBase64Data: slot.imageBase64!.split(',')[1],
            mimeType: slot.imageFile!.type,
        }));
        
        const resultJson = await analyzeReviewsForImprovements(reviewData, storeInfo.name, apiKey);
        try {
            const parsedResult = JSON.parse(resultJson);
            setAnalysisResult(parsedResult);
        } catch (parseError) {
             console.error("Failed to parse analysis JSON:", parseError);
             setAnalysisError("분석 결과를 처리하는 중 오류가 발생했습니다. AI가 유효한 형식의 답변을 생성하지 못했을 수 있습니다.");
        }

    } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류 발생';
        setAnalysisError(message);
    } finally {
        setIsAnalyzing(false);
    }
  }, [reviewSlots, storeInfo.name, apiKey]);
  
  const handleResetAll = () => {
    setStoreInfo({ name: '', menuItems: '', charLimit: '' });
    setReviewSlots([{
      id: 1,
      imageFile: null,
      imageBase64: null,
      generatedReply: '',
      isLoading: false,
      error: null,
    }]);
    setIsGeneratingAll(false);
  };
  
  const pendingSlotsCount = reviewSlots.filter(s => s.imageFile && !s.generatedReply).length;
  const canGenerate = storeInfo.name.trim() && pendingSlotsCount > 0 && !isGeneratingAll;
  const hasGeneratedReplies = reviewSlots.some(slot => slot.generatedReply);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-left w-full sm:w-auto">
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>✨ 우리가게 리뷰 답글 생성기</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">가게 정보를 한 번만 입력하고, 여러 리뷰에 대한 답글을 한번에 생성해보세요.</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${apiKey ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
                    <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                    {apiKey ? 'API 연결됨' : 'API 미연결'}
                </div>
                <button
                    onClick={() => setIsApiKeyManagerOpen(true)}
                    className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    title="API 키 매니저 (보안 키 파일 관리)"
                >
                    <KeyIcon />
                </button>
                <button
                    onClick={() => setIsInstructionsModalOpen(true)}
                    className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    title="사용 설명서"
                >
                    <QuestionMarkCircleIcon />
                </button>
                <ThemeToggle />
            </div>
        </header>

        <main className="space-y-8">
          <StoreInfoForm storeInfo={storeInfo} onChange={handleStoreInfoChange} />
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8">
             <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">리뷰 답글 생성 (최대 10개)</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviewSlots.map((slot, index) => (
                    <ReviewProcessor 
                        key={slot.id} 
                        slotData={slot}
                        onImageUpload={(file) => handleImageUpload(slot.id, file)}
                        index={index}
                    />
                ))}
             </div>
             <div className="mt-8 flex justify-center">
                <button 
                    onClick={handleAddSlot} 
                    disabled={reviewSlots.length >= 10 || isGeneratingAll}
                    className="px-6 py-2 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    + 리뷰 추가하기
                </button>
             </div>
          </div>
          
          <div className="flex flex-row gap-2 justify-center items-stretch sticky bottom-4 z-10">
            <button
              onClick={handleGenerateAll}
              disabled={!canGenerate}
              className="flex-grow px-4 py-3 sm:px-6 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base"
            >
              {isGeneratingAll ? '생성 중...' : `답글 ${pendingSlotsCount}개 생성 🚀`}
            </button>
             <button
                onClick={handleAnalyzeImprovements}
                disabled={!hasGeneratedReplies || isGeneratingAll || isAnalyzing}
                className="px-4 py-3 sm:px-5 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-sm sm:text-base whitespace-nowrap"
            >
                {isAnalyzing ? '분석 중...' : '개선점 분석 ✨'}
            </button>
             <button
                onClick={handleResetAll}
                disabled={isGeneratingAll || isAnalyzing}
                className="px-4 py-3 sm:px-5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors duration-300 text-sm sm:text-base whitespace-nowrap"
            >
                초기화
            </button>
            <div className="px-3 py-3 sm:px-4 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 font-bold rounded-xl text-center text-sm sm:text-base whitespace-nowrap flex items-center justify-center" title={`오늘 사용량: ${usageCount} / ${DAILY_LIMIT}`}>
                {usageCount} / {DAILY_LIMIT}
            </div>
          </div>
        </main>
      </div>
      <footer className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm mt-8">
        <p>AGS 이지스비즈니스그룹</p>
      </footer>
       <AnalysisModal
            isOpen={isAnalysisModalOpen}
            onClose={() => setIsAnalysisModalOpen(false)}
            isLoading={isAnalyzing}
            result={analysisResult}
            error={analysisError}
        />
       <InstructionsModal
            isOpen={isInstructionsModalOpen}
            onClose={() => setIsInstructionsModalOpen(false)}
       />
       <ApiKeyManagerModal
            isOpen={isApiKeyManagerOpen}
            onClose={() => setIsApiKeyManagerOpen(false)}
            onApiKeyLoaded={handleApiKeyLoaded}
       />
    </div>
  );
};

export default App;
