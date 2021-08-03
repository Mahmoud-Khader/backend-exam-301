'use strict'

const express=require('express');
const cors=require('cors');
const app=express();
const mongoose=require('mongoose');
const { createBrotliCompress } = require('zlib');
const axios=require('axios');

require('dotenv').config();
app.use(cors());
app.use(express.json());

const PORT=process.env.PORT;

mongoose.connect(process.env.MONGODB,{ useNewUrlParser: true, useUnifiedTopology: true });

app.get('/',(req,res)=>{
    res.send('Hello Razan');
})

app.listen(PORT,()=>{
    console.log(`${PORT}  listen working fine`);
})


//https://ltuc-asac-api.herokuapp.com/allColorData

app.get('/api',getApiData);
app.get('/fav',getFavData);
app.post('/fav',createFav);
app.delete('/fav/:id',deleteData);
app.put('/fav/:id',updateData);

// get all data from api

async function getApiData(req,res) {
    const url='https://ltuc-asac-api.herokuapp.com/allColorData';
    const apiData=await axios.get(url);
    const apiMap=apiData.data.map(item=>{
        return new Colors(item);
    })
    res.send(apiMap);
}

class Colors{
    constructor(data){
        this.title=data.title;
        this.imageUrl=data.imageUrl;
    }
}

// schemas 

const favSchema = new mongoose.Schema({
    title: String,
    imageUrl:String,
  });

const myUserSchema = new mongoose.Schema({
    email: String,
    data:[],
  });


const favModel = mongoose.model('user', myUserSchema);


// seeding 

function seedData() {
    let mahmoud= new favModel({
        email:'mahmoudkhader2010@gmail.com',
        // email:'quraanrazan282@gmail.com',
        data:[
            {
                "title": "Black",
                "imageUrl": "http://www.colourlovers.com/img/000000/100/100/Black.png"
              },
              {
                "title": "dutch teal",
                "imageUrl": "http://www.colourlovers.com/img/1693A5/100/100/dutch_teal.png"
              }
        ]
    })
    mahmoud.save();
    
}

//seedData();



function getFavData(req,res) {
    // let obj=seedData();
    // res.send(obj);
    let email=req.query.email;

    favModel.findOne({email:email},(error,user)=>{
        if (error) {
            res.send(error);
        } else if(user===null) {
            user= new favModel({
                email:req.body.email,
                data:[]
            })
            
        }
        res.send(user.data);
    })
    
}

// Add Function



function createFav(req,res) {

    const{email,title,imageUrl}=req.body;

    favModel.findOne({email:email},(error,user)=>{
        if (error) {
            res.send(error);
        } else if(user===null) {
            user= new favModel({
                email:req.body.email,
                data:[]
            })
            
        }
        const newFav={
            title:title,
            imageUrl:imageUrl
        }
        user.data.push(newFav);
        user.save();
        res.send(user.data);
    })
    
}


//Delete Function 



function deleteData(req,res) {
    const id=req.params.id;
    const email=req.query.email;
    favModel.findOne({email:email},(error,user)=>{
        user.data.splice(id,1);
        user.save();
        res.send(user.data);
    })
    
}


// Update Function 



function updateData(req,res) {
    const id=req.params.id;
    const {email,title,imageUrl}=req.body;

    favModel.findOne({email:email},(error,user)=>{
        if (error) {
            res.send(error);
            
        }
        const newFav={
            title:title,
            imageUrl:imageUrl
        }
        user.data.splice(id,1,newFav);
        user.save();
        res.send(user.data);
    })
    
}