// src/routes/dishRoutes.js
const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

router.get('/', dishController.getAllDishes);
router.get('/:name', dishController.getDishByName);
router.post('/suggest', dishController.getSuggestedDishes);

router.post('/', dishController.createDish);
router.put('/:name', dishController.updateDish);
router.delete('/:name', dishController.deleteDish);

module.exports = router;
