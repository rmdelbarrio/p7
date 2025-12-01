// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'mBoard - Twitter-style Message Board',
  description: 'A modern Twitter-style message board application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          html, body {
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: white;
            color: #000;
            line-height: 1.4;
          }
          
          a {
            color: inherit;
            text-decoration: none;
          }
          
          button {
            font-family: inherit;
            border: none;
            background: none;
            cursor: pointer;
          }
          
          textarea {
            font-family: inherit;
            border: none;
            resize: none;
            outline: none;
          }
          
          /* Animation for loading */
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}