import mongoose from 'mongoose';

async function connectDB(){
try{
    mongoose.connect('mongodb://localhost:27017/storeprofile',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB`);
    }catch(error){
        console.err
        Error(`Error connecting to MongoDB:`, error);
    }
}

async function disconnectDB(){
    try{
        await mongoose.disconnect();
        console.log(`Disconnected from MongoDB`);
    }catch(error){
        console.error(`Error disconnecting from MongoDB:`, error);
    }
    }

const storeSchema = new mongoose.Schema({
    shopId:{type: Number, required: true, min:1, max:100},
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

const Store = mongoose.model('Store', storeSchema);


//create store information
async function createStore(){
    const store = new Store({
        shopId:3,
        region:"深水埗",
        shopName: "7-eleven(永富大樓地下)",
        address:"九龍深水埗北河街 48 號永富大廈地下 1 號舖",
        openingHour:"24小時",
        lat:22.3280526,
        lng:114.1582259,
        service:["7Cafe","7Wifi","Skyphoto"],
    });
    await store.save();
    console.log('Store :',store);
}

//delete store based on input
async function deleteOneStore(storeobj){
    let result = await Store.deleteOne(storeobj);
    console.log(result);
}

//delete multiple stores based on input
async function deleteManyStores(){
    let result = await Store.deleteMany({shopId: 1});
    console.log(result);
}

//find and delete based on objectId
async function findByIdAndDeleteStore(id){
    let result = await Store.findByIdAndDelete(id);
    console.log(result);
}

//find and update based on the paranethesis
async function updateOneStore(){
    let result = await Store.updateOne({shopId: 2}, {shopName: '7-eleven(永富大樓地下)-2',});
    console.log(result);
}

async function updateManyStores(){
    let result = await Store.updateMany({region: '深水埗'}, {region: '深水埗 -1'});
    console.log(result);
}

async function findByIdAndUpdateStore(shopId){
    let result = await Store.findByIdAndUpdate(shopId, {email:'updated.email@example.com'});
    console.log(result);
}

async function findOneAndUpdateStore(storeobj){
    let result = await Store.findOneAndUpdate(storeobj);
    console.log(result);
}

async function findAllStores(){
    const stores = await Store.find();
    console.log(stores);
    return stores;
}

async function findOneStore(storeobj){
    const store = await Store.find(storeobj);
    console.log(store);
    return store;
}


//search by entering ObjectId
async function findStoreById(id){
    const store = await Store.findById(id);
    console.log(store);
    return store;
}

async function findByKeyword(keyword){
    try{
        const results = await Store.find({
            $or:[
                {shopName:{$regex: keyword, $options: 'i'}},
                {address:{$regex:keyword, $options:'i'}}
            ]
        });
        console.log(results);
        return results;
    }catch(error){
        console.error(error);
    }
}


async function run(){
    //await createStore();  //DONE
    //await deleteOneStore({shopId: 1});   //DONE, delete by criteria in this paranthesis
    //await deleteManyStores(); //Done, criteria is in the code
    //await findByIdAndDeleteStore('6756a11980122b41dda05665'); //Done
    //await updateOneStore(); //Done, criteria is deinfed in code
    //await updateManyStores(); //Done, criteria and update are in the code
    //await findByIdAndUpdateStore('67569d40570bcbdaf599156b'); //DONE
    //await findOneAndUpdateStore({shopId: '2'},{shopName:'7-eleven(永富大樓地下)-暫停營業中2'});
    //await findAllStores(); //DONE
    //await findOneStore({shopName: "7-eleven(永富大樓地下)"}); //DONE
    //await findStoreById('6756a83af862750432b6a148'); //DONE
    await findByKeyword("永富大樓");// DONE
}

run().catch((error) =>console.error(error)).finally(()=>mongoose.connection.close());