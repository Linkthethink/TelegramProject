import {mongoose} from "mongoose"

const questionSchema = new mongoose.Schema({
    questionId:{type: String,required:true},
    question:{type: String, required:true},
    reply:{type: String, required:true}
});

const Question = mongoose.model('Question',questionSchema);

export {Question}