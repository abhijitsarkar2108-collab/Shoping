/* =====================================================
   SHOPING ADMIN PANEL
   SUPABASE + PRODUCT MANAGEMENT
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";


const SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


const {
    createClient
} = window.supabase;


const supabaseClient =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   STATE
===================================================== */

let products = [];

let editingProductId = null;

let deletingProductId = null;


/* =====================================================
   ELEMENTS
===================================================== */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );


const adminApp =
    document.getElementById(
        "adminApp"
    );


const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const productsTable =
    document.getElementById(
        "productsTable"
    );


const productForm =
    document.getElementById(
        "productForm"
    );


const toast =
    document.getElementById(
        "toast"
    );


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(error);

        return;

    }


    if (data.session) {

        await enterAdmin(
            data.session
        );

    }

}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById(
                    "loginEmail"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "loginPassword"
                )
                .value;


        setLoginMessage(
            "Logging in...",
            false
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email,

                    password

                });


        if (error) {

            setLoginMessage(
                error.message,
                true
            );

            return;

        }


        const isAdmin =
            await checkAdmin(
                data.user.id
            );


        if (!isAdmin) {

            await supabaseClient
                .auth
                .signOut();


            setLoginMessage(
                "This account is not an admin.",
                true
            );

            return;

        }


        await enterAdmin(
            data.session
        );

    }
);


/* =====================================================
   CHECK ADMIN
===================================================== */

async function checkAdmin(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("id, role")
            .eq("id", userId)
            .eq("role", "admin")
            .maybeSingle();


    if (error) {

        console.error(
            "Admin check:",
            error
        );

        return false;

    }


    return !!data;

}


/* =====================================================
   ENTER ADMIN
===================================================== */

async function enterAdmin(session) {

    loginScreen.classList.add(
        "hidden"
    );


    adminApp.classList.remove(
        "hidden"
    );


    const email =
        session.user.email || "Admin";


    document.getElementById(
        "adminEmail"
    ).textContent = email;


    await loadProducts();

}


/* =====================================================
   LOGOUT
===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async function() {

            await supabaseClient
                .auth
                .signOut();


            location.reload();

        }
    );


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

document
    .getElementById("togglePassword")
    .addEventListener(
        "click",
        function() {

            const password =
                document.getElementById(
                    "loginPassword"
                );


            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                this.textContent =
                    "🙈";

            } else {

                password.type =
                    "password";

                this.textContent =
                    "👁";

            }

        }
    );


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    showToast(
        "Loading products..."
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        showToast(
            error.message
        );

        return;

    }


    products =
        data || [];


    renderDashboard();

    renderProductsTable();

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    const total =
        products.length;


    const active =
        products.filter(
            p => p.active
        ).length;


    const stock =
        products.reduce(
            (
                total,
                product
            ) =>
                total +
                Number(
                    product.stock || 0
                ),
            0
        );


    const featured =
        products.filter(
            p => p.featured
        ).length;


    document.getElementById(
        "totalProducts"
    ).textContent =
        total;


    document.getElementById(
        "activeProducts"
    ).textContent =
        active;


    document.getElementById(
        "totalStock"
    ).textContent =
        stock;


    document.getElementById(
        "featuredProducts"
    ).textContent =
        featured;


    renderRecentProducts();

}


/* =====================================================
   RECENT PRODUCTS
===================================================== */

function renderRecentProducts() {

    const container =
        document.getElementById(
            "recentProducts"
        );


    const recent =
        products.slice(
            0,
            5
        );


    if (!recent.length) {

        container.innerHTML = `
            <p style="
                color:#999;
                font-size:13px;
                padding:20px 0;
            ">
                No products yet.
            </p>
        `;

        return;

    }


    container.innerHTML =
        recent
            .map(product => `

                <div class="recent-product">

                    <img
                        src="${escapeAttribute(
                            product.image_url
                        )}"
                        alt=""
                    >

                    <div class="recent-product-info">

                        <h4>
                            ${escapeHTML(
                                product.name
                            )}
                        </h4>

                        <p>
                            ${escapeHTML(
                                product.category
                            )}
                            • ₹${Number(
                                product.price
                            ).toLocaleString("en-IN")}
                        </p>

                    </div>

                </div>

            `)
            .join("");

}


/* =====================================================
   PRODUCT TABLE
===================================================== */

