import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#0649ad" />
        <meta
          name="description"
          content="Free English and Tagalog LTO driving-license reviewer for road rules, safety, signs, signals, and markings."
        />
        <link rel="icon" type="image/webp" href="/images/lto_logo.webp?v=2" />
        <link rel="shortcut icon" href="/images/lto_logo.webp?v=2" />
        <link rel="apple-touch-icon" href="/images/lto_logo.webp?v=2" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
