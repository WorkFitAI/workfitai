import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { ApplyModalProvider } from "@/contexts/apply-modal-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkfitAI",
  description: "AI-powered workforce management and job portal platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthProvider>
            <NotificationProvider>
              <ApplyModalProvider>
                {children}
                <Toaster richColors position="bottom-right" />
              </ApplyModalProvider>
            </NotificationProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
