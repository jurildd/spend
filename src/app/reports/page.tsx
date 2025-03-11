'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store';
import Sidebar from '@/components/Sidebar';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

function MonthlySpendingChart() {
    const { transactions } = useTransactionStore();

    // Group transactions by month and calculate total spending
    const monthlySpending = transactions.reduce((acc, t) => {
        const month = t.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { month, spending: 0, income: 0 };
        if (t.amount < 0) {
            acc[month].spending += Math.abs(t.amount);
        } else {
            acc[month].income += t.amount;
        }
        return acc;
    }, {} as Record<string, { month: string; spending: number; income: number }>);

    const data = Object.values(monthlySpending)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((item) => ({
            name: new Date(item.month).toLocaleString('default', {
                month: 'short',
            }),
            Spending: item.spending,
            Income: item.income,
        }));

    return (
        <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <div className='mb-4'>
                <h3 className='text-lg font-semibold'>Monthly Overview</h3>
                <p className='text-sm text-muted-foreground'>
                    Your spending and income patterns
                </p>
            </div>
            <div className='h-[350px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={data}>
                        <XAxis
                            dataKey='name'
                            stroke='#888888'
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke='#888888'
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                                `₱${value.toLocaleString()}`
                            }
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (
                                    active &&
                                    payload &&
                                    payload.length > 1 &&
                                    payload[0]?.value != null &&
                                    payload[1]?.value != null
                                ) {
                                    return (
                                        <div className='rounded-lg border bg-background p-2 shadow-sm'>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <div className='flex flex-col'>
                                                    <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                                        Spending
                                                    </span>
                                                    <span className='font-bold text-red-500'>
                                                        ₱
                                                        {payload[0].value.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                                        Income
                                                    </span>
                                                    <span className='font-bold text-green-500'>
                                                        ₱
                                                        {payload[1].value.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey='Spending'
                            fill='currentColor'
                            radius={[4, 4, 0, 0]}
                            className='fill-red-500'
                        />
                        <Bar
                            dataKey='Income'
                            fill='currentColor'
                            radius={[4, 4, 0, 0]}
                            className='fill-green-500'
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function NetWorthCard() {
    const { transactions } = useTransactionStore();

    // Calculate assets and debts from wallet types
    const netWorth = transactions.reduce(
        (acc, t) => {
            const isCredit =
                t.walletType === 'card' && t.wallet === 'EW KF World';
            if (isCredit) {
                acc.debts += t.amount;
            } else {
                acc.assets += t.amount;
            }
            return acc;
        },
        { assets: 0, debts: 0 }
    );

    return (
        <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <div className='mb-4'>
                <h3 className='text-lg font-semibold'>Net Worth</h3>
                <p className='text-sm text-muted-foreground'>
                    Your total assets and liabilities
                </p>
            </div>
            <div className='grid grid-cols-3 gap-4'>
                <div>
                    <div className='text-sm text-muted-foreground mb-1'>
                        Assets
                    </div>
                    <div className='text-xl font-medium text-green-500'>
                        ₱{Math.max(0, netWorth.assets).toLocaleString()}
                    </div>
                </div>
                <div>
                    <div className='text-sm text-muted-foreground mb-1'>
                        Debts
                    </div>
                    <div className='text-xl font-medium text-red-500'>
                        ₱
                        {Math.abs(Math.min(0, netWorth.debts)).toLocaleString()}
                    </div>
                </div>
                <div>
                    <div className='text-sm text-muted-foreground mb-1'>
                        Net Worth
                    </div>
                    <div className='text-xl font-medium'>
                        ₱{(netWorth.assets + netWorth.debts).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TopCategories() {
    const { transactions } = useTransactionStore();

    // Calculate spending by category
    const categorySpending = transactions.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = 0;
        if (t.amount < 0) acc[t.category] += Math.abs(t.amount);
        return acc;
    }, {} as Record<string, number>);

    // Sort categories by spending
    const sortedCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <div className='mb-4'>
                <h3 className='text-lg font-semibold'>Top Categories</h3>
                <p className='text-sm text-muted-foreground'>
                    Your highest spending categories
                </p>
            </div>
            <div className='space-y-4'>
                {sortedCategories.map(([category, amount]) => (
                    <div key={category} className='flex items-center gap-4'>
                        <div className='flex-1'>
                            <div className='text-sm font-medium'>
                                {category}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                                ₱{amount.toLocaleString()}
                            </div>
                        </div>
                        <div className='w-48 h-2 bg-muted rounded-full overflow-hidden'>
                            <div
                                className='h-full bg-primary rounded-full'
                                style={{
                                    width: `${
                                        (amount / sortedCategories[0][1]) * 100
                                    }%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SpendingByWallet() {
    const { transactions } = useTransactionStore();

    // Calculate spending by wallet
    const walletSpending = transactions.reduce((acc, t) => {
        if (!acc[t.wallet]) acc[t.wallet] = { spent: 0, income: 0 };
        if (t.amount < 0) {
            acc[t.wallet].spent += Math.abs(t.amount);
        } else {
            acc[t.wallet].income += t.amount;
        }
        return acc;
    }, {} as Record<string, { spent: number; income: number }>);

    return (
        <div className='rounded-xl border bg-white p-6 shadow-sm'>
            <div className='mb-4'>
                <h3 className='text-lg font-semibold'>Spending by Wallet</h3>
                <p className='text-sm text-muted-foreground'>
                    Your spending and income distribution
                </p>
            </div>
            <div className='space-y-4'>
                {Object.entries(walletSpending).map(
                    ([wallet, { spent, income }]) => (
                        <div key={wallet} className='space-y-2'>
                            <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium'>
                                    {wallet}
                                </span>
                                <span className='text-sm text-muted-foreground'>
                                    ₱{spent.toLocaleString()} spent
                                </span>
                            </div>
                            <div className='flex gap-2 h-2'>
                                <div
                                    className='bg-red-500 rounded-full'
                                    style={{
                                        width: `${
                                            (spent / (spent + income)) * 100
                                        }%`,
                                    }}
                                />
                                <div
                                    className='bg-green-500 rounded-full'
                                    style={{
                                        width: `${
                                            (income / (spent + income)) * 100
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default function Reports() {
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

    return (
        <div className='flex w-full'>
            <Sidebar
                selectedWallet={selectedWallet}
                onWalletSelect={setSelectedWallet}
            />
            <div className='flex-1 p-8'>
                <h1 className='text-2xl font-semibold mb-6'>Reports</h1>
                <div className='grid grid-cols-2 gap-6'>
                    <MonthlySpendingChart />
                    <NetWorthCard />
                    <TopCategories />
                    <SpendingByWallet />
                </div>
            </div>
        </div>
    );
}
