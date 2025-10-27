import { AuthController } from "../../src/controllers/AuthController.js";
import { CarController } from "../../src/controllers/CarController.js";
import {test, describe, expect, beforeEach, afterEach} from "@jest/globals";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { QAAPI_URL } from "../../src/consts/api.js";
import {faker} from "@faker-js/faker";

describe.skip("Get brand by id", ()=>{
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

    test("Check if any brand from list can be retrieved by id", async ()=>{
        const brandsListResp = await carController.getCarBrandsList();
        expect(brandsListResp.status).toBe(200);
        expect(brandsListResp.data.status).toBe("ok");

        const brands = brandsListResp.data.data;

        for (const brand of brands) {
            const brandByIdResp = await carController.getCarBrandById(brand.id);
            expect(brandByIdResp.status).toBe(200);
            expect(brandByIdResp.data.status).toBe("ok");
            expect(brandByIdResp.data.data).toEqual(brand);
        }
    });

    test("Check if non existing brand id cannot be retrieved", async()=>{
        const brandsListResp = await carController.getCarBrandsList();
        expect(brandsListResp.status).toBe(200);
        expect(brandsListResp.data.status).toBe("ok");

        const brands = brandsListResp.data.data;
        let brandIds = [];
        for (const brand of brands){
            brandIds.push(brand.id);
        }
        const newId = Math.max(...brandIds)+1;

        const brandByIdResp = await carController.getCarBrandById(newId);
        expect(brandByIdResp.status).toBe(404);
        expect(brandByIdResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
        });

    });

    test("Check if brand cannot be retrieved by other fields - title", async()=>{
        const brandsListResp = await carController.getCarBrandsList();
        expect(brandsListResp.status).toBe(200);
        expect(brandsListResp.data.status).toBe("ok");

        const brands = brandsListResp.data.data;
        for(const brand of brands){
            const brandByTitleResp = await carController.getCarBrandById(brand.title);
            expect(brandByTitleResp.status).toBe(404);
            expect(brandByTitleResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
            });
        }
    });

    test("Check if brand cannot be retrieved by other fields - logoFilename", async()=>{
        const brandsListResp = await carController.getCarBrandsList();
        expect(brandsListResp.status).toBe(200);
        expect(brandsListResp.data.status).toBe("ok");

        const brands = brandsListResp.data.data;
        for(const brand of brands){
            const brandByTitleResp = await carController.getCarBrandById(brand.logoFilename);
            expect(brandByTitleResp.status).toBe(404);
            expect(brandByTitleResp.data).toMatchObject({
            status: "error",
            message: expect.any(String)
            });
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