
import React from 'react';
import { ImageStyle } from '../types';

interface StyleSelectorProps {
    selectedStyle: ImageStyle;
    setSelectedStyle: (style: ImageStyle) => void;
    disabled: boolean;
}

const styles = [
    { id: ImageStyle.BrightModern, label: 'Bright & Modern', description: 'Clean, minimalist, and airy.' },
    { id: ImageStyle.RusticDark, label: 'Rustic & Dark', description: 'Moody, dramatic, and rich.' },
    { id: ImageStyle.SocialMedia, label: 'Social Media', description: 'Vibrant, top-down, and trendy.' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, setSelectedStyle, disabled }) => {
    return (
        <div className="w-full">
            <h3 className="text-xl font-semibold mb-3 text-amber-300">2. Choose a Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {styles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        disabled={disabled}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${
                            selectedStyle === style.id ? 'border-amber-400 bg-amber-400/10' : 'border-gray-600 hover:border-gray-500'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <p className="font-bold text-lg text-gray-100">{style.label}</p>
                        <p className="text-sm text-gray-400">{style.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
