import {test,expect,describe} from "@jest/globals";
import axios from "axios";
import { API_URL } from "../src/consts/api";

const apiClient = axios.create({
        baseURL: API_URL,
        validateStatus: () => true
    });

const newBody = {
    body: "New body to replace existing one"
};

test("Check if changes to post are applied",async () =>{
    const postId = 12;
    const response = await apiClient.patch(`/posts/${postId}`,newBody);

    expect(response.status).toBe(200);

    expect(response.data).toMatchObject({
        id: postId,
        title: expect.any(String),
        userId: expect.any(Number),
        ...newBody
    });
});