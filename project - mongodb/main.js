import express from "express";
import mongoose from "mongoose"
import {Question} from "./models/question.js"
mongoose.connect('mongodb://localhost:27017/questions',{
useNewUrlParser:true,
useUnifiedTopology: true,
});

const app = express();
app.use(express.json());

app.post('/question',async(req,res)=>{
    try{
        const questions = new Question(req.body);
        await questions.save();
        res.status(201).send(questions);
    }catch(error){
        res.status(400).send(error);
    }
});

app.get('/question',async (req, res)=>{
    try{
        const questions = await Question.find();
        res.send(questions);
    }catch(error){
        res.status(500).send(error);
    }
});

app.get('/question/:id', async(req,res)=>{
    try{
        const questions = await Question.findById(req.params.id);
        if(!questions){
            return res.status(404).send();
        }
        res.send(questions);
    }catch(error){
        res.status(500).send(error);
    }
});

app.get('/question/search/:keyword',async(req,res)=>{
    try{
        const keyword = await req.params.keyword;
        const questions = await Question.find({
            $or:[
                {question: {$regex: keyword, $options:'i'}},
            ]
        });
        res.send(questions);
    }catch(error){
        res.status(500).send(error);
    }
});

app.put('/question/:id', async (req, res)=>{
    try{
      const questions = await Question.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators: true,
      });
      if(!questions){
        return res.status(404).send();
      }
      res.send(questions);
    }catch(error){
        res.status(400).send(error);
    }
    });

    app.delete('/question/:id',async(req,res)=>{
        try{
            const questions = await Question.findByIdAndDelete(req.params.id);
            if(!questions){
                return res.status(404).send();
            }
            res.send(questions);
        }catch(error){
        res.status(500).send(error);
    }
    });

    const PORT = 3000;
    app.listen(PORT, ()=>{
        console.log(`Server is running at port ${PORT}`);
    })


