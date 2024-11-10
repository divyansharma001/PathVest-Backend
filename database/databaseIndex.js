const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Using proper capitalization for Schema
const ObjectId = mongoose.Types.ObjectId; // Using mongoose.Types.ObjectId for better type safety

// Expense Schema
const expenseSchema = new Schema({
    email: { type:String, required: true },
    imageUrl: String,
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
}, { 
    timestamps: true 
});


const savingOrInvestmentSchema = new Schema({
    email: { type: String},
    equity: { type: Map, of: String },
    mutualFunds: { type: Map, of: String },
    virtualGold: Number
}, {
    timestamps: true
});

// User Schema - This will update the existing User collection
const UserSchema = new Schema({ 
    age: { type: Number, required: true },
    risk: { type: Number, required: true },
    monthlyIncome: { type: Number, required: true },
    insurances: [String],
    expenses: [{ type: Schema.Types.ObjectId, ref: 'expenses' }],
    estimatedExpenses: { type: Number, required: true },
    savingsOrInvestments: { type: Schema.Types.ObjectId, ref: 'savingsorInvestements' },
    riskProfile: String
}, {
    timestamps: true,
    // This ensures the schema matches the existing collection
    collection: 'User'
});
const financialSchema = new Schema({ 
    goalType: { type: Number, required: true },
    targetAmount: { type: Number, required: true },
    timeFrame: { type: Number, required: true },
    priority: [String],
    email: String
});


// Create models
const ExpenseModel = mongoose.model('expenses', expenseSchema);
const SavingsModel = mongoose.model('savingsorInvestements', savingOrInvestmentSchema);
// Use the existing "User" collection
const userModel = mongoose.model('User', UserSchema);
const financialModel = mongoose.model('FinancialGoals', financialSchema);

module.exports = {
    userModel,
    SavingsModel,
    ExpenseModel,
    financialModel
};