export interface GetOldestTicketRequest {
    userId: number
    folderId: number
    topicId: number
    quantity: number
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