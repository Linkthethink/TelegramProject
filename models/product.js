import {mongoose} from "mongoose"

const productSchema=new mongoose.Schema({
    productId:{type:String,required:true},
    cate:{type:String,required:true},
    productName:{type:String,required:true},
    price:{type:Number, min:0,required:true},
    description:{type:String,required:true},
    inventory:{type:Number, min:0,required:true},
    manufacturer:{type:String,required:true},
    availableShop:String,
});

const Product=mongoose.model('Product',productSchema);

export {Product}