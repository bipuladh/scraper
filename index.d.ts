export {};

declare global {
  interface Window {
    sanitize: Function;
    parseDisks: Function;
    parseMemory: Function;
  }
}
