//https://medium.com/codex/global-variables-and-javascript-modules-ce674a869164

//      <------------variable declartions-------->

const closeCart = document.querySelector(".close");
const cardContainer = document.querySelector(".cart-container");
const middle = document.querySelector(".middle");
const cartButton = document.querySelector("#cart");
const products = document.querySelector(".products");
const dropdown = document.querySelector("#sort");
const searchInput = document.querySelector("#search");
const user = document.querySelector(".user");
const userId = localStorage.getItem("id"); //for this time using id from a local storage.
const sectionProducts = document.querySelector(".products");
const cartProducts = document.querySelector(".cart-products");
let fetchUserObject = {}; // user object from fetch
let fetchUserCart = {}; // user cart from fetch
let wholeProduct = []; // array of avaible product object
let cartArray = [];
let userCart = {};

class cart {
    constructor(userId, productArray) {
        this.userId = userId;
        this.productArray = productArray;
        this.totalCost = 0;
        this.updateTotalCost();
    }
    updateTotalCost = () => {
        let cost = 0;
        this.productArray.forEach((element) => {
            cost = cost + element.productObject.price * element.quantity;
        });
        this.totalCost = getReduced(cost);
    };
}

// <------- function definition ----------->

const getUserDetails = async(userId) => {
    // for get the user and cart object for particular id
    //   console.log("getting user details for id - ", userId);
    const userResponse = await fetch(`https://fakestoreapi.com/users/${userId}`);
    console.log("got userResponse");
    const userCartResponse = await fetch(
        `https://fakestoreapi.com/carts/${userId}`
    );
    //   console.log("got cartResponse");
    const userResponseJson = await userResponse.json();
    const userCartResponseJson = await userCartResponse.json();
    //   console.log("user Object", userResponseJson);
    //   console.log("userCart Object", userCartResponseJson);
    return { userResponseJson, userCartResponseJson };
};

// function gets a number returns float with 2 percision with number typeof
//round off the price product
const getReduced = (num) => +Number.parseFloat(num).toFixed(2);

// function gets a product object {id,quantity} array and return product object {id,cost,title,catergory etc..} array
const getProductDetails = async(array) => {
    let i = 0;
    const PromiseMap = array.map((element) => {
        return fetch(`https://fakestoreapi.com/products/${element.productId}`);
    });

    const response = await Promise.all([...PromiseMap]);

    const responseJson = await Promise.all([
        ...response.map((element) => element.json()),
    ]);
    const mappedJson = responseJson.map((element) => {
        const object = {};
        object.productObject = element;
        object.quantity = array[i++].quantity;
        object.productTotalCost = getReduced(element.price * object.quantity);
        return object;
    });
    //console.log("product object", mappedJson);
    return mappedJson;
};

const buildCart = (cartObject) => {
    console.log("building cart");
    cartProducts.innerHTML = "";
    cartObject.productArray.forEach((object) => {
        console.log(object);
        const element = object.productObject;

        const div = document.createElement("div");
        div.className = "single-cart-product";
        const content = `
                      <div class="img">
                            <img  src="${element.image}" alt="">
                        </div>
                        <div class="title">
                           ${element.title}
                        </div>
                        <div class="quantity">
                            Quantity - ${object.quantity}
                        </div>
                        <div class="total-cost">
                            Cost - $  ${object.productTotalCost}
                        </div>
                        `;
        div.setAttribute("id", element.id);
        div.innerHTML = content;
        cartProducts.appendChild(div);
    });
    //   console.log(cartObject.totalCost);
    //   console.log("done cart building");
};

const getProducts = async() => {
    console.log("getting all avaiable products from the API");
    const response = await fetch("https://fakestoreapi.com/products");
    const products = await response.json();
    //   console.log("got all products");
    wholeProduct = [...products];
    return products;
};

const getProductObject = (id) => {
    //returns product object for the particular id from the wholeProduct
    let object = {};
    wholeProduct.forEach((element) => {
        if (element.id == id) {
            object = element;
        }
    });
    return object;
    //console.log(wholeProduct);
};
const add = (object) => {
    //   console.log("adding product");
    let add = false;
    const selectedProduct = getProductObject(object.id);
    // console.log(selectedProduct);
    console.log(userCart.productArray);
    userCart.productArray.forEach((element) => {
        if (element.productObject.id == selectedProduct.id) {
            //   console.log("element to be increamented", element, element.quantity);
            const inc = element.quantity;
            element.quantity = inc + 1;
            element.productTotalCost = getReduced(
                element.quantity * element.productObject.price
            );
            add = true;
            //   console.log(element.quantity, "increamented");
        }
    });
    if (add == false) {
        // console.log("not presented", selectedProduct);
        const object = {};
        object.productObject = selectedProduct;
        object.quantity = 1;
        object.productTotalCost = selectedProduct.price;
        userCart.productArray.push(object);
    }
    //   console.log("product array", userCart.productArray);
    buildCart(userCart);
};
const sub = (object) => {
    console.log("removing product");
    let sub = false;
    const selectedProduct = getProductObject(object.id);
    // console.log(selectedProduct);
    console.log(userCart.productArray);
    userCart.productArray.forEach((element) => {
        if (element.productObject.id == selectedProduct.id) {
            if (element.quantity > 1) {
                // console.log("element to be decreamented", element, element.quantity);
                const des = element.quantity;
                element.quantity = des - 1;
                element.productTotalCost = getReduced(
                    element.quantity * element.productObject.price
                );
                console.log(element.quantity, "decremented");
                sub = true;
            } else if (element.quantity == 1) {
                userCart.productArray = [
                    ...userCart.productArray.filter((element) => {
                        return element.productObject.id != selectedProduct.id;
                    }),
                ];
            } else console.log("element is not presented");
        }
        if (sub === false) console.log("the object is not presented");
    });

    //   console.log("product array", userCart.productArray);
    buildCart(userCart);
};

