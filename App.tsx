import React, { useState, useCallback } from 'react';
import { Dish, ImageStyle } from './types';
import { parseMenu } from './services/geminiService';
import { Header } from './components/Header';
import { MenuInput } from './components/MenuInput';
import { StyleSelector } from './components/StyleSelector';
import { DishCard } from './components/DishCard';
import { Spinner } from './components/Spinner';

const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


export default function App() {
    const [menuText, setMenuText] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.BrightModern);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDishUpdate = useCallback((dishId: string, updatedDish: Partial<Dish>) => {
        setDishes(currentDishes => 
            currentDishes.map(d => d.id === dishId ? { ...d, ...updatedDish } : d)
        );
    }, []);

    const handleParseMenu = async () => {
        if (!menuText.trim()) {
            setError("Please paste your menu first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setDishes([]);

        try {
            const parsedDishes = await parseMenu(menuText);
            const initialDishes: Dish[] = parsedDishes.map((d, index) => ({
                ...d,
                id: `${Date.now()}-${index}`,
            }));
            setDishes(initialDishes);

        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
            setDishes([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans">
            <Header />

            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-2xl">
                    <div className="flex flex-col gap-8">
                        <MenuInput menuText={menuText} setMenuText={setMenuText} disabled={isLoading} />
                        <StyleSelector selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} disabled={isLoading} />
                        
                        <div className="flex justify-center">
                            <button
                                onClick={handleParseMenu}
                                disabled={isLoading}
                                className="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="h-6 w-6 mr-2" />
                                        Parsing Menu...
                                    </>
                                ) : (
                                    <>
                                        <MenuIcon />
                                        Parse Menu & Prepare Gallery
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="max-w-4xl mx-auto mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {dishes.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold text-center mb-8 text-gray-200">Your Culinary Gallery</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {dishes.map((dish) => (
                                <DishCard 
                                    key={dish.id} 
                                    dish={dish} 
                                    onUpdate={handleDishUpdate}
                                    selectedStyle={selectedStyle}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
             <footer className="text-center p-6 text-gray-500 text-sm">
                <p>Powered by Gemini. Built for restaurant visionaries.</p>
            </footer>
        </div>
    );
}
