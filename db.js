const mongoose = require('mongoose')
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL_LOCAL

mongoose.connect(mongoURL)

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log('Connected to MongoDB server')
})

db.on('disconnected', ()=>{
    console.log('MondoDB disconnected')
})

db.on('error', (err)=>{
    console.log('MondoDB connection mai error hai: ', err);
})

module.exports = db;