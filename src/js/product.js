import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

const productId = getParam("product") || document.getElementById("addToCart")?.dataset?.id;
const dataSource = new ProductData();
const product = new ProductDetails(productId, dataSource);
product.init();
