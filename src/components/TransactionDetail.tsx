import { useState } from 'react';
import { Transaction, useTransactionStore } from '@/store';

interface Props {
    transaction: Transaction;
    onClose: () => void;
}

export default function TransactionDetail({ transaction, onClose }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTransaction, setEditedTransaction] = useState(transaction);
    const { updateTransaction, deleteTransaction } = useTransactionStore();

    const handleSave = () => {
        updateTransaction(transaction.id, editedTransaction);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(transaction.id);
            onClose();
        }
    };

    return (
        <div className='fixed inset-0 bg-black/20 flex items-center justify-center'>
            <div className='w-full max-w-2xl bg-white rounded-xl shadow-lg'>
                <div className='p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-xl font-semibold text-gray-800'>
                            {isEditing
                                ? 'Edit Transaction'
                                : 'Transaction Details'}
                        </h2>
                        <button
                            onClick={onClose}
                            className='text-gray-400 hover:text-gray-600'
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
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </button>
                    </div>

                    {isEditing ? (
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Amount
                                </label>
                                <input
                                    type='number'
                                    value={Math.abs(editedTransaction.amount)}
                                    onChange={(e) =>
                                        setEditedTransaction({
                                            ...editedTransaction,
                                            amount:
                                                (editedTransaction.amount < 0
                                                    ? -1
                                                    : 1) *
                                                Math.abs(
                                                    parseFloat(e.target.value)
                                                ),
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                                <div className='mt-2'>
                                    <label className='inline-flex items-center'>
                                        <input
                                            type='checkbox'
                                            checked={
                                                editedTransaction.amount > 0
                                            }
                                            onChange={(e) =>
                                                setEditedTransaction({
                                                    ...editedTransaction,
                                                    amount:
                                                        Math.abs(
                                                            editedTransaction.amount
                                                        ) *
                                                        (e.target.checked
                                                            ? 1
                                                            : -1),
                                                })
                                            }
                                            className='form-checkbox h-4 w-4 text-blue-500'
                                        />
                                        <span className='ml-2 text-sm text-gray-600'>
                                            Inflow
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Merchant
                                </label>
                                <input
                                    type='text'
                                    value={editedTransaction.merchant}
                                    onChange={(e) =>
                                        setEditedTransaction({
                                            ...editedTransaction,
                                            merchant: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Category
                                </label>
                                <input
                                    type='text'
                                    value={editedTransaction.category}
                                    onChange={(e) =>
                                        setEditedTransaction({
                                            ...editedTransaction,
                                            category: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Description
                                </label>
                                <input
                                    type='text'
                                    value={editedTransaction.description || ''}
                                    onChange={(e) =>
                                        setEditedTransaction({
                                            ...editedTransaction,
                                            description: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Date
                                </label>
                                <input
                                    type='date'
                                    value={
                                        new Date(editedTransaction.date)
                                            .toISOString()
                                            .split('T')[0]
                                    }
                                    onChange={(e) =>
                                        setEditedTransaction({
                                            ...editedTransaction,
                                            date: new Date(
                                                e.target.value
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            }),
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between py-3 border-b'>
                                <span className='text-gray-600'>Amount</span>
                                <span
                                    className={
                                        transaction.amount < 0
                                            ? 'text-red-500'
                                            : 'text-green-500'
                                    }
                                >
                                    {transaction.amount < 0 ? '−' : '+'}{' '}
                                    {Math.abs(
                                        transaction.amount
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div className='flex items-center justify-between py-3 border-b'>
                                <span className='text-gray-600'>Merchant</span>
                                <span className='text-gray-900'>
                                    {transaction.merchant}
                                </span>
                            </div>
                            <div className='flex items-center justify-between py-3 border-b'>
                                <span className='text-gray-600'>Category</span>
                                <span className='text-gray-900'>
                                    {transaction.category}
                                </span>
                            </div>
                            <div className='flex items-center justify-between py-3 border-b'>
                                <span className='text-gray-600'>
                                    Description
                                </span>
                                <span className='text-gray-900'>
                                    {transaction.description || '—'}
                                </span>
                            </div>
                            <div className='flex items-center justify-between py-3 border-b'>
                                <span className='text-gray-600'>Date</span>
                                <span className='text-gray-900'>
                                    {transaction.date}
                                </span>
                            </div>
                            <div className='flex items-center justify-between py-3'>
                                <span className='text-gray-600'>
                                    Last modified
                                </span>
                                <span className='text-gray-900'>
                                    {new Date(
                                        transaction.updatedAt
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className='mt-8 flex items-center justify-between'>
                        <button
                            onClick={handleDelete}
                            className='px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                        >
                            Delete transaction
                        </button>
                        <div className='flex items-center gap-3'>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditedTransaction(transaction);
                                            setIsEditing(false);
                                        }}
                                        className='px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className='px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                                    >
                                        Save changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className='px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                                >
                                    Edit transaction
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
