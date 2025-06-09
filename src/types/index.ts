export interface Note {
  id: string;
  content: string;
  title: string;
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  updatedAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  lastEditedBy?: string;
  collaborators: string[];
}

export interface User {
  uid: string;
  isAnonymous: boolean;
  displayName?: string;
}
