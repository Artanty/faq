import { BusEvent } from "typlib"


export interface RegisterComponentsBusEventPayloadItem {
    customElementName: string
    customElementInputs: any,
    customElementTransclusion: string
}

export type RegisterComponentsBusEvent = BusEvent<{
    componentType: string,
    items: RegisterComponentsBusEventPayloadItem[]
}>