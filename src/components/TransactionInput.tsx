'use client';

import React, { useState, useEffect, useRef } from 'react';
import nlp from 'compromise';
import compromiseDates from 'compromise-dates';
import { Transaction } from '@/store';

// Define types for compromise
interface CompromiseDoc {
    numbers: () => {
        found: boolean;
        get: () => Array<number>;
    };
    dates: () => {
        found: boolean;
        get: () => Array<{ start: Date; text: string }>;
    };
    match: (pattern: string) => {
        found: boolean;
        text: () => string;
    };
}

// Register the dates plugin with configuration
nlp.plugin(compromiseDates);
nlp.extend(() => ({
    words: {
        // Month names and abbreviations
        jan: 'Month',
        january: 'Month',
        feb: 'Month',
        february: 'Month',
        mar: 'Month',
        march: 'Month',
        apr: 'Month',
        april: 'Month',
        may: 'Month',
        jun: 'Month',
        june: 'Month',
        jul: 'Month',
        july: 'Month',
        aug: 'Month',
        august: 'Month',
        sep: 'Month',
        sept: 'Month',
        september: 'Month',
        oct: 'Month',
        october: 'Month',
        nov: 'Month',
        november: 'Month',
        dec: 'Month',
        december: 'Month',
        // Relative dates
        today: 'Date',
        t: 'Date',
        tomorrow: 'Date',
        tm: 'Date',
        yesterday: 'Date',
        y: 'Date',
    },
}));

// Add custom words to compromise
nlp.addWords({
    k: 'Value',
    K: 'Value',
    peso: 'Currency',
    pesos: 'Currency',
    p: 'Currency',
    P: 'Currency',
    php: 'Currency',
    PHP: 'Currency',
    '₱': 'Currency',
});

interface ParsedTransaction {
    amount: number;
    merchant: string;
    category: string;
    date: string;
    description?: string;
    wallet: string;
    walletType: 'card' | 'cash' | 'personal';
}

interface Props {
    onSubmit: (
        transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ) => void;
    onCancel: () => void;
}

type Wallet = {
    name: string;
    type: 'card' | 'cash' | 'personal';
};

const MERCHANTS = [
    'SM Supermarket',
    'Cardinal Bakeshop',
    "Henry's Camera",
    "Rustan's",
    'Sunburst',
    'Bow & Wow',
    '7 Eleven',
];

const WALLETS: Wallet[] = [
    { name: 'UB Platinum', type: 'card' },
    { name: 'Cash', type: 'cash' },
    { name: 'Personal & Payroll', type: 'personal' },
    { name: 'Seabank', type: 'card' },
    { name: 'Maya', type: 'card' },
    { name: 'GCash', type: 'card' },
];

const CATEGORIES = [
    'Groceries',
    'Snacks',
    'Hobbies',
    'Quality of Life',
    'Meals',
    'Dogs Stuff',
    'Stuff',
    'Inflow',
] as const;

interface Suggestion {
    text: string;
    type: 'merchant' | 'category' | 'date' | 'amount' | 'wallet';
    icon: React.ReactNode;
    label: string;
}

interface DropdownProps<T> {
    value: T;
    options: readonly T[];
    onChange: (value: T) => void;
    getLabel: (value: T) => string;
    icon: React.ReactNode;
    placeholder: string;
}

