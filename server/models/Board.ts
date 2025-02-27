import mongoose, {Document, Types, Schema} from "mongoose"

// Interface for the Board model
interface IBoard extends Document {
    title: string
    userId: Types.ObjectId
    columns: Types.ObjectId[]
    createdAt: Date
}

// Schema for the Board model
let boardSchema: Schema = new Schema({
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    columns: [{ type: Schema.Types.ObjectId, ref: 'Column' }],
    createdAt: { type: Date, default: Date.now },
})

const Board: mongoose.Model<IBoard> = mongoose.model<IBoard>('Board', boardSchema)

export {Board, IBoard}