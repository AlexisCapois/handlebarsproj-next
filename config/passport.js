const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// const router = require('../routes/ideas');

// chargement du model
const User = mongoose.model("users");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // faire correspondre l'utilsateur
      User.findOne({ email: email }).then((user) => {
        if (!user) {
          return done(null, false, { message: "Utilisateur non trouvé" });
        }

        // faire correspondre le mot de passe
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Le mot de passe ne correspond !",
            });
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
