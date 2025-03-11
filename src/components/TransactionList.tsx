'use client';

import { useState, useEffect } from 'react';
import TransactionInput from './TransactionInput';
import TransactionDetail from './TransactionDetail';
import { useTransactionStore, Transaction } from '@/store';

const WalletIcon = ({ type }: { type: 'card' | 'cash' | 'personal' }) => {
    if (type === 'card') {
        return (
            <svg
                className='w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M3 10h18M7 15h.01M11 15h2M3 6h18v12H3z'
                />
            </svg>
        );
    }
    if (type === 'cash') {
        return (
            <svg
                className='w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                />
            </svg>
        );
    }
    return (
        <svg
            className='w-5 h-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
            />
        </svg>
    );
};

const MerchantIcon = () => (
    <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
    >
        <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
        />
    </svg>
);

const CategoryIcon = () => (
    <svg
        className='w-5 h-5 text-gray-500'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
    >
        <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        />
    </svg>
);

const EmptyState = () => (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
        <svg
            className='w-16 h-16 text-muted-foreground mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
            />
        </svg>
        <h3 className='text-lg font-medium mb-1'>No transactions yet</h3>
        <p className='text-muted-foreground mb-4'>
            Get started by adding your first transaction
        </p>
        <div className='flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded'>
            <span>Press</span>
            <span className='font-medium'>⇧</span>
            <span className='font-medium'>N</span>
            <span>to create a transaction</span>
        </div>
    </div>
);

interface Props {
    selectedWallet: string | null;
}

export default function TransactionList({ selectedWallet }: Props) {
    const { transactions, addTransaction } = useTransactionStore();
    const [showInput, setShowInput] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

    const filteredTransactions = transactions.filter((t) =>
        selectedWallet ? t.wallet === selectedWallet : true
    );
    const totalBalance = filteredTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Shift + N
            if (e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                setShowInput(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNewTransaction = (
        parsedTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        addTransaction(parsedTransaction);
        setShowInput(false);
    };

    return (
        <div className='min-h-screen py-8'>
            <div className='px-8'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-semibold'>
                        {selectedWallet || 'All Wallets'}
                    </h1>
                </div>

                <div className='flex items-center gap-4 mb-6'>
                    <button
                        onClick={() => setShowInput(true)}
                        className='flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm hover:bg-gray-50 transition-colors'
                    >
                        <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 4v16m8-8H4'
                            />
                        </svg>
                        <span>New transaction</span>
                    </button>
                    <div className='text-muted-foreground'>
                        <span className='text-sm'>Total balance</span>
                        <div className='text-xl font-medium text-foreground'>
                            ₱ {totalBalance.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className='rounded-xl border bg-white shadow-sm'>
                    <div className='p-6 space-y-1'>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className='flex items-center px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors gap-6 cursor-pointer'
                                    onClick={() =>
                                        setSelectedTransaction(transaction)
                                    }
                                >
                                    <div className='w-[160px] flex items-center gap-3 shrink-0 min-w-0'>
                                        <WalletIcon
                                            type={transaction.walletType}
                                        />
                                        <span className='text-muted-foreground truncate'>
                                            {transaction.wallet}
                                        </span>
                                    </div>
                                    <div className='w-[160px] flex items-center gap-3 shrink-0 min-w-0'>
                                        <MerchantIcon />
                                        <span className='truncate'>
                                            {transaction.merchant}
                                        </span>
                                    </div>
                                    <div className='w-[140px] flex items-center gap-2 shrink-0 min-w-0'>
                                        <CategoryIcon />
                                        <span className='text-muted-foreground truncate'>
                                            {transaction.category}
                                        </span>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <span className='text-muted-foreground truncate block'>
                                            {transaction.description}
                                        </span>
                                    </div>
                                    <div className='w-[140px] text-right shrink-0 min-w-0'>
                                        <span
                                            className={`truncate block ${
                                                transaction.amount < 0
                                                    ? 'text-red-500'
                                                    : 'text-green-500'
                                            }`}
                                        >
                                            {transaction.amount < 0 ? '−' : '+'}{' '}
                                            {Math.abs(
                                                transaction.amount
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className='w-[90px] text-right shrink-0 min-w-0'>
                                        <span className='text-muted-foreground truncate block'>
                                            {transaction.date}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>
            </div>
            {showInput && (
                <div className='fixed inset-0 bg-black/20 flex items-end justify-center'>
                    <div className='w-full max-w-2xl mb-8'>
                        <TransactionInput
                            onSubmit={handleNewTransaction}
                            onCancel={() => setShowInput(false)}
                        />
                    </div>
                </div>
            )}
            {selectedTransaction && (
                <TransactionDetail
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
}
