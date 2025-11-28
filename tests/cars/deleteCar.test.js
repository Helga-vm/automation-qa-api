import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";

describe.skip("Delete user car by id", ()=>{
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

    test("Check if created car can be deleted by id",async()=>{
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

        let carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);

        const carDeleteResp = await carController.deleteCar(car.id);
        expect(carDeleteResp.status).toBe(200);
        expect(carDeleteResp.data.status).toBe("ok");
        expect(carDeleteResp.data.data).toEqual({
            carId: car.id
        });
        
        carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(404);
        expect(carRetrieveByIdResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        car = undefined;
    });

    test("Check if non-existing car can be deleted by id",async()=>{
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

        const carDeleteResp = await carController.deleteCar(car.id+1);
        expect(carDeleteResp.status).toBe(404);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
    });

    test("Check if car can be deleted by other fields data",async()=>{
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

        let carDeleteResp = await carController.deleteCar(car.brand);
        expect(carDeleteResp.status).toBe(400);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        let carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);

        carDeleteResp = await carController.deleteCar(car.carCreatedAt);
        expect(carDeleteResp.status).toBe(400);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);

        carDeleteResp = await carController.deleteCar(car.logo);
        expect(carDeleteResp.status).toBe(400);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);

        carDeleteResp = await carController.deleteCar(car.logo);
        expect(carDeleteResp.status).toBe(400);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);

        carDeleteResp = await carController.deleteCar(car.model);
        expect(carDeleteResp.status).toBe(400);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);

        carDeleteResp = await carController.deleteCar(car.updatedMileageAt);
        expect(carDeleteResp.status).toBe(400);
        expect(carDeleteResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });
        carRetrieveByIdResp = await carController.getCarById(car.id);
        expect(carRetrieveByIdResp.status).toBe(200);
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