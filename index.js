require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const dns = require('dns');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect('mongodb+srv://lancelee92:29EWJkVvv6LsUa9t@cluster0.kzzhc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')

const shortenerSchema = new Schema({
  url:  String, // String is shorthand for {type: String}  
});

const shortenedUrl = mongoose.model('shortenedUrl', shortenerSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:id', (req, res) => {
  //console.log(req.params.id);
  shortenedUrl.findOne({ _id: req.params.id }, (err, doc) => {
    if(err)
      res.json({ error: err });

    //console.log(doc.url);
    res.redirect(doc.url);    
  });
});

app.get('/api/shorturl', function(req, res) {

  shortenedUrl.find().exec((err, doc) => {
    if(err)
      res.json({ greeting: 'hello API' });
    else
      res.json(doc);
  })
  
});

app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  if(req.body.url){

    const options = {
        all:true,
    };
  
    dns.lookup(req.body.url, options, (err, addresses) => {
      if(err){
        if(err.code == 'ENOTFOUND')
          return res.json({ error: 'invalid url' });
      }
      else {
        const newUrl = new shortenedUrl();
        newUrl.url = req.body.url;
    
        newUrl.save((err, doc) => {
          if(err)
            console.error(err);
    
          res.json({"original_url":req.body.url,"short_url":doc['_id']})
        });    
      }
      
    });
        
    
    
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
