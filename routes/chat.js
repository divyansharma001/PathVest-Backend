let { Router }=require("express")
let chatRouter=Router();

let env=require("dotenv");
env.config();

let Groq=require("groq-sdk")

let grok_key=process.env.Grok_Api;

if (!grok_key) {
    console.error("GROQ_API_KEY environment variable not found");
    return;
  }


chatRouter.post((req,res)=>{//body=> {authorisation:"";conversationHistory:"";prompt:""}
    
      
    try {
    
    let { prompt, conversationHistory }=req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const history = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];

      const prompt = JSON.stringify(prompt);//dont need it ig
    

    const messages = [
      {
        role: "system",
        content:
          "You are a coding assistant. You'll be given a code solution from leetcode, it may contain error. Provide short, accurate, and clear hints to help them progress without giving complete solutions. Try not to ask follow-up questions rather force user to think and complete solution according to the hints given. Use bullet points for clarity and write on new lines when sentences are completed.",
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
  } catch (error) {
    console.error("Error in chat controller:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
    
})

module.exports= {
    chatRouter
}