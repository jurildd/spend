import Link from 'next/link';
import { useTransactionStore } from '@/store';
import { usePathname } from 'next/navigation';

interface Props {
    onWalletSelect: (wallet: string | null) => void;
    selectedWallet: string | null;
}

type AccountType = 'credit' | 'cash';

interface Wallet {
    name: string;
    type: 'card' | 'cash' | 'personal';
    accountType: AccountType;
    initialBalance: number;
}

const WALLETS: Wallet[] = [
    {
        name: 'EW KF World',
        type: 'card',
        accountType: 'credit',
        initialBalance: 0,
    },
    { name: 'Cash', type: 'cash', accountType: 'cash', initialBalance: 0 },
    {
        name: 'Personal & Payroll',
        type: 'personal',
        accountType: 'cash',
        initialBalance: 0,
    },
    {
        name: 'Seabank',
        type: 'card',
        accountType: 'cash',
        initialBalance: 0,
    },
    {
        name: 'Maya',
        type: 'card',
        accountType: 'cash',
        initialBalance: 0,
    },
    { name: 'GCash', type: 'card', accountType: 'cash', initialBalance: 0 },
];

export default function Sidebar({ onWalletSelect, selectedWallet }: Props) {
    const { transactions } = useTransactionStore();
    const pathname = usePathname();

    // Calculate wallet balances from transactions plus initial balance
    const walletBalances = WALLETS.map((wallet) => {
        const transactionBalance = transactions
            .filter((t) => t.wallet === wallet.name)
            .reduce((sum, t) => sum + t.amount, 0);

        // For credit accounts, transactions work in reverse
        const adjustedTransactionBalance =
            wallet.accountType === 'credit'
                ? -transactionBalance
                : transactionBalance;

        return {
            ...wallet,
            balance: wallet.initialBalance + adjustedTransactionBalance,
        };
    });

    const totalBalance = walletBalances.reduce(
        (sum, wallet) => sum + wallet.balance,
        0
    );

    return (
        <nav className='w-[280px] min-h-screen bg-[#F1F1F6]'>
            <div className='p-6 flex flex-col h-full'>
                {/* Header */}
                <div className='mb-8'>
                    <Link
                        href='/'
                        className='text-xl font-semibold text-gray-800 hover:text-gray-900'
                    >
                        Juril&apos;s Budget
                    </Link>
                </div>

                {/* Navigation */}
                <div className='space-y-2 mb-8'>
                    <Link
                        href='/budget'
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                            pathname === '/budget'
                                ? 'bg-white text-gray-900'
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                    >
                        <svg
                            className='w-5 h-5 mr-3 shrink-0'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 6h16M4 12h16m-7 6h7'
                            />
                        </svg>
                        <span className='truncate'>Budget</span>
                    </Link>
                    <Link
                        href='/reports'
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                            pathname === '/reports'
                                ? 'bg-white text-gray-900'
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                    >
                        <svg
                            className='w-5 h-5 mr-3 shrink-0'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                            />
                        </svg>
                        <span className='truncate'>Reports</span>
                    </Link>
                    <div className='relative'>
                        <Link
                            href='/'
                            className={`flex items-center w-full px-3 py-2 hover:bg-white hover:text-gray-900 rounded-lg transition-colors ${
                                pathname === '/' && !selectedWallet
                                    ? 'bg-white text-gray-900'
                                    : 'text-gray-600'
                            }`}
                        >
                            <svg
                                className='w-5 h-5 mr-3 shrink-0'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                                />
                            </svg>
                            <span className='truncate'>Wallets</span>
                            <span className='ml-auto text-gray-600 tabular-nums text-right w-[120px]'>
                                ₱{' '}
                                {totalBalance.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </Link>

                        {/* Vertical line for wallet items */}
                        <div className='absolute left-[21px] top-[46px] w-[2px] bg-gray-200 rounded-full h-[216px]' />

                        {/* Wallet List */}
                        <div className='mt-2 space-y-1 relative'>
                            {walletBalances.map((wallet) => (
                                <div
                                    key={wallet.name}
                                    className='flex pl-[32px] relative'
                                >
                                    <Link
                                        href={`/?wallet=${encodeURIComponent(
                                            wallet.name
                                        )}`}
                                        onClick={() =>
                                            onWalletSelect(wallet.name)
                                        }
                                        className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-white hover:text-gray-900 rounded-lg ${
                                            selectedWallet === wallet.name
                                                ? 'bg-white text-gray-900'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        <span className='font-medium text-gray-700 truncate flex-shrink'>
                                            {wallet.name}
                                        </span>
                                        <span
                                            className={`flex-shrink-0 ml-4 tabular-nums ${
                                                wallet.balance < 0
                                                    ? 'text-red-500 font-medium'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            ₱{' '}
                                            {Math.abs(
                                                wallet.balance
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
