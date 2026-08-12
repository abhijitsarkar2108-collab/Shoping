/* =========================
   PRODUCT DATABASE
========================= */

const products = [

    {
        id: 1,
        name: "Wireless Headphones",
        price: 1299,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    },

    {
        id: 2,
        name: "Smart Watch",
        price: 1999,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
    },

    {
        id: 3,
        name: "Premium T-Shirt",
        price: 599,
        category: "fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
    },

    {
        id: 4,
        name: "Sneakers",
        price: 1499,
        category: "fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    },

    {
        id: 5,
        name: "Modern Chair",
        price: 2999,
        category: "home",
        image: "https://images.unsplash.com/photo-1503602642458-232111445657"
    },

    {
        id: 6,
        name: "Table Lamp",
        price: 899,
        category: "home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c"
    }

];


let cart = JSON.parse(
    localStorage.getItem("myshop_cart")
) || [];


/* =========================
   SHOW PRODUCTS
========================= */

function showProducts(list = products) {

    const grid =
        document.getElementById("productGrid");

    grid.innerHTML = "";

    document.getElementById("productTotal").innerText =
        `${list.length} Products`;

    list.forEach(product => {

        grid.innerHTML += `

            <div class="product">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="product-info">

                    <span class="category">
                        ${product.category}
                    </span>

                    <h3>
                        ${product.name}
                    </h3>

                    <div class="price">
                        ₹${product.price.toLocaleString("en-IN")}
                    </div>

                    <button
                        class="add-btn"
                        onclick="addToCart(${product.id})"
                    >
                        🛒 Add to Cart
                    </button>

                </div>

            </div>

        `;

    });

}


/* =========================
   ADD TO CART
========================= */

function addToCart(id) {

    const product =
        products.find(p => p.id === id);

    const existing =
        cart.find(item => item.id === id);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    saveCart();

    alert("Product added to cart 🛒");
}


/* =========================
   SAVE CART
========================= */

function saveCart() {

    localStorage.setItem(
        "myshop_cart",
        JSON.stringify(cart)
    );

    updateCartCount();

}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    document.getElementById("cartCount")
        .innerText = count;

}


/* =========================
   OPEN CART
========================= */

function openCart() {

    renderCart();

    document.getElementById("cartModal")
        .style.display = "flex";

}


/* =========================
   CLOSE CART
========================= */

function closeCart() {

    document.getElementById("cartModal")
        .style.display = "none";

}


/* =========================
   RENDER CART
========================= */

function renderCart() {

    const container =
        document.getElementById("cartItems");

    container.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total +=
            item.price * item.quantity;

        container.innerHTML += `

            <div class="cart-item">

                <img
                    src="${item.image}"
                >

                <div class="cart-item-info">

                    <strong>
                        ${item.name}
                    </strong>

                    <p>
                        ₹${item.price} ×
                        ${item.quantity}
                    </p>

                </div>

                <button
                    class="remove-btn"
                    onclick="removeFromCart(${item.id})"
                >
                    ✕
                </button>

            </div>

        `;

    });

    if (cart.length === 0) {

        container.innerHTML =
            "<p>Your cart is empty 🛒</p>";

    }

    document.getElementById("cartTotal")
        .innerText =
        total.toLocaleString("en-IN");

}


/* =========================
   REMOVE CART ITEM
========================= */

function removeFromCart(id) {

    cart =
        cart.filter(item => item.id !== id);

    saveCart();

    renderCart();

}


/* =========================
   CHECKOUT
========================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    closeCart();

    document.getElementById("checkoutModal")
        .style.display = "flex";

}


function closeCheckout() {

    document.getElementById("checkoutModal")
        .style.display = "none";

}


/* =========================
   CALCULATE TOTAL
========================= */

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            item.price * item.quantity,
        0
    );

}


/* =========================
   RAZORPAY
========================= */

function startPayment() {

    const name =
        document.getElementById("customerName").value.trim();

    const phone =
        document.getElementById("customerPhone").value.trim();

    const address =
        document.getElementById("customerAddress").value.trim();


    if (!name || !phone || !address) {

        alert(
            "Please fill all delivery details."
        );

        return;
    }


    const total = getCartTotal();


    /*
       IMPORTANT:

       This is only the frontend structure.

       DO NOT put your Razorpay SECRET KEY here.

       Production payment should create
       a Razorpay Order from a backend
       such as Supabase Edge Functions.
    */


    const options = {

        key: "YOUR_RAZORPAY_KEY_ID",

        amount: total * 100,

        currency: "INR",

        name: "MyShop",

        description: "Shopping Order",

        handler: function(response) {

            alert(
                "Payment successful! 🎉\n\n" +
                "Payment ID: " +
                response.razorpay_payment_id
            );

            cart = [];

            saveCart();

            closeCheckout();

        },

        prefill: {

            name: name,

            contact: phone

        },

        theme: {

            color: "#111827"

        }

    };


    const razorpay =
        new Razorpay(options);

    razorpay.open();

}


/* =========================
   SEARCH
========================= */

function searchProducts() {

    const value =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    const result =
        products.filter(product =>
            product.name
                .toLowerCase()
                .includes(value)
        );

    showProducts(result);

}


/* =========================
   CATEGORY
========================= */

function filterCategory(category) {

    if (category === "all") {

        showProducts(products);

        return;
    }

    const result =
        products.filter(
            product =>
                product.category === category
        );

    showProducts(result);

}


/* =========================
   SCROLL
========================= */

function scrollToProducts() {

    document.getElementById("productsSection")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================
   INITIALIZE
========================= */

showProducts();

updateCartCount();
