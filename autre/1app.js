const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');

const Handlebars = require('handlebars');
//const {expressHandlebars} = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
var methodOverride = require('method-override')


const app = express();
const port = 5000;

// Connexion à la BD
/* utilisation d'un promise pour valider ou pas la connexion à la BD
  - si connexion effectué le then() est appelé 
  - sinon c'est le catch() qui sera appelé
*/
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/handlebarProjDB',{
    useNewUrlParser: true
})
.then(()=> console.log('MongoDB Connected...'))
.catch(err => console.log(err));

//chargement de mon model idea
require('../models/Ideas');
const Idea = mongoose.model('ideas')

// handlebars middleware
  app.engine('handlebars', engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)  
  }));
  app.set('view engine', 'handlebars');
  app.set('views', './views'); 
  

// app.engine('handlebars', expressHandlebars({
//     handlebars: allowInsecurePrototypeAccess(Handlebars)
// }));
// app.set('view engine', 'handlebars');

// middleware
app.use(methodOverride('_method'))


// express bodyParser middleware
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Index route
app.get('/', (req, res)=>{
    const title = 'Welcome';
    res.render('index', {
        title: title 
    })
});

//about route
app.get('/about', (req, res)=>{
    res.render('about')
})

// ideas/add route du formulaire
app.get('/ideas/add', (req, res)=>{
    res.render('ideas/add')
});

//edit modifier une donnée
app.get('/ideas/edit/:id', (req,res)=>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea=> {
        res.render('ideas/edit'), {
            idea: idea
        }
    })
})
//Idea index Page
// récupérer les données et les affichées 'ideas/index'
app.get('/ideas', (req, res)=> {
    Idea.find({})
          .sort({date: 'desc'})
          .then(ideas =>{
             res.render('ideas/index', {
               ideas: ideas  
             })
          })
})

//traitement de formulaire
app.post('/ideas', (req, res)=>{
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
            details: req.body.details
        }

        new Idea(newUser)
             .save()
             .then(idea => {
                 res.redirect('/ideas')
             })
    }
})


// traitement du formuler put
app.put('/ideas/:id', (req, res)=>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        idea.title = req.body.title;
        idea.details = req.body.details;
        idea.save()
            .then(idea => {
                res.redirect('/ideas')
            })
    })
})

app.listen(port, ()=>{
    console.log(`Serveur sur le port ${port}`)
})