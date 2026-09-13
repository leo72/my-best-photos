export interface Photo {
    id: string;
    ownerId: string;
    title: string;
    storagePath: string;
    createdAt: Date | null;
  }