function Dropdown<T>({
    value,
    options,
    onChange,
    getLabel,
    icon,
    placeholder,
}: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className='relative'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-2 pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded hover:border-gray-300 focus:outline-none'
            >
                <div className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400'>
                    {icon}
                </div>
                <span>{value ? getLabel(value) : placeholder}</span>
            </button>
            {isOpen && (
                <div className='absolute z-[100] mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto min-w-max max-w-[16rem]'>
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className='px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer truncate'
                        >
                            {getLabel(option)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TransactionInput({ onSubmit, onCancel }: Props) {
    const [input, setInput] = useState('');
    const [selectedWallet, setSelectedWallet] = useState<Wallet>(WALLETS[0]);
    const [selectedMerchant, setSelectedMerchant] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [continuousMode, setContinuousMode] = useState(false);
    const [parsedPreview, setParsedPreview] =
        useState<ParsedTransaction | null>(null);
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const parseInput = (text: string): ParsedTransaction | null => {
        const doc = nlp(text) as CompromiseDoc;

        // Parse amount
        let amount: number | null = null;
        const isInflow = text.trim().startsWith('+');
        const money = doc.match('#Money+ #Currency?');
        if (money.found) {
            const value = money
                .text()
                .toLowerCase()
                .replace(/[₱p$+]/g, '')
                .replace(/k/g, '000');
            amount = parseFloat(value);
            // Default to outflow (negative) unless explicitly marked as inflow
            if (!isInflow) {
                amount = -amount;
            }
        } else {
            const numbers = doc.numbers();
            if (numbers.found) {
                const num = numbers.get()[0];
                amount = typeof num === 'number' ? num : null;
                // Default to outflow (negative) unless explicitly marked as inflow
                if (amount !== null && !isInflow) {
                    amount = -amount;
                }
            }
        }
        if (!amount) return null;

        // Parse date
        const dates = doc.dates();
        const date = dates.found
            ? new Date(dates.get()[0].start).toISOString().split('T')[0]
            : selectedDate;

        // Parse merchant and category
        const merchant = selectedMerchant || '';
        const category = selectedCategory || '';

        return {
            amount,
            merchant,
            category,
            date,
            wallet: selectedWallet.name,
            walletType: selectedWallet.type,
        };
    };

    const getSuggestionIcon = (type: Suggestion['type']): React.ReactNode => {
        switch (type) {
            case 'merchant':
                return (
                    <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                        />
                    </svg>
                );
            case 'category':
                return (
                    <svg
                        className='w-4 h-4'
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
            case 'date':
                return (
                    <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                    </svg>
                );
            case 'amount':
                return (
                    <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                    </svg>
                );
            case 'wallet':
                return (
                    <svg
                        className='w-4 h-4'
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
                );
        }
    };

    const findSuggestion = (word: string): Suggestion | null => {
        if (!word || word.length < 2) return null;

        // Try merchant match
        const merchantMatch = MERCHANTS.find((m) =>
            m.toLowerCase().startsWith(word.toLowerCase())
        );
        if (merchantMatch) {
            return {
                text: merchantMatch,
                type: 'merchant',
                icon: getSuggestionIcon('merchant'),
                label: 'Merchant',
            };
        }

        // Try category match
        const categoryMatch = CATEGORIES.find((c) =>
            c.toLowerCase().startsWith(word.toLowerCase())
        );
        if (categoryMatch) {
            return {
                text: categoryMatch,
                type: 'category',
                icon: getSuggestionIcon('category'),
                label: 'Category',
            };
        }

        // Try wallet match
        const walletMatch = WALLETS.find((w) =>
            w.name.toLowerCase().startsWith(word.toLowerCase())
        );
        if (walletMatch) {
            return {
                text: walletMatch.name,
                type: 'wallet',
                icon: getSuggestionIcon('wallet'),
                label: 'Wallet',
            };
        }

        // Try amount match using compromise
        const doc = nlp(word) as CompromiseDoc;
        const money = doc.match('(#Value|#Money)+ (#Currency|k|K)?');
        if (money.found) {
            return {
                text: money.text(),
                type: 'amount',
                icon: getSuggestionIcon('amount'),
                label: 'Amount',
            };
        }

        // Try date match
        const monthMatch = word.match(
            /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})$/i
        );
        if (monthMatch) {
            const [_, month, day] = monthMatch;
            return {
                text: `${month} ${day}`,
                type: 'date',
                icon: getSuggestionIcon('date'),
                label: 'Date',
            };
        }

        // Try relative date shortcuts
        const relativeDates = [
            'today',
            't',
            'tomorrow',
            'tm',
            'yesterday',
            'y',
        ];
        if (relativeDates.includes(word.toLowerCase())) {
            return {
                text: word,
                type: 'date',
                icon: getSuggestionIcon('date'),
                label: 'Date',
            };
        }

        return null;
    };

    const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
        const text = e.currentTarget.textContent || '';
        setInput(text);
        const parsed = parseInput(text);
        setParsedPreview(parsed);
        const words = text.split(/\s+/);
        const lastWord = words[words.length - 1];
        const newSuggestion = findSuggestion(lastWord);
        setSuggestion(newSuggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey && parsedPreview) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Tab' && suggestion) {
            e.preventDefault();
            const cursorPosition = window
                .getSelection()
                ?.getRangeAt(0).startOffset;
            if (cursorPosition !== undefined) {
                setInput((prev) => {
                    const words = prev.split(/\s+/);
                    words[words.length - 1] = suggestion.text;
                    return words.join(' ') + ' ';
                });
                setSuggestion(null);
            }
        }
    };

    // Handle dropdown changes
    const handleMerchantChange = (merchant: string) => {
        setSelectedMerchant(merchant);

        // Replace the old merchant in the text field if it exists
        if (selectedMerchant && input.includes(selectedMerchant)) {
            const newInput = input.replace(selectedMerchant, merchant);
            setInput(newInput);
            if (inputRef.current) {
                inputRef.current.textContent = newInput;
            }
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);

        // Replace the old category in the text field if it exists
        if (selectedCategory && input.includes(selectedCategory)) {
            const newInput = input.replace(selectedCategory, category);
            setInput(newInput);
            if (inputRef.current) {
                inputRef.current.textContent = newInput;
            }
        }
    };

    // Reset selections when input is cleared
    useEffect(() => {
        if (!input) {
            setSelectedCategory('');
            setSelectedMerchant('');
        }
    }, [input]);

    useEffect(() => {
        const text = input;
        const parsed = parseInput(text);
        setParsedPreview(parsed);
    }, [input, parseInput]);

    const handleSubmit = () => {
        if (parsedPreview) {
            const transaction: Omit<
                Transaction,
                'id' | 'createdAt' | 'updatedAt'
            > = {
                amount: parsedPreview.amount,
                merchant: selectedMerchant || parsedPreview.merchant || '',
                category: selectedCategory || parsedPreview.category || '',
                date: selectedDate,
                description: parsedPreview.description,
                wallet: selectedWallet.name,
                walletType: selectedWallet.type,
            };
            onSubmit(transaction);
            if (!continuousMode) {
                onCancel();
            } else {
                setInput('');
                setParsedPreview(null);
                setSuggestion(null);
                setSelectedCategory('');
                setSelectedMerchant('');
            }
        }
    };

    const renderPreview = () => {
        if (!parsedPreview) return null;

        const previewWords = [];
        if (parsedPreview.amount) {
            previewWords.push(
                <span
                    key='amount'
                    className={
                        parsedPreview.amount < 0
                            ? 'text-red-500'
                            : 'text-green-500'
                    }
                >
                    {parsedPreview.amount < 0 ? '−' : '+'} ₱
                    {Math.abs(parsedPreview.amount).toLocaleString()}
                </span>
            );
        }
        if (parsedPreview.merchant) {
            previewWords.push(
                <span key='merchant' className='text-gray-600'>
                    at {parsedPreview.merchant}
                </span>
            );
        }
        if (parsedPreview.description) {
            previewWords.push(
                <span key='description' className='text-gray-500'>
                    {parsedPreview.description}
                </span>
            );
        }

        return (
            <>
                {previewWords.map((word, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && ' '}
                        {word}
                    </React.Fragment>
                ))}
            </>
        );
    };

    // Add global escape key listener
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    // Auto focus input when modal opens
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className='bg-white rounded-xl shadow-lg overflow-visible -translate-y-24'>
            <div className='p-4'>
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-xl font-semibold text-gray-800'>
                            New transaction
                        </h2>
                        <div className='flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                            <span>⇧</span>
                            <span>N</span>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
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

                <div>
                    <div className='relative flex'>
                        <div
                            ref={inputRef}
                            contentEditable
                            onInput={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className='w-full h-16 py-2 focus:outline-none whitespace-pre-wrap flex items-center'
                            role='textbox'
                            aria-multiline='true'
                            spellCheck={false}
                        />
                        {suggestion && (
                            <div className='absolute pointer-events-none py-2 inset-y-0 left-0 flex items-center'>
                                <span className='invisible'>{input}</span>
                                <span className='inline-flex items-center gap-1.5 text-gray-400 bg-gray-50/80 px-2 py-0.5 rounded'>
                                    {suggestion.icon}
                                    <span className='text-sm'>
                                        {suggestion.text}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className='mt-4'>
                    <div className='flex gap-2'>
                        <Dropdown
                            value={selectedWallet}
                            options={WALLETS}
                            onChange={setSelectedWallet}
                            getLabel={(wallet) => wallet.name}
                            placeholder='Wallet'
                            icon={
                                <svg
                                    className='w-4 h-4'
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
                            }
                        />
                        <Dropdown
                            value={selectedMerchant}
                            options={MERCHANTS}
                            onChange={handleMerchantChange}
                            getLabel={(merchant) => merchant}
                            placeholder='Merchant'
                            icon={
                                <svg
                                    className='w-4 h-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={1.5}
                                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                                    />
                                </svg>
                            }
                        />
                        <Dropdown
                            value={selectedCategory}
                            options={CATEGORIES}
                            onChange={handleCategoryChange}
                            getLabel={(category) => category}
                            placeholder='Category'
                            icon={
                                <svg
                                    className='w-4 h-4'
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
                            }
                        />
                        <div className='relative min-w-0'>
                            <input
                                type='date'
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className='pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded hover:border-gray-300 focus:outline-none w-fit'
                            />
                            <div className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none'>
                                <svg
                                    className='w-4 h-4 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={1.5}
                                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='px-4 py-3 bg-gray-50 flex justify-between items-center rounded-b-xl'>
                <div className='flex items-center gap-3 text-sm'>
                    {renderPreview()}
                </div>
                <div className='flex items-center gap-3'>
                    <button
                        onClick={() => setContinuousMode(!continuousMode)}
                        className={`px-3 py-1.5 text-sm rounded-lg ${
                            continuousMode
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Continuous
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!parsedPreview}
                        className='px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Create transaction
                    </button>
                </div>
            </div>
        </div>
    );
}
