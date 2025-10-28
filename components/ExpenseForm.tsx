import React, { useState, useEffect } from 'react';
import { Expense } from '../types.ts';
import { CurrencyIcon, TagIcon, PlusIcon, CalendarIcon, CategoryIcon, PencilIcon } from './Icons.tsx';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'location'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onCancelEdit: () => void;
  expenseToEdit: Expense | null;
  categories: string[];
  onEditCategories: () => void;
}

const InputField: React.FC<{ id: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; icon: React.ReactNode; step?: string }> = ({ id, label, type, value, onChange, placeholder, icon, step }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {icon}
            </div>
            <input
                type={type}
                name={id}
                id={id}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3"
                placeholder={placeholder}
                step={step}
                required
            />
        </div>
    </div>
);


export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, onUpdateExpense, onCancelEdit, expenseToEdit, categories, onEditCategories }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const isEditing = expenseToEdit !== null;
  
  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);
      setCategory(expenseToEdit.category);
      const date = new Date(expenseToEdit.timestamp);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
      setDateTime(localISOTime);
      setError('');
    } else {
       setAmount('');
       setDescription('');
       setDateTime('');
       setCategory(categories[0] || '');
       setError('');
    }
  }, [expenseToEdit, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, insira um valor válido e maior que zero.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, preencha a descrição.');
      return;
    }
    if (!category) {
      setError('Por favor, adicione uma categoria antes de registrar um gasto.');
      return;
    }

    const expenseData = {
      amount: parsedAmount,
      description,
      category,
      timestamp: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
    };

    if (isEditing) {
        onUpdateExpense({ ...expenseToEdit, ...expenseData });
    } else {
        onAddExpense(expenseData);
        setAmount('');
        setDescription('');
        setDateTime('');
        setCategory(categories[0] || '');
        setError('');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Gasto' : 'Adicionar Novo Gasto'}</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <InputField 
            id="amount"
            label="Valor (R$)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            icon={<CurrencyIcon />}
            step="0.01"
        />

        <InputField 
            id="description"
            label="Descrição do Gasto"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Almoço com amigos"
            icon={<TagIcon />}
        />
        
        <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                 <button
                    type="button"
                    onClick={onEditCategories}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    aria-label="Editar Categorias"
                    title="Editar Categorias"
                >
                    <PencilIcon />
                </button>
            </div>
            <div className="relative rounded-md shadow-sm">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CategoryIcon />
                </div>
                <select 
                    id="category" 
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
        </div>

        <div>
            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data e Hora (Opcional)</label>
            <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CalendarIcon />
                </div>
                <input
                    type="datetime-local"
                    name="datetime"
                    id="datetime"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3"
                />
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <button
            type="submit"
            disabled={categories.length === 0}
            className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
            {isEditing ? 'Salvar Alterações' : (
                <>
                    <PlusIcon />
                    Adicionar Gasto
                </>
            )}
            </button>
            {isEditing && (
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="w-full flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                    Cancelar
                </button>
            )}
        </div>
      </form>
    </div>
  );
};