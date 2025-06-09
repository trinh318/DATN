from sentence_transformers import SentenceTransformer, util
import re

# Load mô hình Sentence-BERT (nhẹ và hiệu quả)
model = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_text(text):
    # Chuẩn hóa văn bản: xóa khoảng trắng dư, ký tự thừa
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def calculate_match_scores(resumes, jd, batch_size=100):
    """
    Tính điểm tương đồng giữa một JD và danh sách nhiều CVs theo lô
    :param resumes: List[str] - danh sách CV
    :param jd: str - mô tả công việc
    :param batch_size: int - kích thước mỗi lô xử lý
    :return: List[float] - danh sách điểm (0-100)
    """
    jd = preprocess_text(jd)
    resumes = [preprocess_text(r) for r in resumes]

    # Encode JD 1 lần
    jd_embedding = model.encode(jd, convert_to_tensor=True, normalize_embeddings=True)

    scores = []
    for i in range(0, len(resumes), batch_size):
        batch = resumes[i:i + batch_size]
        cv_embeddings = model.encode(batch, convert_to_tensor=True, normalize_embeddings=True)
        batch_scores = util.dot_score(jd_embedding, cv_embeddings)[0]
        scores.extend([round(score.item() * 100, 2) for score in batch_scores])

    return scores

def generate_recommendation(score):
    """
    Gợi ý đánh giá dựa trên điểm phù hợp
    :param score: float (0–100)
    :return: str - lời nhận xét
    """
    if score > 85:
        return "CV rất phù hợp với vị trí này. Có thể mời phỏng vấn ngay."
    elif score > 65:
        return "CV khá phù hợp. Có thể cân nhắc phỏng vấn."
    elif score > 45:
        return "CV phù hợp một phần. Cần bổ sung kỹ năng hoặc kinh nghiệm."
    else:
        return "CV không phù hợp với yêu cầu công việc hiện tại."
