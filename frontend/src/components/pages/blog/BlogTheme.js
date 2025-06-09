import React, { useState } from 'react';
import "../../../styles/bloghome.css";

const Theme = () => {
    const [fontSize, setFontSize] = useState('16px');
    const [primaryColor, setPrimaryColor] = useState(252); // Default color
    const [bgLightness, setBgLightness] = useState({
        light: '15%',
        white: '20%',
        dark: '95%'
    });

    const handleFontSizeChange = (sizeClass) => {
        let newFontSize = '16px';
        let stickyTopLeft = '-2rem';
        let stickyTopRight = '-17rem';

        switch (sizeClass) {
            case 'font-size-1':
                newFontSize = '10px';
                stickyTopLeft = '5.4rem';
                stickyTopRight = '5.4rem';
                break;
            case 'font-size-2':
                newFontSize = '13px';
                stickyTopLeft = '5.4rem';
                stickyTopRight = '-7rem';
                break;
            case 'font-size-3':
                newFontSize = '16px';
                stickyTopLeft = '-2rem';
                stickyTopRight = '-17rem';
                break;
            case 'font-size-4':
                newFontSize = '19px';
                stickyTopLeft = '-5rem';
                stickyTopRight = '-25rem';
                break;
            case 'font-size-5':
                newFontSize = '22px';
                stickyTopLeft = '-12rem';
                stickyTopRight = '-35rem';
                break;
            default:
                break;
        }

        document.documentElement.style.fontSize = newFontSize;
        document.documentElement.style.setProperty('--sticky-top-left', stickyTopLeft);
        document.documentElement.style.setProperty('--sticky-top-right', stickyTopRight);
        setFontSize(newFontSize);
    };

    const handleColorChange = (colorClass) => {
        let newColorHue = 252; // Default color
        switch (colorClass) {
            case 'color-1':
                newColorHue = 252;
                break;
            case 'color-2':
                newColorHue = 52;
                break;
            case 'color-3':
                newColorHue = 352;
                break;
            case 'color-4':
                newColorHue = 152;
                break;
            case 'color-5':
                newColorHue = 202;
                break;
            default:
                break;
        }
        document.documentElement.style.setProperty('--primary-color-hue', newColorHue);
        setPrimaryColor(newColorHue);
    };

    const handleBgChange = (bgClass) => {
        let newBgLightness = {
            light: '15%',
            white: '20%',
            dark: '95%'
        };

        if (bgClass === 'bg-2') {
            newBgLightness = {
                light: '15%',
                white: '20%',
                dark: '95%'
            };
        } else if (bgClass === 'bg-3') {
            newBgLightness = {
                light: '0%',
                white: '10%',
                dark: '95%'
            };
        }

        setBgLightness(newBgLightness);
        document.documentElement.style.setProperty('--light-color-lightness', newBgLightness.light);
        document.documentElement.style.setProperty('--white-color-lightness', newBgLightness.white);
        document.documentElement.style.setProperty('--dark-color-lightness', newBgLightness.dark);
    };

    return (
        <div className="customize-theme">
            <div className="card">
                <h2>Customize your view</h2>
                <p className="text-muted">Manage your font size, color, and background</p>
                
                {/* Font Size */}
                <div className="font-size">
                    <h4>Font Size</h4>
                    <div>
                        <h6>Aa</h6>
                        <div className="choose-size">
                            <span className="font-size-1" onClick={() => handleFontSizeChange('font-size-1')}></span>
                            <span className="font-size-2 active" onClick={() => handleFontSizeChange('font-size-2')}></span>
                            <span className="font-size-3" onClick={() => handleFontSizeChange('font-size-3')}></span>
                            <span className="font-size-4" onClick={() => handleFontSizeChange('font-size-4')}></span>
                            <span className="font-size-5" onClick={() => handleFontSizeChange('font-size-5')}></span>
                        </div>
                        <h3>Aa</h3>
                    </div>
                </div>

                {/* Color Palette */}
                <div className="color">
                    <h4>Color</h4>
                    <div className="choose-color">
                        <span className="color-1 active" onClick={() => handleColorChange('color-1')}></span>
                        <span className="color-2" onClick={() => handleColorChange('color-2')}></span>
                        <span className="color-3" onClick={() => handleColorChange('color-3')}></span>
                        <span className="color-4" onClick={() => handleColorChange('color-4')}></span>
                        <span className="color-5" onClick={() => handleColorChange('color-5')}></span>
                    </div>
                </div>

                {/* Background Selection */}
                <div className="background">
                    <h4>Background</h4>
                    <div className="choose-bg">
                        <div className="bg-1 active" onClick={() => handleBgChange('bg-1')}>
                            <span></span>
                            <h5>Light</h5>
                        </div>
                        <div className="bg-2" onClick={() => handleBgChange('bg-2')}>
                            <span></span>
                            <h5>Dim</h5>
                        </div>
                        <div className="bg-3" onClick={() => handleBgChange('bg-3')}>
                            <span></span>
                            <h5>Dark</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Theme;
