'use strict';

const fs = require('fs');
const express = require('express');
const validUrl = require('valid-url');
const rand = require('random-key');
const app = express();
const baseURL = 'https://ja-urlshortener-ms.glitch.me/';


//use mongodb on mlab
const mongodb = require('mongodb');
const MONGODB_URI = process.env.MONGOLAB_URI;
const MongoClient = mongodb.MongoClient;

const COLLECTION="urlmap";
let record = {
  _id: null,
  longurl: null,
  shorturl: null
}

//is the URL valid
function isValidUrl(uri) {
  //regex101.com explains this regex http:// https:// optional, leading www optional
  const expression = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)/g;
  return uri.match(expression);
}

function getShortCode() {
  //create a random 4 char code
  return rand.generate(4);
}

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		    res.sendFile(process.cwd() + '/views/index.html');
    });

//Respond to new URL passed in
app.use('/new/*', (req,res) => {
   //test for valid url
  let longurl = req.params[0];
  
  if (isValidUrl(longurl)) {
    // Use connect method to connect to the Server
    MongoClient.connect(MONGODB_URI, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        throw err;
      } else {
        //check if original URL is in db
        let mydb = db.collection(COLLECTION);
        mydb.find({
          longurl: longurl
        }).toArray(function(err, doc) {
          if (err) throw err;
            //longurl not found
            if (doc.length === 0) {
              //check it longurl has http(s):// prefix
              if (longurl.indexOf("http") < 0) {
                record.longurl = "http://"+longurl;
              } else {
                record.longurl = longurl;  
              }
              record._id = getShortCode();
              //create a short code
              record.shorturl = baseURL.concat(record._id);
              //insert a new record 
              mydb.insert(record, function(err, data) {
                if (err) throw err
              });
              //Close connection
              db.close(); 
            } else {
              //longurl found
              record.longurl = doc[0].longurl;
              record.shorturl = doc[0].shorturl;
              //Close connection
              db.close(); 
            }      
            res.json({
              "original url" : record.longurl,
              "short_url": record.shorturl
            });       
        });    
      }  
    });
  } else {
    //invalid case
    res.json({"Error": "Invalid URL"});
  }
});

app.get('/:id', function (req,res) {
  let id = req.params.id;
  // Use connect method to connect to the Server
  MongoClient.connect(MONGODB_URI, function (err, db) {
    let mydb = db.collection(COLLECTION);
    mydb.find({
          _id: id
    }).toArray(function(err, doc) {
      if (err) throw err;
      //id not found
      if (doc.length === 0) {
        res.json({
          "error" : "No short url found for given input"
        })
        db.close();  
      } else {
        let redirect = doc[0].longurl;
        res.redirect(redirect);
        db.close();
      }
    });
  });
}); 

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

