import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";

describe.skip("Get user car by id", ()=>{
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
        userPassword = `Ytuiwq${faker.number.int({min: 10, max:9999999})}`;
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

    test("Check if created car can be retrieved by id",async()=>{
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
        
        const carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);
        expect(carRetrieveByIdResp.data.status).toBe("ok");
        expect(carRetrieveByIdResp.data.data).toMatchObject({
            ...car      
        });
    });

    test("Check if created by other user car can be retrieved by id",async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];
        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min:0, max:999999})
        };
        
        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;
        
        const carRetrieveByIdResp = await carController.getCarById(car.id-1);
        expect(carRetrieveByIdResp.status).toBe(404);
        expect(carRetrieveByIdResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
    });

    test("Check if non-existing car can be retrieved by id",async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];
        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min:0, max:999999})
        };
        
        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;
        
        const carRetrieveByIdResp = await carController.getCarById(car.id+1);
        expect(carRetrieveByIdResp.status).toBe(404);
        expect(carRetrieveByIdResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
    });

    test("Check if car can be retrieved by other fields data",async()=>{
        const carBrandResp = await carController.getCarBrandsList();
        expect(carBrandResp.status).toBe(200);
        const carBrand = carBrandResp.data.data[faker.number.int({min:0, max: carBrandResp.data.data.length-1})];
        const carModelResp = await carController.getCarModelsList();
        expect(carModelResp.status).toBe(200);
        const carModel = carModelResp.data.data.find((model)=> model.carBrandId === carBrand.id);

        const carData = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min:0, max:999999})
        };
        
        const carCreationResp = await carController.createCar(carData);
        expect(carCreationResp.status).toBe(201);
        expect(carCreationResp.data.status).toBe("ok");
        car = carCreationResp.data.data;
        
        const carRetrieveByIdResp1 = await carController.getCarById(car.brand);
        expect(carRetrieveByIdResp1.status).toBe(404);
        expect(carRetrieveByIdResp1.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });

        const carRetrieveByIdResp2 = await carController.getCarById(car.carCreatedAt);
        expect(carRetrieveByIdResp2.status).toBe(404);
        expect(carRetrieveByIdResp2.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });

        const carRetrieveByIdResp3 = await carController.getCarById(car.logo);
        expect(carRetrieveByIdResp3.status).toBe(404);
        expect(carRetrieveByIdResp3.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });

        const carRetrieveByIdResp4 = await carController.getCarById(car.model);
        expect(carRetrieveByIdResp4.status).toBe(404);
        expect(carRetrieveByIdResp4.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });

        const carRetrieveByIdResp5 = await carController.getCarById(car.updatedMileageAt);
        expect(carRetrieveByIdResp5.status).toBe(404);
        expect(carRetrieveByIdResp5.data).toMatchObject({
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