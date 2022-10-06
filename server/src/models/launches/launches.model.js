const launches = require('./launches.mongo');
const planets = require('../planets/planets.mongo');
const axios = require('axios');

const SPACE_X_URL = 'https://api.spacexdata.com/v5/launches/query';

async function getLaunches(skip, limit) {
    const l = await launches.find({}, {'_id': 0, '__v': 0}).sort({flightNumber: 1}).skip(skip).limit(limit)
    return Array.from(l);
}

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({flightNumber: launch.flightNumber}, launch, {upsert: true});
}

async function addLaunch(launch) {
    const planet = await planets.findOne({keplerName: launch.destination});
    if (!planet) {
        throw new Error('No matching planets found!');
    }

    const source = {
        success: true,
        upcoming: true,
        customer: ['Zero to Maestry', 'Nasa'],
        flightNumber: await getLatestFlightNumber() + 1
    };
    await saveLaunch(Object.assign(launch, source))
}

async function existsLaunch(id) {
    return await findLaunch({flightNumber: id});
}

async function abortLaunch(launchId) {
    const filter = {flightNumber: launchId};
    const update = {upcoming: false, success: false};
    const {modifiedCount} = await launches.updateOne(filter, update);
    return modifiedCount;
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches.findOne().sort('-flightNumber');
    if (!latestLaunch) {
        return 0;
    }
    return latestLaunch.flightNumber;
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({flightNumber: 1, rocket: "Falcon 1", mission: 'FalconSat'});
    if (firstLaunch) {
        console.log('Launch data ready')
        return;
    }
    await populateLaunches();
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function populateLaunches() {
    const postData = {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    };
    const {data, status} = await axios.post(SPACE_X_URL, postData);
    if (status !== 200) {
        throw new Error('Launch data download failed!;')
    }
    for (const doc of data.docs) {
        const launch = {
            flightNumber: doc['flight_number'],
            mission: doc['name'],
            rocket: doc['rocket']['name'],
            launchDate: doc['date_local'],
            upcoming: doc['upcoming'],
            success: doc['success'],
            customer: doc['payloads'].flatMap((payload) => payload['customers'])
        };
        await saveLaunch(launch);
    }
}

module.exports = {getLaunches, addLaunch, existsLaunch, abortLaunch, loadLaunchData};