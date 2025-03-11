'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TransactionList from '@/components/TransactionList';

function HomeContent() {
    const searchParams = useSearchParams();
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

    // Set the selected wallet from URL parameters when the page loads
    useEffect(() => {
        const walletParam = searchParams.get('wallet');
        if (walletParam) {
            setSelectedWallet(walletParam);
        }
    }, [searchParams]);

    return (
        <div className='flex w-full'>
            <Sidebar
                selectedWallet={selectedWallet}
                onWalletSelect={setSelectedWallet}
            />
            <div className='flex-1'>
                <TransactionList selectedWallet={selectedWallet} />
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense
            fallback={
                <div className='flex w-full'>
                    <div className='w-[280px] h-screen bg-[#F1F1F6]' />
                    <div className='flex-1 p-8'>
                        <div className='animate-pulse'>
                            <div className='h-8 w-48 bg-gray-200 rounded mb-8' />
                            <div className='space-y-4'>
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className='h-16 bg-gray-200 rounded'
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <HomeContent />
        </Suspense>
    );
}
