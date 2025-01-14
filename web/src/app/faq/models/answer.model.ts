export interface Answer {
    id: number;
    ticketId: number;
    body: string;
    date: string;
    rate: number;
    userId: number
  }
  

export interface AnswerSaveResponse {
  id: number;
  ticketId: number;
  body: string;
  rate: number;
}
