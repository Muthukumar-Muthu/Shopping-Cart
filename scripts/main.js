//      <------------variables declartions-------->
const cartContainer = document.querySelector(".cart-container");
const middle = document.querySelector(".middle");
const cartButton = document.querySelector("#cart");
const products = document.querySelector(".products");
const dropdown = document.querySelector("#sort");
const searchInput = document.querySelector("#search");
const userId = localStorage.getItem("id"); //for this time using id from a local storage.
const sectionProducts = document.querySelector(".products");
const cartProducts = document.querySelector(".cart-products");
const cartLogo = document.querySelector("#cart-logo");
const closeCart = document.querySelector(".close");
const userButton = document.querySelector("div.user");
const userDetails = document.querySelector("aside.user");
const closeUser = document.querySelector(".close-user");
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

// getUserDetails(userId) --> returns  user Object and userCart object ex: userId = 2 and returns both object
const getUserDetails = async(userId) => {
    const userResponse = await fetch(`https://fakestoreapi.com/users/${userId}`);
    const userCartResponse = await fetch(
        `https://fakestoreapi.com/carts/${userId}`
    );
    const userResponseJson = await userResponse.json();
    const userCartResponseJson = await userCartResponse.json();
    return { userResponseJson, userCartResponseJson };
};

//returns particluar object for that id from wholeProduct array
const getProductObject = (id) => {
    //returns product object for the particular id from the wholeProduct
    let object = {};
    wholeProduct.forEach((element) => {
        if (element.id == id) {
            object = element;
        }
    });
    return object;
};

//returns all avaiable product array
const getProducts = async() => {
    const response = await fetch("https://fakestoreapi.com/products");
    const products = await response.json();
    wholeProduct = [...products];
    return products;
};

// getReduced(num) --> returns a float with percision of 2   ex: getReduced(2.5558) --> 2.55
const getReduced = (num) => +Number.parseFloat(num).toFixed(2);

// getProductDetails(array) --> function gets a product object {id,quantity} array and return product object {id,cost,title,catergory etc..} array
const getProductDetails = async(array) => {
    let i = 0;
    const PromiseMap = array.map((element) => {
        //map of promises for the id from the array
        return fetch(`https://fakestoreapi.com/products/${element.productId}`);
    });
    const response = await Promise.all([...PromiseMap]); //all or nothing  -- promise.all returns a response headers
    const responseJson = await Promise.all([
        ...response.map((element) => element.json()),
    ]); //all or nothing  -- promise.all returns a response json (does not have quantity with this map)
    const mappedJson = responseJson.map((element) => {
        const object = {};
        object.productObject = element;
        object.quantity = array[i++].quantity;
        object.productTotalCost = getReduced(element.price * object.quantity);
        return object;
    });
    return mappedJson; //mapped with quantity
};

