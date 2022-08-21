var express = require('express');
var router = express.Router();
var User = require("../model/Users");

/* GET users register form. */
router.get('/new', function(req, res, next) {
    // console.log(req.session.flash);
    return res.render('user_register_form', { error: req.flash("error")[0] });
});

// post users register data 
router.post("/", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email already taken!");
                return res.redirect("/users/new");
            }
            if (err.name === "ValidationError") {
                req.flash("error", "Password's length must be greater than 5");
                return res.redirect("/users/new");
            }
            return res.json({ err });
        } else {
            return res.redirect("/users/login");
        }
    });
});

// get users login form 
router.get("/login", (req, res, next) => {
    return res.render('user_login_form', { error: req.flash("error")[0] });
});

// post users login form
router.post("/login", (req, res, next) => {
    let { email, password, userType } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect("/users/login");
    };
    User.findOne({ email }, (err, user) => {
        if (err) return next(err);
        if (user.userType === userType) {
            if (user) {
                user.verifyPassword(password, (err, result) => {
                    if (err) return next(err);
                    if (result) {
                        console.log("logged in success");
                        req.session.userId = user.id;
                        return res.redirect("/podcasts/new");
                    }
                    req.flash("error", "Password is incorrect");
                    return res.redirect("/users/login");
                });
            }
        } else {
            req.flash("error", "You cannot access premium/VIP contents.");
            return res.redirect("/users/login");
        }
    });
});
// users logs in redirects to podcasts lists

// show admin register form
router.get("/register/admin", (req, res, next) => {
    return res.render("adminRegister", { error: req.flash("error")[0] });
});


// posts admin register form
router.post("/admin", (req, res, next) => {
    req.body.isAdmin = true;
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email already taken!");
                return res.redirect("/users/register/admin");
            }
            if (err.name === "ValidationError") {
                req.flash("error", "Password's length must be greater than 5");
                return res.redirect("/users/register/admin");
            }
            return res.json({ err });
        } else {
            return res.redirect("/users/login/admin");
        }
    });
});

// get admin login form
router.get("/login/admin", (req, res, next) => {
    return res.render("adminLogin", { error: req.flash("error")[0] });
});

// post login admin form 
router.post("/login/admin", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect("/users/login/admin");
    };
    User.findOne({ email }, (err, user) => {
        if (err) return next(err);
        if (user) {
            user.verifyPassword(password, (err, result) => {
                if (err) return next(err);
                if (result) {
                    console.log("logged in as admin successfully");
                    req.session.userId = user.id;
                    return res.redirect("/podcasts/new");
                }
                req.flash("error", "Password is incorrect");
                return res.redirect("/users/login/admin");
            });
        }

    });
})


// users logout
router.get("/logout", (req, res, next) => {
    req.session.destroy();
    return res.redirect("/users/login");
})


module.exports = router;