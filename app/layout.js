import ClientProvider from "./components/ClientProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "GAMICA Lost & Found Portal - Campus Community Hub",
  description: "University Lost & Found Portal - Report and find lost items on campus. Connect with fellow students to reunite lost belongings with their owners.",
  keywords: "lost and found, university, campus, GAMICA, lost items, found items, student portal",
  authors: [{ name: "Nazir Hussain" }],
  creator: "Nazir Hussain",
  publisher: "GAMICA University",
  robots: "index, follow",
  openGraph: {
    title: "GAMICA Lost & Found Portal",
    description: "University Lost & Found Portal - Report and find lost items on campus",
    type: "website",
    locale: "en_US",
    siteName: "GAMICA Lost & Found Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "GAMICA Lost & Found Portal",
    description: "University Lost & Found Portal - Report and find lost items on campus",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#667eea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <ClientProvider>
          {children}
        </ClientProvider>
        <Toaster position="top-right" />
        
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}