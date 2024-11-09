function calculateAllocation(age, profile) {
    const maxAllocation = 100 - age;
    let allocation = {};
  
    switch (profile) {//high,medium,low
      case "high":
        allocation = {
          equity: maxAllocation * 0.8,
          property: maxAllocation * 0.15,
          commodities: maxAllocation * 0.05,
          debt: age * 0.5,
        };
        break;
  
      case "medium":
        allocation = {
          equity: maxAllocation * 0.6,
          property: maxAllocation * 0.2,
          commodities: maxAllocation * 0.1,
          debt: age,
        };
        break;
  
      case "low":
        allocation = {
          equity: maxAllocation * 0.4,
          property: maxAllocation * 0.15,
          commodities: maxAllocation * 0.05,
          debt: age + maxAllocation * 0.4,
        };
        break;
  
      default:
        throw new Error("Invalid risk profile");
    }
  
    return allocation;
}
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

        const { age, riskProfile } = userData[0];
        console.log(userData);
        
        const allocation = calculateAllocation(age, riskProfile);

        res.json({
            email,
            allocation
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
        console.log(error);
        
    }
});

module.exports = {recommendationsRouter};