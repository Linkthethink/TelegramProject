import {mongoose} from "mongoose"

const shopSchema = new mongoose.Schema({
    shopId:{type: String,required:true},
    region:{type: String, required: true},
    shopName: {type: String, required: true},
    address:{type: String, required: true},
    openingHour:{type: String, required: true},
    lat:{type: Number, required: true, min:0, max:1000},
    lng:{type: Number, required: true, min:0, max:1000},
    service: {type: [String], 
        validate: {
          validator: function(v) {
            return v.length <= 6;
          },
          message: props => `${props.value} `
        },
      },
});

const Shop = mongoose.model('Shop',shopSchema);

export {Shop}