import mongoose, {Document, Schema} from "mongoose"
import {ITicket} from "./Ticket"

// Kanban board column model

interface IColumn extends Document {
    title: string
    tickets: mongoose.Types.ObjectId[] | ITicket[]
}

let columnSchema: Schema = new Schema({
    name: { type: String, required: true },
    tickets: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
})

const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>('Ticket', columnSchema)

export {Column, IColumn}