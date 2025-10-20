import {test,expect,describe} from "@jest/globals";
import axios from "axios";
import { API_URL } from "../src/consts/api";

const apiClient = axios.create({
        baseURL: API_URL,
        validateStatus: () => true
    });

const newPost = {
    title: 'Post one',
    body: 'This is new post created for api check',
    userId: 13
};

test("Check if the post is created", async ()=>{
    const response = await apiClient.post('/posts', newPost);
    expect(response.status).toBe(201);

    expect(response.data).toMatchObject({
        id: expect.any(Number),
        ...newPost
    });
    
})