function setName() {
    //   console.log("setting name");
    const Username = `${fetchUserObject.name.firstname} ${fetchUserObject.name.lastname}`;
    document.querySelector("#name").innerHTML = Username;
}

//sorting - sort function will collect the .single-products and sort based on the sort.value
const sort = (value) => {
    value = value.toLowerCase();
    //   console.log(value);
    const productsHtml = [...document.querySelectorAll(".single-products")];
    const productsId = productsHtml.map((value) => value.id);
    const localWholeProduct = productsId.map((value) => getProductObject(value));
    //   console.log(localWholeProduct);
    if (value == "rating") {
        localWholeProduct.sort((firstElement, secondElement) => {
            return secondElement.rating.rate - firstElement.rating.rate;
        });
    } else if (value == "stocks") {
        localWholeProduct.sort((firstElement, secondElement) => {
            return secondElement.rating.count - firstElement.rating.count;
        });
    } else if (value == "price") {
        localWholeProduct.sort((firstElement, secondElement) => {
            return secondElement.price - firstElement.price;
        });
    }
    buildProducts(localWholeProduct);
};

// sorting event listener
const search = () => {
    const value = searchInput.value;
    const regex = new RegExp(value, "ig");
    const array = wholeProduct.filter((value) => regex.test(value.title));
    buildProducts(array);
};

// <-----execution stage------->
// console.log(`user Id ${userId}`);
getUserDetails(userId)
    .then((response) => {
        fetchUserObject = {...response.userResponseJson };
        fetchUserCart = {...response.userCartResponseJson };
        setName();
        console.log("user", response.userResponseJson); // create user object
        console.log("cart", response.userCartResponseJson); // create cart object
        return response.userCartResponseJson;
    })
    .then((response) => {
        getProductDetails(response.products)
            .then((productObjectArray) => {
                console.log(productObjectArray); // create cart object with products
                userCart = new cart(fetchUserCart.id, productObjectArray);
                console.log("userCart", userCart);
                buildCart(userCart);
            })
            .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

const buildProducts = (products) => {
    console.log("building products");
    sectionProducts.innerHTML = "";
    products.forEach((product) => {
        const content = `
                    <div class="title product-item">${product.title}</div>
                    <div class="price product-item">Price - $ ${product.price}</div>
                    <!-- <div class="description">${product.description}</div> -->
                    <div class="cateogry product-item">
                       ${product.category}
                    </div>
                    <div class="img product-item">
                        <img src="${product.image}" alt="">
                    </div>

                    <div class="rate product-item">Rate - ${product.rating.rate}</div>
                    <div class="count product-item">Count -  ${product.rating.count}</div>
                    <div class="add-button">
               Add to cart
            </div>
                `;

        const div = document.createElement("div");
        div.className = "single-products";
        div.setAttribute("id", product.id);

        div.innerHTML = content;
        sectionProducts.appendChild(div);
    });
};
getProducts().then((products) => {
    //for all products
    buildProducts(products);
});

// <------- event listners ----------->
/* closeCart.addEventListener("click", () => {
    //CLOSE CART
    console.log("cart close");
    document.body.style.zIndex = "10";
    cardContainer.style.zIndex = "-10";
    middle.style.zIndex = "-10";
});

cartButton.addEventListener("click", () => {
    //OPEN CART

    console.log("cart open");
    cardContainer.style.zIndex = "10";
    middle.style.zIndex = "5";
});
*/

products.addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.className == "add-button") {
        add(e.target.parentElement);
    }
    if (e.target.className == "subract") {
        sub(e.target.parentElement.parentElement);
    }
    userCart.updateTotalCost();
    //   console.log(userCart.totalCost);
});

dropdown.addEventListener("change", () => {
    sort(dropdown.value);
});

searchInput.addEventListener("keyup", search); //TODO: CHANGE this function like sorting event

user.addEventListener("click", () => {
    console.log(fetchUserObject);
});
//TODO: add total cart cost to cart object in html