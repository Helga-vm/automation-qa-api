import { BaseController } from "./BaseController.js";

export class CarController extends BaseController {
    getCarBrandsList(){
        return this.client.get("/api/cars/brands");
    }

    getCarBrandById(id){
        return this.client.get(`/api/cars/brands/${id}`);
    }

    getCarModelsList(){
        return this.client.get("/api/cars/models");
    }

    getCarModelById(id){
        return this.client.get(`/api/cars/models/${id}`);
    }

    getUserCarsList(){
        return this.client.get("/api/cars");
    }

    createCar(carData){
        return this.client.post("/api/cars",carData);
    }

    getCarById(id){
        return this.client.get(`/api/cars/${id}`);
    }

    updateCar(id, carData){
        return this.client.put(`/api/cars/${id}`,carData);
    }

    deleteCar(id){
        return this.client.delete(`/api/cars/${id}`);
    }
}