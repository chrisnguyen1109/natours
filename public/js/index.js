import "@babel/polyfill";
import mapService from "./mapbox";
import { login, logout } from "./login";
import { updateUser, updatePassword } from "./updateSettings";
import executeApi from "./executeApi";
import bookTour from "./stripe";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const mapBox = $("#map");
const loginForm = $(".form--login");
const logOutBtn = $(".nav__el--logout");
const userDataForm = $(".form-user-data");
const userPasswordForm = $(".form-user-password");
const bookBtn = $("#book-tour");

if (mapBox) {
    const locationsData = mapBox.dataset.locations;
    const locations = JSON.parse(locationsData);

    mapService.displayMap(locations);
}

loginForm && executeApi(loginForm, "btn--save-login", "Logging...", login, "login");

userDataForm &&
    executeApi(userDataForm, "btn--save-settings", "Updating data...", updateUser, "updateUser");

if (userDataForm) {
    const formUpload = $(".form__upload");
    formUpload.addEventListener("change", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("photo", $("#photo").files[0]);
        await updateUser(formData, "photo");
    });
}

userPasswordForm &&
    executeApi(
        userPasswordForm,
        "btn--save-password",
        "Updating password...",
        updatePassword,
        "updatePassword"
    );

if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
        // e.target.closest("#book-tour").innerHTML = "Processing...";
        $("#book-tour").innerHTML = "Processing...";
        $("#book-tour").disabled = true;
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener("click", logout);
}
