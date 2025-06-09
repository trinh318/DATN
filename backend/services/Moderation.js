const axios = require('axios');
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { ComprehendClient, BatchDetectSentimentCommand } = require("@aws-sdk/client-comprehend");
const axiosRetry = require('axios-retry').default;

// Cấu hình axios để tự động thử lại khi gặp lỗi tạm thời (503, 429,...)
axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return error.response?.status === 503 || error.response?.status === 429;
    },
});
const comprehendClient = new ComprehendClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

const teencodeWords = ["ck", "vk", "ox", "ny", "hok", "z", "dc", "k", "jk", "cmt", "đmm", "vl", "clgt", "dkm", "mẹ kiếp", "con chó", "vãi cả", "sml", "bố mày", "mẹ mày"];
// kiem tra là Tiếng Việt 
const detectVietnamese = (text) => {
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseChars.test(text);
};

const extractVietnameseText = (text) => {
    return text.split(" ").filter(word => detectVietnamese(word)).join(" ");
};

const containsOffensiveOrTeencode = (text) => {
    const lowerText = text.toLowerCase();
    console.log("Checking text:", lowerText); // Thêm log để debug
    const foundOffensive = offensiveWords.some(word => lowerText.includes(word));
    const foundTeencode = teencodeWords.some(word => lowerText.includes(word));
    console.log("Offensive:", foundOffensive, "Teencode:", foundTeencode); // Kiểm tra kết quả
    return { foundOffensive, foundTeencode };
};
const containsTeencode = (text) => {
    return text.split(" ").some(word => teencodeWords.includes(word.toLowerCase()));
};
// DeepL translator
const translateWithDeepL = async (text) => {
    try {
        console.log("🚀 Đang dịch với DeepL:", text);
        const response = await axios.post("https://api-free.deepl.com/v2/translate", null, {
            params: {
                auth_key: DEEPL_API_KEY,
                text: text,
                ource_lang: "VI",
                target_lang: "EN",
            },
        });

        console.log("DeepL Response:", response.data);
        return response.data.translations[0]?.text || text; // Nếu lỗi, trả về văn bản gốc
    } catch (error) {
        console.error("❌ Lỗi khi dịch văn bản:", error.response?.data || error.message);
        return text; // Nếu lỗi, trả về văn bản gốc
    }
};
// Google translate 
const translateText = async (text, sourceLang = "vi", targetLang = "en") => {
    try {
        const response = await axios.get("https://translate.googleapis.com/translate_a/single", {
            params: {
                client: "gtx",
                sl: sourceLang,
                tl: targetLang,
                dt: "t",
                q: text
            }
        });

        return response.data[0].map(translation => translation[0]).join(" ");
    } catch (error) {
        console.error("❌ Lỗi khi dịch văn bản:", error.message);
        return text; // Trả về văn bản gốc nếu lỗi
    }
};

