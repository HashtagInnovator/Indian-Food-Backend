// src/controllers/dishController.js
const dataService = require('../services/dataService');

exports.getAllDishes = (req, res) => {
  try {
    const { search, diet, page = 1, limit = 10, sort, sortDir } = req.query;
    let dishes = dataService.getAllDishes();

    if (search) {
      const searchLower = search.toLowerCase();
      dishes = dishes.filter(dish =>
        dish.name.toLowerCase().includes(searchLower) ||
        dish.ingredients.toLowerCase().includes(searchLower)
      );
    }

    if (diet) {
      const filterDiet = diet.toLowerCase().replace(/[\s-]+/g, '');
      dishes = dishes.filter(dish => {
        const dishDiet = dish.diet.toLowerCase().replace(/[\s-]+/g, '');
        return dishDiet === filterDiet;
      });
    }

    if (sort) {
      const direction = sortDir === 'desc' ? -1 : 1;
    
      if (['prep_time', 'cook_time'].includes(sort)) {
        dishes.sort((a, b) => (a[sort] - b[sort]) * direction);
      } else {

        dishes.sort((a, b) => {
          const aVal = (a[sort] || '').toString().toLowerCase();
          const bVal = (b[sort] || '').toString().toLowerCase();
          return aVal.localeCompare(bVal) * direction;
        });
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const pagedDishes = dishes.slice(startIndex, startIndex + limitNum);

    res.json({
      total: dishes.length,
      page: pageNum,
      limit: limitNum,
      data: pagedDishes
    });
  } catch (err) {
    console.error('Error in getAllDishes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDishByName = (req, res) => {
  try {
    const nameParam = req.params.name;
    const dish = dataService.getDishByName(nameParam);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    res.json(dish);
  } catch (err) {
    console.error('Error in getDishByName:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSuggestedDishes = (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid "ingredients" array' });
    }
    const suggestions = dataService.getDishesByIngredientList(ingredients);
    res.json({ possibleDishes: suggestions });
  } catch (err) {
    console.error('Error in getSuggestedDishes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createDish = (req, res) => {
  try {
    const newDish = req.body;
    if (!newDish.name) {
      return res.status(400).json({ error: 'Dish name is required' });
    }
    const existing = dataService.getDishByName(newDish.name);
    if (existing) {
      return res.status(409).json({ error: 'Dish already exists' });
    }
    const createdDish = dataService.addDish(newDish);
    res.status(201).json(createdDish);
  } catch (err) {
    console.error('Error in createDish:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateDish = (req, res) => {
  try {
    const nameParam = decodeURIComponent(req.params.name);

    const updatedDish = dataService.updateDish(nameParam, req.body);
    if (!updatedDish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    res.json(updatedDish);
  } catch (err) {
    console.error('Error in updateDish:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteDish = (req, res) => {
  try {
    const nameParam = decodeURIComponent(req.params.name);

    const deleted = dataService.deleteDish(nameParam);
    if (!deleted) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    console.error('Error in deleteDish:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
