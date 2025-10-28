import React from 'react';
import { Expense } from '../types.ts';
import { TrashIcon, EditIcon } from './Icons.tsx';

interface ExpenseTableProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onDeleteExpense, onEditExpense }) => {
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum gasto registrado.</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece adicionando um novo gasto ou refine sua busca.</p>
            </div>
        );
    }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Visualização de Cartões para Celular */}
        <div className="md:hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense) => (
                    <li key={expense.id} className="p-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-gray-200 break-words">{expense.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{expense.location}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDateTime(expense.timestamp)}</p>
                            </div>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400 text-right">{formatCurrency(expense.amount)}</p>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                {expense.category}
                            </span>
                            <div className="flex items-center">
                                <button onClick={() => onEditExpense(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" aria-label="Editar Gasto">
                                    <EditIcon />
                                </button>
                                <button onClick={() => onDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label="Excluir Gasto">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* Visualização de Tabela para Desktop */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Local</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Ações</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(expense.timestamp)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{expense.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    {expense.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{expense.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEditExpense(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors mr-2" aria-label="Editar Gasto">
                                    <EditIcon />
                                </button>
                                <button onClick={() => onDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label="Excluir Gasto">
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};