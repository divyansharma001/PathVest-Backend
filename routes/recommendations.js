


function calculateAllocation(age, profile) {
    const maxAllocation = 100 - age;
    let allocation = {};
  
    switch (profile) {
      case "risky":
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
  
 
  const age = 30;
  const profile = "medium";
  const allocation = calculateAllocation(age, profile);
  
  console.log(`Allocation for age ${age} with ${profile} risk profile:`);
  console.log(`Equity: ${allocation.equity.toFixed(2)}%`);
  console.log(`Property: ${allocation.property.toFixed(2)}%`);
  console.log(`Commodities: ${allocation.commodities.toFixed(2)}%`);
  console.log(`Debt: ${allocation.debt.toFixed(2)}%`);