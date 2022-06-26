const express = require("express");
const { engine, create } = require("express-handlebars");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const passport = require("passport");

const Handlebars = require("handlebars");
const { expressHandlebars } = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

//chargement des routes
const ideas = require("./routes/ideas");
const users = require("./routes/users");

//charger le passport-local config
require("./config/passport")(passport);

const app = express();
const port = 3000;

// Connexion à la BD
/* utilisation d'un promise pour valider ou pas la connexion à la BD
  - si connexion effectué le then() est appelé 
  - sinon c'est le catch() qui sera appelé
*/
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/handlebarProjDB", {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// personnalisé mon handlebars
const hbs = create({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    ifeq: function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

// handlebars middleware
// app.engine('handlebars', engine({
//   handlebars: allowInsecurePrototypeAccess(Handlebars)
// }));
// app.set('view engine', 'handlebars');
// app.set('views', './views');

// app.engine('handlebars', ExpressHandlebars({
//     handlebars: allowInsecurePrototypeAccess(Handlebars)
// }));
// app.set('view engine', 'handlebars');

// express bodyParser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//methode override middleware
app.use(methodOverride("_method"));

// Express session and flash middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Variables globales
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Index route
app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("index", {
    title: title,
  });
});

//about route
app.get("/about", (req, res) => {
  res.render("about");
});

//Utilisation des routes
app.use("/ideas", ideas);
app.use("/users", users);

app.listen(port, () => {
  console.log(`Serveur sur le port ${port}`);
});
