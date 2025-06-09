import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Lấy id từ URL
import "../../../styles/createtest.css";
import { getId } from '../../../libs/isAuth';

const CreateTest = () => {
  const { id } = useParams(); // Lấy id bài kiểm tra (nếu có)
  const [isEditMode, setIsEditMode] = useState(false);
  const [testDetails, setTestDetails] = useState({
    title: "",
    description: "",
    duration: "",
  });

  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct_answer: "", points: "" },
  ]);

  useEffect(() => {
    if (id) {
      // Nếu có id, chuyển sang chế độ chỉnh sửa
      setIsEditMode(true);
      const fetchTestDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/tests/${id}`);
          const data = await response.json();
          setTestDetails({
            title: data.title,
            description: data.description,
            duration: data.duration,
          });
          setQuestions(data.questions || []);
        } catch (error) {
          console.error("Error fetching test details:", error);
        }
      };
      fetchTestDetails();
    }
  }, [id]);

  const handleTestDetailChange = (e) => {
    const { name, value } = e.target;
    setTestDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      { question: "", options: ["", "", "", ""], correct_answer: "", points: "" },
    ]);
  };

  const userID = getId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...testDetails,
      questions,
      userId: userID,
    };

    try {
      const endpoint = isEditMode
        ? `http://localhost:5000/api/tests/edit/${id}`
        : "http://localhost:5000/api/tests/create-test";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert(isEditMode ? "Chỉnh sửa bài Test thành công!" : "Thêm bài Test thành công!");
        // Reset form hoặc điều hướng người dùng
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating/editing test:", error);
      alert("An error occurred while creating/editing the test.");
    }
  };

  return (
    <form className="create-test-form" onSubmit={handleSubmit}>
      <h2 className="create-test-title">
        {isEditMode ? "Edit Test" : "Create Test"}
      </h2>

      {/* Test Details */}
      <div className="create-test-section">
        <label className="create-test-label">Title:</label>
        <input
          type="text"
          name="title"
          className="create-test-input"
          value={testDetails.title}
          onChange={handleTestDetailChange}
          required
        />
      </div>
      <div className="create-test-section">
        <label className="create-test-label">Description:</label>
        <textarea
          name="description"
          className="create-test-textarea"
          value={testDetails.description}
          onChange={handleTestDetailChange}
          required
        />
      </div>
      <div className="create-test-section">
        <label className="create-test-label">Duration (minutes):</label>
        <input
          type="number"
          name="duration"
          className="create-test-input"
          value={testDetails.duration}
          onChange={handleTestDetailChange}
          required
        />
      </div>

      <h3 className="create-test-subtitle">Questions</h3>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="create-test-question">
          <div className="create-test-section">
            <label className="create-test-label">Question {qIndex + 1}:</label>
            <input
              type="text"
              className="create-test-input"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
              required
            />
          </div>
          <div className="create-test-section">
            <label className="create-test-label">Options:</label>
            {q.options.map((option, oIndex) => (
              <div key={oIndex} className="create-test-option">
                <input
                  type="text"
                  className="create-test-input"
                  value={option}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          <div className="create-test-section">
            <label className="create-test-label">Correct Answer:</label>
            <input
              type="text"
              className="create-test-input"
              value={q.correct_answer}
              onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
              required
            />
          </div>
          <div className="create-test-section">
            <label className="create-test-label">Points:</label>
            <input
              type="number"
              className="create-test-input"
              value={q.points}
              onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
              required
            />
          </div>
        </div>
      ))}

      <button type="button" className="create-test-add-btn" onClick={addQuestion}>
        + Add Question
      </button>

      <button type="submit" className="create-test-submit-btn">
        {isEditMode ? "Save Changes" : "Create Test"}
      </button>
    </form>
  );
};

export default CreateTest;
