let cartCount = 0;

function addToCart() {
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
    
    // Optional: Show a small alert
    alert('Product added to your cart!');
}
