import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Expense } from './types.ts';
import { ExpenseForm } from './components/ExpenseForm.tsx';
import { ExpenseTable } from './components/ExpenseTable.tsx';
import { CategoryManager } from './components/CategoryManager.tsx';
import { ConfirmationModal } from './components/ConfirmationModal.tsx';
import { DownloadIcon, SunIcon, MoonIcon, SystemIcon } from './components/Icons.tsx';

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'];

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      return savedExpenses ? JSON.parse(savedExpenses) : [];
    } catch (error) {
      console.error("Could not load expenses from localStorage", error);
      return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const savedCategories = localStorage.getItem('categories');
      return savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;
    } catch (error) {
        console.error("Could not load categories from localStorage", error);
        return DEFAULT_CATEGORIES;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme as 'light' | 'dark' | 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
    
    const themeColor = isDark ? '#111827' : '#4F46E5';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);

  }, [theme]);

  useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
          if (theme === 'system') {
              const root = window.document.documentElement;
              root.classList.toggle('dark', e.matches);
              const themeColor = e.matches ? '#111827' : '#4F46E5';
              document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
          }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error("Could not save expenses to localStorage", error);
    }
  }, [expenses]);

  useEffect(() => {
    try {
        localStorage.setItem('categories', JSON.stringify(categories));
    } catch (error) {
        console.error("Could not save categories to localStorage", error);
    }
  }, [categories]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'location'>) => {
    const getLocation = (): Promise<string> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                return resolve("Geolocalização não suportada");
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
                },
                (error) => {
                    let errorMessage = "Erro ao obter localização";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Permissão de localização negada";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Localização indisponível";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Tempo esgotado para obter localização";
                            break;
                    }
                    resolve(errorMessage);
                }
            );
        });
    };

    const location = await getLocation();

    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      location: location,
    };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prevExpenses =>
      prevExpenses
        .map(expense => (expense.id === updatedExpense.id ? updatedExpense : expense))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const deleteExpense = (id: string) => {
    setConfirmation({
        isOpen: true,
        title: "Confirmar Exclusão de Gasto",
        message: "Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.",
        onConfirm: () => {
            setExpenses(prev => prev.filter(e => e.id !== id));
            setConfirmation(null);
        }
    });
  };

  const addCategory = (category: string) => {
    if (category && !categories.find(c => c.toLowerCase() === category.toLowerCase())) {
        setCategories(prev => [...prev, category]);
    }
  };

  const deleteCategory = (categoryToDelete: string) => {
    setConfirmation({
        isOpen: true,
        title: "Confirmar Exclusão de Categoria",
        message: `Tem certeza que deseja excluir a categoria "${categoryToDelete}"? Isso não afetará os gastos já registrados.`,
        onConfirm: () => {
            setCategories(prev => prev.filter(c => c !== categoryToDelete));
            setConfirmation(null);
        }
    });
  };
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const totalSpent = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

  const exportToCSV = () => {
    const headers = ['Data e Hora', 'Valor (R$)', 'Descrição', 'Categoria', 'Local'];
    const rows = filteredExpenses.map(expense => [
      new Date(expense.timestamp).toLocaleString('pt-BR'),
      expense.amount.toFixed(2).replace('.',','),
      `"${expense.description.replace(/"/g, '""')}"`,
      `"${expense.category.replace(/"/g, '""')}"`,
      `"${expense.location.replace(/"/g, '""')}"`
    ].join(';'));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(';') + "\n" 
      + rows.join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gastos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleThemeToggle = () => {
    setTheme(current => {
        if (current === 'light') return 'dark';
        if (current === 'dark') return 'system';
        return 'light';
    });
  };

  const ThemeToggleButton = () => {
    const iconMap = {
        light: <SunIcon />,
        dark: <MoonIcon />,
        system: <SystemIcon />,
    };

    const titleMap = {
        light: 'Mudar para tema escuro',
        dark: 'Mudar para tema do sistema',
        system: 'Mudar para tema claro',
    };
    
    return (
        <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-indigo-200 hover:bg-indigo-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label="Mudar tema"
            title={titleMap[theme]}
        >
            {iconMap[theme]}
        </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <header className="bg-indigo-600 shadow-lg">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Meu Controle de Gastos
                  </h1>
                  <p className="text-indigo-200 mt-1">
                    Registre e visualize seus gastos de forma simples e organizada.
                  </p>
                </div>
                <ThemeToggleButton />
            </div>
        </div>
      </header>
       
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div ref={formRef}>
            <ExpenseForm 
              onAddExpense={addExpense} 
              categories={categories}
              expenseToEdit={editingExpense}
              onUpdateExpense={updateExpense}
              onCancelEdit={handleCancelEdit}
              onEditCategories={() => setCategoryModalOpen(true)}
            />
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gasto Total (Filtro Atual)</h3>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Gastos</h2>
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                <input
                    type="search"
                    placeholder="Buscar gastos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full md:w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {expenses.length > 0 && (
                    <button
                    onClick={exportToCSV}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                    <DownloadIcon />
                    Exportar
                    </button>
                )}
              </div>
            </div>
            <ExpenseTable 
                expenses={filteredExpenses} 
                onDeleteExpense={deleteExpense} 
                onEditExpense={handleEditExpense}
            />
          </div>
        </div>
      </main>
      
      {isCategoryModalOpen && (
        <CategoryManager
            categories={categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            onClose={() => setCategoryModalOpen(false)}
        />
      )}

      {confirmation?.isOpen && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            onClose={() => setConfirmation(null)}
            onConfirm={confirmation.onConfirm}
            title={confirmation.title}
            message={confirmation.message}
        />
      )}

      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Controle de Gastos. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;