const {parse} = require("csv-parse");
const {createReadStream} = require("fs");
const path = require('path');
const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return (
        planet["koi_disposition"] === "CONFIRMED" &&
        planet["koi_insol"] > 0.36 &&
        planet["koi_insol"] < 1.11 &&
        planet["koi_prad"] < 1.6
    );
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        createReadStream(path.join(__dirname, '..', '..','data', 'kepler-data.csv'))
            .pipe(parse({comment: "#", columns: true}))
            .on("data", async (planet) => {
                if (isHabitablePlanet(planet)) {
                    await savePlanet(planet)
                }
            })
            .on("error", (error) => {
                reject(error);
            })
            .on('end', async () => {
                resolve();
            })
    });
}

async function getPlanets() {
    return planets.find({}, {'_id': 0, '__v': 0});
}

async function savePlanet(planet){
    try {
        await planets.updateOne(
            {keplerName: planet.kepler_name},
            {keplerName: planet.kepler_name},
            {upsert: true}
        );
    } catch (error) {
        console.log(`Could not save planet ${error}`);
    }
}

module.exports = {
    getPlanets,
    loadPlanetsData
};
