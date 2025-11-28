import { BaseController } from "./BaseController.js";

export class AuthController extends BaseController{
    registerUser(userData){
        return this.client.post("/api/auth/signup", userData);
    }

    loginUser(userCreds){
        return this.client.post("/api/auth/signin", userCreds);
    }

    logoutUser(){
        return this.client.get("/api/auth/logout");
    }

    deleteUser(){
        return this.client.delete("/api/users");
    }
}