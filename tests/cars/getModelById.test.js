import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";

describe.skip("Get model by id", ()=>{
    const jar = new CookieJar();
    const apiClient = wrapper(axios.create({
        baseURL: QAAPI_URL,
        validateStatus: () => true,
        jar
    }));

    let userPassword;
    let userData;
    const authController = new AuthController(apiClient);
    const carController = new CarController(apiClient);

    beforeEach(async()=>{
        userPassword = `Ytrewq${faker.number.int({min: 10, max:999999999})}`;
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

    test("Check if any model from list can be retrieved by id", async ()=>{
        const modelsListResp = await carController.getCarModelsList();
        expect(modelsListResp.status).toBe(200);
        expect(modelsListResp.data.status).toBe("ok");

        const models = modelsListResp.data.data;

        for (const model of models) {
            const modelByIdResp = await carController.getCarModelById(model.id);
            expect(modelByIdResp.status).toBe(200);
            expect(modelByIdResp.data.status).toBe("ok");
            expect(modelByIdResp.data.data).toEqual(model);
        }
    });

    test("Check if non existing model id cannot be retrieved", async()=>{
        const modelsListResp = await carController.getCarModelsList();
        expect(modelsListResp.status).toBe(200);
        expect(modelsListResp.data.status).toBe("ok");

        const models = modelsListResp.data.data;
        let modelIds = [];
        for (const model of models){
            modelIds.push(model.id);
        }
        const newId = Math.max(...modelIds)+1;

        const modelByIdResp = await carController.getCarModelById(newId);
        expect(modelByIdResp.status).toBe(404);
        expect(modelByIdResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });

    });

    test("Check if model cannot be retrieved by other fields - title", async()=>{
        const modelsListResp = await carController.getCarModelsList();
        expect(modelsListResp.status).toBe(200);
        expect(modelsListResp.data.status).toBe("ok");

        const models = modelsListResp.data.data;
        for(const model of models){
            if(Number(model.title) != model.title){
                const modelByTitleResp = await carController.getCarModelById(model.title);
                expect(modelByTitleResp.status).toBe(404);
                expect(modelByTitleResp.data).toMatchObject({
                    status: "error",
                    message: expect.any(String)
                });
            }
        }
    });

    afterEach(async ()=>{
        const logoutUserResp = await authController.logoutUser();
        expect(logoutUserResp.status).toBe(200);
        expect(logoutUserResp.data).toEqual({
            status: "ok"
        });
    });
});