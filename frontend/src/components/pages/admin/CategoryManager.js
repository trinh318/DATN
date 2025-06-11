import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaFileLines, FaFilePen, FaFileCircleXmark, FaCaretUp, FaCaretDown } from 'react-icons/fa6';
import '../../../styles/categorymanager.css';

const CategoryManager = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "_id", direction: "asc" });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [state, setState] = useState("active");

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(categoryData.map((cat) => cat._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSort = (column) => {
    let direction = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? <FaCaretUp /> : <FaCaretDown />;
    }
    return null;
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account); // Lưu trữ dữ liệu account vào state
    setState(account.state || "active");
    setIsEditAccountOpen(true); // Mở form edithttp://localhost:5000/api/categoryschema
  };
  const handleCloseAccountEdit = () => {
    setIsEditAccountOpen(false);
  };
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categoryschema/all');
      setCategoryData(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [editingCareerIndex, setEditingCareerIndex] = useState(null);
  const [editingCareerTitle, setEditingCareerTitle] = useState("");
  const [isEditingCareer, setIsEditingCareer] = useState(false);

  const [isAddingCareer, setIsAddingCareer] = useState(false);
  const [newCareerTitle, setNewCareerTitle] = useState("");

  const handleRemoveCareer = (index) => {
    const updatedCareers = selectedAccount.careers.filter((_, i) => i !== index);
    setSelectedAccount(prev => ({ ...prev, careers: updatedCareers }));
  };

  const handleEditCareer = (index) => {
    setEditingCareerIndex(index);
    setEditingCareerTitle(selectedAccount.careers[index].title);
    setIsEditingCareer(true);
    setIsAddingCareer(false); // nếu đang thêm thì hủy
  };

  const handleSaveEditedCareer = () => {
    const updatedCareers = [...selectedAccount.careers];
    updatedCareers[editingCareerIndex].title = editingCareerTitle;
    setSelectedAccount(prev => ({ ...prev, careers: updatedCareers }));
    setIsEditingCareer(false);
  };

  const handleSave = async (id) => {
    try {
      const updatedData = {
        name: selectedAccount.name,
        careers: selectedAccount.careers,
        state: state
      };

      if (!id) {
        // Tạo mới danh mục
        await axios.post("http://localhost:5000/api/categoryschema", updatedData);
        alert("Thêm danh mục thành công!");
      } else {
        // Cập nhật danh mục
        await axios.put(`http://localhost:5000/api/categoryschema/${id}`, updatedData);
        alert("Cập nhật danh mục thành công!");
      }

      setIsEditAccountOpen(false);
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);

      // Xử lý lỗi từ backend
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Lỗi :  ${error.response.data.message}`);
      } else {
        alert("Đã xảy ra lỗi khi lưu danh mục.");
      }
    }
  };
  const handleSaveNewCareer = () => {
    if (newCareerTitle.trim() === "") return;
    const newCareer = { title: newCareerTitle.trim() };
    const updatedCareers = [...selectedAccount.careers, newCareer];
    setSelectedAccount(prev => ({ ...prev, careers: updatedCareers }));
    setNewCareerTitle("");
    setIsAddingCareer(false);
  };

  return (
    <div className='company-profile'>
      <div className="company-profile-container">
        <div className="company-profile-tabs">
          <button className="company-profile-tab">
            <FaEye /> Danh mục nghề nghiệp
          </button>
          <button className="add-category-btn" onClick={() => {
            setSelectedAccount({ name: "", careers: [] });
            setIsEditAccountOpen(true);
          }}>
            + Thêm danh mục
          </button>
        </div>
      </div>

      <div className="company-profile-content followed-companies">
        <div className="user-management-table-container">
          <table className="user-management-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="user-management-select-all"
                  />
                </th>
                <th onClick={() => handleSort("_id")}>
                  ID {getSortIcon("_id")}
                </th>
                <th onClick={() => handleSort("name")}>
                  Category Name {getSortIcon("name")}
                </th>
                <th>
                  Careers
                </th>
                <th>
                  State
                </th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category) => (
                <tr key={category._id} className="user-management-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(category._id)}
                      onChange={() => handleSelectRow(category._id)}
                      className="user-management-row-checkbox"
                    />
                  </td>
                  <td>{category._id}</td>
                  <td>{category.name}</td>
                  <td>
                    <ul>
                      {category.careers.map((career, index) => (
                        <li key={index}>{career.title}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{category.state}</td>
                  <td>
                    <div className="user-management-dropdown">
                      <FaFilePen onClick={() => handleAccountClick(category)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isEditAccountOpen && (
        <div className="user-info-edit-overlay">
          <div className="user-info-edit-container">
            {/* Header */}
            <div className="user-info-edit-header-form">
              <div className="user-info-edit-header">
                <h2>Chi tiết danh mục</h2>
                <button className="user-info-edit-close-btn" onClick={handleCloseAccountEdit}>
                  &times;
                </button>
              </div>
            </div>

            {/* Nội dung Form */}
            <form className="user-info-edit-form">
              {selectedAccount?._id && (
                <div className="user-info-edit-row">
                  <label htmlFor="id" className="user-info-edit-label">
                    ID Danh mục
                  </label>
                  <input
                    type="text"
                    id="id"
                    name="id"
                    className="user-info-edit-input"
                    value={selectedAccount._id}
                    readOnly
                  />
                </div>
              )}


              <div className="user-info-edit-row">
                <label htmlFor="name" className="user-info-edit-label">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="user-info-edit-input"
                  value={selectedAccount?.name || ""}
                  onChange={(e) => {
                    setSelectedAccount({ ...selectedAccount, name: e.target.value });
                  }}
                />
              </div>
              <div className="user-info-edit-row">
                <label htmlFor="name" className="user-info-edit-label">
                  Trạng thái
                </label>
                <select value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div className="career-section">
                <div className="career-header">
                  <label className="user-info-edit-label">Danh sách nghề nghiệp</label>
                  <button
                    className="add-career-btn"
                    onClick={() => setIsAddingCareer(true)}
                    type="button"
                  >
                    +
                  </button>
                </div>

                <div className="career-list">
                  {selectedAccount?.careers?.map((career, index) => (
                    <div
                      key={index}
                      className="career-tag"
                      onClick={() => handleEditCareer(index)}
                    >
                      {career.title}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCareer(index);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form chỉnh sửa nghề nghiệp */}
                {isEditingCareer && (
                  <div className="career-edit-form">
                    <input
                      type="text"
                      value={editingCareerTitle}
                      onChange={(e) => setEditingCareerTitle(e.target.value)}
                      className="career-edit-input"
                      placeholder="Sửa nghề nghiệp..."
                    />
                    <button type="button" onClick={handleSaveEditedCareer}>Lưu</button>
                    <button type="button" onClick={() => setIsEditingCareer(false)}>Hủy</button>
                  </div>
                )}

                {/* Form thêm nghề nghiệp */}
                {isAddingCareer && (
                  <div className="career-edit-form">
                    <input
                      type="text"
                      value={newCareerTitle}
                      onChange={(e) => setNewCareerTitle(e.target.value)}
                      className="career-edit-input"
                      placeholder="Nhập tên nghề nghiệp..."
                    />
                    <button type="button" onClick={handleSaveNewCareer}>Lưu</button>
                    <button type="button" onClick={() => setIsAddingCareer(false)}>Hủy</button>
                  </div>
                )}
              </div>


            </form>

            {/* Footer */}
            <div className="user-info-edit-button-row">
              <button onClick={() => handleSave(selectedAccount._id)} className="user-info-edit-save-btn bg-[#5a8cb5]" type="submit">
                Lưu
              </button>
              <button className="user-info-edit-cancel-btn bg-gray-100" type="button" onClick={handleCloseAccountEdit}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
