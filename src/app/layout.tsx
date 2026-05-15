import { Inter } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ReduxProvider from '@/store/ReduxProvider';
import SessionManager from "@/components/common/SessionManager";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Flwbite POS",
  description: "AI Powered POS for UMKM",
  manifest: "/manifest.json",
  themeColor: "#0166ff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flwbite POS",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark:bg-gray-900`}>
        <ReduxProvider>
          <ThemeProvider>
            <SidebarProvider>
              <SessionManager />
              <Toaster position="bottom-center" richColors />
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
