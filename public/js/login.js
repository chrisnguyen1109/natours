import axios from "axios";
import showAlert from "./alert";

const url = window.location.origin;

export const logout = async () => {
    try {
        const res = await axios({
            method: "GET",
            url: `${url}/api/v1/auth/logout`,
        });
        if (res.data.status === "success") location.reload();
    } catch (err) {
        console.log(err);
        showAlert("error", "Error logging out! Try again.");
    }
};

export const login = async (data) => {
    try {
        const response = await axios({
            method: "POST",
            url: `${url}/api/v1/auth/login`,
            data,
        });

        if (response.data?.status === "success") {
            showAlert("success", "Logged in successfully!");
            window.setTimeout(() => {
                location.assign("/");
            }, 500);
        }
    } catch (err) {
        console.log(err);
        showAlert("error", err.response?.data?.message || "Unknow error!");
    }
};
