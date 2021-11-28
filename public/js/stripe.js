import axios from "axios";
import showAlert from "./alert";
const stripe = Stripe(
    "pk_test_51K0fS6DLUvUWpZhT76rW8JBD2cVVgXgCXVQ2gxljHFyArZwNdhmT5Ee1c2M8UvGFIiB59mAVauIOaGW15E9lnUuz00eoyFJAc4"
);

const url = window.location.origin;

export default async (tourId) => {
    try {
        const session = await axios({
            method: "GET",
            url: `/api/v1/bookings/checkout-session/${tourId}`,
        });

        if (session.data.status === "success") {
            await stripe.redirectToCheckout({
                sessionId: session.data.session.id,
            });
        }
    } catch (err) {
        console.log(err);
        showAlert("error", err.response?.data?.message || "Unknow error!");
    }
};
