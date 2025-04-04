import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css"; // Assuming you have a CSS file for styles

const MealPlanner = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [formData, setFormData] = useState({
    goal: "",
    diet: "",
    portionSize: "",
    cuisine: "",
    allergy: "",
  });

  const toggleMealSection = (mealType) => {
    setExpandedMeal(expandedMeal === mealType ? null : mealType);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateMealPlan = async () => {
    if (!formData.goal || !formData.diet || !formData.portionSize || !formData.cuisine) {
      alert("Please fill out all required fields!");
      return;
    }

    setLoading(true);
    setMealPlan(null);
    setError(null);

    const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
    const MISTRAL_MODEL = "mistral-small";

    if (!MISTRAL_API_KEY) {
      setError("❌ API key is missing. Please configure your .env file.");
      setLoading(false);
      return;
    }

    // Enhanced prompt for detailed meal plans
    const prompt = `
      Create a meal plan for a person whose goal is ${formData.goal} and follows a ${formData.diet} diet.
      - Cuisine Preference: ${formData.cuisine}
      - Portion Size: ${formData.portionSize}
      - Exclude Ingredients: ${formData.allergy || "None"}

      Provide **Breakfast**, **Lunch**, and **Dinner** with:
      - Dish Name (bold)
      - How to make it (short description)
      - Calories range
      - Short Description
      - Ingredients List (for shopping list)

      Format:
      **Breakfast:**
      - Dish Name: Example Dish
      - How to make it (short description)
      - Calories: 250-300
      - Description: Short description.
      - Ingredients: [List of items]

      **Lunch:**
      - Dish Name: Example Dish
      - How to make it (short description)
      - Calories: 450-500
      - Description: Short description.
      - Ingredients: [List of items]

      **Dinner:**
      - Dish Name: Example Dish
      - How to make it (short description)
      - Calories: 400-450
      - Description: Short description.
      - Ingredients: [List of items]
    `;

    try {
      const response = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: MISTRAL_MODEL,
          messages: [{ role: "system", content: prompt }],
          max_tokens: 500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
          },
        }
      );

      const result = response.data.choices[0].message.content;

      // Parsing meals properly
      const meals = { breakfast: [], lunch: [], dinner: [] };
      let shoppingItems = [];
      let currentMeal = null;

      result.split("\n").forEach((line) => {
        if (line.toLowerCase().includes("breakfast")) currentMeal = "breakfast";
        else if (line.toLowerCase().includes("lunch")) currentMeal = "lunch";
        else if (line.toLowerCase().includes("dinner")) currentMeal = "dinner";
        else if (line.toLowerCase().includes("ingredients:")) {
          shoppingItems.push(line.replace("Ingredients:", "").trim());
        } else if (currentMeal && line.trim() !== "") {
          meals[currentMeal].push(line);
        }
      });

      setMealPlan(meals);
      setShoppingList(shoppingItems);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError("⚠️ Failed to fetch meal plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meal-planner-container">
      {/* Meal Planner Section */}
      <div className="glass-card">
        <h2 className="title">🍽️ AI-Powered Meal Planner</h2>

        <div className="input-group">
          <label>🎯 Select Your Goal</label>
          <select name="goal" onChange={handleChange} className="select-box">
            <option value="">-- Choose Goal --</option>
            <option value="weight loss">Weight Loss</option>
            <option value="muscle gain">Muscle Gain</option>
            <option value="healthy living">Healthy Living</option>
            <option value="weight maintenance">Weight Maintenance</option>
            <option value="high protein">High Protein Diet</option>
          </select>
        </div>

        <div className="input-group">
          <label>🥗 Diet Preference</label>
          <select name="diet" onChange={handleChange} className="select-box">
            <option value="">-- Choose Diet --</option>
            <option value="veg">Veg</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="balanced">Balanced</option>
            <option value="low carb">Low Carb</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>

        <div className="input-group">
          <label>🍽️ Portion Size</label>
          <select name="portionSize" onChange={handleChange} className="select-box">
            <option value="">-- Choose Portion Size --</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="input-group">
          <label>🌍 Cuisine Preference</label>
          <select name="cuisine" onChange={handleChange} className="select-box">
            <option value="">-- Choose Cuisine --</option>
            <option value="indian">Indian</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="chinese">Chinese</option>
            <option value="mediterranean">Mediterranean</option>
          </select>
        </div>

        <div className="input-grp">
          <label>🚫 Allergies (Optional)</label>
          <input type="text" name="allergy" placeholder="E.g., Nuts, Dairy, Gluten" onChange={handleChange} className="input-box" />
        </div>

        <button onClick={generateMealPlan} className="generate-btn">
          {loading ? "Generating..." : "Generate Meal Plan"}
        </button>
      </div>

      {/* Meal Plan Display Section */}
      {mealPlan && (
        <div className="meal-list">
          <h3 className="meal-title">📋 Your Meal Plan</h3>

          {["breakfast", "lunch", "dinner"].map((mealType) => (
  <div
    key={mealType}
    className={`meal-section ${expandedMeal === mealType ? "active" : ""}`}
    onClick={() => toggleMealSection(mealType)}
  >
    <h4>
      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
      {expandedMeal === mealType ? " 🔽" : " ▶"} 
    </h4>
    <ul>
      {mealPlan[mealType].map((meal, index) => (
        <li key={index}>{meal}</li>
      ))}
    </ul>
  </div>
))}

          {shoppingList && (
            <div className="shopping">
              <h4>🛒 Shopping List</h4>
              <ul>
                {shoppingList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
    
  );
};

export default MealPlanner;
