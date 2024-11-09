const mongoose=require("mongoose");
const schema=mongoose.Schema;
const ObjectId=mongoose.ObjectId;

//basically the req body will look like this: {name, email, password, age, risk, monthlyIncome, insurences: ["ksdjnc","dscjkn","sdc"], estimatedExpenses, savingorInvestement: {mutualFunds: {"ds":"sc"},virtualGold: 12, equity: {"dewwe":"23"}}}

const user=new schema({ 
    name: String,
    email: {type: String,unique: true,trim: true},
    password: String,
    profilePicture: String,
    age: Number,//i can take dob and calc age, but ig this will work fine
    risk: Number,
    monthlyIncome: Number,
    insurances: [String],
    expenses: [ObjectId],
    estimatedExpenses: Number,
    // savingorInvestement: [{type: ObjectId, ref: "savingsorInvestements"}]//will be storing object id of the savorInv model here
},{timestamps: true})

const savingorInvestement=new schema({
    userId: ObjectId,
    equity: {type: Map,of: String},
    mutualFunds: {type: Map,of: String},
    virtualGold: Number,
 })

 const expenseSchema = new schema({
    userId: ObjectId,
    imageUrl: String,
    name: String,
    category: String,
    price: Number,
    description: String
}, { timestamps: true });

 

//i can store survey data and user data in diff collections, for multiple different surveys related to one user

let userModel=mongoose.model("users",user)
let savingsModel=mongoose.model("savingsorInvestements",savingorInvestement)
let expenseModel=mongoose.model("expenses",expenseSchema)

module.exports={
    userModel,
    savingsModel,
    expenseModel
}
