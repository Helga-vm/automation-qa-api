import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";

describe.skip("Get list of all models",()=>{
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

    test("Check retrieving models list", async()=>{
        const modelsListResp = await carController.getCarModelsList();
        expect(modelsListResp.status).toBe(200);
        expect(modelsListResp.data.status).toBe("ok");
    });

    test("Check if all models in the list has expected structure", async()=>{
        const modelsListResp = await carController.getCarModelsList();
        expect(modelsListResp.status).toBe(200);
        expect(modelsListResp.data.status).toBe("ok");

        const models = modelsListResp.data.data;
        for (const model of models){
            expect(model).toEqual({
                id: expect.any(Number),
                title: expect.any(String),
                carBrandId: expect.any(Number)
            });
        }
    });

    test("Check if all models are assigned to existing brands", async()=>{
        const brandsListResp = await carController.getCarBrandsList();
        expect(brandsListResp.status).toBe(200);
        expect(brandsListResp.data.status).toBe("ok");
        const brands = brandsListResp.data.data;
        let brandIds = [];
        for (const brand of brands){
            brandIds.push(brand.id);
        }
        
        const modelsListResp = await carController.getCarModelsList();
        expect(modelsListResp.status).toBe(200);
        expect(modelsListResp.data.status).toBe("ok");
        const models = modelsListResp.data.data;

        for(const model of models){
            expect(brandIds.includes(model.carBrandId)).toBe(true);
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