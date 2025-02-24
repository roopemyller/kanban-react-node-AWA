import mongoose, {Types, Document, Schema} from "mongoose"
import {ITicket} from "./Ticket"
import { Board } from "./Board"

// Kanban board column model

interface IColumn extends Document {
    title: string
    boardId: Types.ObjectId
    createdAt: Date
    tickets: mongoose.Types.ObjectId[] | ITicket[]
}

let columnSchema: Schema = new Schema({
    title: { type: String, required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    createdAt: { type: Date, default: Date.now },
    tickets: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
})

const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>('Column', columnSchema)

export {Column, IColumn}