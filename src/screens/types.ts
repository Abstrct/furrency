export interface Ctx {
  /** The route this screen answers ("#/den"). */
  route: string;
  /** The part after the route ("#/prowl/1-1000" → "1-1000"). */
  param?: string;
  go(path: string): void;
  /** Open the Pact (paw, words, clan, den); 'words' opens on the paw words. */
  pact(start?: 'words'): void;
}

export interface Screen {
  el: HTMLElement;
  title?: string;
  enter?(): void;
  leave(): void;
}