//buildCart(cartObject) -- builds cart in html
const buildCart = (cartObject) => {
    cartProducts.innerHTML = "";
    cartObject.productArray.forEach((object) => {
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
                            
                             <span>Quantity -</span><span>
                <i class="fas fa-plus plus"></i>
                <input type="number" name="" id="" value=${object.quantity}>
                <i class="fas fa-minus subract"></i>
            </span>
                        </div>
                        <div class="total-cost">
                            Cost - $  ${object.productTotalCost}
                        </div>
                        `;
        div.setAttribute("id", element.id);
        div.innerHTML = content;
        cartProducts.appendChild(div);
    });
    const div = document.createElement("div");
    div.id = "total-cost";
    div.innerText = `Total Cost - $${cartObject.totalCost}`;
    cartProducts.appendChild(div);
};

//adding products to the userCart
const add = (object) => {
    let add = false;
    const selectedProduct = getProductObject(object.id);
    userCart.productArray.forEach((element) => {
        if (element.productObject.id == selectedProduct.id) {
            const inc = element.quantity;
            element.quantity = inc + 1;
            element.productTotalCost = getReduced(
                element.quantity * element.productObject.price
            );
            add = true;
        }
    });
    if (add == false) {
        const object = {};
        object.productObject = selectedProduct;
        object.quantity = 1;
        object.productTotalCost = selectedProduct.price;
        userCart.productArray.push(object);
    }
    userCart.updateTotalCost();
    buildCart(userCart);
};

//removing or decreasing the count of products from the userCart
const sub = (object) => {
    console.log("removing product");
    let sub = false;
    const selectedProduct = getProductObject(object.id);
    userCart.productArray.forEach((element) => {
        if (element.productObject.id == selectedProduct.id) {
            if (element.quantity > 1) {
                const des = element.quantity;
                element.quantity = des - 1;
                element.productTotalCost = getReduced(
                    element.quantity * element.productObject.price
                );
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
    userCart.updateTotalCost();
    buildCart(userCart);
};

//sets Name of user to the HTML
function setName() {
    const Username = `${fetchUserObject.name.firstname} ${fetchUserObject.name.lastname}`;
    document.querySelector("#name").innerHTML = Username;
}

//sorting - sort function will collect the .single-products and sort based on the sort.value
const sort = (value) => {
    value = value.toLowerCase();
    const productsHtml = [...document.querySelectorAll(".single-products")];
    const productsId = productsHtml.map((value) => value.id);
    const localWholeProduct = productsId.map((value) => getProductObject(value));
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

// sorting based on the selected input value
const search = () => {
    const value = searchInput.value;
    const regex = new RegExp(value, "ig");
    const array = wholeProduct.filter((value) => regex.test(value.title));
    buildProducts(array);
};

//builds the user in HTML
const buildUser = () => {
    document.querySelector(".remove").remove();
    const content = `
    <div class="name">
            Name:
            <span class="first-name">${fetchUserObject.name.firstname}</span>
            <span class="last-name">${fetchUserObject.name.lastname}</span>
        </div>
        <div class="email">
            Email:
            <span>${fetchUserObject.email}</span>
        </div>
        <div class="phone">
            Mobile Number:
            <span>${fetchUserObject.phone}</span>
        </div>
        <div class="address">
            Address
            <div class="street">Street:
                <span>${fetchUserObject.address.street}</span>
            </div>
            <div class="city">City:
                <span>${fetchUserObject.address.city}</span>
            </div>
            <div class="zipcode">Zipcode:
                <span>${fetchUserObject.address.zipcode}</span>
            </div>
        </div>`;
    const div = document.createElement("div");
    div.innerHTML = content;
    userDetails.append(div);
};

const toggleOverlay = () => {
    const overlay = document.querySelector("#overlay");
    overlay.style.height = `${document.body.scrollHeight}px`;
    overlay.classList.toggle("overlay");
};

// <-----execution stage------->

getUserDetails(userId)
    .then((response) => {
        fetchUserObject = {...response.userResponseJson };
        fetchUserCart = {...response.userCartResponseJson };
        setName();
        buildUser();
        return response.userCartResponseJson;
    })
    .then((response) => {
        getProductDetails(response.products)
            .then((productObjectArray) => {
                userCart = new cart(fetchUserCart.id, productObjectArray);
                buildCart(userCart);
            })
            .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

const buildProducts = (products) => {
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
    buildProducts(products);
});

// <---------- Event Listeners ----------->

cartLogo.addEventListener("click", (e) => {
    e.preventDefault();
    cartContainer.style.transform = `translateX(0px)`;
    toggleOverlay();
});

closeCart.addEventListener("click", () => {
    cartContainer.style.transform = `translateX(1000px)`;
    toggleOverlay();
    const overlay = document.querySelector("#overlay");
    overlay.style.height = `0px`;
});

cartContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("plus"))
        add(e.target.parentElement.parentElement.parentElement);
    if (e.target.classList.contains("subract"))
        sub(e.target.parentElement.parentElement.parentElement);
});

products.addEventListener("click", (e) => {
    console.log(e.target, "here");
    if (e.target.classList.contains("add-button")) {
        add(e.target.parentElement);
    }
});

dropdown.addEventListener("change", () => {
    sort(dropdown.value);
});

searchInput.addEventListener("keyup", search); //CHANGE this function like sorting event

userButton.addEventListener("click", (e) => {
    e.preventDefault();
    userDetails.style.transform = `translateX(0px)`;
    toggleOverlay();
});

closeUser.addEventListener("click", () => {
    console.log("close user");
    userDetails.style.transform = `translateX(-1000px)`;
    toggleOverlay();
    const overlay = document.querySelector("#overlay");
    overlay.style.height = `0px`;
});

//add total cart cost to cart object in html