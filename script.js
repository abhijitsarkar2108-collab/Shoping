/* =====================================================
   URBANWEAR E-COMMERCE
===================================================== */


/* ================= PRODUCTS ================= */

const products = [

  {
    id: 1,
    name: "Classic Black Oversized Shirt",
    category: "Shirts",
    price: 799,
    oldPrice: 1299,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-12"
  },

  {
    id: 2,
    name: "Premium White Casual Shirt",
    category: "Shirts",
    price: 699,
    oldPrice: 1199,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-11"
  },

  {
    id: 3,
    name: "Urban Beige Oversized T-Shirt",
    category: "T-Shirts",
    price: 499,
    oldPrice: 899,
    rating: 4.9,
    reviews: 211,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-10"
  },

  {
    id: 4,
    name: "Minimal Black T-Shirt",
    category: "T-Shirts",
    price: 449,
    oldPrice: 799,
    rating: 4.6,
    reviews: 76,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-09"
  },

  {
    id: 5,
    name: "Premium Grey Hoodie",
    category: "Hoodies",
    price: 999,
    oldPrice: 1799,
    rating: 4.8,
    reviews: 143,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-08"
  },

  {
    id: 6,
    name: "Streetwear Black Hoodie",
    category: "Hoodies",
    price: 1099,
    oldPrice: 1999,
    rating: 4.9,
    reviews: 190,
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-07"
  },

  {
    id: 7,
    name: "Classic Blue Denim Jeans",
    category: "Jeans",
    price: 899,
    oldPrice: 1499,
    rating: 4.7,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-06"
  },

  {
    id: 8,
    name: "Relaxed Fit Denim Jeans",
    category: "Jeans",
    price: 949,
    oldPrice: 1599,
    rating: 4.6,
    reviews: 65,
    image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=900&q=80",
    date: "2026-08-05"
  }

];


/* ================= STATE ================= */

let currentCategory = "All";

let currentProducts = [...products];

let cart = JSON.parse(
  localStorage.getItem("urbanwearCart")
) || [];


/* ================= ELEMENTS ================= */

const productGrid =
  document.getElementById("productGrid");

const productCount =
  document.getElementById("productCount");

const cartCount =
  document.getElementById("cartCount");

const cartOverlay =
  document.getElementById("cartOverlay");

const cartItems =
  document.getElementById("cartItems");

const cartTotal =
  document.getElementById("cartTotal");

const toast =
  document.getElementById("toast");


/* ================= DISCOUNT ================= */

function discountPercentage(price, oldPrice) {

  return Math.round(
    ((oldPrice - price) / oldPrice) * 100
  );

}


/* ================= RENDER PRODUCTS ================= */

function renderProducts(list = currentProducts) {

  productGrid.innerHTML = "";

  productCount.textContent =
    `${list.length} products`;


  if (list.length === 0) {

    productGrid.innerHTML = `
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:80px 20px;
      ">
        <h2>No products found</h2>
        <p style="color:#777;margin-top:10px;">
          Try another search or category.
        </p>
      </div>
    `;

    return;

  }


  list.forEach(product => {

    const discount =
      discountPercentage(
        product.price,
        product.oldPrice
      );


    const card =
      document.createElement("div");

    card.className =
      "product-card";


    card.innerHTML = `

      <div
        class="product-image"
        onclick="openQuickView(${product.id})"
      >

        ${
          discount > 0
          ?
          `<span class="sale-badge">
             ${discount}% OFF
           </span>`
          :
          ""
        }

        <button
          class="wishlist"
          onclick="event.stopPropagation(); toggleWishlist(${product.id})"
        >
          ♡
        </button>

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >

      </div>


      <div class="product-info">

        <div class="product-category">
          ${product.category}
        </div>

        <div class="product-name">
          ${product.name}
        </div>

        <div class="rating">
          ⭐ ${product.rating}
          <span style="color:#999">
            (${product.reviews})
          </span>
        </div>

        <div class="price">

          ₹${product.price}

          <span class="old-price">
            ₹${product.oldPrice}
          </span>

          <span class="discount">
            ${discount}% OFF
          </span>

        </div>


        <button
          class="quick-add"
          onclick="addToCart(${product.id})"
        >
          ADD TO CART
        </button>

      </div>

    `;


    productGrid.appendChild(card);

  });

}


