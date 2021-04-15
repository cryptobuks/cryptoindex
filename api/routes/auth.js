var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = config.get('mongoURI');

const client = new MongoClient(db, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
 
    const db = client.db();
    const collection = db.collection('users');

    // POST:Authenticate a user
router.post('/', function(req, res, next) {  

    let email = req.body.email;
    let password = req.body.password;

    var query = { email };
    // var projection = { 'name':1, 'email':1 };
  
    collection.findOne(query) 
      .then(result=> {
       if(result === null){
         res.status(400).json({msg:"EmailID not found."});
       }else{
       let auth = bcrypt.compareSync(password, result.password);
       if(auth === true){
        jwt.sign({
          name:result.name
        },
         config.get('jwtSecret'),
          { expiresIn: 60 * 60 },
          (err,token) => {
            if(err) throw err;
            res.status(200).json({
              token,
              msg:'Login Successful.'
            });
          });
       }else{
         res.status(400).json({msg:"Login Failed."})
       }
      }
       
        
      }); 
  });

})

module.exports = router;