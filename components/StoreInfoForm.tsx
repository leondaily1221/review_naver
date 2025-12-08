import React from 'react';

export interface StoreInfo {
  name: string;
  menuItems: string;
  charLimit: string;
}

interface StoreInfoFormProps {
  storeInfo: StoreInfo;
  onChange: (field: keyof StoreInfo, value: string) => void;
}

export const StoreInfoForm: React.FC<StoreInfoFormProps> = ({ storeInfo, onChange }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof StoreInfo; value: string };
    onChange(name, value);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">가게 기본 정보 입력</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Store Name */}
        <div className="md:col-span-2">
          <label htmlFor="store-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            가게 이름
          </label>
          <input
            id="store-name"
            name="name"
            type="text"
            value={storeInfo.name}
            onChange={handleInputChange}
            placeholder="예: AGS파스타 송도점"
            className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>

        {/* Menu Items */}
        <div className="md:col-span-2">
          <label htmlFor="menu-items" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            대표 메뉴 (선택 사항, 쉼표로 구분)
          </label>
          <textarea
            id="menu-items"
            name="menuItems"
            value={storeInfo.menuItems}
            onChange={handleInputChange}
            placeholder="비워두시면 AI가 사진을 분석해요. 예: 크림 파스타, 바질 페스토 피자"
            rows={3}
            className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
          />
        </div>
        
        {/* Character Limit */}
        <div className="md:col-span-2">
            <label htmlFor="char-limit" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                글자 수 제한 (선택)
            </label>
            <input
                id="char-limit"
                name="charLimit"
                type="number"
                value={storeInfo.charLimit}
                onChange={handleInputChange}
                min="10"
                placeholder="예: 200 (비워두면 제한 없음)"
                className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
        </div>
      </div>
    </div>
  );
};