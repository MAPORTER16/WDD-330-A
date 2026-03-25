import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function packageItems(items) {
    return items.map((item) => ({
        id: item.Id,
        name: item.Name,
        price: item.FinalPrice,
        quantity: item.Quantity || 1,
    }));
}

export default class CheckoutProcess {
    constructor(key, outputSelector) {
        this.key = key;
        this.outputSelector = outputSelector;
        this.list = [];
        this.itemTotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.orderTotal = 0;
    }

    init() {
        this.list = getLocalStorage(this.key) || [];
        this.calculateItemSummary();
    }

    calculateItemSummary() {
        const summaryElement = document.querySelector(
            this.outputSelector + " #cartTotal"
        );
        const itemNumElement = document.querySelector(
            this.outputSelector + " #num-items"
        );
        this.itemTotal = this.list.reduce(
            (total, item) => total + item.FinalPrice * (item.Quantity || 1),
            0
        );
        const totalItems = this.list.reduce((sum, item) => sum + (item.Quantity || 1), 0);
        itemNumElement.textContent = totalItems;
        summaryElement.textContent = `$${this.itemTotal.toFixed(2)}`;
    }

    calculateOrderTotal() {
        const totalItems = this.list.reduce((sum, item) => sum + (item.Quantity || 1), 0);
        this.shipping = totalItems > 0 ? 10 + (totalItems - 1) * 2 : 0;
        this.tax = (this.itemTotal * 0.06).toFixed(2);
        this.orderTotal = (
            parseFloat(this.itemTotal) +
            parseFloat(this.shipping) +
            parseFloat(this.tax)
        ).toFixed(2);

        this.displayOrderTotals();
    }

    displayOrderTotals() {
        const shipping = document.querySelector(
            this.outputSelector + " #shipping-estimate"
        );
        const tax = document.querySelector(this.outputSelector + " #tax");
        const orderTotal = document.querySelector(
            this.outputSelector + " #order-total"
        );
        shipping.textContent = `$${this.shipping.toFixed(2)}`;
        tax.textContent = `$${this.tax}`;
        orderTotal.textContent = `$${this.orderTotal}`;
    }

    async checkout() {
        const formElement = document.forms["checkout"];

        const payload = {
            orderDate: new Date(),
            fname: formElement.fname.value,
            lname: formElement.lname.value,
            street: formElement.street.value,
            city: formElement.city.value,
            state: formElement.state.value,
            zip: formElement.zip.value,
            cardNumber: formElement.cardNumber.value,
            expiration: formElement.expiration.value,
            code: formElement.code.value,
            items: packageItems(this.list),
            orderTotal: this.orderTotal,
            shipping: this.shipping,
            tax: this.tax,
        };

        try {
            const result = await services.checkout(payload);
            console.log(result);
            setLocalStorage("so-cart", []);
            location.assign("/checkout/success.html");
        } catch (err) {
            // Remove any existing alerts before displaying new ones
            document.querySelectorAll(".alert").forEach((alert) => alert.remove());

            if (err.name === "servicesError") {
                const messages = err.message;
                if (typeof messages === "object") {
                    // The server may return an object with a message property or an array
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => alertMessage(msg));
                    } else if (messages.message) {
                        alertMessage(messages.message);
                    } else {
                        // Try to display all values from the error object
                        Object.values(messages).forEach((msg) => alertMessage(msg));
                    }
                } else {
                    alertMessage(messages);
                }
            } else {
                alertMessage("There was a problem with your order. Please try again.");
            }
        }
    }
}
