import { BusEvent } from "./app.component"

export interface RegisterComponentsBusEventPayload {
    target: string,
    customElementName: string
    customElementInputs: any,
    customElementTransclusion: string
    url: string
}

export type RegisterComponentsBusEvent = BusEvent<RegisterComponentsBusEventPayload>