import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";

describe.skip("Get user cars", ()=>{
    const jar = new CookieJar();
    const apiClient = wrapper(axios.create({
        baseURL: QAAPI_URL,
        validateStatus: () => true,
        jar
    }));

    const authController = new AuthController(apiClient);
    const carController = new CarController(apiClient);
    let userPassword;
    let userData;

    const cars = [];

    beforeEach(async()=>{
        userPassword = `Ytuiwq${faker.number.int({min: 10, max:999999999})}`;
        userData = {
            name: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: userPassword,
            repeatPassword: userPassword
        };

        const userRegisterResp = await authController.registerUser(userData);
        expect(userRegisterResp.status).toBe(201);
        expect(userRegisterResp.data.status).toBe("ok");

        const userLoginResp = await authController.loginUser({
            email: userData.email,
            password: userPassword,
            remember: faker.datatype.boolean()
        });
        expect(userLoginResp.status).toBe(200);
        expect(userLoginResp.data.status).toBe("ok");
    });

    test("Check if all created by the user cars are in the list (by ids)", async() =>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carIds = [];
        
        for (let i = 0; i<=faker.number.int({min:1, max:5}); i++){
            const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];
            const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);
            const carData = {
                carBrandId: carBrand.id,
                carModelId: carModel.id,
                mileage: faker.number.int({min:1, max:999999})
            };
            const carCreationResp = await carController.createCar(carData);
            expect(carCreationResp.status).toBe(201);
            expect(carCreationResp.data.status).toBe("ok");
            cars.push(carCreationResp.data.data);
            carIds.push(carCreationResp.data.data.id);
        }
        
        const userCarsListResp = await carController.getUserCarsList();
        expect(userCarsListResp.status).toBe(200);
        expect(userCarsListResp.data.status).toBe("ok");
        const userCars = userCarsListResp.data.data;
        const userCarIds = [];

        for (const userCar of userCars){
            expect(carIds.includes(userCar.id)).toBeTruthy();
            userCarIds.push(userCar.id);
        }
        for (const car of cars){
            expect(userCarIds.includes(car.id)).toBeTruthy();
        }
    });

    test("Check the structure of the car in user cars list", async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);

        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);
        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min:0, max:999999})
        };

        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        cars.push(carCreationResp.data.data);

        const userCarsListResp = await carController.getUserCarsList();
        expect(userCarsListResp.status).toBe(200);
        expect(userCarsListResp.data.status).toBe("ok");
        expect(userCarsListResp.data.data[0]).toMatchObject({
            brand: expect.any(String),
            carBrandId: expect.any(Number),
            carCreatedAt: expect.any(String), 
            carModelId: expect.any(Number), 
            id: expect.any(Number), 
            initialMileage: expect.any(Number), 
            logo: expect.any(String), 
            mileage: expect.any(Number), 
            model: expect.any(String),
            updatedMileageAt: expect.any(String)
        });
    });

    afterEach(async ()=>{
        for (const car of cars){
            const deleteCarResp = await carController.deleteCar(car.id);
            expect(deleteCarResp.status).toBe(200);
            expect(deleteCarResp.data.status).toBe("ok");
            expect(deleteCarResp.data.data).toEqual({
                carId: car.id
            });
            cars.splice(cars.indexOf(car),1);
        }
        const logoutUserResp = await authController.logoutUser();
        expect(logoutUserResp.status).toBe(200);
        expect(logoutUserResp.data).toEqual({
            status: "ok"
        });
    });

});