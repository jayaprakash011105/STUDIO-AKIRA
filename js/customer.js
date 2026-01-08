// Customer Portal Logic for STUDIO AKIRA

// Shopping Cart Management (using localStorage)
let cart = JSON.parse(localStorage.getItem('studioakira_cart')) || [];

function addToCart(productId, productDetails = {}) {
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += (productDetails.quantity || 1);
    } else {
        cart.push({ productId, quantity: (productDetails.quantity || 1) });
    }

    localStorage.setItem('studioakira_cart', JSON.stringify(cart));
    updateCartCount();

    // Show custom modal instead of simple toast
    showAddedToCartModal(productDetails);
}

function showAddedToCartModal(details) {
    // Remove existing modal if any
    const existingModal = document.getElementById('cart-notification-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'cart-notification-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 20px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    content.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 15px;">🛍️</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-sage-darker); margin-bottom: 10px;">Added to Cart!</h3>
        <p style="color: var(--color-text-light); margin-bottom: 25px;">${details.name || 'Item'} has been successfully added to your cart.</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="document.getElementById('cart-notification-modal').remove()" style="padding: 12px 24px; border: 2px solid var(--color-light-gray); background: white; border-radius: 30px; cursor: pointer; font-weight: 600; color: var(--color-text);">Continue Shopping</button>
            <button onclick="window.location.href='cart.html'" style="padding: 12px 24px; border: none; background: linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%); border-radius: 30px; cursor: pointer; font-weight: 600; color: white;">View Cart</button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
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

// Wishlist Management
let wishlist = JSON.parse(localStorage.getItem('studioakira_wishlist')) || [];

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) {
        wishlist.push(productId);
        showToast('Added to wishlist', 'success');
    } else {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist', 'info');
    }
    localStorage.setItem('studioakira_wishlist', JSON.stringify(wishlist));
    updateWishlistUI(productId);
}

function isInWishlist(productId) {
    return wishlist.includes(productId);
}

function updateWishlistUI(productId = null) {
    // If productId is provided, update specific button, else update all
    if (productId) {
        const btns = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);
        btns.forEach(btn => {
            if (isInWishlist(productId)) {
                btn.classList.add('active');
                btn.innerHTML = '❤️'; // Filled heart
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '🤍'; // Empty heart
            }
        });
    }
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

                const rawImage = product.images && product.images[0] ? product.images[0] : 'assets/images/products/lavender-candle.png';
                const imageUrl = (rawImage.startsWith('http') || rawImage.startsWith('data:')) ? rawImage : `../${rawImage}`;

                html += `
          <div class="cart-item" data-product-id="${item.productId}">
            <img src="${imageUrl}" alt="${product.name}" class="cart-item-image">
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

                // Get correct image URL
                const rawImage = product.images && product.images[0] ? product.images[0] : 'assets/images/products/lavender-candle.png';

                items.push({
                    productId: item.productId,
                    productName: product.name,
                    quantity: item.quantity,
                    price: product.price,
                    image: rawImage,
                    description: product.description || ''
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
