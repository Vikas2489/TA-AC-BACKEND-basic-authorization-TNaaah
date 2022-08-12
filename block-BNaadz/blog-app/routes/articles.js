var express = require("express");
var router = express.Router();
var Article = require("../models/articles");
var Comment = require("../models/comments");
var User = require("../models/users");
var auth = require("../middlewares/auth");


// get all the articles 
router.get("/", (req, res, next) => {
    Article.find({}, (err, articlesArr) => {
        if (err) return next(err);
        return res.render("listOfArticles", { articles: articlesArr, error: req.flash("error")[0] });
    });
});

//get article form
router.get("/new", auth.loggedInUser, (req, res, next) => {
    res.render("articleForm");
});

// edit the article (get pre filled form of article)
router.get("/:title/edit", auth.loggedInUser, (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }, (err, article) => {
        if (err) return next(err);
        if (req.user.id == article.author) {
            return res.render("updateArticleForm", { article });
        } else {
            req.flash("error", "You cannot edit other's articles!!!!!");
            return res.redirect("/articles/" + `${article.slug}`);
        }

    });
});

// fetch details of specific article
router.get("/:title", (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }).populate("comments").exec((err, article) => {
        if (err) return next(err);
        return res.render("singleArticleDetail", { article, error: req.flash("error")[0], commentErr: req.flash("commentErr")[0] });
    });
});

// setting up middleware for authoraization
router.use(auth.loggedInUser);


// post article form
router.post("/", (req, res, next) => {
    req.body.author = req.session.userId;
    Article.create(req.body, (err, article) => {
        if (err) return next(err);
        User.findByIdAndUpdate(req.session.userId, { $push: { articleId: article._id } }, (err, user) => {
            if (err) return next(err);
            return res.redirect("/articles");
        });
    });
});

// delete an article
router.get("/:title/delete", (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }, (err, article) => {
        if (err) return next(err);
        if (req.user.id == article.author) {
            return Article.findByIdAndDelete(article.id, (err, deletedArticle) => {
                if (err) return next(err);
                Comment.deleteMany(deletedArticle.comments, (err, deletedComment) => {
                    if (err) return next(err);
                    User.findByIdAndUpdate(req.user.id, { $pull: { articleId: deletedArticle.id } }, (err, user) => {
                        if (err) return next(err);
                        return res.redirect("/articles");
                    })
                })

            })
        } else {
            req.flash("error", "You cannot delete other's articles!!!!!");
            return res.redirect("/articles/" + `${article.slug}`);
        }
    })
});

// update the article
router.post("/:title", (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }, (err, article) => {
        if (err) return next(err);
        article.title = req.body.title;
        article.description = req.body.description;
        article.author = req.session.userId;
        article.save((err, article) => {
            if (err) return next(err);
            return res.redirect("/articles/" + `${article.slug}`);
        });
    });
});

// increament likes 
router.get("/:title/likes", (req, res, next) => {
    let title = req.params.title;
    Article.findOneAndUpdate({ slug: title }, { $inc: { likes: 1 } }, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + `${article.slug}`);
    });
});

// create a comment
router.post("/:articleId/comment", (req, res, next) => {
    let articleId = req.params.articleId;
    req.body.articleId = articleId;
    req.body.userId = req.user.id;
    Comment.create(req.body, (err, comment) => {
        if (err) return next(err);
        Article.findByIdAndUpdate(articleId, { $push: { comments: comment.id } }, (err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${article.slug}`);
        });
    });
})

// like the comment
router.get("/:commentId/comments/like", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, (err, comment) => {
        if (err) return next(err);
        Comment.findById(commentId).populate("articleId").exec((err, comment) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${comment.articleId.slug}`);
        });
    });
});

// delete a comment
router.get("/:commentId/comments/delete", (req, res, next) => {
    let commentId = req.params.commentId;

    Comment.findById(commentId, (err, comment) => {
        if (err) return next(err);
        if (req.user.id == comment.userId) {
            Comment.findByIdAndDelete(commentId, (err, deletedComment) => {
                if (err) return next(err);
                Article.findByIdAndUpdate(deletedComment.articleId, { $pull: { comments: commentId } }, (err, article) => {
                    if (err) return next(err);
                    return res.redirect("/articles/" + `${article.slug}`);
                });
            });
        } else {
            Article.findById(comment.articleId, (err, article) => {
                if (err) return next(err);
                req.flash("commentErr", "Cannot delete other's comment!!!!");
                return res.redirect("/articles/" + `${article.slug}`);
            })
        }
    });
})

// get form to edit ur comment
router.get("/:commentId/comments/edit", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findById(commentId, (err, comments) => {
        if (err) return next(err);
        if (req.user.id == comments.userId) {
            return res.render("commentForm.ejs", { comments });
        } else {
            Article.findById(comments.articleId, (err, article) => {
                if (err) return next(err);
                req.flash("commentErr", "Cannot edit other's comment!!!!");
                return res.redirect("/articles/" + `${article.slug}`);
            })
        }
    })
});

// post to edit form
router.post("/:commentId/comments", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findByIdAndUpdate(commentId, req.body, (err, updatedComment) => {
        if (err) return next(err);
        Article.findById(updatedComment.articleId, (err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${article.slug}`);
        });
    })
});

module.exports = router;