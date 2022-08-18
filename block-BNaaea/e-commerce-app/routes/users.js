var express = require("express");
var router = express.Router();
var Product = require("../models/products");
var User = require("../models/users");
var auth = require("../middlewares/auth");

// get register form of user
router.get("/new", (req, res, next) => {
    console.log(res.locals.user, req.session.usersId);
    return res.render("userRegisterForm", { error: req.flash("error")[0] });
});

// post the register form of user
router.post("/", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email is already registered!");
                return res.redirect("/users/new");
            }
            if (err.name === "ValidationError") {
                req.flash("error", "Password is Short, less than 5");
                return res.redirect("/users/new");
            }
            return res.json({ err });
        } else {
            console.log(user);
            return res.redirect("/users/login");
        }
    });
});

// get all users 
router.get("/allusers", (req, res, next) => {
    User.distinct("name", (err, allUsers) => {
        if (err) return next(err);
        return res.render("allUsers", { allUsers });
    });
});

// get admin register form 
router.get("/admin/new", (req, res, next) => {
    return res.render("adminRegister", { error: req.flash("error")[0] });
});

// get admin dashboard
router.get("/admin/dashboard", auth.checkUserOrAdminIsLoggedIn, (req, res, next) => {
    let userId = req.session.usersId;

    return res.render("adminDashboard");
});

// view all users on admin dashboard
router.get("/allusers", (req, res, next) => {
    User.find({}, (err, usersArr) => {
        if (err) return next(err);
        console.log(usersArr);
    })
});

// post the register form of admin
router.post("/admin", (req, res, next) => {
    req.body.isAdmin = true;
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email is already registered!");
                return res.redirect("/users/admin/new");
            }
            if (err.name === "ValidationError") {
                req.flash("error", "Password is Short, less than 5");
                return res.redirect("/users/admin/new");
            }
            return res.json({ err });
        } else {
            return res.redirect("/users/admin/login");
        }
    });
});

// get admin login form
router.get("/admin/login", (req, res, next) => {
    return res.render("adminLoginForm", { error: req.flash("error")[0] });
});

// post the admin login form
router.post("/admin/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect('/users/admin/login');
    }
    User.findOne({ email }, (err, users) => {
        if (err) {
            return next(err);
        }
        if (users.isAdmin) {
            if (!users) {
                req.flash("error", "Email is not registered");
                return res.redirect("/users/admin/login");
            }
            if (users) {
                users.verifyPassword(password, (err, result) => {
                    if (err) return next(err);
                    if (!result) {
                        req.flash("error", "Password is incorrect");
                        return res.redirect("/users/admin/login");
                    }
                    if (result) {
                        req.session.usersId = users.id;
                        console.log("Every execution is right");
                        return res.redirect("/products/new");
                    }
                })
            }
        } else {
            req.flash("error", "You are not registered as admin!!!!");
            return res.redirect("/users/admin/login");
        }
    });
});

// get login form of user
router.get("/login", (req, res, next) => {
    return res.render("userLoginForm", { error: req.flash("error")[0] });
});

// post login form user
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect('/users/login');
    }
    User.findOne({ email }, (err, users) => {
        if (err) {
            return next(err);
        }
        if (!users) {
            req.flash("error", "Email is not registered");
            return res.redirect("/users/login");
        }
        if (users) {
            users.verifyPassword(password, (err, result) => {
                if (err) return next(err);
                if (!result) {
                    req.flash("error", "Password is incorrect");
                    return res.redirect("/users/login");
                }
                if (result) {
                    req.session.usersId = users.id;
                    return res.redirect("/products");
                }
            })
        }
    });
});

// add to cart
router.get("/:productId/cart", auth.loggedInUser, (req, res, next) => {
    let productId = req.params.productId;
    User.findByIdAndUpdate(req.session.usersId, { $push: { cart: productId } }, (err, user) => {
        if (err) return next(err);
        return res.redirect("/products");
    });
});

// logout as user
router.get("/logout", (req, res, next) => {
    req.session.destroy();
    return res.redirect("/users/login");
});

// logout as admin
router.get("/admin/logout", (req, res, next) => {
    req.session.destroy();
    return res.redirect("/users/admin/login");
});

module.exports = router;