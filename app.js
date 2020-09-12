const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const search = require(__dirname+"/search.js");

const homeStartingContent = "To compose your first post click on the compose link in the navigation bar.";
const aboutContent = "This is a blog site developed to log anything you choose!.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

let homeContent = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.post("/compose",(req,res)=>{
  let post = {title: req.body.title, message : req.body.message, link: "post/"+req.body.title.replace(/ /g, "-").toLowerCase()};
  homeContent.push(post);
  res.redirect("/");
});

app.get("/",(req,res)=>{
  var bruh = "Bruh bruh";
  res.render("home", {startingContent : homeStartingContent, homeContent : homeContent});
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

app.get("/post/:blogPost",(req,res)=>{

  if(req.params.blogPost === "home"){
    res.render("post", {title : "Home", content : homeStartingContent});
  }
  else{
  let returnedTitle = search.getTitle(homeContent, req.params.blogPost);
  let returnedMessage = search.getMessage(homeContent, req.params.blogPost);
  for(var i = 0; i < homeContent.length; i++){
  console.log(req.params.blogPost);
  if(req.params.blogPost === homeContent[i].link.substr(5,homeContent[i].link.length)){
  res.render("post", {title : returnedTitle, content : returnedMessage});
  break;
  }
  res.redirect("/");
}
}

});

app.listen(process.env.PORT, function() {
  console.log("Server started on port 3000");
});
