const axios = require('axios');

module.exports = {
    usage: ['recipe'],
    description: 'Find recipes based on ingredients',
    emoji: '🍳',
    commandType: 'Search', // Add command type for categorization
    isWorkAll: true,
    async execute(sock, m, args) {
        const ingredients = args.join(' ');
        if (!ingredients) {
            return await sock.sendMessage(m.key.remoteJid, { text: 'Usage: /recipe [ingredients (comma-separated)]' }, { quoted: m });
        }

        try {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredients}`);
            const recipes = response.data.meals;

            if (!recipes || recipes.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: 'No recipes found for those ingredients.' }, { quoted: m });
            }

            // Premium UI - Interactive List
            let recipeOptions = 'Here are some recipes you can try:\n\n';
            recipes.slice(0, 5).forEach((recipe, index) => { // Show top 5
                recipeOptions += `${index + 1}. ${recipe.strMeal}\n`;
            });

            const askRecipe = await sock.sendMessage(m.key.remoteJid, { text: recipeOptions }, { quoted: m });
            

            // Wait for user's choice (you'll need to implement this logic)
            const chosenRecipe = await waitForRecipeChoice(sock, m, recipes); // Hypothetical function
            
            const recipeText = `
╭───────── 🍳 Recipe 🍳 ─────────╮
│                                 │
│   *${chosenRecipe.strMeal}*                  │
│                                 │
│  **Ingredients:**               │`;

            for (let i = 1; i <= 20; i++) { // Max 20 ingredients
                const ingredient = chosenRecipe[`strIngredient${i}`];
                const measure = chosenRecipe[`strMeasure${i}`];
                if (ingredient) {
                    recipeText += `\n│  • ${ingredient} - ${measure || 'To taste'}`; 
                }
            }
            
            recipeText += `\n│                                 │
│  **Instructions:**               │
│  ${chosenRecipe.strInstructions}   │
│                                 │
│  📖 Find the full recipe at:   │
│  ${chosenRecipe.strSource}      │
│                                 │
╰─────────────────────────╯
            `;

            await sock.sendMessage(m.key.remoteJid, {
                text: recipeText,
                contextInfo: {
                    externalAdReply: {
                        title: chosenRecipe.strMeal,
                        body: 'Enjoy your meal!',
                        mediaType: 1, // Image
                        thumbnailUrl: chosenRecipe.strMealThumb,
                        sourceUrl: chosenRecipe.strSource,
                    }
                }
            }, { quoted: m });
        } catch (error) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Error fetching recipes. Please try again later.' }, { quoted: m });
        }
    }
};

// (Hypothetical function - you'll need to implement this)
async function waitForRecipeChoice(sock, m, recipes) {
    // ... logic to wait for the user's response and return the chosen recipe
}
