// Customer Portal Logic for STUDIO AKIRA

// Shopping Cart Management (using localStorage)
let cart = JSON.parse(localStorage.getItem('studioakira_cart')) || [];

function addToCart(productId, quantity = 1) {
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    localStorage.setItem('studioakira_cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('studioakira_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('studioakira_cart', JSON.stringify(cart));
        }
    }
}

function getCart() {
    return cart;
}

function clearCart() {
    cart = [];
    localStorage.removeItem('studioakira_cart');
    updateCartCount();
}

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadges = document.querySelectorAll('.cart-count');
    cartBadges.forEach(badge => {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'inline-block' : 'none';
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Load cart items with product details
async function loadCartItems() {
    const cartItems = getCart();
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartContainer) return;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3 class="empty-state-title">Your cart is empty</h3>
        <p class="empty-state-text">Add some beautiful candles to get started!</p>
        <a href="products.html" class="btn btn-primary">Shop Now</a>
      </div>
    `;
        if (cartTotal) cartTotal.textContent = formatPrice(0);
        return;
    }

    showLoading(true);
    let total = 0;
    let html = '';

    for (const item of cartItems) {
        try {
            const productDoc = await db.collection('products').doc(item.productId).get();
            if (productDoc.exists) {
                const product = productDoc.data();
                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                const imageUrl = product.images && product.images[0] ? product.images[0] : 'assets/images/products/lavender-candle.png';

                html += `
          <div class="cart-item" data-product-id="${item.productId}">
            <img src="../${imageUrl}" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-details">
              <h3>${product.name}</h3>
              <p class="cart-item-price">${formatPrice(product.price)}</p>
            </div>
            <div class="cart-item-quantity">
              <button onclick="updateCartQuantity('${item.productId}', ${item.quantity - 1}); loadCartItems();">-</button>
              <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity('${item.productId}', this.value); loadCartItems();">
              <button onclick="updateCartQuantity('${item.productId}', ${item.quantity + 1}); loadCartItems();">+</button>
            </div>
            <div class="cart-item-total">${formatPrice(itemTotal)}</div>
            <button class="btn-remove" onclick="removeFromCart('${item.productId}'); loadCartItems();">×</button>
          </div>
        `;
            }
        } catch (error) {
            console.error('Error loading cart item:', error);
        }
    }

    cartContainer.innerHTML = html;
    if (cartTotal) cartTotal.textContent = formatPrice(total);
    showLoading(false);
}

// Place Order
async function placeOrder(orderData) {
    try {
        showLoading(true);

        const user = await getCurrentUser();
        const cartItems = getCart();

        if (cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // Get product details for all cart items
        const items = [];
        let totalAmount = 0;

        for (const item of cartItems) {
            const productDoc = await db.collection('products').doc(item.productId).get();
            if (productDoc.exists) {
                const product = productDoc.data();
                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;

                items.push({
                    productId: item.productId,
                    productName: product.name,
                    quantity: item.quantity,
                    price: product.price
                });
            }
        }

        // Create order
        const orderId = generateOrderId();
        await db.collection('orders').doc(orderId).set({
            customerId: user.uid,
            customerDetails: {
                name: orderData.name,
                email: orderData.email,
                phone: orderData.phone,
                address: orderData.address
            },
            items: items,
            totalAmount: totalAmount,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear cart
        clearCart();

        showToast('Order placed successfully!', 'success');
        showLoading(false);

        // Redirect to orders page
        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 1500);

    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Failed to place order: ' + error.message, 'error');
        showLoading(false);
    }
}
