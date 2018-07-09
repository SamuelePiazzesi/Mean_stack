const path =  require('path');
const express = require ('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


//CREATE APP
const app = express();

//DB

mongoose.connect('mongodb+srv://SamuelePiazzesi:1DIlsyNwpXMefe5t@cluster0-mafat.mongodb.net/mean-stack-app?')
.then(()=>{
  console.log('connected to db');
}).catch(()=>{
  console.log('connection failed');
})

// ROUTES

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');



app.use(bodyParser.json());
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS, PUT');
  next();
})

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);




module.exports = app;
