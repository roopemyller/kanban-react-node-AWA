import mongoose, {Document, Schema} from "mongoose"


interface IUser extends Document {
    name: string
    email: string
    password: string
}


let userSchema: Schema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema)

export {User}