/* ================= CATEGORY ================= */

function filterCategory(category) {

  currentCategory = category;


  if (category === "All") {

    currentProducts = [...products];

  } else {

    currentProducts =
      products.filter(
        product =>
          product.category === category
      );

  }


  document
    .querySelectorAll(".category")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.category === category
      );

    });


  document.getElementById(
    "activeFilter"
  ).textContent =
    category === "All"
      ? "All Products"
      : category;


  renderProducts(currentProducts);

}


/* ================= CATEGORY BUTTONS ================= */

document
  .querySelectorAll("[data-category]")
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        filterCategory(
          this.dataset.category
        );

        document
          .getElementById("mobileMenu")
          .classList.remove("active");

      }
    );

  });


/* ================= SORT ================= */

document
  .getElementById("sortSelect")
  .addEventListener("change", function () {

    const value = this.value;


    let sorted =
      [...currentProducts];


    if (value === "low") {

      sorted.sort(
        (a, b) => a.price - b.price
      );

    }


    if (value === "high") {

      sorted.sort(
        (a, b) => b.price - a.price
      );

    }


    if (value === "newest") {

      sorted.sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

    }


    renderProducts(sorted);

  });


/* ================= SEARCH ================= */

const searchBox =
  document.getElementById("searchBox");

const searchInput =
  document.getElementById("searchInput");


document
  .getElementById("searchBtn")
  .addEventListener(
    "click",
    () => {

      searchBox.classList.add("active");

      searchInput.focus();

    }
  );


document
  .getElementById("closeSearch")
  .addEventListener(
    "click",
    () => {

      searchBox.classList.remove(
        "active"
      );

      searchInput.value = "";

      renderProducts(currentProducts);

    }
  );


searchInput.addEventListener(
  "input",
  function () {

    const query =
      this.value
        .toLowerCase()
        .trim();


    if (!query) {

      renderProducts(
        currentProducts
      );

      return;

    }


    const results =
      currentProducts.filter(product =>

        product.name
          .toLowerCase()
          .includes(query)

        ||

        product.category
          .toLowerCase()
          .includes(query)

      );


    renderProducts(results);

  }
);


/* ================= MOBILE MENU ================= */

document
  .getElementById("menuBtn")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("mobileMenu")
        .classList.add("active");

    }
  );


document
  .getElementById("closeMenu")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("mobileMenu")
        .classList.remove("active");

    }
  );


/* ================= SHOP NOW ================= */

document
  .getElementById("shopNow")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("products")
        .scrollIntoView({
          behavior: "smooth"
        });

    }
  );


/* ================= CART ================= */

function addToCart(id) {

  const product =
    products.find(
      p => p.id === id
    );


  const existing =
    cart.find(
      item => item.id === id
    );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      ...product,

      quantity: 1

    });

  }


  saveCart();

  updateCart();

  showToast(
    "Added to cart ✓"
  );

}


function removeFromCart(id) {

  cart =
    cart.filter(
      item => item.id !== id
    );

  saveCart();

  updateCart();

}


function saveCart() {

  localStorage.setItem(
    "urbanwearCart",
    JSON.stringify(cart)
  );

}


