import axios from "axios";
import showAlert from "./alert";

const $ = document.querySelector.bind(document);

const url = window.location.origin;

export const updateUser = async (data, type = "user") => {
    try {
        const res = await axios({
            method: "PATCH",
            url: `${url}/api/v1/auth/update-me`,
            data,
        });
        if (res.data.status === "success" && type === "user") {
            showAlert("success", `DATA updated successfully!`);
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        } else if (res.data.status === "success" && type === "photo") {
            $(".form__user-photo").src = `/img/users/${res.data.user.photo}`;
        }
    } catch (err) {
        console.log(err);
        showAlert("error", err.response?.data?.message || "Updated fail!");
    }
};

export const updatePassword = async (data) => {
    try {
        const res = await axios({
            method: "PATCH",
            url: `${url}/api/v1/auth/update-password`,
            data,
        });
        if (res.data.status === "success") {
            showAlert("success", `PASSWORD updated successfully!`);
        }
    } catch (err) {
        console.log(err);
        showAlert("error", err.response?.data?.message || "Updated fail!");
    }
};
