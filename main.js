import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getJSON} from "./data.js";
import mongoose from "mongoose"
import {Question} from "./models/question.js"
import {Shop} from "./models/shop.js"
import {Product} from "./models/product.js";
mongoose.connect('mongodb://localhost:27017/database',{
//useNewUrlParser:true,
//useUnifiedTopology: true,
});


const app = express();
app.use(express.json());

const users = [{
    "id": "1", "username": "staff", "password":
        "$2b$10$mim5bK.8vWt.9bau06G6LuTIAb27NjmhlWXrocdyzXMs00chVq3Vi"
}]

const authenticate = (req, res, next) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.user = { "id": user.id, "username": user.username };
        next();
    } else {
        res.status(401).json({ "message": "Invalid credentials" });
        console.log(`${username}, ${password}`);
    }
};

const authorize = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader === undefined || authHeader === null) {
            return res.sendStatus(401);
        }
        const token = authHeader.split(" ")[1];
        if (token == null) return res.sendStatus(401);
        jwt.verify(token, "secret_key", (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } catch (err) {
        console.log(err);
    }
};

app.post("/login", authenticate, (req, res) => {
    const token = jwt.sign(req.user, "secret_key", { "expiresIn": "1h" });
    res.json({ token });
})

//getproducts API
app.get("/getproducts",async(req,res)=>{
    try{
        const products=await Product.find();
        res.send(products);
    } catch (err){
        console.log("Error catched: Loading products is fail.");
        console.log(err);
    }
});


//addproduct API
app.post("/addproduct",async(req,res)=>{
    try{
        const product=new Product(req.body);
        await product.save();
        res.status(201).send(product);
    } catch (err){
        res.status(400).json({"err":"Error catched: Add product fail."});
        console.log("Error catched: Add product fail.");
        console.log(err);
    }
});

//editproduct API
app.put("/editproduct/:productId", async (req, res) => {
    try {
           const product = await Product.findOneAndUpdate(
            { productId: req.params.productId },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!product) {
            return res.status(404).send();
        }
        res.send(product);
    } catch (err) {
        res.status(400).json({ "Error": "Error catched: Edit product fail." });
        console.log("Error catched: Edit product fail.");
        console.log(err);
    }
});

//deleteproduct API
app.delete("/delproduct/:productId",async(req,res)=>{
    try{
        const product=await Product.findOneAndDelete({productId:req.params.productId});
        if(!product){
            return res.status(404).send();
        }
        res.send(product);
    } catch(err){
        console.log("Error catched: Delete product fail.");
        console.log(err);
    }
});

//searchproducts API
app.get("/searchproducts/:keyword",async(req,res)=>{
    try{
        const keyword=req.params.keyword;
        const products=await Product.find({
            productName:{$regex:keyword,$options:'i'}  // case-insensitive
        });
        res.send(products);
    } catch (err){
        console.log("Error catched: Search product is fail.");
        console.log(err);
    }
});

//searchproductswithprice API
app.get("/searchproductswithprice/:keywordPrice",async(req,res)=>{
    try{
        const inputData=req.params.keywordPrice;
        let keyword =inputData.split('&')[0];
        let pricelimit=parseInt(inputData.split('$')[1]);
        const products=await Product.find({
            $and:[
                {productName:{$regex:keyword,$options:'i'}},  // case-insensitive
                {price:{$lte: pricelimit}}
            ]
        });
        res.send(products);
    } catch (err){
        console.log("Error catched: Search product is fail.");
        console.log(err);
    }
});

app.post('/addquestion',async(req,res)=>{
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

app.get('/searchquestion/:keyword',async(req,res)=>{
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

app.put('/editquestion/:questionId', authorize,async (req, res)=>{
    try{
      const questions = await Question.findOneAndUpdate({questionId:req.params.questionId}, req.body,{
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

    app.delete('/delquestion/:questionId', authorize,async(req,res)=>{
        try{
            const questions = await Question.findOneAndDelete({questionId:req.params.questionId});
            if(!questions){
                return res.status(404).send();
            }
            res.send(questions);
        }catch(error){
        res.status(500).send(error);
    }
    });

    app.post('/addshop', authorize,async(req,res)=>{
        try{
            const questions = new Shop(req.body);
            await questions.save();
            res.status(201).send(questions);
        }catch(error){
            res.status(400).send(error);
        }
    });
    
    app.get('/getshop',async (req, res)=>{
        try{
            const shops = await Shop.find();
            res.send(shops);
        }catch(error){
            res.status(500).send(error);
        }
    });
    
    app.get('/getshop/:shopId', async(req,res)=>{
        try{
            const shops = await Shop.findOne({shopId: req.params.shopId});
            if(!shops){
                return res.status(404).send();
            }
            res.send(shops);
        }catch(error){
            res.status(500).send(error);
        }
    });
    
    app.put('/editshop/:shopId', authorize,async (req, res)=>{
        try{
          const shops = await Shop.findOneAndUpdate({shopId:req.params.shopId}, req.body,{
            new:true,
            runValidators: true,
          });
          if(!shops){
            return res.status(404).send();
          }
          res.send(shops);
        }catch(error){
            res.status(400).send(error);
        }
        });
    
        app.delete('/delshop/:shopId',authorize,async(req,res)=>{
            try{
                const shops = await Shop.findOneAndDelete({shopId:req.params.shopId});
                if(!shops){
                    return res.status(404).send();
                }
                res.send(shops);
            }catch(error){
            res.status(500).send(error);
        }
        });

        function haversineDistance(coords1, coords2, isMiles = false) {
            const toRad = (x) => x * Math.PI / 180;
        
            const lat1 = coords1.latitude;
            const lon1 = coords1.longitude;
        
            const lat2 = coords2.latitude;
            const lon2 = coords2.longitude;
        
            const R = 6371;  // radius of the earth (unit: kilometer)
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let distance = R * c;
        
            if (isMiles) {
                distance /= 1.60934;  // change kilometer to mile
            }
        
            return distance;
        }

        app.get("/findshop/:latitude/:longitude", async (req, res) => {
        try {
        const content = await getJSON("http://localhost:3000/getshop");
        let result ;
        if (Array.isArray(content.data)) {
            for (let i = 0; i < content.data.length; i++) {
                let coords1 = { latitude: content.data[i].lat, longitude: content.data[i].lng };
                console.log(coords1);
                let coords2 = { latitude: parseFloat(req.params.latitude), longitude: parseFloat(req.params.longitude) };
                console.log(coords2);
                 result = await content.data.filter(item => {
                    const coords1 = { latitude: item.lat, longitude: item.lng };
                    return haversineDistance(coords1, coords2) <= 2; // filter within 2 km
                });
            }
            res.json(result);
        }
    } catch (err) {
        console.error("Error caught: Get shops failed.", err);
        res.status(500).send("Internal Server Error");
    }
});

function printout(shops) {
    if (shops.length === 0) {
        return "No shops found within the specified distance.";
    }

    return shops.map(item => {
        return `
                Shop Name: ${item.shopName}
                Shop ID: ${item.shopId}
                Region: ${item.region}
                Address: ${item.address}
                Opening Hours: ${item.openingHour}
                Coordinates: ${item.lat}, ${item.lng}
                Additional Services: ${item.service}
            `.trim();
    }).join("\n\n");
}
    
    const PORT = 3000;
    app.listen(PORT, ()=>{
        console.log(`Server is running at port ${PORT}`);
    })


