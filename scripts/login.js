const form = document.querySelector("#input-form");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const notification = document.querySelector(".notification");
let userobject = {};
import { validate } from "./userobject.js";

form.addEventListener("submit", (e) => {
    e.preventDefault();
    validate(username.value, password.value).then((value) => {
        if (value == false) {
            console.log("no user object found");
            notification.style.color = "red";
            notification.innerHTML = "User Not found";
        } else {
            //user found
            console.log("user object", value);
            //redirect to home page
            userobject = value;
            localStorage.clear();
            localStorage.setItem("id", value.id);
            location.href = "home.html";
        }
    });
});