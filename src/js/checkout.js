import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const myCheckout = new CheckoutProcess("so-cart", ".order-summary");
myCheckout.init();
myCheckout.calculateOrderTotal();

document.querySelector("#checkoutSubmit").addEventListener("click", (e) => {
    e.preventDefault();
    const myForm = document.forms["checkout"];
    const chk = myForm.checkValidity();
    myForm.reportValidity();
    if (chk) {
        myCheckout.checkout();
    }
});
