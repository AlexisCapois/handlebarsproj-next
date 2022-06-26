const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth')

//chargement de mon model idea
require('../models/Ideas');
const Idea = mongoose.model('ideas')

// ideas/add route du formulaire
router.get('/add', ensureAuthenticated, (req, res)=>{
    res.render('ideas/add')
});

//Idea index Page
// récupérer les données et les affichées 'ideas/index'
router.get('/', ensureAuthenticated, (req, res)=> {
    Idea.find({user: req.user.id})
          .sort({date: 'desc'})
          .then(ideas =>{
             res.render('ideas/index', {
               ideas: ideas  
             })
          })
});

// accès à tous les ideas
router.get('/allideas', ensureAuthenticated, (req, res)=> {
    Idea.find({})
          .sort({date: 'desc'})
          .then(ideas =>{
             res.render('ideas/allideas', {
               ideas: ideas,
               user : req.user  
             })
          })
});

// Modifier une donnée existante, Edit Page
router.get('/edit/:id', ensureAuthenticated, (req, res)=> {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        if(idea.user != req.user.id){
          req.flash('error_msg', 'Non Autorisé');
          res.redirect('/ideas');
        }else{
            res.render('ideas/edit', {
                idea: idea
            })
        }
    })
}) 

//traitement de formulaire
router.post('/', ensureAuthenticated, (req, res)=>{
    // console.log(req.body)
    // res.send('validé');

    // Validations des infos à partir du serveur
    let errors = [];

    if(!req.body.title){
        errors.push({text: 'Please add a title'})
    }
    if(!req.body.details){
        errors.push({text: 'Please add some details'})
    }

    if(errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        })
    }else{
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }

        new Idea(newUser)
             .save()
             .then(idea => {
                 req.flash('success_msg', 'Idée de cours ajoutée avec succès')
                 res.redirect('/ideas')
             })
    }
});

// traitment du formulaire d'edit
router.put('/:id', ensureAuthenticated, (req, res)=>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        idea.title = req.body.title;
        idea.details = req.body.details;
        
        idea.save()
            .then(idea => {
                req.flash('success_msg', 'Mise à jour effectuée avec succès')
                res.redirect('/ideas')
            })
        
    })
});

//Suppression de la donnée
router.delete('/:id', ensureAuthenticated, (req, res)=> {
    Idea.remove({ _id: req.params.id})
        .then(()=>{
            // pour le message d'info
            req.flash('success_msg', 'Idée de cours supprimée');
            res.redirect('/ideas');
        })
});

module.exports = router;