var User = require("../model/Users");
module.exports = {
    isUserLoggedInOrNot: (req, res, next) => {
        if (req.session && req.session.userId) {
            return next();
        } else {
            return res.redirect("/users/login");
        }
    },
    userInfo: (req, res, next) => {
        let userId = req.session.userId;
        if (userId) {
            User.findById(userId, (err, user) => {
                if (err) return next(err);
                res.locals.user = user;
                req.user = user;
                return next();
            });
        } else {
            req.user = null;
            res.locals.user = null;
            return next();
        }
    }
}