import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
title:String,
content:String,
timeStamp:String
})

const Article = mongoose.model("article",articleSchema);

export default Article;