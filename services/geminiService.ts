
import { GoogleGenAI, Type } from "@google/genai";
import type { StoreInfo } from "../components/StoreInfoForm";

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Make a minimal request to test the key
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: "test" }] },
            config: {
                maxOutputTokens: 1,
            }
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

export const generateReviewReply = async (imageBase64Data: string, mimeType: string, storeInfo: StoreInfo, charLimit: number | null, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API 키가 제공되지 않았습니다. API 키를 입력해주세요.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    let menuInstructions = '';
    if (storeInfo.menuItems && storeInfo.menuItems.trim() !== '') {
        menuInstructions = `
        4.  **메뉴 언급:** 우리 가게의 대표 메뉴를 자연스럽게 언급해주세요. 다음은 우리 가게의 대표 메뉴 목록입니다: [${storeInfo.menuItems}]. 이미지에 보이는 메뉴나 고객이 언급한 메뉴를 중심으로 칭찬해주면 더욱 좋습니다.
        5.  **메뉴 설명:** 메뉴를 언급할 때, 왜 맛있는지에 대한 간단한 설명을 덧붙여주세요. (예: '저희 대표 메뉴인  Makarna 파스타는 매일 아침 직접 끓인 신선한 토마토 소스로 만들어져서 손님들께서 많이 사랑해주신답니다!')`;
    } else {
        menuInstructions = `
        4.  **메뉴 분석 및 언급:** 첨부된 리뷰 스크린샷 이미지를 면밀히 분석하여 고객이 어떤 메뉴를 먹었는지 파악해주세요. 파악된 메뉴의 이름을 답글에 자연스럽게 언급하며 칭찬해주세요. (예: '주문해주신 OO 파스타와 OO 피자 맛있게 드셨다니 정말 기쁩니다!') 만약 이미지에서 메뉴를 파악하기 어렵다면, 고객이 작성한 리뷰 내용에서 메뉴를 찾아 언급해주세요.
        5.  **메뉴 칭찬:** 분석된 메뉴에 대해 긍정적인 칭찬을 덧붙여주세요. (예: '특히 저희 파스타는 신선한 재료로 정성껏 만들어 많은 분들이 좋아해주시는 메뉴랍니다.')`;
    }
    
    let prompt = `
        당신은 대한민국에서 '${storeInfo.name}' 식당을 운영하는 사장님을 위한 친절한 AI 어시던트입니다. 고객의 네이버 리뷰 스크린샷에 대한 답글을 작성하는 것이 당신의 임무입니다.

        첨부된 리뷰 스크린샷 이미지를 분석하고, 아래 지침에 따라 고객의 마음에 와닿는 따뜻하고 진심 어린 답글을 작성해주세요.

        **지침:**
        1.  **어조:** 매우 친절하고, 상냥하며, 정중한 말투를 사용해주세요. 고객에게 감사하는 마음이 느껴지도록 작성해주세요.
        2.  **이모지:** 문맥에 맞는 귀엽고 긍정적인 이모지 (예: 😊, 🙏, ❤️, ✨, 👍)를 2~3개 적절하게 사용해주세요.
        3.  **가게 이름:** 우리 가게 이름인 '${storeInfo.name}'을 자연스럽게 언급해주세요.
        ${menuInstructions}
        6.  **재방문 유도:** 감사 인사를 전하며, 다음 방문을 기약하는 긍정적인 문구로 마무리해주세요.
        7.  **형식:** 최종 결과물은 다른 설명 없이, 사장님이 바로 복사해서 붙여넣을 수 있는 완벽한 댓글 내용만 생성해주세요.`;

    if (charLimit) {
        prompt += `\n        8.  **글자 수 제한:** 답글은 반드시 공백 포함 ${charLimit}자 이내로 작성해주세요.`;
    }

    prompt += `\n\n        분석을 시작하고, 최고의 답글을 작성해주세요!
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: imageBase64Data,
                        },
                    },
                    { text: prompt },
                ],
            }
        });
        
        return response.text;

    } catch (error) {
        console.error("Error generating content with Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("유효하지 않은 API 키입니다. 키를 확인해주세요.");
        }
        throw new Error("AI 답글을 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};

export const analyzeReviewsForImprovements = async (
    reviews: { imageBase64Data: string; mimeType: string }[],
    storeName: string,
    apiKey: string,
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API 키가 제공되지 않았습니다. API 키를 입력해주세요.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        당신은 대한민국에서 '${storeName}' 식당을 운영하는 사장님을 돕는 뛰어난 비즈니스 컨설턴트입니다.
        첨부된 고객 리뷰 스크린샷 이미지들을 종합적으로 분석하여, 우리 가게가 더 발전할 수 있는 '개선점'과 고객들이 만족한 '강점'을 찾아주세요.

        **분석 및 출력 지침:**
        1.  **핵심 요약:** 리뷰 내용에서 반복적으로 나타나는 칭찬이나 불만 사항을 핵심만 간결하게 요약해주세요.
        2.  **구체적인 제안:** 발견된 개선점에 대해서는 사장님이 실제로 실행할 수 있는 구체적인 해결책을 제시해주세요.
        3.  **JSON 형식 준수:** 반드시 아래에 명시된 JSON 스키마에 맞춰 결과를 생성해야 합니다. 다른 설명이나 텍스트 없이 유효한 JSON 객체만 반환해주세요.

        **분석 항목:**
        - **improvementPoints (개선점):** 고객 리뷰에서 발견된 불만이나 아쉬운 점 1~2개. (만약 없다면 빈 배열로 반환)
        - **strengths (강점):** 고객들이 가장 칭찬하는 우리 가게의 좋은 점 1~2개.
        - **summary (총평):** 분석 결과를 바탕으로 사장님을 위한 격려와 조언이 담긴 한두 문장의 짧은 총평.

        분석을 시작하고, '${storeName}' 가게의 성공을 위한 통찰력 있는 JSON 분석 결과를 생성해주세요!
    `;
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        improvementPoints: {
          type: Type.ARRAY,
          description: '개선이 필요한 점 목록입니다. 각 항목은 제목과 설명으로 구성됩니다.',
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: '개선점의 핵심 제목입니다.' },
              description: { type: Type.STRING, description: '개선점에 대한 구체적인 설명입니다.' },
            },
            required: ['title', 'description'],
          },
        },
        strengths: {
          type: Type.ARRAY,
          description: '고객들이 칭찬한 강점 목록입니다. 각 항목은 제목과 설명으로 구성됩니다.',
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: '강점의 핵심 제목입니다.' },
              description: { type: Type.STRING, description: '강점에 대한 구체적인 설명입니다.' },
            },
            required: ['title', 'description'],
          },
        },
        summary: {
          type: Type.STRING,
          description: '사장님을 위한 짧고 격려가 되는 총평입니다.',
        },
      },
      required: ['improvementPoints', 'strengths', 'summary'],
    };


    const imageParts = reviews.map(review => ({
        inlineData: {
            mimeType: review.mimeType,
            data: review.imageBase64Data,
        },
    }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error analyzing reviews with Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("유효하지 않은 API 키입니다. 키를 확인해주세요.");
        }
        throw new Error("리뷰를 분석하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};
