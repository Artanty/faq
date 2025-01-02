export interface Ticket {
    id: number;
    title: string;
    question: string;
    rightAnswer: string;
    date: string;
    lastShownDate: string;
    answersQuantity: number;
    folderId: number
    topicId: number | null
    userId: number
  }

  