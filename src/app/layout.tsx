import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { HouseholdProvider } from "@/lib/household-store";
import { NavHeader } from "@/components/NavHeader";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ClerkThemeProvider } from "@/components/ClerkThemeProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "OpenDoor — Find benefits you may qualify for",
  description:
    "A free, informational tool that helps you find public benefit programs you may qualify for. No account needed — an optional free account lets you save your results across devices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          // Runs before paint so there's no flash of the wrong theme or density.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('opendoor-theme');document.documentElement.classList.toggle('dark', t !== 'light');if(localStorage.getItem('opendoor-density')==='compact')document.documentElement.setAttribute('data-density','compact');if(localStorage.getItem('opendoor-locale')==='es')document.documentElement.lang='es';var a=JSON.parse(localStorage.getItem('opendoor-a11y')||'{}');var r=document.documentElement;if(a.textSize==='lg'||a.textSize==='xl')r.setAttribute('data-text-size',a.textSize);if(a.highContrast)r.setAttribute('data-contrast','high');if(a.dyslexiaFont)r.setAttribute('data-font','dyslexia');if(a.reduceMotion)r.setAttribute('data-motion','reduce');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkThemeProvider>
          <HouseholdProvider>
            <NavHeader />
            {children}
            <AccessibilityMenu />
            <ChatWidget />
          </HouseholdProvider>
        </ClerkThemeProvider>
      </body>
    </html>
  );
}
