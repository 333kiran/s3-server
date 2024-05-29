import Article from "../models/article-schema.js";
import Subscriber from '../models/newsletter-subscriber.js';
import { sendNewsletterEmail } from "../utils/send-newsletter-mail.js";

// export const addArticles = async(req,res) => {
//     try{
// const {article} = req.body;

// const newArticle = {
//     title:article.title,
//     content: article.content,
//     timeStamp:article.timestamp
// }

// const saveArticle = new Article(newArticle);
// const data =  await saveArticle.save(); 
// // console.log("data ->>",data);
// res.status(200).json({
//     message:'Article saved into db successfully',
//     success:true,
//     result:data
// })

//     }catch(error){
//         console.log("error while adding new article into db",error);
//         res.status(500).json({
//             message:'internal server error'
//         })
//     }
// }


export const addArticles = async (req, res) => {
    try {
      const { article } = req.body;
  
      const newArticle = {
        title: article.title,
        content: article.content,
        timeStamp: article.timestamp
      };
  
      // Save the new article to the database
      const savedArticle = new Article(newArticle);
      await savedArticle.save();
  
      // Fetch list of subscribed users' email addresses from the database
      const subscribers = await Subscriber.find({}, 'email');
  
// Construct the email message
const subject = "New Article Published: " + article.title;
const message = `Hello,\n\nA new article "${article.title}" has been published on our website. Check it out:\n\n${article.content}\n\nThank you!`;


      
      // Send emails to subscribers
      for (const subscriber of subscribers) {
        await sendNewsletterEmail(subscriber.email, subject,message);
      }
  
      res.status(200).json({
        message: 'Article saved into db successfully',
        success: true,
        result: savedArticle
      });
    } catch (error) {
      console.log("error while adding new article into db", error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

export const fetchAllArticlesList = async(req,res) => {
    try{
const articlesList = await Article.find();
console.log("list ->",articlesList);
if(!articlesList){
    res.status(404).json({
        message:'Article not found'
    })
}else{
    res.status(200).json({
        message:'Articles list fetched successfully',
        success:true,
        result:articlesList
    })
}
    }catch(error){
        console.log("error while afetchAllArticlesList from db",error);
        res.status(500).json({
            message:'internal server error'
        })
    }
}

export const deleteArticleById = async(req,res) => {
    try {
        const {id} = req.params;
        const article = await Article.findById(id);
        if(!article){
            res.status(404).json({
                message:"Article not found"
            })
        }else{
            await Article.deleteOne({_id:id});
            res.status(200).json({
                message:"ARticle deleted successfully",
                success:true
            })
        }
    } catch (error) {
        console.log("error while deleting article by ID ",error);
        res.status(500).json({
            message:'internal server error'
        })
    }
}

export const updateArticleById = async(req,res) => {
    try {
        const {id} = req.params;
        const { title, content, timeStamp } = req.body;
        const article = await Article.findById(id);
        if(!article){
            res.status(404).json({
                message:"Article not found"
            })
        }else{
           // Update individual fields of the article
        article.title = title;
        article.content = content;
        article.timeStamp = timeStamp;

        const updatedArticle = await article.save();

        res.status(200).json({
            message: "Article updated successfully",
            success: true,
            result: updatedArticle
        });
        }
    } catch (error) {
        console.log("error while deleting article by ID ",error);
        res.status(500).json({
            message:'internal server error'
        })
    }
}

