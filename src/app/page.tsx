'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TransactionList from '@/components/TransactionList';

export default function Home() {
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
