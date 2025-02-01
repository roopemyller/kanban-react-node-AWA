import mongoose, {Document, Schema} from "mongoose"

// Kanban board ticket model

interface ITicket extends Document {
    title: string
    desc: string
    date: Date
    labels: string[]
}

let ticketSchema: Schema = new Schema({
    title: {type: String, required: true},
    desc: {type: String, required: false},
    date: {type: Date, required: false},
    labels: {type: [String], required: false}
})

const Ticket: mongoose.Model<ITicket> = mongoose.model<ITicket>('Ticket', ticketSchema)

export {Ticket, ITicket}