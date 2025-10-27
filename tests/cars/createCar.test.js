import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";
import { invalidCarStructure, invalidCarData, invalidCarDataLimits } from "../../src/fixtures/invalidCars.js";

describe.skip("Create car", ()=>{
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

    let car;

    beforeEach(async()=>{
        userPassword = `Ytuloq${faker.number.int({min: 10, max:99999})}`;
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

    test("Should be possible to create new car with valid data", async() =>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];

        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min:1, max:999999})
        };
        
        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;

        expect(car).toMatchObject({
            id: expect.any(Number),
            initialMileage: carData.mileage,
            updatedMileageAt: expect.any(String),
            brand: carBrand.title,
            model: carModel.title,
            logo: carBrand.logoFilename,
            ...carData
        });

        const carRetrieveResp = await carController.getCarById(carCreationResp.data.data.id);
        expect(carRetrieveResp.status).toBe(200);
        expect(carRetrieveResp.data.status).toBe("ok");
        expect(carRetrieveResp.data.data).toEqual(car);
    });

    test("Check if new car with invalid input structure creation is impossible", async()=>{
        for (const invalidCar of invalidCarStructure){
            const carCreationResp = await carController.createCar(invalidCar);
            expect(carCreationResp.status).toBe(400);
            expect(carCreationResp.data).toMatchObject({
                status: "error",
                message: expect.any(String)
            });
        }
    });

    test("Check if new car with invalid input values creation is impossible", async()=>{
        for (const invalidCar of invalidCarData){
            const carCreationResp = await carController.createCar(invalidCar);
            expect(carCreationResp.status).toBe(400);
            expect(carCreationResp.data).toMatchObject({
                status: "error",
                message: expect.any(String)
            });
        }
    });

    test("Check if new car with invalid input limits creation is impossible", async()=>{
        for (const invalidCar of invalidCarDataLimits){
            const carCreationResp = await carController.createCar(invalidCar);
            expect(carCreationResp.status).toBe(404);
            expect(carCreationResp.data).toMatchObject({
                status: "error",
                message: expect.any(String)
            });
        }
    });

    afterEach(async ()=>{
        if(car !== undefined){
            const deleteCarResp = await carController.deleteCar(car.id);
            expect(deleteCarResp.status).toBe(200);
            expect(deleteCarResp.data.status).toBe("ok");
            expect(deleteCarResp.data.data).toEqual({
                carId: car.id
            });
            car = undefined;
        }
        const logoutUserResp = await authController.logoutUser();
        expect(logoutUserResp.status).toBe(200);
        expect(logoutUserResp.data).toEqual({
            status: "ok"
        });
    });

});


