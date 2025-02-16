import mongoose, {Document, Schema} from "mongoose"

// Kanban board ticket model

interface ITicket extends Document {
    title: string
    description: string
    date: Date
    columnId: string

}

const ticketSchema: Schema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    date: {type: Date, default: Date.now },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
})

const Ticket: mongoose.Model<ITicket> = mongoose.model<ITicket>('Ticket', ticketSchema)

export {Ticket, ITicket}