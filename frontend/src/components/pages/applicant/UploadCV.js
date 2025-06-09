import React, { useState, useEffect } from 'react';
import { FaPlus, FaEllipsisV, FaPaperclip, FaArrowAltCircleDown } from 'react-icons/fa';
import { MdDeleteForever } from "react-icons/md";
import { getId } from '../../../libs/isAuth';
import axios from 'axios';

const UploadCV = () => {
  const [showForm, setShowForm] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [check, setCheck] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);  // Khai báo useState cho uploadedFiles

  const userId = getId(); // Lấy ID người dùng

  // Toggle menu visibility
  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Hàm xử lý khi tải file
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'raw_file_upload'); // Đảm bảo bạn đã tạo upload preset trên Cloudinary
    formData.append('resource_type', 'raw'); // Đảm bảo là 'raw' cho tệp PDF
    formData.append('folder', 'raw/upload');
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxwoaywlz/upload`, // Đường dẫn đúng
        formData
      );

      console.log('Cloudinary response:', response.data);
      return response.data.secure_url; // URL của file được upload
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; // Lấy file từ input
    if (file) {
      try {
        // Upload file lên Cloudinary
        const uploadedUrl = await uploadToCloudinary(file);

        if (uploadedUrl) {
          console.log('Uploaded file URL:', uploadedUrl);
          const fileType = file.type;
          console.log('File MIME Type:', fileType);
          setCheck(!check);
          alert('Thêm CV thành công!'); // Lưu thông tin file vào backend (nếu cần)
          const response = await axios.post(
            'http://localhost:5000/api/cvfile/upload',
            {
              originalName: file.name,
              fileName: uploadedUrl,
              uploadedBy: userId,
              mimeType: fileType,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
              },
            }
          );
          console.log('File info saved to backend:', response.data);
          setCheck(!check); // Cập nhật trạng thái để fetch lại danh sách
        } else {
          console.error('Failed to upload file to Cloudinary');
        }
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      // Gửi yêu cầu DELETE để xóa file
      const response = await axios.delete(`http://localhost:5000/api/cvfile/files/${file._id}`);
      alert('Xóa CV thành công!');
      setCheck(!check);
      if (response.status === 200) {
        console.log('File deleted successfully:', response.data);
        setUploadedFiles(prevFiles => prevFiles.filter(f => f._id !== file._id));
      } else {
        console.error('Failed to delete file:', response.data.error);
      }
    } catch (error) {
      console.error('Error deleting file:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cvfile/files/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.files.length === 0) {
          throw new Error('Không có CV');
        } else {
          setFiles(response.data.files);
        }

      } catch (error) {
        setError('Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [userId, check]);

  // Hàm mở/đóng form
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleDownloadFile = async (file) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(file.fileName);
      const blob = await response.blob();

      // Create a temporary link to trigger the download
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      // Set the download attribute with the original file name
      a.href = url;
      a.download = file.originalName; // Suggest the original file name

      // Trigger the download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the object URL after download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  return (
    <div className="w-full max-w-full">
      {/* Tiêu đề và nút mở form */}
      <div className="flex gap-2 items-center">
        <div className='px-4 py-2 bg-blue-900 text-white flex items-center gap-2 rounded-full hover:cursor-pointer hover:bg-blue-700' onClick={toggleForm}>
          <h3 className="text-sm font-semibold">
          Hồ sơ đã tải lên
        </h3>
        <FaPlus className="text-sm cursor-pointer transition-transform duration-300 hover:rotate-90" onClick={toggleForm} />
        </div>
      </div>

      {/* Form tải file */}
      {showForm && (
        <div className="mt-2 text-center border-2 border-dashed border-blue-500 rounded-lg p-5">
          <label htmlFor="file-upload" className="inline-flex items-center justify-center px-5 py-2 bg-gray-200 text-gray-700 rounded-full cursor-pointer text-base transition-colors duration-300 hover:bg-gray-300 w-52">
            <FaPlus className="text-gray-700 mr-2 text-sm" />
            Chọn Hồ Sơ
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            accept=".doc,.docx,.pdf"
            className="hidden"
          />
          <p className="text-gray-500 text-sm mt-2">
            Hỗ trợ định dạng .doc, .docx, .pdf có kích thước dưới 5120KB
          </p>
        </div>
      )}

      {/* Danh sách hồ sơ đã tải */}
      <div className="mt-2 space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md"
          >
            <FaPaperclip className="text-blue-500 text-lg mr-3" />
            <div className="flex-1 flex flex-col">
              <span className="font-semibold text-red-500">{file.originalName}</span>
              <span className="text-sm text-gray-500">
                Cập nhật lần cuối: {
                  (() => {
                    const date = new Date(file.createdAt);
                    const day = date.getDate();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();
                    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
                  })()
                }
              </span>
              <a
                href={file.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm underline w-fit"
              >
                Xem File
              </a>
            </div>

            <div className="flex items-center ml-4">
              <FaArrowAltCircleDown
                className="text-xl text-gray-600 hover:text-gray-800 mr-3 cursor-pointer"
                onClick={() => handleDownloadFile(file)}
              />
              <MdDeleteForever
                className="text-2xl text-red-500 hover:text-red-700 cursor-pointer"
                onClick={() => handleDeleteFile(file)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default UploadCV;
