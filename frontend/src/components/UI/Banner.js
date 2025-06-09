import { useEffect, useState } from 'react';
import '../../styles/banner.css';
import SearchBar from './SearchBar';

function Banner() {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Xáo trộn ảnh
    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    useEffect(() => {
        const imageList = [];
        for (let i = 0; i <= 20; i++) {
            imageList.push(require(`../../assets/home-image/home-${i}.png`));
        }
        setImages(shuffleArray(imageList));
    }, []);

    // Tự động chuyển ảnh
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // đổi ảnh mỗi 3s

        return () => clearInterval(interval);
    }, [images]);

    return (
        <div className='banner-body-main'>
            <div className="banner-body">
                <div className="extra-layer-1"></div>
                <div className="extra-layer-2"></div>
                <div className="extra-layer-3"></div>
                <div className="extra-layer-4"></div>
                <div className="extra-layer-5"></div>
                <SearchBar />

                <div className="banner-container">
                    <div className="banner-content">
                        {images.length > 0 && (
                            <img
                                src={images[currentIndex]}
                                alt="banner"
                                className="banner-image"
                            />
                        )}
                        
                        {/* Nút điều khiển */}
                        <button className="banner-btn left" onClick={() =>
                            setCurrentIndex((currentIndex - 1 + images.length) % images.length)
                        }>
                            ❮
                        </button>
                        <button className="banner-btn right" onClick={() =>
                            setCurrentIndex((currentIndex + 1) % images.length)
                        }>
                            ❯
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Banner;
