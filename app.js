const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");

require('dotenv').config()

//Mongoose
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

//Passport
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;

//Schemas
const blogPostSchema = require("./models/BlogPost.js");
const userSchema = require("./models/User.js");

//Middleware
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//DB Connection
mongoose.connect('mongodb+srv://admin:Dudeman$484@cluster0.xefat.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);


//Models
const User = mongoose.model("User", userSchema);
const BlogPost = mongoose.model("Blog", blogPostSchema);

passport.use(User.createStrategy());


//Passport Serialize/Deserialize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Routes

app.get("/", (req, res)=>{
  if(req.isAuthenticated()){
    res.redirect('/home');
  }
  else{
  res.sendFile(`${__dirname}/public/index.html`);
  }
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

app.get("/about",(req,res)=>{
  res.render("about", {startingContent : aboutContent});
});

app.get("/contact",(req,res)=>{
  res.render("contact", {startingContent : contactContent});
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

//Authentication Required
app.get("/compose",(req,res)=>{
  if(req.isAuthenticated()){
  res.render("compose");
  }
  else {
    res.redirect('/login');
  }
});

app.get("/post/:userLink/:blogPost",(req,res)=>{
  
  if(req.isAuthenticated()){
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
}
else {

  res.redirect('/login');
}

});

app.get('/logout', function(req, res, next){
  if(req.isAuthenticated()){
  req.logout((err)=> {
    if (err) { return next(err); }
  });
  res.redirect('/');
}
else {

  res.redirect('/login');
}
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

app.post("/compose",(req,res)=>{
  if(req.isAuthenticated()){

    var post = new BlogPost({
      title: req.body.title,
      message: req.body.message,
      link: "post/" + req.user._id + "/" + req.body.title.replace(/ /g, "-").toLowerCase(),
      user: req.user._id
    });
    post.save();
    res.redirect("/home");
}
else{
  res.redirect("/login");
}
});


app.listen(3000, ()=>{
  console.log("Server started");
});
