import {test,expect,describe} from "@jest/globals";
import axios from "axios";
import { API_URL } from "../src/consts/api";

const apiClient = axios.create({
        baseURL: API_URL,
        validateStatus: () => true
    });
const postId = 12;
const replacementPost1 = {
    title: "Replacement post",
    body: "New body to replace existing one",
    userId: 14
};
const replacementPost2 = {
    title: "Shortened post",
    userId: 13
};

describe("Replacement post checks", ()=>{
    test("Check replacement with all-fields-object",async () =>{
        const response = await apiClient.put(`/posts/${postId}`,replacementPost1);

        expect(response.status).toBe(200);

        expect(response.data).toMatchObject({
            id: postId,
            ...replacementPost1
        });
    });

    test("Check replacement with some-fields-object", async () =>{
        const response = await apiClient.put(`/posts/${postId}`,replacementPost2);

        expect(response.status).toBe(200);

        expect(response.data).toMatchObject({
            id: postId,
            ...replacementPost2
        });
    });
});

