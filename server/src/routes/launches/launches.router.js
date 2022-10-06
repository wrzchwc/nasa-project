const express = require('express');
const launchesController = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', launchesController.getLaunches);
launchesRouter.post('/', launchesController.addLaunch);
launchesRouter.delete('/:id', launchesController.abortLaunch)

module.exports = launchesRouter;