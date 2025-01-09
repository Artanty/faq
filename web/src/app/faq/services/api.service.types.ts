export interface GetOldestTicketRequest {
    userId: number
    folderId?: number
    topicId?: number
    quantity?: number
    dateFrom?: string
    dateTo?: string
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

export interface GetSchedulesByUserIdRequest {
    userId: number
}

export interface GetSchedulesByUserIdResponseItem {
    id: number; // Unique identifier for the schedule
    userId: number; // ID of the user associated with the schedule
    folderId: number | null; // ID of the folder (nullable)
    topicId: number | null; // ID of the topic (nullable)
    ticketId: number | null; // ID of the ticket (nullable)
    dateFrom: string | null; // Start date of the schedule (nullable)
    dateTo: string | null; // End date of the schedule (nullable)
    frequency: number; // Frequency in minutes
    weekdays: string; // Weekdays pattern (e.g., '1011001')
    active: number; // Active status (0 or 1)
    createdAt: string; // Timestamp when the schedule was created
  }

  export type GetSchedulesByUserIdResponse = GetSchedulesByUserIdResponseItem[]

  export interface CreateScheduleRequest {
    "userId": number
    "weekdays": string
    "frequency": number
    "active": boolean
    "folderId"?: number
    "topicId"?: number
    "ticketId"?: number
    "dateFrom"?: string
    "dateTo"?: string
  }