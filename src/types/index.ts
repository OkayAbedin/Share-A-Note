export interface Note {
  id: string;
  content: string;
  title: string;
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  updatedAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  lastEditedBy?: string;
  collaborators: string[];
  isCodeView?: boolean; // Remember if note was last saved in code mode
  codeLanguage?: string; // Remember the last selected language
}

export interface User {
  uid: string;
  isAnonymous: boolean;
  displayName?: string;
}
