module.exports = {
    ensureAuthenticated: function(req,res ,next){
        if(req.isAuthenticated()){
            return next()
        }
        req.flash('error_msg', 'Non autourisé');
        res.redirect('users/login')
    }
}