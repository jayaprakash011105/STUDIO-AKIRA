// Utility Functions for STUDIO AKIRA

// Format price in INR
function formatPrice(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusConfig = {
        pending: { class: 'badge-warning', text: 'Pending' },
        approved: { class: 'badge-success', text: 'Approved' },
        in_production: { class: 'badge-info', text: 'In Production' },
        ready_for_packaging: { class: 'badge-info', text: 'Ready for Packaging' },
        packaged: { class: 'badge-primary', text: 'Packaged' },
        shipped: { class: 'badge-primary', text: 'Shipped' },
        delivered: { class: 'badge-success', text: 'Delivered' },
        cancelled: { class: 'badge-danger', text: 'Cancelled' },
        rejected: { class: 'badge-danger', text: 'Rejected' },
        active: { class: 'badge-success', text: 'Active' }
    };

    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return `<span class="badge ${config.class}">${config.text}</span>`;
}

// Get current user
async function getCurrentUser() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        resolve({ uid: user.uid, email: user.email, ...userDoc.data() });
                    } else {
                        reject(new Error('User document not found'));
                    }
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(new Error('No user logged in'));
            }
        });
    });
}

// Check user role and redirect if unauthorized
async function checkRole(allowedRoles) {
    try {
        const user = await getCurrentUser();
        if (!allowedRoles.includes(user.role)) {
            showToast('Unauthorized access', 'error');
            window.location.href = '/index.html';
            return null;
        }

        // Check approval status for manufacturer and delivery roles
        if ((user.role === 'manufacturer' || user.role === 'delivery') && user.status !== 'active') {
            showToast('Your account is pending approval', 'warning');
            auth.signOut();
            window.location.href = '/index.html';
            return null;
        }

        return user;
    } catch (error) {
        console.error('Role check error:', error);
        window.location.href = '/index.html';
        return null;
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        showToast('Logged out successfully', 'success');
        window.location.href = '/index.html';
    }).catch((error) => {
        showToast('Logout failed: ' + error.message, 'error');
    });
}

// Setup real-time listener
function setupRealtimeListener(collection, callback, query = null) {
    let ref = db.collection(collection);
    if (query) {
        ref = query(ref);
    }
    return ref.onSnapshot(callback);
}

// Loading spinner
function showLoading(show = true) {
    const loader = document.getElementById('loading-spinner');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone
function isValidPhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

// Generate order ID
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Generate batch number
function generateBatchNumber() {
    return 'BATCH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}