function updateCart() {

  const totalItems =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  cartCount.textContent =
    totalItems;


  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty.
      </p>
    `;

    cartTotal.textContent =
      "₹0";

    return;

  }


  cartItems.innerHTML = "";


  let total = 0;


  cart.forEach(item => {

    total +=
      item.price *
      item.quantity;


    const div =
      document.createElement("div");

    div.className =
      "cart-item";


    div.innerHTML = `

      <img
        src="${item.image}"
        alt="${item.name}"
      >

      <div class="cart-item-info">

        <h4>
          ${item.name}
        </h4>

        <p>
          ₹${item.price}
          × ${item.quantity}
        </p>

      </div>

      <button
        class="remove-item"
        onclick="removeFromCart(${item.id})"
      >
        Remove
      </button>

    `;


    cartItems.appendChild(div);

  });


  cartTotal.textContent =
    `₹${total}`;

}


/* ================= OPEN CART ================= */

document
  .getElementById("cartBtn")
  .addEventListener(
    "click",
    () => {

      updateCart();

      cartOverlay.classList.add(
        "active"
      );

    }
  );


document
  .getElementById("closeCart")
  .addEventListener(
    "click",
    () => {

      cartOverlay.classList.remove(
        "active"
      );

    }
  );


/* ================= QUICK VIEW ================= */

function openQuickView(id) {

  const product =
    products.find(
      p => p.id === id
    );


  const discount =
    discountPercentage(
      product.price,
      product.oldPrice
    );


  document.getElementById(
    "quickContent"
  ).innerHTML = `

    <div class="quick-product">

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <div class="quick-details">

        <div class="product-category">
          ${product.category}
        </div>

        <h2>
          ${product.name}
        </h2>

        <div class="rating">
          ⭐ ${product.rating}
          (${product.reviews} reviews)
        </div>

        <div class="quick-price">

          ₹${product.price}

          <span class="old-price">
            ₹${product.oldPrice}
          </span>

        </div>

        <p class="quick-description">

          Premium quality fashion product
          designed for comfortable everyday
          wear. Modern fit, premium material
          and stylish design.

        </p>

        <button
          class="quick-cart"
          onclick="addToCart(${product.id}); closeQuickView();"
        >
          ADD TO CART
        </button>

      </div>

    </div>

  `;


  document
    .getElementById("quickView")
    .classList.add("active");

}


function closeQuickView() {

  document
    .getElementById("quickView")
    .classList.remove("active");

}


document
  .getElementById("quickClose")
  .addEventListener(
    "click",
    closeQuickView
  );


/* ================= WISHLIST ================= */

function toggleWishlist(id) {

  showToast(
    "Wishlist feature activated ♡"
  );

}


/* ================= FILTER ================= */

const filterOverlay =
  document.getElementById(
    "filterOverlay"
  );


document
  .getElementById("filterBtn")
  .addEventListener(
    "click",
    () => {

      filterOverlay.classList.add(
        "active"
      );

    }
  );


document
  .getElementById("filterClose")
  .addEventListener(
    "click",
    () => {

      filterOverlay.classList.remove(
        "active"
      );

    }
  );


const priceRange =
  document.getElementById(
    "priceRange"
  );

const priceValue =
  document.getElementById(
    "priceValue"
  );


priceRange.addEventListener(
  "input",
  function () {

    priceValue.textContent =
      this.value;

  }
);


document
  .getElementById("applyFilter")
  .addEventListener(
    "click",
    () => {

      const category =
        document.querySelector(
          'input[name="filterCategory"]:checked'
        ).value;


      const maxPrice =
        Number(priceRange.value);


      let filtered =
        products.filter(
          product =>
            product.price <= maxPrice
        );


      if (category !== "All") {

        filtered =
          filtered.filter(
            product =>
              product.category ===
              category
          );

      }


      currentProducts =
        filtered;


      currentCategory =
        category;


      document.getElementById(
        "activeFilter"
      ).textContent =
        `${category} • Up to ₹${maxPrice}`;


      renderProducts(filtered);


      filterOverlay.classList.remove(
        "active"
      );

    }
  );


/* ================= TOAST ================= */

function showToast(message) {

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 2000);

}


/* ================= CHECKOUT ================= */

document
  .getElementById("checkoutBtn")
  .addEventListener(
    "click",
    () => {

      if (cart.length === 0) {

        showToast(
          "Your cart is empty!"
        );

        return;

      }


      alert(
        "Checkout system will be connected here."
      );

    }
  );


/* ================= INITIALIZE ================= */

renderProducts();

updateCart();
