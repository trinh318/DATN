import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../styles/testedit.css';

const TestEdit = () => {
  const { id } = useParams(); // Lấy id bài kiểm tra từ URL
  const [testDetails, setTestDetails] = useState({
    title: "",
    description: "",
    duration: "",
    questions: [], // Dữ liệu câu hỏi sẽ được lưu vào đây
  });
  const navigate = useNavigate(); // Hook để điều hướng sau khi lưu thay đổi

  // Lấy thông tin bài kiểm tra và các câu hỏi từ API khi component mount
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tests/edit/${id}`);
        const data = await response.json();
        console.log(data); // In ra dữ liệu nhận được từ API
        setTestDetails({
          title: data.title || "",
          description: data.description || "",
          duration: data.duration || "",
          questions: data.questions || [], // Đảm bảo data.questions có dữ liệu
        });
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    fetchTestDetails();
  }, [id]);

  // Xử lý thay đổi thông tin bài kiểm tra
  const handleTestDetailChange = (e) => {
    const { name, value } = e.target;
    setTestDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Xử lý thay đổi câu hỏi
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...testDetails.questions];
    updatedQuestions[index][field] = value;
    setTestDetails({ ...testDetails, questions: updatedQuestions });
  };

  // Xử lý thay đổi lựa chọn câu hỏi
  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...testDetails.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setTestDetails({ ...testDetails, questions: updatedQuestions });
  };

  // Thêm câu hỏi mới
  const addQuestion = () => {
    setTestDetails((prevDetails) => ({
      ...prevDetails,
      questions: [
        ...prevDetails.questions,
        { question: "", options: ["", "", "", ""], correct_answer: "", points: "" },
      ],
    }));
  };

  // Lưu thay đổi
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...testDetails, // All fields from testDetails including questions
    };
  
    try {
      const response = await fetch(`http://localhost:5000/api/tests/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Chỉnh sửa bài kiểm tra thành công!");
        navigate('/recruiter-page'); // Redirect to the recruiter page
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating test:", error);
      alert("Đã xảy ra lỗi khi cập nhật bài kiểm tra.");
    }
  };
  

  return (
    <form className="test-edit-form" onSubmit={handleSubmit}>
      <h2 className="test-edit-title">Chỉnh sửa bài kiểm tra</h2>

      {/* Thông tin bài kiểm tra */}
      <div className="test-edit-section">
        <label className="test-edit-label">Tiêu đề:</label>
        <input
          type="text"
          name="title"
          className="test-edit-input"
          value={testDetails.title}
          onChange={handleTestDetailChange}
          required
        />
      </div>
      <div className="test-edit-section">
        <label className="test-edit-label">Mô tả:</label>
        <textarea
          name="description"
          className="test-edit-textarea"
          value={testDetails.description}
          onChange={handleTestDetailChange}
          required
        />
      </div>
      <div className="test-edit-section">
        <label className="test-edit-label">Thời gian (phút):</label>
        <input
          type="number"
          name="duration"
          className="test-edit-input"
          value={testDetails.duration}
          onChange={handleTestDetailChange}
          required
        />
      </div>

      <h3 className="test-edit-subtitle">Câu hỏi</h3>

      {/* Hiển thị câu hỏi */}
      {testDetails.questions.length > 0 ? (
        testDetails.questions.map((q, qIndex) => (
          <div key={qIndex} className="test-edit-question">
            <div className="test-edit-section">
              <label className="test-edit-label">Câu hỏi {qIndex + 1}:</label>
              <input
                type="text"
                className="test-edit-input"
                value={q.question || ""}
                onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                required
              />
            </div>
            <div className="test-edit-section">
              <label className="test-edit-label">Lựa chọn:</label>
              {q.options?.map((option, oIndex) => (
                <div key={oIndex} className="test-edit-option">
                  <input
                    type="text"
                    className="test-edit-input"
                    value={option || ""}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="test-edit-section">
              <label className="test-edit-label">Đáp án đúng:</label>
              <input
                type="text"
                className="test-edit-input"
                value={q.correct_answer || ""}
                onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                required
              />
            </div>
            <div className="test-edit-section">
              <label className="test-edit-label">Số điểm:</label>
              <input
                type="number"
                className="test-edit-input"
                value={q.points || ""}
                onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
                required
              />
            </div>
          </div>
        ))
      ) : (
        <p>Không có câu hỏi nào. Hãy thêm câu hỏi.</p>
      )}

      {/* Thêm câu hỏi */}
      <button type="button" className="test-edit-add-btn" onClick={addQuestion}>
        + Thêm câu hỏi
      </button>

      {/* Lưu thay đổi */}
      <button type="submit" className="test-edit-submit-btn">
        Lưu thay đổi
      </button>
    </form>
  );
};

export default TestEdit
