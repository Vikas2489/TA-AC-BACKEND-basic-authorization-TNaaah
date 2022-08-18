var User = require("../models/users");
module.exports = {
    loggedInUser: (req, res, next) => {
        if (req.session && req.session.usersId) {
            return next();
        } else {
            return res.redirect("/users/login");
        }
    },
    userInfo: (req, res, next) => {
        let userId = req.session && req.session.usersId;
        if (userId) {
            User.findById(userId, "name email isAdmin", (err, user) => {
                if (err) return next(err);
                req.user = user;
                res.locals.user = user;
                return next();
            })
        } else {
            req.user = null;
            res.locals.user = null;
            return next();
        }
    },
    checkUserOrAdminIsLoggedIn: (req, res, next) => {
        let userId = req.session && req.session.usersId;
        if (userId) {
            User.findById(userId, (err, user) => {
                if (err) return next(err);
                if (user.isAdmin) {
                    return next();
                } else {
                    return res.redirect("/users/admin/login");
                }
            })
        } else {
            return res.redirect("/users/admin/login");
        }

    }
};