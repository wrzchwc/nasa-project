const request = require('supertest');
const app = require('../../app');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo');
const {loadPlanetsData} = require("../../models/planets/planets.model");

const mission = 'mission';
const rocket = 'rocket';
const destination = 'Kepler-442 b';
const launchDate = 'September 1, 2022';

describe('/launches', () => {
    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('GET /launches', () => {
        test('Should respond with 200', async () => {
            const response = await request(app).get('/v1/launches').expect('Content-Type', /json/).expect(200);
        })
    });

    describe('POST /launches', () => {
        test('Should respond with 201', async () => {
            const launch = {mission, rocket, destination, launchDate};
            const response = await request(app).post('/v1/launches').send(launch).expect('Content-Type', /json/).expect(201);
            expect(response.body).toMatchObject({mission, rocket, destination});
            expect(response.body.launchDate).toEqual(new Date(launchDate).toISOString());
        });

        test('Should catch missing properties', async () => {
            const launch = {mission, rocket, destination};
            const response = await request(app).post('/v1/launches').send(launch).expect('Content-Type', /json/).expect(400);
            expect(response.body).toStrictEqual({error: 'Missing values'});
        });

        test('Should catch invalid dates', async () => {
            const launch = {mission, rocket, destination, launchDate: 'launchDate'};
            const response = await request(app).post('/v1/launches').send(launch).expect('Content-Type', /json/).expect(400);
            expect(response.body).toStrictEqual({error: 'Invalid launch date'});
        });
    });
});