function calculateAllocation(age, profile) {
    const maxAllocation = 100 - age;
    let allocation = {};

    switch (profile) {
        case "high":
            allocation = {
                equity: Math.round(maxAllocation * 0.8),
                property: Math.round(maxAllocation * 0.15),
                commodities: Math.round(maxAllocation * 0.05),
                debt: Math.round(age * 0.5),
            };
            break;

        case "medium":
            allocation = {
                equity: Math.round(maxAllocation * 0.6),
                property: Math.round(maxAllocation * 0.2),
                commodities: Math.round(maxAllocation * 0.1),
                debt: age,
            };
            break;

        case "low":
            allocation = {
                equity: Math.round(maxAllocation * 0.4),
                property: Math.round(maxAllocation * 0.15),
                commodities: Math.round(maxAllocation * 0.05),
                debt: Math.round(age + maxAllocation * 0.4),
            };
            break;

        default:
            throw new Error("Invalid risk profile");
    }

    // Adjust the total to ensure it sums to 100%
    const total = allocation.equity + allocation.property + allocation.commodities + allocation.debt;
    const adjustment = 100 - total;

    if (adjustment !== 0) {
        allocation.debt += adjustment;
    }

    return allocation;
}

// console.log(calculateAllocation(30, "high"));

//   const age = 30;
//   const profile = "medium";
//   const allocation = calculateAllocation(age, profile);
  
//   console.log(`Allocation for age ${age} with ${profile} risk profile:`);
//   console.log(`Equity: ${allocation.equity.toFixed(2)}%`);
//   console.log(`Property: ${allocation.property.toFixed(2)}%`);
//   console.log(`Commodities: ${allocation.commodities.toFixed(2)}%`);
//   console.log(`Debt: ${allocation.debt.toFixed(2)}%`);
const recommendationsRouter = require("express").Router();
// const recommendationsRouter = Router();

const { Router } = require("express");
const {userModel, savingsModel, expenseModel }=require("../database/databaseIndex")

recommendationsRouter.post('/', async (req, res) => {//post req with {email: "";} in req body
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        // Mock function to get user data by email
        // const getUserDataByEmail = async (email) => {
        //     // Replace this with actual database call
        //     return {
        //         age: 30,
        //         profile: 'medium'
        //     };
        // };
        const userData = await userModel.find({
            email
        });
        if (!userData) {
            return res.status(404).send('User not found');
        }

        const { age, riskProfile } = userData;
        console.log(riskProfile)
        
        const allocation = calculateAllocation(age, riskProfile);

        res.json({
            email,
            allocation
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
        console.log(error);
        
        res.json({
            email,
            allocation: calculateAllocation(20, "high")
        });
        
    }
});

module.exports = {recommendationsRouter};