// Hàm gọi API Hugging Face
const analyzeWithHuggingFace = async (text) => {
    try {
        if (!process.env.HUGGINGFACE_API_KEY) {
            throw new Error("Thiếu Hugging Face API Key");
        }
        
        if (containsTeencode(text)) {
            return { error: "Nội dung chứa teen code, không được chấp nhận" };
        }

        if (detectVietnamese(text)) {
            console.log("Tiếng Việt - Dịch sang tiếng Anh trước khi phân tích");
            text = await translateText(text, "vi", "en");
            console.log("Dịch xong:", text);
        }

        const headers = { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` };

        try {
            // Gọi API Hugging Face
            const [offensiveResponse, sentimentResponse, hateSpeechResponse, toxicResponse] = await Promise.all([
                axios.post("https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-offensive", { inputs: text }, { headers }),
                axios.post("https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest", { inputs: text }, { headers }),
                axios.post("https://api-inference.huggingface.co/models/Hate-speech-CNERG/bert-base-uncased-hatexplain", { inputs: text }, { headers }),
                axios.post("https://api-inference.huggingface.co/models/unitary/unbiased-toxic-roberta", { inputs: text }, { headers })
            ]);

            // Kiểm tra phản hồi
            const extractScore = (response, label) => {
                return response.data?.[0]?.find(r => r.label === label)?.score || 0.00;
            };

            return {
                nonOffensive: extractScore(offensiveResponse, "non-offensive"),
                offensive: extractScore(offensiveResponse, "offensive"),
                neutral: extractScore(sentimentResponse, "neutral"),
                positive: extractScore(sentimentResponse, "positive"),
                negative: extractScore(sentimentResponse, "negative"),
                hateSpeechScore: extractScore(hateSpeechResponse, "hate speech"),
                toxicScore: extractScore(toxicResponse, "toxic"),
                hateSpeechLabel: hateSpeechResponse.data?.[0]?.[0]?.label || "unknown",
                toxicLabel: toxicResponse.data?.[0]?.[0]?.label || "unknown",
            };
        } catch (error) {
            console.error("Hugging Face API Error:", error.response?.data || error.message);
            return { error: "Lỗi khi gọi API Hugging Face", details: error.response?.data || error.message };
        }
    } catch (error) {
        console.error("Lỗi xử lý:", error.message);
        return { error: error.message };
    }
};
// hàm xet bằng AWS
const moderateWithAWSComprehend = async (text) => {
    try {
        if (!text || typeof text !== "string") {
            return { error: "Invalid input text" };
        }

        const params = {
            LanguageCode: "en",
            TextList: [text]
        };

        const command = new BatchDetectSentimentCommand(params);
        const result = await comprehendClient.send(command);

        if (result.ResultList.length === 0) {
            return { error: "No sentiment detected" };
        }

        return { sentiment: result.ResultList[0].Sentiment };
    } catch (error) {
        console.error("AWS Comprehend Error:", error);
        return { error: "Failed to analyze text with AWS Comprehend" };
    }
};

const automoderate = async (text) => {
    if (!text) return { error: 'No text provided' };
    console.log("Mo ta text thuc hien kiem duyet: ", text);

    // Call moderation APIs (Hugging Face, Cohere, AWS)
    const hfAnalysis = await analyzeWithHuggingFace(text);
    console.log("hfAnalysis: ", hfAnalysis);
    const awsAnalysis = await moderateWithAWSComprehend(text);
    console.log("awsAnalysis: ", awsAnalysis);
    // Construct the moderation result object
    if (hfAnalysis?.error === "Lỗi khi gọi API Hugging Face" && hfAnalysis?.details === "Not Found") {
        const result = {
            hfAnalysis: null,
            awsAnalysis: awsAnalysis?.sentiment || 'Not analyzed',
        };

        let status = 'pending';

        if (result.awsAnalysis === 'NEGATIVE') {
            status = 'rejected';
        } else if (result.awsAnalysis === 'POSITIVE' || result.awsAnalysis === 'NEUTRAL') {
            status = 'approved';
        }

        return {
            result,
            status,
        };
    }
    
    const result = {
        hfAnalysis: {
            nonOffensive: hfAnalysis?.nonOffensive || 0,
            offensive: hfAnalysis?.offensive || 0,
            neutral: hfAnalysis?.neutral || 0,
            positive: hfAnalysis?.positive || 0,
            negative: hfAnalysis?.negative || 0,
            hateSpeech: hfAnalysis?.hate_speech_score || 0,
            toxicity: hfAnalysis?.toxicScore || 0,
        },
        awsAnalysis: awsAnalysis?.sentiment || 'Not analyzed',
    };

    
    let status = 'pending';
    const allZero = Object.values(result.hfAnalysis).every(val => val === 0);
    // Trường hợp bị từ chối ngay lập tức
    if (
        result.hfAnalysis.toxicity > 0.5 ||
        result.hfAnalysis.hateSpeech > 0.5 ||
        result.hfAnalysis.offensive > 0.5 ||
        result.awsAnalysis === 'NEGATIVE'
    ) {
        status = 'rejected';
    }
    else if (allZero) {
        status = 'pending';
    } 
    // Trường hợp phê duyệt ngay lập tức
    else if (
        result.hfAnalysis.positive > result.hfAnalysis.negative &&
        (
            (result.awsAnalysis === 'POSITIVE' && result.hfAnalysis.positive > 0.2) ||
            (result.awsAnalysis === 'NEUTRAL' && result.hfAnalysis.positive > 0.3)
        )
    ) {
        status = 'approved';
    }    
    
    // Xử lý trường hợp chưa phân tích
    else if (result.awsAnalysis === 'Not analyzed') {
        status = 'pending';
    }
    // Trường hợp trung tính cao, có thể phê duyệt
    else if (result.hfAnalysis.neutral > 0.8 && result.hfAnalysis.positive > 0.3) {
        status = 'approved';
    }
    // Trường hợp tiêu cực cao
    else if (result.hfAnalysis.negative > 0.5 || result.awsAnalysis === 'NEGATIVE') {
        status = 'rejected';
    }
    // Trường hợp tất cả giá trị đều rất thấp
    else if (
        result.hfAnalysis.positive < 0.1 &&
        result.hfAnalysis.negative < 0.1 &&
        result.hfAnalysis.offensive < 0.1 &&
        result.hfAnalysis.hateSpeech < 0.1 &&
        result.hfAnalysis.toxicity < 0.1
    ) {
        status = 'pending';
    }
    else if (result.hfAnalysis.neutral > 0.8 && (result.hfAnalysis.positive + result.hfAnalysis.negative) < 0.2) {
        status = 'pending';
    }

    return {
        result,
        status,
    };
};
module.exports = { automoderate };
