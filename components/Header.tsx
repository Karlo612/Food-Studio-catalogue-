import React from 'react';

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="text-center p-6 border-b border-gray-700">
            <div className="flex justify-center items-center gap-4 mb-2">
                <CameraIcon />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-500">
                    Virtual Food Photographer
                </h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Turn your menu into a masterpiece. Upload photos of your dishes and use AI to transform them into professional-quality images.
            </p>
        </header>
    );
};
