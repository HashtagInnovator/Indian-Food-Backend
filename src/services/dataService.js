// src/services/dataService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let dishesData = [];

const csvFilePath = path.join(__dirname, '../data/indian_food.csv');

if (!fs.existsSync(csvFilePath)) {
  console.error('CSV file NOT found at:', csvFilePath);
} else {
  console.log('Found CSV file at:', csvFilePath);
}

// Load CSV data
function loadCsvData() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv({ bom: true }))
      .on('headers', (headers) => {
        console.log('CSV Headers Detected:', headers);
      })
      .on('data', (row) => {
        console.log('CSV Row:', row);
        const dish = {
          name: (row['name'] || '').trim(),
          ingredients: (row['ingredients'] || '').trim(),
          diet: (row['diet'] || '').trim(),
          prep_time: parseInt(row['prep_time'], 10) || 0,
          cook_time: parseInt(row['cook_time'], 10) || 0,
          flavor_profile: (row['flavor_profile'] || '').trim(),
          course: (row['course'] || '').trim(),
          state: (row['state'] || '').trim(),
          region: (row['region'] || '').trim()
        };
        results.push(dish);
      })
      .on('end', () => {
        console.log('Finished reading CSV. Total parsed rows:', results.length);
        resolve(results);
      })
      .on('error', (err) => {
        console.error('Error while reading CSV:', err);
        reject(err);
      });
  });
}

// Initialize in‑memory data at startup
(async () => {
  try {
    dishesData = await loadCsvData();
    console.log(`Successfully loaded ${dishesData.length} dishes.`);
  } catch (err) {
    console.error('Error loading CSV data:', err);
  }
})();

function getAllDishes() {
  return [...dishesData];
}

function getDishByName(nameParam) {
  const nameLower = nameParam.trim().toLowerCase();
  return dishesData.find(dish => dish.name.trim().toLowerCase() === nameLower);
}

function getDishesByIngredientList(userIngredients) {
  const userIngSet = new Set(userIngredients.map(i => i.toLowerCase()));
  return dishesData.filter(dish => {
    const dishIngArray = dish.ingredients
      .split(',')
      .map(i => i.trim().toLowerCase())
      .filter(Boolean);
    return dishIngArray.every(ing => userIngSet.has(ing));
  });
}

// BONUS: Create a new dish
function addDish(newDish) {
  const dish = {
    name: (newDish.name || '').trim(),
    ingredients: (newDish.ingredients || '').trim(),
    diet: (newDish.diet || '').trim(),
    prep_time: parseInt(newDish.prep_time, 10) || 0,
    cook_time: parseInt(newDish.cook_time, 10) || 0,
    flavor_profile: (newDish.flavor_profile || '').trim(),
    course: (newDish.course || '').trim(),
    state: (newDish.state || '').trim(),
    region: (newDish.region || '').trim()
  };
  dishesData.push(dish);
  return dish;
}

// BONUS: Update an existing dish by name (case‑insensitive, trimmed)
function updateDish(nameParam, updateData) {
  const index = dishesData.findIndex(
    dish => dish.name.trim().toLowerCase() === nameParam.trim().toLowerCase()
  );
  if (index === -1) return null;
  const dish = dishesData[index];
  const updatedDish = {
    ...dish,
    ...updateData,
    name: updateData.name ? updateData.name.trim() : dish.name,
    ingredients: updateData.ingredients ? updateData.ingredients.trim() : dish.ingredients,
    diet: updateData.diet ? updateData.diet.trim() : dish.diet,
    prep_time: updateData.prep_time !== undefined ? parseInt(updateData.prep_time, 10) || 0 : dish.prep_time,
    cook_time: updateData.cook_time !== undefined ? parseInt(updateData.cook_time, 10) || 0 : dish.cook_time,
    flavor_profile: updateData.flavor_profile ? updateData.flavor_profile.trim() : dish.flavor_profile,
    course: updateData.course ? updateData.course.trim() : dish.course,
    state: updateData.state ? updateData.state.trim() : dish.state,
    region: updateData.region ? updateData.region.trim() : dish.region,
  };
  dishesData[index] = updatedDish;
  return updatedDish;
}

// BONUS: Delete a dish by name (case‑insensitive, trimmed)
function deleteDish(nameParam) {
  const initialLength = dishesData.length;
  dishesData = dishesData.filter(
    dish => dish.name.trim().toLowerCase() !== nameParam.trim().toLowerCase()
  );
  return dishesData.length < initialLength;
}

module.exports = {
  getAllDishes,
  getDishByName,
  getDishesByIngredientList,
  addDish,
  updateDish,
  deleteDish
};
