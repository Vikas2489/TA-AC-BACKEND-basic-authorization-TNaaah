var express = require("express");
var router = express.Router();
var Product = require("../models/products");
var fs = require("fs");
var path = require("path");
var auth = require("../middlewares/auth");
var absolutePathOfUploads = path.join(__dirname, "../", "/public/uploads/");

// multer
var multer = require("multer");

var uploadsPath = path.join(__dirname, "../", "/public/uploads/");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });


// get all the products by all admins
router.get("/", auth.loggedInUser, (req, res, next) => {
    Product.find({}).populate('userId').exec((err, productsArr) => {
        if (err) return next(err);
        return res.render("allProducts", { productsArr, userId: req.session.usersId });
    });
});

// like a product by user
router.get("/:productId/like", auth.loggedInUser, (req, res, next) => {
    let productId = req.params.productId;
    Product.findByIdAndUpdate(productId, { $inc: { likes: 1 } }, (err, product) => {
        if (err) return next(err);
        return res.redirect("/products");
    });
});

// unlike a product by user
router.get("/:productId/unlike", auth.loggedInUser, (req, res, next) => {
    let productId = req.params.productId;
    Product.findByIdAndUpdate(productId, { $inc: { likes: -1 } }, (err, product) => {
        if (err) return next(err);
        return res.redirect("/products");
    });
});


// get all categories page
router.get("/allcategories", (req, res, next) => {
    Product.distinct("category", (err, category) => {
        if (err) return next(err);
        return res.render("allcategories", { category });
    });
});

// get products based on category
router.get("/category", (req, res, next) => {
    let query = req.query;
    Product.find(query, (err, products) => {
        if (err) return next(err);
        res.render("categoriesBasedProducts", { products });
    })
})

router.use(auth.checkUserOrAdminIsLoggedIn);

// new product form
router.get("/new", (req, res, next) => {
    return res.render("productForm");
});



// post product form
router.post("/", upload.single('image'), (req, res, next) => {
    req.body.userId = req.session.usersId;
    req.body.image = req.file.filename;
    req.body.category = req.body.category.split(" ");
    Product.create(req.body, (err, product) => {
        if (err) return next(err);
        return res.redirect("/products/" + `${req.session.usersId}`);
    });
});


// post updated form
router.post("/:productId", upload.single('image'), (req, res, next) => {
    let productId = req.params.productId;
    if (req.file) {
        req.body.image = req.file.filename;
        req.body.category = req.body.category.split(" ");
        Product.findById(productId).exec((err, product) => {
            if (err) return next(err);
            return fs.unlink(path.join(__dirname, "../", "/public/uploads/", product.image), (err) => {
                return console.log(err);
            });
        });
        Product.findByIdAndUpdate(productId, req.body, (err, product) => {
            if (err) return next(err);
            return res.redirect("/products/" + `${req.session.usersId}`);
        });
    } else {
        req.body.category = req.body.category.split(" ");
        Product.findByIdAndUpdate(productId, req.body, (err, product) => {
            if (err) return next(err);
            return res.redirect("/products/" + `${req.session.usersId}`);
        });
    }


});

// show products created by specific admin
router.get("/:userId", (req, res, next) => {
    let userId = req.params.userId;
    Product.find({ userId: userId }, (err, products) => {
        if (err) return next(err);
        return res.render("productsBySpecificAdmin", { products })
    })
})

// Edit the product prefilled form
router.get("/:productId/edit", (req, res, next) => {
    let productId = req.params.productId;
    Product.findById(productId, (err, product) => {
        if (err) return next(err);
        return res.render("editProductForm", { product, category: product.category.join(" "), path: path.join(__dirname, "../") });
    });
});




// delete a product
router.get("/:productId/delete", (req, res, next) => {
    let userId = req.session.usersId;
    Product.findByIdAndDelete(req.params.productId, (err, deletedProduct) => {
        if (err) return next(err);
        fs.unlink(path.join(absolutePathOfUploads, deletedProduct.image), (err) => {
            if (err) return next(err);
            console.log("Deleted Successfully");
        });
        return res.redirect("/products/" + `${userId}`);
    })
});

module.exports = router;