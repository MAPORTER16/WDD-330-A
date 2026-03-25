import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

loadHeaderFooter();

const productId = getParam("product") || document.getElementById("addToCart")?.dataset?.id;
const dataSource = new ExternalServices();
const product = new ProductDetails(productId, dataSource);
product.init();
