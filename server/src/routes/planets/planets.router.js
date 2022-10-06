const express = require('express');
const planetsController = require('./planets.controller');

const planetsRouter = express.Router();

planetsRouter.get('/', planetsController.getPlanets);

module.exports = planetsRouter;