//https://medium.com/codex/global-variables-and-javascript-modules-ce674a869164
let cartArray = [];
const closeCart = document.querySelector(".close");
const cardContainer = document.querySelector(".cart-container");
const middle = document.querySelector(".middle");
const cartButton = document.querySelector("#cart");

closeCart.addEventListener("click", () => {
    //CLOSE CART
    cardContainer.style.zIndex = "-5";
    middle.style.zIndex = "-10";
});

cartButton.addEventListener("click", () => {
    //OPEN CART
    cardContainer.style.zIndex = "10";
    middle.style.zIndex = "5";
});

const userId = localStorage.getItem("id"); //for this time using id as a local storage.

const getUserDetails = async(userId) => {
    // for get the user and cart for particular id
    const userResponse = await fetch(`https://fakestoreapi.com/users/${userId}`);
    const userCartResponse = await fetch(
        `https://fakestoreapi.com/carts/${userId}`
    );
    const userResponseJson = await userResponse.json();
    const userCartResponseJson = await userCartResponse.json();
    // console.log("user Object", userResponseJson);
    // console.log("userCart Object", userCartResponseJson);
    return { userResponseJson, userCartResponseJson };
};
//TODO: use promise.all
// function gets a product array and log the particular product id and quantity
const getProductDetails = async(array) => {
    const PromiseMap = array.map((element) => {
        return fetch(`https://fakestoreapi.com/products/${element.productId}`);
    });

    const response = await Promise.all([...PromiseMap]);
    const responseJson = await Promise.all([
        ...response.map((element) => element.json()),
    ]);

    return responseJson;
};

//TODO: function gets a id, quantity and log the product object

const getProductObject = async(id, quantity) => {
    const productResponse = await fetch(
        `https://fakestoreapi.com/products/${id}`
    );
    const productResponseJson = await productResponse.json();
    // console.log("product json", productResponseJson);
    cartArray.push(productResponseJson);
    //  console.log("cartarray", cartArray);
    return cartArray;
};
// get executed
getUserDetails(userId)
    .then((response) => {
        //  console.log("user", response.userResponseJson);
        //  console.log("cart", response.userCartResponseJson);
        return response.userCartResponseJson;
    })
    .then((response) => {
        getProductDetails(response.products).then((responseJson) =>
            console.log(responseJson)
        );
    })
    .catch((err) => console.log(err));

// create cart

/*
        const sectionProducts = document.querySelector(".products");
        const cartProducts = document.querySelector(".cart-products");

        let cartArray = [];
        const dummyArray = [];
        class singleProduct {
            constructor(id, price, name, quantity, image) {
                this.id = id;
                this.price = price;
                this.name = name;
                this.quantity = quantity;
                this._totalCost = price * quantity;
                this.image = image;
            }
            totalCost = () => {
                this._totalCost = this.price * this.quantity;
            };
        }

        const getProducts = async() => {
            const response = await fetch("https://fakestoreapi.com/products");
            const products = await response.json();
            return products;
        };
        const setCartArray = async(productArray) => {
            //sets the cart array
            let i = 0;
            productArray.forEach((productObject) => {
                (async() => {
                    const id = productObject.productId;
                    const quan = productObject.quantity;
                    await Promise.resolve(getProductObject(id, quan));

                    cartArray = [...dummyArray];
                    buildCart(cartArray[i++]);
                    console.log(cartArray, "from dummyarray to cart ");
                })();
            });
        };

        const getProductObject = async(id, quan) => {
            // for particular product
            const response = await fetch(`https://fakestoreapi.com/products/${id}`);
            const responseJson = await response.json();

            const object = new singleProduct(
                responseJson.id,
                responseJson.price,
                responseJson.title,
                quan,
                responseJson.image
            );
            dummyArray.push(object);
            console.log(dummyArray, "in get product");
        };
        const buildCart = async(element) => {
            const div = document.createElement("div");
            div.className = "single-cart-product";
            const content = `
                      <div class="img">
                            <img  src="${element.image}" alt="">
                        </div>
                        <div class="title">
                           ${element.name}
                        </div>
                        <div class="quantity">
                            Quantity - ${element.quantity}
                        </div>
                        <div class="total-cost">
                            Cost - $  ${element._totalCost}
                        </div>
                        `;
            div.innerHTML = content;
            cartProducts.appendChild(div);
        };
        getUser(userId) // for user information
            .then((response) => {
                console.log("user information", response);
                document.querySelector("#name").innerHTML =
                    response.name.firstname + " " + response.name.lastname;
            })
            .catch((error) => console.log(error));

        getUserCart(userId)
            .then((cartObject) => {
                // for specific user cart
                setCartArray(cartObject.products)
                    .then(() => {
                        buildCart();
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));

        getProducts().then((products) => {
            //for all products
            products.forEach((product) => {
                const content = `
                    <div class="title">${product.title}</div>
                    <div class="price">Price $ ${product.price}</div>
                    <!-- <div class="description">${product.description}</div> -->
                    <div class="cateogry">
                       ${product.category}
                    </div>
                    <div class="img">
                        <img src="${product.image}" alt="">
                    </div>

                    <div class="rate">Rate - ${product.rating.rate}</div>
                    <div class="count">Count -  ${product.rating.count}</div>
                    <div class="add">
                        <button class="add">Add to cart</button>
                    </div>
                `;
                const div = document.createElement("div");
                div.className = "single-products";
                div.innerHTML = content;
                sectionProducts.appendChild(div);
            });
        });

        //function

        const products = document.querySelector(".products");
        products.addEventListener("click", (e) => {
            if (e.target.className == "add") {
                console.log(e.target.parentElement.parentElement);
            }
        });


        */