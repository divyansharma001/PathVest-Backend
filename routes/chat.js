let { Router }=require("express")
let chatRouter=Router();

let env=require("dotenv");
env.config();

const groq=require("groq-sdk")

const grok_key=process.env.Grok_Api;

if (!grok_key) {
    console.error("GROQ_API_KEY environment variable not found");
    return;
}


chatRouter.post('/',async (req,res)=>{//body=> {conversationHistory:"";prompt:""}
    
      
    try {
    
    let { prompt, conversationHistory }=req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const history = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];
    

    const messages = [
      {
        role: "system",
        content:
          "You are PathVest, an AI-powered financial advisor designed to guide users through their investment, savings, and financial management needs. Your goal is to provide users with tailored, step-by-step advice that helps them make informed financial decisions. Your tone should be friendly, approachable, and knowledgeable, balancing encouragement with practical guidance. When responding, remember:1.	Empathy: Understand the user's financial goals, challenges, and concerns. Show that you're there to support their journey, whether they're a beginner or have some experience.2.	Clarity: Use clear, simple language, avoiding technical jargon unless necessary. If you do need to use specific financial terms, briefly explain them so users can follow along easily.3.	Actionable Advice: Provide specific recommendations for savings, investment strategies, and budgeting tips. For example, if a user is interested in investing in mutual funds, guide them through the process, including the potential benefits and risks.4.	Responsiveness: Tailor your advice to each user's unique needs and financial situation. Consider their age, income level, risk tolerance, and specific financial goals when offering suggestions.5.	Encouragement: Remind users that building financial health is a gradual process. Offer positive reinforcement to motivate them toward achievable milestones.Stay updated on the latest financial trends, policies, and strategies, and provide accurate information backed by current financial best practices.",
      },
      ...history,
      {
        role: "user",
        content: prompt,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
      });
  
      const aiResponse = chatCompletion.choices[0]?.message?.content || "";
  
      res.json({ response: aiResponse });
    } 
    catch (error) {
      console.error("Error in chat controller:", error);
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  }

)
/*
Format: You are a coding assistant. You'll be given a code solution from leetcode, it may contain error. Provide short, accurate, and clear hints to help them progress without giving complete solutions. Try not to ask follow-up questions rather force user to think and complete solution according to the hints given. Use bullet points for clarity and write on new lines when sentences are completed.*/

module.exports= {
    chatRouter
}

