const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//chargement de mon model User
require('../models/Users');
const User = mongoose.model('users');
const passport =require('passport')

// ====================================================== //
// ================== User Login Route ================== //
// ====================================================== //

router.get('/login', (req,res)=>{
    res.render('users/login')
});
// ====================================================== //
// =============== //login formulaire post ============== //
// ====================================================== //

router.get('/login', (req,res)=>{
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true,

    })(req, res, next);
})

//route register
router.get('/register', (req,res)=>{
    
    res.render('users/register');
})
// Register Post
// console.log(req.body);
// res.send('register')
// router.post('/register',( req,res)=>{

//     let errors = [];

//     if(req.body.password != req.body.password2) {
//         errors.push({text : 'le mot de passe doit être identique'})
//     }

//     if(req.body.password.length < 4) {
//         errors.push({text : 'le mot de passe doit comporter au moins 4 caractéres'})
//     }

//     if(errors.length > 0){
//         res.render('/users/register', {
//             errors: errors,
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password,
//             password2: req.body.password2
//         })
    
// })


//Register formulaire post
router.post('/register', (req, res)=>{
    let errors = [];

    if(req.body.password != req.body.password2 ){
        errors.push({text: 'Le mot de pass de passe doit être le même'})
    }

    if(req.body.password.length < 4){
        errors.push({ text: 'le mot de passe doit contenir au moins 4 caractères'})
    }

    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        })
    }else {
        User.findOne({email: req.body.email})
            .then(user=>{
                if(user){
                    req.flash('error_msg', 'Email existant');
                }else{

                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    })
                    // console.log(newUser);
                    // res.send('enregistrement passé');
                    bcrypt.genSalt(10, (err, salt)=>{
                        bcrypt.hash(newUser.password, salt, (err,hash)=>{
                            if (err) throw err; 
                                
                            newUser.password = hash;
                            newUser.save()
                                .then(user =>{ 
                                    req.flash('success_msg', 'Vous êtes à present enregistré');
                                    res.redirect('/users/login');
                                })
                                .catch(err =>{
                                    console.log(err);
                                    return;
                                });
                        } )
                    })
                }
            })
    }
    
})


module.exports = router;