export interface GetOldestTicketRequest {
    userId: number
    folderId?: number
    topicId?: number
    quantity?: number
}

export interface GetOldestTicketResponse {
    "id": number
    "title": string
    "question": string
    "rightAnswer": string
    "date": string
    "lastShownDate": string
    "answersQuantity": number
    "folderId": number
    "topicId": number
    "userId": number
}

export interface GetUserTicketsRequest {
    userId: number
}

export interface GetTicketByIdRequest {
    ticketId: number
}

export interface CreateTicketRequest {
    title: string
    question: string
    rightAnswer: string
    folderId: number
    topicId?: number
}

export interface DeleteWithAnswersRequest {
    ticketId: number
}

export interface GetAnswersByTicketIdRequest {
    ticketId: number
}