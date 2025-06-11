import { Link, useLocation, useNavigate } from "react-router-dom";
import '../../styles/searchbar.css';
import { useState, useEffect } from "react";
import { MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";

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
        <>
            <div className="w-full py-2 relative z-20 grid place-items-center">
                <div className={`flex items-center bg-white rounded-full p-1 shadow-md ${linkUrl.pathname.startsWith("/jobs/job-recommendation") ? "w-full" : "w-[90%]"}`}>
                    <input
                        type="text"
                        className="border-none outline-none px-4 py-[14px] text-sm rounded-full flex-1"
                        placeholder="Vị trí tuyển dụng, tên công ty"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center px-2 border-l border-gray-300 text-sm cursor-pointer relative w-[250px]">
                        <div
                            className="flex justify-between gap-2 items-center w-full"
                            onClick={toggleDropdown}
                        >
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span className="flex-1 truncate">{location}</span>
                            {isDropdownOpen ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-9 left-0 right-0 bg-white text-gray-800 border border-gray-300 rounded max-h-[300px] overflow-hidden z-10">
                                <input
                                    type="text"
                                    className="w-[calc(100%-20px)] m-2 p-2 border border-gray-300 rounded text-gray-800"
                                    placeholder="Tìm kiếm tỉnh/thành phố"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                />
                                <div className="max-h-[250px] overflow-y-auto">
                                    {filteredProvinces.length > 0 ? (
                                        filteredProvinces.map((province, index) => (
                                            <div
                                                key={index}
                                                className={`p-2 cursor-pointer text-gray-800 hover:bg-gray-100 ${province === location ? "bg-gray-100" : ""
                                                    }`}
                                                onClick={() => handleSelectLocation(province)}
                                            >
                                                {province}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-center text-gray-500">
                                            Không tìm thấy kết quả
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="flex items-center bg-white text-teal-800 border-2 border-teal-800 px-5 py-2 rounded-full cursor-pointer text-sm font-bold ml-2"
                        onClick={handleSearch}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Tìm kiếm
                    </button>
                </div>
            </div>
        </>
    );
}

export default SearchBar;
