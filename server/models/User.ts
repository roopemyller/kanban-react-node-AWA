import mongoose, {Document, Schema} from "mongoose"

// User model
interface IUser extends Document {
    name: string
    email: string
    password: string
    profilePicture: string
    createdAt: Date
}
// Schema for the User model
let userSchema: Schema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profilePicture: { type: String, default: ''},
    createdAt: { type: Date, default: Date.now }
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema)

export {User}