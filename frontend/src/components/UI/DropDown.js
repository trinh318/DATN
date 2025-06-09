import React, { useState, useEffect, useRef } from 'react';
import '../../styles/dropdown.css';

function Dropdown({ label, options, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const dropdownRef = useRef(null);

    // Toggle mở/đóng dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Xử lý khi người dùng chọn hoặc bỏ chọn một option
    const handleOptionClick = (option) => {
        const isSelected = selectedOptions.some((selected) => selected.id === option.id);
        const newSelections = isSelected
            ? selectedOptions.filter((selected) => selected.id !== option.id)  // Nếu đã chọn, bỏ chọn
            : [...selectedOptions, option];  // Nếu chưa chọn, chọn thêm

        setSelectedOptions(newSelections);  // Cập nhật state của selectedOptions
        onSelect(newSelections);  // Gọi onSelect để truyền giá trị đã chọn lên component cha
    };

    // Đóng dropdown khi người dùng nhấp ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="find-jobs-dropdown" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="find-jobs-dropdown-toggle">
                {label} <span className="find-jobs-dropdown-arrow">▼</span>
            </button>
            {isOpen && (
                <div className="find-jobs-dropdown-menu">
                    <ul>
                        {options.map((option) => (
                            <li key={option.id} className="find-jobs-dropdown-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.some((selected) => selected.id === option.id)}
                                        onChange={() => handleOptionClick(option)}
                                    />
                                    {option.name}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Dropdown;
