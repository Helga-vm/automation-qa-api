import {test,expect} from "@jest/globals";
import axios from "axios";
import { API_URL } from "../src/consts/api";

const apiClient = axios.create({
        baseURL: API_URL,
        validateStatus: () => true
    });

test("Check if post with the ID exists", async () =>{
    const postId = 1;

    const response = await apiClient.get(`posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
        id: postId,
        title: expect.any(String),
        body: expect.any(String),
        userId: expect.any(Number)
    }); 
});