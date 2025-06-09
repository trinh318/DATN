import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Sử dụng để chuyển hướng
import "../../../styles/testlist.css";
import 'font-awesome/css/font-awesome.min.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';


const TestList = () => {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate(); // Hook điều hướng

  // Gọi API để lấy danh sách bài kiểm tra
  useEffect(() => {
    const userId = getId();  // Lấy ID người dùng đang đăng nhập
  
    const fetchTests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tests/user/${userId}`);
        const data = await response.json();
        console.log("Fetched tests:", data);  // Kiểm tra dữ liệu trả về
        setTests(data);  // Lưu bài kiểm tra của người dùng vào state
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };
  
    fetchTests();
  }, []);
  

  const handleDeleteTest = async (testId) => {
    // Hiển thị thông báo xác nhận trước khi xóa
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?");
  
    if (!confirmDelete) {
      return; // Nếu người dùng không xác nhận, không làm gì cả
    }
  
    try {
      // Gửi yêu cầu xóa bài kiểm tra theo ID
      const response = await axios.delete(`http://localhost:5000/api/tests/${testId}`);
      console.log(response.data); // Hiển thị thông báo thành công (nếu cần)
  
      // Cập nhật lại state để loại bỏ bài kiểm tra đã xóa
      setTests(tests.filter(test => test._id !== testId));
  
      // Thông báo xóa thành công
      alert("Xóa bài kiểm tra thành công!");
    } catch (error) {
      console.error('Error deleting test:', error);
      alert("Error deleting test. Please try again.");
    }
  };
  
  const handleEditTest = (id) => {
    navigate(`/tests/edit/${id}`); // Chuyển hướng đến trang chỉnh sửa
  };
  
  return (
    <div className="test-list-container">
      <h2 className="test-list-title">Danh sách các bài kiểm tra</h2>
      {tests.length > 0 ? (
        <table className="test-list-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Thời gian (phút)</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, index) => (
              <tr key={test._id}>
                <td>{index + 1}</td>
                <td>{test.title}</td>
                <td>{test.description}</td>
                <td>{test.duration}</td>
                <td>{new Date(test.created_at).toLocaleDateString()}</td>
                <td>
                  
                <button
                className="test-action-btn edit-btn"
                onClick={() => handleEditTest(test._id)}
                >
                <i className="fa fa-pencil" aria-hidden="true"></i> {/* Edit icon */}
                </button>

                <button
                className="test-action-btn delete-btn"
                onClick={() => handleDeleteTest(test._id)}
                >
                <i className="fa fa-trash" aria-hidden="true"></i> {/* Delete icon */}
                </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có bài kiểm tra nào được tìm thấy.</p>
      )}
    </div>
  );
};

export default TestList;
