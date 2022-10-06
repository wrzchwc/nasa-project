const launchesModel = require('../../models/launches/launches.model');
const {getPagination} = require('../../services/query');

async function getLaunches(request, response) {
    const {skip, limit} = getPagination(request.query);
    return response.status(200).json(await launchesModel.getLaunches(skip, limit));
}

async function addLaunch(request, response) {
    const launch = request.body;
    if(!(launch.mission && launch.rocket && launch.launchDate && launch.destination)) {
        return response.status(400).json({error: 'Missing values'})
    }
    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate.valueOf())){
        return response.status(400).json({error: 'Invalid launch date'})
    }
    await launchesModel.addLaunch(launch);
    return response.status(201).json(launch);
}

async function abortLaunch(request, response) {
    const id = Number(request.params.id);
    if (!(await launchesModel.existsLaunch(id))) {
        return response.status(404).json({error: 'Launch not found'});
    }
    const aborted = await launchesModel.abortLaunch(id);
    if(!aborted) {
        return response.status(400).json({error: 'Launch not aborted'})
    }
    return response.status(200).json({ok: true});
}

module.exports = {getLaunches, addLaunch, abortLaunch};