import React, { useState } from 'react';
import { Spinner } from './Spinner';

interface ImageEditorProps {
    onEdit: (prompt: string) => Promise<void>;
}

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);


export const ImageEditor: React.FC<ImageEditorProps> = ({ onEdit }) => {
    const [prompt, setPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isEditing) return;
        setIsEditing(true);
        try {
            await onEdit(prompt);
            setPrompt('');
        } catch (error) {
            console.error("Editing failed:", error);
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a retro filter', 'Change background'"
                disabled={isEditing}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={isEditing || !prompt.trim()}
                className="px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-md hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isEditing ? <Spinner size="h-5 w-5" /> : <EditIcon className="h-5 w-5" />}
            </button>
        </form>
    );
};