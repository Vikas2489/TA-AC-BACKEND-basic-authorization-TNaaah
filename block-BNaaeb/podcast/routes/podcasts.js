var express = require("express");
var router = express.Router();
var multer = require("multer");
const { type } = require("os");
var path = require("path");
var uploadsPath = path.join(__dirname, "../", "/public/uploads");
var auth = require("../middlewares/auth");
const Podcast = require("../model/Podcasts");
const User = require("../model/Users");
const fs = require("fs");

console.log(uploadsPath);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.use(auth.isUserLoggedInOrNot);

// get podcast form
router.get("/new", (req, res, next) => {
    return res.render("podcastsForm");
});

// post podcast form
router.post("/", upload.single("image"), (req, res, next) => {
    req.body.image = req.file.filename;
    console.log(req.file);
    req.body.userId = req.session.userId;
    if (!req.user.isAdmin) {
        req.body.podcastsType = req.user.userType;
    } else if (req.user.isAdmin) {
        req.body.isVerified = true;
    }
    Podcast.create(req.body, (err, podcast) => {
        if (err) return next(err);
        return res.redirect("/podcasts");
    });
});

// verifying the podcasts
router.get("/:id/verify", (req, res, next) => {
    let podcastId = req.params.id;
    Podcast.findByIdAndUpdate(podcastId, { isVerified: true }, (err, podcast) => {
        if (err) return next(err);
        return res.redirect("/podcasts");
    })
})

// edit the podcast by admin
router.get("/:id/edit", (req, res, next) => {
    let podcastId = req.params.id;
    Podcast.findById(podcastId, (err, podcast) => {
        if (err) return next(err);
        console.log(podcast);
        return res.render("editPodcastForm", { podcast });
    });
});

// post the updated podcast form
router.post("/:id", upload.single('image'), (req, res, next) => {
    let podcastId = req.params.id;
    if (req.file) {
        req.body.image = req.file.filename;
    }
    req.body.isVerified = true;
    Podcast.findByIdAndUpdate(podcastId, req.body, (err, podcast) => {
        if (err) return next(err);
        if (req.body.image) {
            fs.unlink(path.join(__dirname, "../", "/public/uploads/", podcast.image), (err) => {
                return console.log(err);
            });
        }
        return res.redirect("/podcasts");
    });
});

// get all podcast
router.get("/", (req, res, next) => {
    let podcastsType = req.user.userType;
    if (podcastsType === "free member") {
        Podcast.find({ podcastsType: "free member" }, (err, podcastArr) => {
            if (err) return next(err);
            // checking if it's verified or not
            podcastArr = podcastArr.filter((podcasts) => {
                if (podcasts.isVerified) {
                    return podcasts;
                }
            });
            return res.render("allPodcasts", { podcastArr });
        });
    }
    if (podcastsType === "VIP member") {
        Podcast.find({}, (err, allPodcastArr) => {
            if (err) return next(err);
            let podcastArr = allPodcastArr.filter(podcast => {
                if (podcast.podcastsType === "free member" || podcast.podcastsType === "VIP member") {
                    if (podcast.isVerified) {
                        return podcast;
                    }
                }
            });
            return res.render("allPodcasts", { podcastArr });
        });
    }
    if (podcastsType === "premium member") {
        Podcast.find({}, (err, podcastArr) => {
            if (err) return next(err);
            // checking if it's verified or not
            podcastArr = podcastArr.filter((podcasts) => {
                if (podcasts.isVerified) {
                    return podcasts;
                }
            });
            return res.render("allPodcasts", { podcastArr });
        })
    }
    if (!podcastsType) {
        Podcast.find({}, (err, podcastArr) => {
            if (err) return next(err);
            return res.render("allPodcasts", { podcastArr });
        });
    }
});

// delete a podcasts
router.get("/:id/delete", (req, res, next) => {
    let podcastId = req.params.id;
    Podcast.findByIdAndDelete(podcastId, (err, podcast) => {
        if (err) return next(err);
        fs.unlink(path.join(__dirname, "../", "/public/uploads/", podcast.image), (err) => {
            return console.log(err);
        });
        return res.redirect('/podcasts');
    })
})

module.exports = router;