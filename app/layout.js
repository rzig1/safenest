import "./globals.css";
import Providers from "./providers";
import Nav from "@/app/components/Nav";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
