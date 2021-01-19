const mongoose = require("mongoose");


const blogPostSchema = new mongoose.Schema({
    title: String,
    message: String,
    link: String,
    user: String
});

module.exports = blogPostSchema;