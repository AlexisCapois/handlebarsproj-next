const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//chargement de mon model User
require('../models/Users');
const User = mongoose.model('users');
const passport = require('passport')

// ====================================================== //
// ================== User Login Route ================== //
// ====================================================== //

router.get('/login', (req,res)=>{
    res.render('users/login')
});
// ====================================================== //
// =============== //login formulaire post ============== //
// ====================================================== //

router.post('/login', (req,res, next)=>{
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

//Register formulaire post
// Register formulaire post 
router.post('/register', (req,res)=>{
    // pour tester
    // console.log(req.body)
    // res.send('register')
    let errors = [];

    if(req.body.password !=req.body.password2){
        errors.push({text: 'Le mot de passe n\'est pas identique'})
    }
    if(req.body.password.length < 4){
        errors.push({text : 'Le mot de passe doit contenir au moins à 4 caractères'})
    }

    if(errors.length > 0 ){
        res.render('users/register', {
                errors : errors,
                name : req.body.name,
                email : req.body.email,
                password : req.body.password,
                password2 : req.body.password2,
        })
    } else {
        User.findOne({email: req.body.email})
            .then(user =>{
                if(user){
                    req.flash('error_msg', 'Email existe déjà');
                    res.redirect('/users/register');
                }else{
                    const newUser = new User ({
                        name : req.body.name,
                        email : req.body.email,
                        password : req.body.password,
                    })
                    // console.log(newUser)
                    // res.send('enregistrement passé');
                    bcrypt.genSalt(10, (err, salt)=>{  // element qu'on veut hashé, le salt, collbak
                        bcrypt.hash(newUser.password, salt, (err, hash) =>{
                            if(err) throw err; // on jete l'erreur
                            newUser.password = hash; 
                            newUser.save() // sauvegarde le user dans la base
                                .then(user =>{
                                    req.flash('success_msg', 'Vous êtes a présent enregistré et vous pouvez vous connecter');
                                    res.redirect('/users/login')
                                })
                                .catch(err =>{
                                    console.log(err);
                                    return;
                                });
                        })
                    })
                }
            })
    }
})


//route du logout

router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg' , 'Vous êtes déconnecté');
    res.redirect('/users/login');
})


module.exports = router;