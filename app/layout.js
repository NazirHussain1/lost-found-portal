import ClientProvider from "./components/ClientProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Portal",
  description: "University Lost & Found",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
      </body>
    </html>
  );
}