import React, { useState, useRef } from 'react';
import { Dish, ImageStyle } from '../types';
import { Spinner } from './Spinner';
import { ImageEditor } from './ImageEditor';
import { editImage, generateFoodImageFromReference, generateFoodImageFromDescription } from '../services/geminiService';

interface DishCardProps {
    dish: Dish;
    selectedStyle: ImageStyle;
    onUpdate: (dishId: string, updatedDish: Partial<Dish>) => void;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const GeneratorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.5 18.75l1.188-.648a2.25 2.25 0 011.423-1.423L17.25 15l.648 1.188a2.25 2.25 0 011.423 1.423L20.25 18.75l-1.188.648a2.25 2.25 0 01-1.423 1.423z" />
    </svg>
);


const ImageUploader: React.FC<{ onImageUpload: (base64: string) => void }> = ({ onImageUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleClick = () => fileInputRef.current?.click();

    return (
        <div 
            onClick={handleClick}
            className="w-full h-full flex flex-col items-center justify-center bg-gray-700/50 border-2 border-dashed border-gray-500 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
        >
            <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-400 font-semibold">Upload Reference</p>
            <p className="text-xs text-gray-500">Click to select an image</p>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
        </div>
    );
};


export const DishCard: React.FC<DishCardProps> = ({ dish, onUpdate, selectedStyle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    const handleEdit = async (prompt: string) => {
        if (!dish.imageUrl) return;
        setCardError(null);
        setIsEditing(true);
        try {
            const newImageUrl = await editImage(dish.imageUrl, prompt);
            onUpdate(dish.id, { imageUrl: newImageUrl });
        } catch (error) {
            setCardError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleGenerateFromReference = async () => {
        if (!dish.referenceImageUrl) return;
        setCardError(null);
        onUpdate(dish.id, { isGenerating: true });
        try {
            const newImageUrl = await generateFoodImageFromReference(dish.referenceImageUrl, dish.name, dish.description, selectedStyle);
            onUpdate(dish.id, { imageUrl: newImageUrl, isGenerating: false });
        } catch (error) {
            setCardError(error instanceof Error ? error.message : "Failed to enhance image.");
            onUpdate(dish.id, { isGenerating: false });
        }
    };

    const handleGenerateFromDescription = async () => {
        setCardError(null);
        onUpdate(dish.id, { isGenerating: true });
        try {
            const newImageUrl = await generateFoodImageFromDescription(dish.name, dish.description, selectedStyle);
            onUpdate(dish.id, { imageUrl: newImageUrl, isGenerating: false });
        } catch (error) {
            setCardError(error instanceof Error ? error.message : "Failed to generate image.");
            onUpdate(dish.id, { isGenerating: false });
        }
    };

    const handleDownload = () => {
        if (!dish.imageUrl) return;
        const link = document.createElement('a');
        link.href = dish.imageUrl;
        link.download = `${dish.name.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleRemoveReference = () => {
        onUpdate(dish.id, { referenceImageUrl: undefined, imageUrl: undefined });
    }

    const renderCardContent = () => {
        if (dish.isGenerating) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <div className="text-center p-4">
                        <Spinner size="h-10 w-10" />
                        <p className="mt-2 font-semibold text-gray-200">
                           {dish.referenceImageUrl ? "Enhancing Photo..." : "Generating from Description..."}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">This can take a moment.</p>
                    </div>
                </div>
            )
        }
        if (dish.imageUrl) {
            return <img src={dish.imageUrl} alt={dish.name} className={`w-full h-full object-cover transition-opacity duration-300 ${isEditing ? 'opacity-40' : 'opacity-100'}`} />
        }
        if (dish.referenceImageUrl) {
            return <img src={dish.referenceImageUrl} alt={`Reference for ${dish.name}`} className="w-full h-full object-cover" />
        }
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700/30 p-4">
                <ImageUploader onImageUpload={(base64) => onUpdate(dish.id, { referenceImageUrl: base64 })} />
                <div className="flex items-center w-full my-4">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs font-semibold">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>
                <button
                  onClick={handleGenerateFromDescription}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-gray-900 font-bold rounded-md hover:bg-amber-400 transition-colors"
                >
                    <SparklesIcon className="h-5 w-5" /> Generate from Description
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg flex flex-col">
            <div className="relative aspect-w-4 aspect-h-3">
                {renderCardContent()}
                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="text-center">
                            <Spinner size="h-10 w-10" />
                            <p className="mt-2 font-semibold text-gray-200">Applying Edits...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h4 className="text-lg font-bold text-gray-100">{dish.name}</h4>
                <p className="text-sm text-gray-400 mb-3 flex-grow">{dish.description}</p>
                
                {dish.imageUrl && !dish.isGenerating ? (
                    <>
                        <ImageEditor onEdit={handleEdit} />
                        <button 
                          onClick={handleDownload}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors"
                        >
                            <DownloadIcon className="h-5 w-5" /> Download
                        </button>
                    </>
                ) : dish.referenceImageUrl && !dish.isGenerating ? (
                     <div className="flex flex-col gap-2">
                        <button 
                          onClick={handleGenerateFromReference}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-gray-900 font-bold rounded-md hover:bg-amber-400 transition-colors"
                        >
                            <GeneratorIcon className="h-5 w-5" /> Enhance Photo
                        </button>
                         <button 
                          onClick={handleRemoveReference}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Change Reference Image
                        </button>
                    </div>
                ): null}

                {cardError && <p className="text-red-400 text-xs mt-2 text-center">{cardError}</p>}
            </div>
        </div>
    );
};