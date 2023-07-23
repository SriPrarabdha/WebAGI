import { Inter } from 'next/font/google';
import './globals.css';
import Provider from '../components/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Intellify Web',
  description: 'Meet your new AI legal assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
