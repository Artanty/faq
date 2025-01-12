import { BusEvent } from "./app.component"

export interface RegisterComponentsBusEventPayload {
    target: string,
    customElementName: string
}

export type RegisterComponentsBusEvent = BusEvent<RegisterComponentsBusEventPayload>