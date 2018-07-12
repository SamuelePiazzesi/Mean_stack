const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');



exports.createUser = (req, res, next) =>{
  bcrypt.hash(req.body.authData.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.authData.email,
        password: hash,
        username: req.body.username
      });
      user.save()
        .then(result => {
          res.status(200).json({
            message: 'sono la risposta 201 di router post signup',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({

              message: 'mi dispiace ma l\'email o lo username selezionato sono già utilizzat!'

          });
        });
    });
};

exports.loginUser = (req, res, next) => {
  let foundUser;
  User.findOne({email: req.body.email})
    .then(user => {
      if (!user)  {
        return res.status(401).json({message: 'Auth failed'});
      }
      foundUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {

      if (!result) {
        return res.status(401).json({message: 'Auth failed'});
      }
      const token = jwt.sign({email:foundUser.email, userId: foundUser._id}, 'secret_should_be_longer', {expiresIn: '1h'});
      res.status(200).json({message: 'auth success', token, expiresIn: 3600, userId: foundUser._id, username: foundUser.username});
    })
    .catch(err => {
      console.log(err);
      return res.status(401).json({message: 'Email/Password errati'});
    })
};

