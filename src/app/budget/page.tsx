'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Budget() {
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

    return (
        <div className='flex w-full'>
            <Sidebar
                selectedWallet={selectedWallet}
                onWalletSelect={setSelectedWallet}
            />
            <div className='flex-1 p-8'>
                <h1 className='text-2xl font-semibold mb-6'>Budget</h1>
                <div className='rounded-xl border bg-white p-6 shadow-sm'>
                    <div className='mb-4'>
                        <h3 className='text-lg font-semibold'>Coming Soon</h3>
                        <p className='text-sm text-muted-foreground'>
                            The budget feature is currently under development
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
