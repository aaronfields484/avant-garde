const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const blogPostSchema = require("./models/BlogPost.js");
const userSchema = require("./models/User.js");

const app = express();

app.use(session({
  secret: "animalcrackersinmysoup",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb+srv://admin-aaron:Dudeman484@cluster0.evswk.mongodb.net/avant', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

app.set('view engine', 'ejs');


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const User = mongoose.model("User", userSchema);
const BlogPost = mongoose.model("Blog", blogPostSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/", (req, res)=>{
  res.sendFile(`${__dirname}/public/index.html`);
});

app.get("/about", (req, res)=>{
  res.sendFile(`${__dirname}/public/about.html`);
});

app.get("/signup", (req, res)=>{
  res.sendFile(`${__dirname}/public/signup.html`);
});

app.get("/login", (req, res)=>{
  res.sendFile(`${__dirname}/public/login.html`);
});

app.post("/compose",(req,res)=>{

  var post = new BlogPost({
    title: req.body.title,
    message: req.body.message,
    link: "post/" + req.user._id + "/" + req.body.title.replace(/ /g, "-").toLowerCase(),
    user: req.user._id
  });
  post.save();
  res.redirect("/home");
});

app.get("/home",(req,res)=>{
    console.log(req.user);
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
      BlogPost.find({user: req.user._id},(err, callback)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log(callback);
          res.render("home", {homeContent : callback});
        }
      });
    }
    else{
      res.redirect("/login");
    }
  });



app.get("/about",(req,res)=>{
  res.render("about", {startingContent : aboutContent});
});

app.get("/contact",(req,res)=>{
  res.render("contact", {startingContent : contactContent});
});

app.get("/compose",(req,res)=>{
  res.render("compose");
});

app.get("/post/:userLink/:blogPost",(req,res)=>{

  console.log(req.params.blogPost);
  if(req.params.blogPost === "home"){
    res.render("post", {title : "Home", content : homeStartingContent});
  }

  else{
  console.log(req.params);
    BlogPost.findOne({link: "post/"+ req.params.userLink +"/" + req.params.blogPost},(err, callback)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log(callback);
        let returnedTitle = callback.title;
        let returnedMessage = callback.message;
        res.render("post", {title : returnedTitle, content : returnedMessage});
      }
    });
  }

 

});

app.post("/login",(req,res)=>{
  const user = new User({
    username: req.body.usernameLogin,
    password: req.body.passwordLogin
  });
  console.log(user.username);
  req.login(user, (err)=>{
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/home");
      });
    }
  });
}); 

app.post("/signup", (req, res)=>{
  User.register({username: req.body.username}, req.body.password, function (err, user) {
    if(err){
      console.log(err);
      res.redirect("/signup");
    } else{
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/home");
      });
    }
    });

});

app.listen(process.env.PORT, ()=>{
  console.log("Server started on port");
});
