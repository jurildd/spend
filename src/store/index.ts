import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { StateCreator } from 'zustand';

export interface Transaction {
    id: string;
    wallet: string;
    walletType: 'card' | 'cash' | 'personal';
    merchant: string;
    category: string;
    description?: string;
    amount: number;
    date: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    group: string;
    budgeted: number;
    activity: number;
    available: number;
}

export interface Budget {
    id: string;
    month: string; // YYYY-MM format
    categories: Category[];
    toBeBudgeted: number;
}

interface TransactionState {
    transactions: Transaction[];
    addTransaction: (
        transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ) => void;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    getTransactionsByWallet: (wallet: string | null) => Transaction[];
    getTransactionsByCategory: (category: string) => Transaction[];
}

interface BudgetState {
    budgets: Budget[];
    categories: Category[];
    addBudget: (budget: Omit<Budget, 'id'>) => void;
    updateBudget: (id: string, budget: Partial<Budget>) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, category: Partial<Category>) => void;
    moveMoneyBetweenCategories: (
        fromId: string,
        toId: string,
        amount: number
    ) => void;
}

type TransactionPersist = (
    config: StateCreator<TransactionState>,
    options: PersistOptions<TransactionState>
) => StateCreator<TransactionState>;

type BudgetPersist = (
    config: StateCreator<BudgetState>,
    options: PersistOptions<BudgetState>
) => StateCreator<BudgetState>;

export const useTransactionStore = create<TransactionState>()(
    (persist as unknown as TransactionPersist)(
        (set, get) => ({
            transactions: [
                {
                    id: crypto.randomUUID(),
                    wallet: 'EW KF World',
                    walletType: 'card',
                    merchant: 'SM Supermarket',
                    category: 'Groceries',
                    amount: -2500,
                    date: '2024-03-11',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: crypto.randomUUID(),
                    wallet: 'EW KF World',
                    walletType: 'card',
                    merchant: 'Netflix',
                    category: 'Entertainment',
                    amount: -499,
                    date: '2024-03-10',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: crypto.randomUUID(),
                    wallet: 'Cash',
                    walletType: 'cash',
                    merchant: 'Jollibee',
                    category: 'Food',
                    amount: -150,
                    date: '2024-03-11',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: crypto.randomUUID(),
                    wallet: 'Personal & Payroll',
                    walletType: 'personal',
                    merchant: 'Salary',
                    category: 'Income',
                    amount: 50000,
                    date: '2024-03-05',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: crypto.randomUUID(),
                    wallet: 'Seabank',
                    walletType: 'card',
                    merchant: 'Interest',
                    category: 'Income',
                    amount: 1250.36,
                    date: '2024-03-01',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: crypto.randomUUID(),
                    wallet: 'Maya',
                    walletType: 'card',
                    merchant: 'Shopee',
                    category: 'Shopping',
                    amount: -1299.75,
                    date: '2024-03-09',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
            addTransaction: (transaction) =>
                set((state) => ({
                    transactions: [
                        {
                            ...transaction,
                            id: crypto.randomUUID(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        ...state.transactions,
                    ],
                })),
            updateTransaction: (id, transaction) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id
                            ? {
                                  ...t,
                                  ...transaction,
                                  updatedAt: new Date().toISOString(),
                              }
                            : t
                    ),
                })),
            deleteTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),
            getTransactionsByWallet: (wallet) => {
                const { transactions } = get();
                return wallet
                    ? transactions.filter((t) => t.wallet === wallet)
                    : transactions;
            },
            getTransactionsByCategory: (category) => {
                const { transactions } = get();
                return transactions.filter((t) => t.category === category);
            },
        }),
        {
            name: 'transactions-storage',
        }
    )
);

export const useBudgetStore = create<BudgetState>()(
    (persist as unknown as BudgetPersist)(
        (set) => ({
            budgets: [],
            categories: [],
            addBudget: (budget) =>
                set((state) => ({
                    budgets: [
                        ...state.budgets,
                        { ...budget, id: crypto.randomUUID() },
                    ],
                })),
            updateBudget: (id, budget) =>
                set((state) => ({
                    budgets: state.budgets.map((b) =>
                        b.id === id ? { ...b, ...budget } : b
                    ),
                })),
            addCategory: (category) =>
                set((state) => ({
                    categories: [
                        ...state.categories,
                        { ...category, id: crypto.randomUUID() },
                    ],
                })),
            updateCategory: (id, category) =>
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === id ? { ...c, ...category } : c
                    ),
                })),
            moveMoneyBetweenCategories: (fromId, toId, amount) =>
                set((state) => ({
                    categories: state.categories.map((c) => {
                        if (c.id === fromId) {
                            return { ...c, available: c.available - amount };
                        }
                        if (c.id === toId) {
                            return { ...c, available: c.available + amount };
                        }
                        return c;
                    }),
                })),
        }),
        {
            name: 'budgets-storage',
        }
    )
);
