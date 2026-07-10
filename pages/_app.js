import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <main className="font-sans min-h-screen bg-dark-900 text-slate-100 flex flex-col">
      <Component {...pageProps} />
    </main>
  );
}