function renderProductsTable(
    list = products
) {

    if (!list.length) {

        productsTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:50px;
                        color:#999;
                    "
                >
                    No products found.
                </td>

            </tr>

        `;

        return;

    }


    productsTable.innerHTML =
        list
            .map(product => {

                const active =
                    product.active;


                const featured =
                    product.featured;


                return `

                    <tr>

                        <td>

                            <div class="
                                product-table-info
                            ">

                                <img
                                    src="${escapeAttribute(
                                        product.image_url
                                    )}"
                                    alt=""
                                >

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            product.name
                                        )}
                                    </strong>

                                    <span>
                                        ID #${product.id}
                                    </span>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${escapeHTML(
                                product.category
                            )}
                        </td>


                        <td>

                            ₹${Number(
                                product.price
                            ).toLocaleString(
                                "en-IN"
                            )}

                            ${
                                product.old_price
                                ?
                                `
                                <small
                                    style="
                                        color:#999;
                                        text-decoration:
                                        line-through;
                                        display:block;
                                    "
                                >
                                    ₹${Number(
                                        product.old_price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </small>
                                `
                                :
                                ""
                            }

                        </td>


                        <td>
                            ${product.stock}
                        </td>


                        <td>

                            <span class="
                                status
                                ${
                                    active
                                    ? "active"
                                    : "inactive"
                                }
                            ">

                                ${
                                    active
                                    ? "Active"
                                    : "Inactive"
                                }

                            </span>

                        </td>


                        <td>
                            ${
                                featured
                                ? "⭐ Yes"
                                : "—"
                            }
                        </td>


                        <td>

                            <div class="
                                action-buttons
                            ">

                                <button
                                    onclick="
                                        editProduct(
                                            ${product.id}
                                        )
                                    "
                                >
                                    ✏️
                                </button>


                                <button
                                    class="delete"
                                    onclick="
                                        openDeleteModal(
                                            ${product.id}
                                        )
                                    "
                                >
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            })
            .join("");

}


/* =====================================================
   SEARCH
===================================================== */

document
    .getElementById("productSearch")
    .addEventListener(
        "input",
        filterProducts
    );


document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        filterProducts
    );


function filterProducts() {

    const search =
        document
            .getElementById(
                "productSearch"
            )
            .value
            .toLowerCase()
            .trim();


    const category =
        document.getElementById(
            "categoryFilter"
        ).value;


    const filtered =
        products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all"
                ||
                product.category ===
                    category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    renderProductsTable(
        filtered
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const section =
                    this.dataset.section;


                showSection(
                    section
                );

            }
        );

    });


function showSection(section) {

    document
        .querySelectorAll(
            ".content-section"
        )
        .forEach(el => {

            el.classList.add(
                "hidden"
            );

        });


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(el => {

            el.classList.remove(
                "active"
            );

        });


    if (
        section ===
        "dashboard"
    ) {

        document
            .getElementById(
                "dashboardSection"
            )
            .classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Dashboard";

    }


    if (
        section ===
        "products"
    ) {

        document
            .getElementById(
                "productsSection"
            )
            .classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Products";

    }


    if (
        section ===
        "addProduct"
    ) {

        document
            .getElementById(
                "addProductSection"
            )
            .classList.remove(
                "hidden"
            );

        document.getElementById(
            "pageTitle"
        ).textContent =
            editingProductId
            ? "Edit Product"
            : "Add Product";

    }


    document
        .querySelector(
            `[data-section="${section}"]`
        )
        ?.classList.add(
            "active"
        );

}


/* =====================================================
   ADD PRODUCT BUTTONS
===================================================== */

document
    .getElementById(
        "addProductBtn"
    )
    .addEventListener(
        "click",
        function() {

            resetProductForm();

            showSection(
                "addProduct"
            );

        }
    );


document
    .getElementById(
        "viewAllProducts"
    )
    .addEventListener(
        "click",
        function() {

            showSection(
                "products"
            );

        }
    );


document
    .getElementById(
        "cancelProduct"
    )
    .addEventListener(
        "click",
        function() {

            resetProductForm();

            showSection(
                "products"
            );

        }
    );


/* =====================================================
   IMAGE PREVIEW
===================================================== */

document
    .getElementById(
        "productImage"
    )
    .addEventListener(
        "input",
        function() {

            updateImagePreview(
                this.value
            );

        }
    );


function updateImagePreview(
    url
) {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!url) {

        preview.innerHTML =
            "<span>Image preview</span>";

        return;

    }


    preview.innerHTML = `

        <img
            src="${escapeAttribute(url)}"
            alt="Preview"
            onerror="
                this.parentElement.innerHTML =
                '<span>Invalid image URL</span>'
            "
        >

    `;

}


/* =====================================================
   PRODUCT FORM SUBMIT
===================================================== */

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "productName"
            ).value.trim();


        const category =
            document.getElementById(
                "productCategory"
            ).value;


        const description =
            document.getElementById(
                "productDescription"
            ).value.trim();


        const image_url =
            document.getElementById(
                "produ
