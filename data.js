import{promises as fs} from 'fs';
import axios from "axios";

async function getJSON(url){
    return await axios.get(url);
}

export{getJSON}