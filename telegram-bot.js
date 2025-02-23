import TelegramBot from 'node-telegram-bot-api';
import {getJSON} from "./data.js";

console.log("Telegram Bot Server start...");
let token = "7166287953:AAEvZ7iODA3qC6crvvKAB8jzkpL3xpBy9O0";
let bot=new TelegramBot(token,{polling:true});

//Haversine formular - calculate the distance between two points
function haversineDistance(coords1,coords2,isMiles=false){
    const toRad=(x)=>x*Math.PI/180;

    const lat1=coords1.latitude;
    const lon1=coords1.longitude;

    const lat2=coords2.latitude;
    const lon2=coords2.longitude;

    const R=6371;  // radius of the earth (unit: kilometer)
    const dLat=toRad(lat2-lat1);
    const dLon=toRad(lon2-lon1);
    const a=Math.sin(dLat/2)*Math.sin(dLat/2)+
        Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*
        Math.sin(dLon/2)*Math.sin(dLon/2);
    const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    let distance=R*c;

    if(isMiles){
        distance/=1.60934;  // change kilometer to mile
    }

    return distance;
}

function printout(store,bot,fromId,resp){
    store.forEach(async (item)=>{
        resp += `${item.shopName}\n`;
        resp += `分店編號: ${item.shopId}\n`;
        resp += `地區: ${item.region}\n`;
        resp += `地址: ${item.address}\n`;
        resp += `營業時間: ${item.openingHour}\n`;
        resp += `坐標: ${item.lat}, ${item.lng}\n`;
        resp += `附加服務: ${item.service}`;
        console.log(resp);
        bot.sendMessage(fromId, resp);
        resp = "";
    });
}

function questionbank(questionlist,bot,fromId,resp){
    questionlist.forEach(async (speech)=>{
        resp += `問題:${speech.question}\n\n`;
        resp += `回覆: ${speech.reply}`;
        console.log(resp);
        bot.sendMessage(fromId, resp);
        resp = "";
    });
}

function printoutProduct(product, bot, fromId, resp){
    product.forEach((item)=>{
        resp += `${item.productName}\n`;
        resp += `產品編號: ${item.productId}\n`;
        resp += `類別: ${item.cate}\n`;
        resp += `價格: ${item.price}\n`;
        resp += `產品詳情: ${item.description}\n`;
        resp += `品牌: ${item.manufacturer}\n`;
        resp += `有庫存分店: ${item.availableShop}\n`;
        resp += `庫存: ${item.inventory}`;
        console.log(resp);
        bot.sendMessage(fromId, resp);
        resp = "";
    });
}


bot.onText(/\/start/,function(msg){
    let chatId=msg.chat.id;
    let resp="歡迎使用7-Eleven Telegram 聊天機器人，以下是基礎使用指令：\n/search 產品關鍵字 --獲取產品的資訊\n/search 產品關鍵字&$XX --篩選產品關鍵字及價格以下範圍，獲取相應產品資訊\n📍分享閣下的Telegram GPS位置，以搜索2公里以內的分店\n/question 問題關鍵字 --去搜查相關常見問題";
    bot.sendMessage(chatId, resp);
});

bot.onText(/\/question(.+)/,async function(msg,match){
    try{
        let fromId=msg.from.id;
        let resp="";
        let input=match[1].replace(" ","");
        let questionJSON = await getJSON("http://localhost:3000/question/");
        let answer=questionJSON.data.filter((questionlist)=>{
            return questionlist.question.replace(" ","").indexOf(input)!=-1;
        });
        if(answer.length>0){
        questionbank(answer,bot,fromId,resp);
        }else{
            bot.sendMessage(fromId,"不好意思，系統沒有相關的建議問題，請重新輸入。");    
        }
    }catch(err){
        console.log(err);
    }
});

bot.on('location',async(msg)=>{
    try{
        let fromId=msg.from.id;
        let resp="";
        const coords1={latitude:msg.location.latitude,longitude:msg.location.longitude};
        let coords2={latitude:34.0522,longitude:-118.2437};
        let storeJSON=await getJSON("http://localhost:3000/getshop");
        let result=storeJSON.data.filter((store)=>{
            coords2={latitude:store.lat,longitude:store.lng};
            console.log(haversineDistance(coords1,coords2));
            return haversineDistance(coords1,coords2)<=2;
        });
        if(result.length>0){

            printout(result,bot,fromId,resp);
        }else{
            bot.sendMessage(fromId,"系統無法找尋附近的分店。");
        }
    }catch(err){
        console.log(err);
    }
});

bot.onText(/\/getStores/,async function(msg){
    let fromId=msg.from.id;
    let resp="";
    try {
        let storeJSON=await getJSON("http://localhost:3000/store");
        printout(storeJSON.data,bot,fromId,resp);
    } catch(err){
        console.log(err);
    }
});

bot.onText(/\/search (.+)/, async function(msg, match){
    try{
        let fromId = msg.from.id;
        let resp = "";
        let input = match[1];
        let keyword =input.split('&')[0];
        // let keyword =input.match(/([^&]+)/)[0];
        let pricelimit =9999999999;
        if (input.includes('$')){pricelimit=parseInt(input.split('$')[1]);}
        // if (input.includes('$')){pricelimit=parseInt(input.match(/(?:\$)(\d+)/)[1]);}
        let getProducts=await getJSON("http://localhost:3000/getproducts");
        let result = getProducts.data.filter((product)=>{
            return (product.productName.indexOf(keyword)!=-1 && product.price<=pricelimit) ||
            product.productName.indexOf(input)!=-1;
        // let result = getProducts.data.filter((product)=>{
        //     return (product.productName.includes(keyword) && product.price<=pricelimit) ||
        //     product.productName.includes(input);
     });
     if(result.length>0){
     console.log(result);
     printoutProduct(result, bot, fromId, resp);
    }else{
        bot.sendMessage(fromId,"系統無法找尋相關的產品。");
    }
    }catch (err){
        console.log(err);
    }
});
