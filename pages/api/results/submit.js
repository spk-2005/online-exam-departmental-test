import connectMongo from "@/pages/lib/mongodb";
import Result from "@/pages/models/result";
import User from "@/pages/models/users";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectMongo();
    
    // Save the result first
    const result = await Result.create(req.body);
    
    // Get the user data from the request
    const { name, group, test } = req.body;
    
    console.log(`Processing attempt decrease for user: ${name}, group: ${group}, test: ${test}`);
    
    // Find the user and decrease their attempts
    const user = await User.findOne({ username: name }).lean();
    
    if (user) {
      console.log(`Found user: ${user.username}`);
      console.log(`User groupAttempts:`, JSON.stringify(user.groupAttempts, null, 2));
      
      // Find the group in user's groupAttempts
      const groupIndex = user.groupAttempts.findIndex(g => g.group === group);
      
      if (groupIndex !== -1) {
        console.log(`Found group at index: ${groupIndex}`);
        
        // Find the test in the group's tests
        const testIndex = user.groupAttempts[groupIndex].tests.findIndex(t => t.testName === test);
        
        if (testIndex !== -1) {
          console.log(`Found test at index: ${testIndex}`);
          console.log(`Current remaining attempts: ${user.groupAttempts[groupIndex].tests[testIndex].remainingAttempts}`);
          
          // Decrease the remaining attempts by 1, but don't go below 0
          if (user.groupAttempts[groupIndex].tests[testIndex].remainingAttempts > 0) {
            user.groupAttempts[groupIndex].tests[testIndex].remainingAttempts -= 1;
            
            // Save the updated user document
            await user.save();
            
            console.log(`Successfully decreased attempts for user: ${name}`);
            console.log(`New remaining attempts: ${user.groupAttempts[groupIndex].tests[testIndex].remainingAttempts}`);
            
            res.status(201).json({ 
              message: "Result saved and attempts updated", 
              result,
              attemptsDecreased: true,
              remainingAttempts: user.groupAttempts[groupIndex].tests[testIndex].remainingAttempts
            });
          } else {
            console.log(`No remaining attempts for user: ${name}`);
            res.status(201).json({ 
              message: "Result saved but no attempts remaining", 
              result,
              attemptsDecreased: false,
              remainingAttempts: 0
            });
          }
        } else {
          console.log(`Test ${test} not found for user ${name} in group ${group}`);
          res.status(201).json({ 
            message: "Result saved but test not found in user attempts", 
            result,
            attemptsDecreased: false,
            error: "Test not found"
          });
        }
      } else {
        console.log(`Group ${group} not found for user ${name}`);
        res.status(201).json({ 
          message: "Result saved but group not found in user attempts", 
          result,
          attemptsDecreased: false,
          error: "Group not found"
        });
      }
    } else {
      console.log(`User ${name} not found`);
      res.status(201).json({ 
        message: "Result saved but user not found", 
        result,
        attemptsDecreased: false,
        error: "User not found"
      });
    }
    
  } catch (err) {
    console.error("Error in submit handler:", err);
    res.status(500).json({ message: "Error saving result or updating attempts", error: err.message });
  }
}