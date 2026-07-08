// Allow TypeScript to accept CSS file imports (e.g. import '../styles/globals.css')
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
