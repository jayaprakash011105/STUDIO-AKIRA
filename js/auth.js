// Authentication Logic for STUDIO AKIRA

// Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    showRoleSelection();
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    resetForms();
}

function showRoleSelection() {
    document.getElementById('roleSelection').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
}

function showLoginForm() {
    document.getElementById('roleSelection').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
}

function showSignupForm() {
    document.getElementById('roleSelection').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function selectRole(role) {
    document.getElementById('selectedRole').value = role;
    showLoginForm();
}

function resetForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    showRoleSelection();
}

// Login Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('selectedRole').value;

    showLoading(true);

    try {
        // Sign in with Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user document from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            throw new Error('User profile not found');
        }
        const userData = userDoc.data();
        const userRole = userData.role;

        // Verify role and approval status
        // Admin check: if email is admin@gmail.com, use admin role regardless of selection
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail === 'admin@gmail.com') {
            if (userRole !== 'admin') {
                await auth.signOut();
                throw new Error('Access denied. This email is reserved for Admin only.');
            }
            redirectToPortal('admin');
            return;
        }

        // Verify role matches selection for non-admins
        if (userRole !== role) {
            await auth.signOut();
            throw new Error(`This account is not registered as a ${role}`);
        }

        // Check approval status for manufacturer and delivery roles
        if ((userRole === 'manufacturer' || userRole === 'delivery') && userData.status !== 'active') {
            await auth.signOut();
            showToast('Your account is pending admin approval. Please wait for approval before logging in.', 'warning');
            showLoading(false);
            return;
        }

        // Redirect based on role
        redirectToPortal(userRole);

    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please check your credentials.', 'error');
        showLoading(false);
    }
});

// Signup Handler
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    // Validate phone
    if (!isValidPhone(phone)) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    showLoading(true);

    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Determine initial status
        const status = (role === 'manufacturer' || role === 'delivery') ? 'pending' : 'active';

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email.toLowerCase().trim(),
            phone: phone,
            role: role,
            status: status,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // If manufacturer or delivery, create approval request
        if (role === 'manufacturer' || role === 'delivery') {
            await db.collection('approvalRequests').add({
                userId: user.uid,
                userEmail: email.toLowerCase().trim(),
                userName: name,
                requestedRole: role,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await auth.signOut();
            showToast('Account created! Your request is pending admin approval. You will be notified once approved.', 'success');
            closeLoginModal();
        } else {
            // Customer account - redirect immediately
            showToast('Account created successfully!', 'success');
            redirectToPortal(role);
        }

    } catch (error) {
        console.error('Signup error:', error);
        showToast(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
});

// Redirect to appropriate portal
function redirectToPortal(role) {
    const portals = {
        customer: '/customer/home.html',
        admin: '/admin/dashboard.html',
        manufacturer: '/manufacturer/dashboard.html',
        delivery: '/delivery/dashboard.html'
    };

    const target = portals[role] || '/index.html';
    window.location.href = target;
}

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
    if (user && window.location.pathname === '/index.html') {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.status === 'active') {
                    redirectToPortal(userData.role);
                }
            }
        } catch (error) {
            console.error('Auth state check error:', error);
        }
    }
});

// Close modal on outside click
document.getElementById('loginModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') {
        closeLoginModal();
    }
});
