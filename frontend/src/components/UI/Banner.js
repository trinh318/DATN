import { useEffect, useState } from 'react';
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
        <>
            <div className="flex flex-col relative">
                <div className="relative flex flex-col items-center font-sans overflow-hidden bg-gradient-to-br from-[#094248] to-[#B7E1E4]">

                    {/* Background layers */}
                    <div className="absolute inset-0 -skew-x-[20deg] bg-[rgba(0,150,136,0.3)] z-0"></div>
                    <div className="absolute inset-0 -skew-x-[15deg] translate-x-[60px] bg-[rgba(14,126,115,0.2)] z-0"></div>
                    <div className="absolute inset-0 -skew-x-[20deg] translate-x-[120px] bg-[rgba(22,146,140,0.2)] z-0"></div>
                    <div className="absolute inset-0 -skew-x-[20deg] translate-x-[180px] bg-[rgba(50,100,150,0.15)] z-0"></div>
                    <div className="absolute inset-0 -skew-x-[20deg] translate-x-[240px] bg-[rgba(75,195,183,0.262)] z-0"></div>

                    {/* Search bar */}
                    <SearchBar />

                    {/* Banner container */}
                    <div className="relative flex flex-col items-center w-[90%] mb-5 bg-white rounded-[10px] z-10 overflow-hidden">
                        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
                            {images.length > 0 && (
                                <img
                                    src={images[currentIndex]}
                                    alt="banner"
                                    className="w-full h-full object-contain transition-opacity duration-1000 animate-kenburns"
                                />
                            )}

                            {/* Overlay gradient */}
                            <div className="absolute w-full h-full bg-gradient-to-t from-[rgba(0,0,0,0.4)] to-[rgba(0,0,0,0)] z-10 pointer-events-none"></div>

                            {/* Buttons */}
                            <button
                                className="absolute left-[30px] top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/90 text-3xl p-2 rounded-full z-20"
                                onClick={() =>
                                    setCurrentIndex((currentIndex - 1 + images.length) % images.length)
                                }
                            >
                                ❮
                            </button>
                            <button
                                className="absolute right-[30px] top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/90 text-3xl p-2 rounded-full z-20"
                                onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}
                            >
                                ❯
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Banner;
