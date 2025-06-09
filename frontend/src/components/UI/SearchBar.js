import { Link, useLocation, useNavigate } from "react-router-dom";
import '../../styles/searchbar.css';
import { useState, useEffect } from "react";

function SearchBar() {
    const linkUrl = useLocation();

    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("Tất cả tỉnh/thành phố");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [searchLocation, setSearchLocation] = useState(""); // Dùng để lọc location trong dropdown
    const navigate = useNavigate();

    // Fetch danh sách tỉnh/thành phố
    useEffect(() => {
        fetch('/provinces.json') // Đường dẫn tới file JSON
            .then((response) => response.json())
            .then((data) => setProvinces(data))
            .catch((error) => console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error));
    }, []);

    const handleSearch = () => {
        const trimmedQuery = searchQuery.trim();
        const trimmedLocation = location.trim();

        const queryParam = `query=${encodeURIComponent(trimmedQuery)}`;
        const locationParam =
            trimmedLocation && trimmedLocation !== "Tất cả tỉnh/thành phố"
                ? `&location=${encodeURIComponent(trimmedLocation)}`
                : "";

        navigate(`/search-job?${queryParam}${locationParam}`);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch(); // Tìm kiếm khi nhấn Enter
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSelectLocation = (selectedLocation) => {
        setLocation(selectedLocation);
        setIsDropdownOpen(false); // Đóng dropdown sau khi chọn
    };

    const filteredProvinces = provinces.filter((province) =>
        province.toLowerCase().includes(searchLocation.toLowerCase())
    );

    return (
        <div className='search-bar-body'>
            {!linkUrl.pathname.startsWith("/jobs/job-recommendation") ? (
                <>
                    <div className="search-bar-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Vị trí tuyển dụng, tên công ty"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="location-dropdown">
                            <div
                                className="search-bar-location-header"
                                onClick={toggleDropdown}
                            >
                                <span className="location-icon">📍</span>
                                <span className="location-text">{location}</span>
                                <span className="dropdown-arrow">
                                    {isDropdownOpen ? "▲" : "▼"}
                                </span>
                            </div>
                            {isDropdownOpen && (
                                <div className="search-bar-dropdown">
                                    <input
                                        type="text"
                                        className="search-bar-dropdown-input"
                                        placeholder="Tìm kiếm tỉnh/thành phố"
                                        value={searchLocation}
                                        onChange={(e) =>
                                            setSearchLocation(e.target.value)
                                        }
                                    />
                                    <div className="search-bar-dropdown-list">
                                        {filteredProvinces.length > 0 ? (
                                            filteredProvinces.map((province, index) => (
                                                <div
                                                    key={index}
                                                    className={`search-bar-dropdown-item ${
                                                        province === location
                                                            ? "search-bar-selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleSelectLocation(province)
                                                    }
                                                >
                                                    {province}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="search-bar-no-results">
                                                Không tìm thấy kết quả
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            className="search-button"
                            onClick={handleSearch}
                        >
                            <span className="search-icon">🔍</span>
                            Tìm kiếm
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div
                        className="search-bar-container"
                        style={{ width: "100%" }}
                    >
                        <div className="search-bar-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Vị trí tuyển dụng, tên công ty"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="location-dropdown">
                                <div
                                    className="search-bar-location-header"
                                    onClick={toggleDropdown}
                                >
                                    <span className="location-icon">📍</span>
                                    <span className="location-text">{location}</span>
                                    <span className="dropdown-arrow">
                                        {isDropdownOpen ? "▲" : "▼"}
                                    </span>
                                </div>
                                {isDropdownOpen && (
                                    <div className="search-bar-dropdown">
                                        <input
                                            type="text"
                                            className="search-bar-dropdown-input"
                                            placeholder="Tìm kiếm tỉnh/thành phố"
                                            value={searchLocation}
                                            onChange={(e) =>
                                                setSearchLocation(e.target.value)
                                            }
                                        />
                                        <div className="search-bar-dropdown-list">
                                            {filteredProvinces.length > 0 ? (
                                                filteredProvinces.map((province, index) => (
                                                    <div
                                                        key={index}
                                                        className={`search-bar-dropdown-item ${
                                                            province === location
                                                                ? "search-bar-selected"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            handleSelectLocation(province)
                                                        }
                                                    >
                                                        {province}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="search-bar-no-results">
                                                    Không tìm thấy kết quả
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                className="search-button"
                                onClick={handleSearch}
                            >
                                <span className="search-icon">🔍</span>
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SearchBar;
