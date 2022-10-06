const planetsModel = require("../../models/planets/planets.model");

async function getPlanets(_request, response) {
    return response.status(200).json(await planetsModel.getPlanets());
}

module.exports = {
    getPlanets,
};
