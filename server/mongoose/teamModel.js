import { Schema } from "mongoose";
import mongoose from "mongoose";


const teamSchema = new Schema({
    id: Number,
    name: String,
    year: String
})

let teamModel = mongoose.model("team", teamSchema);
export default teamModel;
