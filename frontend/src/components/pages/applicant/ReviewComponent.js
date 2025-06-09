import React, { useState } from 'react';
import '../../../styles/reviewcomponent.css';
import { useLocation, useNavigate } from "react-router-dom";
import { getId } from '../../../libs/isAuth';
import axios from 'axios';

const ReviewComponent = () => {
  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState(null);
  const [summary, setSummary] = useState('');
  const [overtimeSatisfaction, setOvertimeSatisfaction] = useState('');
  const [overtimeReason, setOvertimeReason] = useState('');
  const [whatYouLove, setWhatYouLove] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [details, setDetails] = useState({
    salary_benefits: 0,
    training: 0,
    management: 0,
    culture: 0,
    workspace: 0
  });

  const location = useLocation();
  const navigate = useNavigate();
  const companyId = location.state?.companyId;
  const userId = getId();

  const handleRatingDetailChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!rating || !summary || !overtimeSatisfaction || !overtimeReason || !whatYouLove || !suggestion || recommend === null) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const reviewData = {
      user_id: userId,
      company_id: companyId,
      rating,
      comment: summary,
      recommend,
      overtime_feeling: overtimeSatisfaction,
      overtime_reason: overtimeReason,
      what_i_love: whatYouLove,
      suggestion,
      details
    };
    console.log("thong tin", reviewData)
    try {
      const res = await axios.post("http://localhost:5000/api/reviewschema", reviewData); // chỉnh URL nếu khác
      alert("Đánh giá đã được gửi!");
      navigate(`/companies/companydetail/${companyId}`);
      // hoặc điều hướng đến trang chi tiết công ty
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      alert("Gửi đánh giá thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="company-detail-review-container">
      <h2 className="company-detail-review-title">Đánh giá Công ty</h2>
      <p className="company-detail-review-description">
      Chỉ mất 1 phút để hoàn thành biểu mẫu đánh giá này. Ý kiến của bạn sẽ rất hữu ích cho cộng đồng Developer đang tìm kiếm công việc. 
      </p>

      {/* Tổng thể */}
      <div className="company-detail-review-section">
        <label>Đánh giá tổng thể *</label>
        <div className="company-detail-review-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? 'company-detail-review-star active' : 'company-detail-review-star'}
            >★</span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <input
        type="text"
        placeholder="Tóm tắt"
        value={summary}
        onChange={e => setSummary(e.target.value)}
        className="company-detail-review-input"
      />

      {/* Overtime */}
      <div className="company-detail-review-section">
        <label>Bạn cảm thấy thế nào về chính sách làm thêm giờ? *</label>
        <div className="company-detail-review-radio-group">
          <label>
            <input type="radio" name="overtime" value="satisfied"
              onChange={(e) => setOvertimeSatisfaction(e.target.value)} /> Hài lòng
          </label>
          <label>
            <input type="radio" name="overtime" value="unsatisfied"
              onChange={(e) => setOvertimeSatisfaction(e.target.value)} /> Không hài lòng
          </label>

        </div>
        <textarea
          placeholder="Nhập lý do"
          value={overtimeReason}
          onChange={e => setOvertimeReason(e.target.value)}
          className="company-detail-review-textarea"
        />
      </div>

      {/* What you love */}
      <div className="company-detail-review-section">
        <label>Điều gì khiến bạn yêu thích khi làm việc tại đây? *</label>
        <textarea
          value={whatYouLove}
          onChange={e => setWhatYouLove(e.target.value)}
          className="company-detail-review-textarea"
        />
      </div>

      {/* Suggestion */}
      <div className="company-detail-review-section">
        <label>Góp ý để công ty cải thiện tốt hơn *</label>
        <textarea
          value={suggestion}
          onChange={e => setSuggestion(e.target.value)}
          className="company-detail-review-textarea"
        />
      </div>

      {/* Rating details */}
      <div className="company-detail-review-section">
        <label>Chi tiết đánh giá *</label>
        {[
          ['salary_benefits', 'Lương & Phúc lợi'],
          ['training', 'Đào tạo & Học hỏi'],
          ['management', 'Quản lý quan tâm'],
          ['culture', 'Văn hóa & Môi trường'],
          ['workspace', 'Không gian làm việc']
        ].map(([key, label], idx) => (
          <div key={idx} className="company-detail-review-rating-item">
            <span>{label}</span>
            <div className="company-detail-review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleRatingDetailChange(key, star)}
                  className={star <= details[key] ? 'company-detail-review-star active' : 'company-detail-review-star'}
                >★</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommend */}
      <div className="company-detail-review-section">
        <label>Bạn có muốn giới thiệu công ty này cho bạn bè không? *</label>
        <div className="company-detail-review-radio-group">
          <label>
            <input type="radio" name="recommend" onChange={() => setRecommend(true)} /> Có
          </label>
          <label>
            <input type="radio" name="recommend" onChange={() => setRecommend(false)} /> Không
          </label>
        </div>
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} className="company-detail-review-submit-button">
        Gửi Đánh Giá
      </button>
    </div>
  );
};

export default ReviewComponent;
