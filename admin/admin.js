/* =====================================================
   SHOPING ADMIN PANEL
   SUPABASE + PRODUCT MANAGEMENT
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://txxdhjhmquzqztjtrxxu.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_Or16AUkorA8OkpvNQXsj_w_3-9uXSi_";


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
                "productImage"
            ).value.trim();


        const price =
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            );


        const oldPriceValue =
            document.getElementById(
                "productOldPrice"
            ).value;


        const old_price =
            oldPriceValue
            ? Number(oldPriceValue)
            : null;


        const stock =
            Number(
                document.getElementById(
                    "productStock"
                ).value
            );


        const rating =
            Number(
                document.getElementById(
                    "productRating"
                ).value
            );


        const reviews =
            Number(
                document.getElementById(
                    "productReviews"
                ).value
            );


        const featured =
            document.getElementById(
                "productFeatured"
            ).checked;


        const active =
            document.getElementById(
                "productActive"
            ).checked;


        const slug =
            createSlug(
                name
            );


        const productData = {

            name,

            slug,

            category,

            description,

            image_url,

            price,

            old_price,

            stock,

            rating,

            reviews,

            featured,

            active

        };


        const saveButton =
            document.getElementById(
                "saveButtonText"
            );


        saveButton.textContent =
            "SAVING...";


        let result;


        if (
            editingProductId
        ) {

            result =
                await supabaseClient
                    .from("products")
                    .update(
                        productData
                    )
                    .eq(
                        "id",
                        editingProductId
                    );

        } else {

            result =
                await supabaseClient
                    .from("products")
                    .insert(
                        productData
                    );

        }


        saveButton.textContent =
            editingProductId
            ? "UPDATE PRODUCT"
            : "ADD PRODUCT";


        if (result.error) {

            console.error(
                result.error
            );

            showToast(
                result.error.message
            );

            return;

        }


        showToast(
            editingProductId
            ? "Product updated ✓"
            : "Product added ✓"
        );


        resetProductForm();

        await loadProducts();

        showSection(
            "products"
        );

    }
);


/* =====================================================
   EDIT PRODUCT
===================================================== */

window.editProduct =
async function(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {

        showToast(
            "Product not found"
        );

        return;

    }


    editingProductId =
        id;


    document.getElementById(
        "productId"
    ).value =
        id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productImage"
    ).value =
        product.image_url || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price ?? "";


    document.getElementById(
        "productOldPrice"
    ).value =
        product.old_price ?? "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock ?? 0;


    document.getElementById(
        "productRating"
    ).value =
        product.rating ?? 0;


    document.getElementById(
        "productReviews"
    ).value =
        product.reviews ?? 0;


    document.getElementById(
        "productFeatured"
    ).checked =
        !!product.featured;


    document.getElementById(
        "productActive"
    ).checked =
        !!product.active;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Product";


    document.getElementById(
        "saveButtonText"
    ).textContent =
        "UPDATE PRODUCT";


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Edit Product";


    updateImagePreview(
        product.image_url
    );


    showSection(
        "addProduct"
    );

};


/* =====================================================
   RESET FORM
===================================================== */

function resetProductForm() {

    editingProductId =
        null;


    productForm.reset();


    document.getElementById(
        "productId"
    ).value =
        "";


    document.getElementById(
        "productActive"
    ).checked =
        true;


    document.getElementById(
        "productFeatured"
    ).checked =
        false;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Product";


    document.getElementById(
        "saveButtonText"
    ).textContent =
        "ADD PRODUCT";


    document.getElementById(
        "imagePreview"
    ).innerHTML =
        "<span>Image preview</span>";

}


/* =====================================================
   DELETE
===================================================== */

window.openDeleteModal =
function(id) {

    deletingProductId =
        id;


    document
        .getElementById(
            "deleteModal"
        )
        .classList.remove(
            "hidden"
        );

};


document
    .getElementById(
        "cancelDelete"
    )
    .addEventListener(
        "click",
        closeDeleteModal
    );


function closeDeleteModal() {

    deletingProductId =
        null;


    document
        .getElementById(
            "deleteModal"
        )
        .classList.add(
            "hidden"
        );

}


document
    .getElementById(
        "confirmDelete"
    )
    .addEventListener(
        "click",
        async function() {

            if (
                !deletingProductId
            ) {

                return;

            }


            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "id",
                        deletingProductId
                    );


            if (error) {

                console.error(error);

                showToast(
                    error.message
                );

                return;

            }


            closeDeleteModal();


            showToast(
                "Product deleted ✓"
            );


            await loadProducts();

        }
    );


/* =====================================================
   HELPERS
===================================================== */

function createSlug(text) {

    return text

        .toLowerCase()

        .trim()

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}


function setLoginMessage(
    message,
    error = false
) {

    loginMessage.textContent =
        message;

    loginMessage.style.color =
        error
        ? "#d93025"
        : "#666";

}


function showToast(
    message
) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =====================================================
   AUTH STATE
===================================================== */

supabaseClient
    .auth
    .onAuthStateChange(
        async (
            event,
            session
        ) => {

            if (
                event ===
                    "SIGNED_OUT"
            ) {

                loginScreen
                    .classList
                    .remove(
                        "hidden"
                    );

                adminApp
                    .classList
                    .add(
                        "hidden"
                    );

            }

        }
    );
