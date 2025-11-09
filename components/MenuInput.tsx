
import React from 'react';

interface MenuInputProps {
    menuText: string;
    setMenuText: (text: string) => void;
    disabled: boolean;
}

export const MenuInput: React.FC<MenuInputProps> = ({ menuText, setMenuText, disabled }) => {
    return (
        <div className="w-full">
            <h3 className="text-xl font-semibold mb-3 text-amber-300">1. Paste Your Menu</h3>
            <textarea
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                placeholder="Example:&#10;Spaghetti Carbonara - Creamy pasta with pancetta, egg yolk, and parmesan.&#10;Margherita Pizza - Classic pizza with tomato, mozzarella, and basil.&#10;..."
                disabled={disabled}
                className="w-full h-48 p-4 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors duration-200 resize-none text-gray-300 placeholder-gray-500 disabled:opacity-50"
            />
        </div>
    );
};
