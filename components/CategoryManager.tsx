import React, { useState } from 'react';
import { CloseIcon, PlusIcon, TrashIcon } from './Icons.tsx';

interface CategoryManagerProps {
    categories: string[];
    onAddCategory: (category: string) => void;
    onDeleteCategory: (category: string) => void;
    onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory, onDeleteCategory, onClose }) => {
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');

    const handleAddCategory = () => {
        const trimmedCategory = newCategory.trim();
        if (!trimmedCategory) {
            setError('O nome da categoria não pode estar vazio.');
            return;
        }
        if (categories.find(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
            setError('Esta categoria já existe.');
            return;
        }
        onAddCategory(trimmedCategory);
        setNewCategory('');
        setError('');
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Categorias</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="new-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nova Categoria
                        </label>
                        <div className="flex gap-2">
                             <input
                                type="text"
                                id="new-category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Ex: Contas"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                <PlusIcon />
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {categories.length > 0 ? (
                            categories.map(category => (
                                <div key={category} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                    <span className="text-gray-800 dark:text-gray-200">{category}</span>
                                    <button onClick={() => onDeleteCategory(category)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma categoria encontrada.</p>
                        )}
                    </div>
                </div>

                 <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
                    >
                        Fechar
                    </button>
                 </div>
            </div>
        </div>
    );
};