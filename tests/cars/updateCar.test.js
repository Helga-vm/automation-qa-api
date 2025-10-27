import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";
import { invalidCarStructure, invalidCarData, invalidCarDataLimits } from "../../src/fixtures/invalidCars.js";
import { validCarsData } from "../../src/fixtures/validCars.js";

describe.skip("Update car", ()=>{
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

    test("Should be possible to update car with valid data", async() =>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];

        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: 5
        };
        
        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;

        for (const validCar of validCarsData){

            const carUpdateResp = await carController.updateCar(car.id, validCar);
            expect(carUpdateResp.status).toBe(200);
            expect(carUpdateResp.data.status).toBe("ok");
            const newBrandResp = await carController.getCarBrandById(validCar.carBrandId);
            expect(newBrandResp.status).toBe(200);
            const newModelResp = await carController.getCarModelById(validCar.carModelId);
            expect(newModelResp.status).toBe(200);            
            expect(carUpdateResp.data.data).toMatchObject({
                id: car.id,
                carBrandId: validCar.carBrandId,
                carModelId: validCar.carModelId,
                initialMileage: car.initialMileage,
                updatedMileageAt: expect.any(String),
                mileage: validCar.mileage,
                brand: newBrandResp.data.data.title,
                model: newModelResp.data.data.title,
                logo: newBrandResp.data.data.logoFilename
            });

            const carRetrieveResp = await carController.getCarById(carUpdateResp.data.data.id);
            expect(carRetrieveResp.status).toBe(200);
            expect(carRetrieveResp.data.status).toBe("ok");
            expect(carRetrieveResp.data.data).toEqual(carUpdateResp.data.data);
        }
    });

    test("Check if updating a car with partial input structure is possible", async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];

        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: 1
        };

        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;

        for (const updateCar of invalidCarStructure){
            const carUpdateResp = await carController.updateCar(car.id, updateCar);
            expect(carUpdateResp.status).toBe(200);
            expect(carUpdateResp.data.status).toBe("ok");
        }
    });

    test("Check if updating a car with invalid input values is impossible", async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];

        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: 1
        };

        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;
        for (const invalidCar of invalidCarData){
            const carUpdateResp = await carController.updateCar(car.id,invalidCar);
            expect(carUpdateResp.status).toBe(400);
            expect(carUpdateResp.data).toMatchObject({
                status: "error",
                message: expect.any(String)
            });
        }
    });

    test("Check if updating a car with invalid input limits is impossible", async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];

        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: 1
        };

        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;
        for (const invalidCar of invalidCarDataLimits){
            const carUpdateResp = await carController.updateCar(car.id,invalidCar);
            expect(carUpdateResp.status).toBe(404);
            expect(carUpdateResp.data).toMatchObject({
                status: "error",
                message: expect.any(String)
            });
        }
    });

    test("Check if updating a car with milage less than previous is impossible", async()=>{
        const carData = {
            carBrandId: 1,
            carModelId: 3,
            mileage: 10
        };

        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;

        const invalidCar ={
            carBrandId: 1,
            carModelId: 3,
            mileage: 5
        };
        
        const carUpdateResp = await carController.updateCar(car.id,invalidCar);
        expect(carUpdateResp.status).toBe(400);
        expect(carUpdateResp.data).toMatchObject({
                status: "error",
                message: expect.any(String)
            });
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


