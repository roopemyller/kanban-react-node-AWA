import mongoose, {Document, Schema} from "mongoose"

// Kanban board ticket model
interface ITicket extends Document {
    title: string
    description: string
    date: Date
    columnId: string
    backgroundColor: string
    modifiedAt?: Date
}
// Schema for the Kanban board ticket model
const ticketSchema: Schema = new Schema({
    title: {type: String, required: true},
    description: {type: String},
    date: {type: Date, default: Date.now },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    backgroundColor: { type: String, default: '#3b3b3b' },
    modifiedAt: { type: Date },
})

const Ticket: mongoose.Model<ITicket> = mongoose.model<ITicket>('Ticket', ticketSchema)

export {Ticket, ITicket}