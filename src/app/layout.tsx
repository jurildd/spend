import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Spend - Personal Finance Tracker',
    description: 'Track your spending and manage your budget with ease',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`${inter.className} bg-[#F1F1F6] text-gray-900`}>
                {children}
            </body>
        </html>
    );
}
