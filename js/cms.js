// Dynamic Content Management System (CMS) for STUDIO AKIRA
// This module handles loading and rendering dynamic content from Firestore

class ContentManagementSystem {
    constructor() {
        this.content = null;
        this.theme = null;
        this.settings = null;
        this.baseUrl = this.calculateBaseUrl();
    }

    // Determine the base path adjustment needed based on current page location
    calculateBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/customer/') || path.includes('/admin/') || path.includes('/manufacturer/') || path.includes('/delivery/')) {
            return '../';
        }
        return '';
    }

    // Adjust relative paths based on the page location
    fixPath(path) {
        if (!path) return '';
        // If it's already an absolute URL or starts with /, don't touch it
        if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
            return path;
        }
        // Apply the base URL adjustment
        return this.baseUrl + path;
    }

    // Initialize CMS and load all content
    async init() {
        try {
            await this.loadSettings();
            await this.loadTheme();
            await this.loadContent();
            await this.loadNavigation();
            this.applyTheme();
            return true;
        } catch (error) {
            console.error('CMS Initialization Error:', error);
            return false;
        }
    }

    // Load global navigation
    async loadNavigation() {
        try {
            const navDoc = await db.collection('websiteContent').doc('navigation').get();
            if (navDoc.exists) {
                this.navigation = navDoc.data().links || [];
            } else {
                this.navigation = this.getDefaultNavigation();
            }
        } catch (error) {
            console.error('Error loading navigation:', error);
            this.navigation = this.getDefaultNavigation();
        }
    }

    // Load global settings
    async loadSettings() {
        try {
            const settingsDoc = await db.collection('websiteContent').doc('settings').get();
            if (settingsDoc.exists) {
                this.settings = settingsDoc.data();
            } else {
                // Default settings
                this.settings = {
                    activeThemeId: 'standard',
                    siteName: 'studio akira',
                    maintenanceMode: false
                };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = { activeThemeId: 'standard' };
        }
    }

    // Load active theme
    async loadTheme() {
        try {
            const themeId = this.settings.activeThemeId || 'standard';
            const themeDoc = await db.collection('websiteContent').doc('themes').get();

            if (themeDoc.exists) {
                const themes = themeDoc.data();
                this.theme = themes[themeId] || themes.standard;
            } else {
                // Default standard theme
                this.theme = this.getDefaultTheme();
            }
        } catch (error) {
            console.error('Error loading theme:', error);
            this.theme = this.getDefaultTheme();
        }
    }

    // Load page-specific content
    async loadContent(pageId = 'homepage') {
        try {
            const contentDoc = await db.collection('websiteContent').doc(pageId).get();

            if (contentDoc.exists) {
                this.content = contentDoc.data();
            } else {
                // Default content structure
                this.content = this.getDefaultContent(pageId);
            }
            return this.content;
        } catch (error) {
            console.error(`Error loading content for ${pageId}:`, error);
            this.content = this.getDefaultContent(pageId);
            return this.content;
        }
    }

    // Apply theme CSS variables
    applyTheme() {
        if (!this.theme) return;

        const root = document.documentElement;
        const colors = this.theme.colors || {};

        // Apply color variables
        Object.keys(colors).forEach(key => {
            console.log(`CMS: Applying color --${key} = ${colors[key]}`);
            root.style.setProperty(`--${key}`, colors[key]);
        });

        // Apply custom CSS if provided
        if (this.theme.customCSS) {
            const styleElement = document.createElement('style');
            styleElement.id = 'cms-custom-theme';
            styleElement.textContent = this.theme.customCSS;
            document.head.appendChild(styleElement);
        }
    }

    // Render all sections to the page
    renderSections(containerId = 'cms-content') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('CMS container not found:', containerId);
            return;
        }

        if (!this.content || !this.content.sections) {
            console.error('No content sections to render');
            return;
        }

        // Sort sections by order
        const sections = this.content.sections
            .filter(section => section.active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Clear container
        container.innerHTML = '';

        // Render each section
        sections.forEach(section => {
            const sectionHTML = this.renderSection(section);
            if (sectionHTML) {
                container.insertAdjacentHTML('beforeend', sectionHTML);
            }
        });
    }

    // Render individual section based on type
    renderSection(section) {
        const renderers = {
            hero: this.renderHeroSection.bind(this),
            collections: this.renderCollectionsSection.bind(this),
            bestSellers: this.renderBestSellersSection.bind(this),
            whyUs: this.renderWhyUsSection.bind(this),
            gifting: this.renderGiftingSection.bind(this),
            reviews: this.renderReviewsSection.bind(this),
            newsletter: this.renderNewsletterSection.bind(this)
        };

        const renderer = renderers[section.type];
        if (renderer) {
            return renderer(section.data);
        } else {
            console.warn('Unknown section type:', section.type);
            return '';
        }
    }

    // Section Renderers
    renderHeroSection(data) {
        return `
            <section class="hero-main">
                <div class="container">
                    <div class="hero-main-grid">
                        <div class="hero-main-content">
                            <h1 class="hero-main-title">${data.title || 'studio<br>akira'}</h1>
                            <p class="hero-main-tagline">${data.tagline || 'Where light becomes ritual.'}</p>
                            <p class="hero-main-description">${data.description || 'Handcrafted luxury candles that transform your space into a sanctuary'}</p>
                            <a href="${this.fixPath(data.buttonLink || 'customer/products.html')}" class="btn btn-primary btn-pill btn-large">${data.buttonText || 'Explore Collections'}</a>
                        </div>
                        <div class="hero-main-image">
                            <img src="${this.fixPath(data.image || 'assets/images/banners/Copilot_20260107_162550.png')}" alt="${data.imageAlt || 'Studio Akira Candles'}">
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderCollectionsSection(data) {
        const collections = data.collections || [];
        const collectionsHTML = collections.map(col => `
            <div class="benefit-card" style="cursor: pointer;" onclick="window.location.href='${this.fixPath(col.link || 'customer/products.html')}'">
                <div class="benefit-image">
                    <img src="${this.fixPath(col.image)}" alt="${col.title}">
                </div>
                <h3 class="benefit-title">${col.title}</h3>
                <p class="benefit-text">${col.description}</p>
                <div style="margin-top: 15px; font-weight: 600; color: var(--color-sage-dark);">${col.price || ''}</div>
            </div>
        `).join('');

        return `
            <section class="section benefits-section">
                <div class="container">
                    <p class="section-label">${data.label || 'SHOP OUR COLLECTIONS'}</p>
                    <h2 class="section-title">${data.title || 'Explore Our Candles'}</h2>
                    <p class="section-description">${data.description || 'Thoughtfully created candles for every mood, moment, and ritual.'}</p>
                    <div class="benefits-grid">
                        ${collectionsHTML}
                    </div>
                    <div class="text-center" style="margin-top: var(--spacing-xl);">
                        <a href="${this.fixPath(data.buttonLink || 'customer/products.html')}" class="btn btn-primary btn-large">${data.buttonText || 'View All Products'}</a>
                    </div>
                </div>
            </section>
        `;
    }

    renderBestSellersSection(data) {
        return `
            <section class="featured-collection-section">
                <div class="container">
                    <div class="featured-collection-grid">
                        <div class="featured-collection-content">
                            <p class="section-label" style="color: var(--color-sage-dark);">${data.label || 'BEST SELLERS'}</p>
                            <h2 class="featured-collection-title">${data.title || 'Most Loved'}</h2>
                            <p class="featured-collection-text">${data.description || 'Our most chosen candles — trusted, gifted, and returned to again and again.'}</p>
                            <a href="${this.fixPath(data.buttonLink || 'customer/products.html')}" class="btn btn-primary btn-large">${data.buttonText || 'Shop Best Sellers'}</a>
                        </div>
                        <div class="featured-collection-image">
                            <img src="${this.fixPath(data.image || 'assets/images/banners/hero.png')}" alt="${data.imageAlt || 'Best Sellers Collection'}">
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderWhyUsSection(data) {
        const stats = data.stats || [];
        const statsHTML = stats.map(stat => `
            <div style="padding: var(--spacing-lg);">
                <div style="font-size: 3rem; font-weight: 700; color: var(--color-sage-dark); font-family: var(--font-heading);">${stat.value}</div>
                <div style="color: var(--color-text-light); font-size: 0.95rem;">${stat.label}</div>
            </div>
        `).join('');

        const features = data.features || [];
        const featuresHTML = features.map(feature => `
            <div style="background: white; padding: var(--spacing-xl); border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--color-sage-light) 0%, var(--color-sage) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--spacing-md); font-size: 2rem;">${feature.icon}</div>
                <h3 style="font-size: 1.3rem; margin-bottom: var(--spacing-sm); color: var(--color-sage-darker);">${feature.title}</h3>
                <p style="color: var(--color-text-light); line-height: 1.6;">${feature.description}</p>
            </div>
        `).join('');

        const badges = data.badges || [];
        const badgesHTML = badges.map(badge => `
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-md) var(--spacing-lg); background: white; border-radius: 50px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <span style="font-size: 1.5rem;">${badge.icon}</span>
                <span style="font-weight: 500; color: var(--color-sage-darker);">${badge.text}</span>
            </div>
        `).join('');

        return `
            <section class="section" style="background: linear-gradient(135deg, #f8f6f3 0%, #e8e4df 100%); padding: var(--spacing-xxl) 0;">
                <div class="container">
                    <div style="text-align: center; margin-bottom: var(--spacing-xl);">
                        <p class="section-label">${data.label || 'THE STUDIO AKIRA PROMISE'}</p>
                        <h2 class="section-title">${data.title || 'Why Thousands Trust Our Candles'}</h2>
                        <p class="section-description" style="max-width: 700px; margin: 0 auto;">${data.description || 'Every candle we craft carries our commitment to quality, sustainability, and your well-being.'}</p>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-lg); margin-bottom: var(--spacing-xxl); text-align: center;">
                        ${statsHTML}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-xl);">
                        ${featuresHTML}
                    </div>
                    <div style="display: flex; justify-content: center; gap: var(--spacing-xl); margin-top: var(--spacing-xxl); flex-wrap: wrap;">
                        ${badgesHTML}
                    </div>
                </div>
            </section>
        `;
    }

    renderGiftingSection(data) {
        return `
            <section class="featured-collection-section" style="background: var(--color-sage-light);">
                <div class="container">
                    <div class="featured-collection-grid">
                        <div class="featured-collection-image">
                            <img src="${this.fixPath(data.image || 'assets/images/banners/hero.png')}" alt="${data.imageAlt || 'Luxury Gift Sets'}">
                        </div>
                        <div class="featured-collection-content">
                            <p class="section-label" style="color: var(--color-sage-dark);">${data.label || 'GIFTING'}</p>
                            <h2 class="featured-collection-title">${data.title || 'Gifts That Glow Longer'}</h2>
                            <p class="featured-collection-text">${data.description || 'Our luxury gift boxes are thoughtfully curated to celebrate moments, emotions, and connections.'}</p>
                            <a href="${this.fixPath(data.buttonLink || 'customer/products.html')}" class="btn btn-primary btn-large">${data.buttonText || 'Shop Gift Sets'}</a>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderReviewsSection(data) {
        const reviews = data.reviews || [];
        const reviewsHTML = reviews.map(review => `
            <div style="background: #fafafa; border: 1px solid #eee; border-radius: 16px; padding: var(--spacing-xl);">
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; background: ${review.avatarColor || 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.2rem;">${review.initial}</div>
                    <div>
                        <div style="font-weight: 600; color: var(--color-sage-darker);">${review.name}</div>
                        <div style="font-size: 0.85rem; color: var(--color-text-light);">${review.location}</div>
                    </div>
                    <div style="margin-left: auto; background: #e8f5e9; color: #2e7d32; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; font-weight: 500;">✓ Verified</div>
                </div>
                <div style="color: #f59e0b; margin-bottom: var(--spacing-sm);">${review.stars || '★★★★★'}</div>
                <h4 style="font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--color-sage-darker);">"${review.title}"</h4>
                <p style="color: var(--color-text-light); line-height: 1.6; margin-bottom: var(--spacing-sm);">${review.text}</p>
                <div style="font-size: 0.85rem; color: var(--color-text-light);">Purchased: ${review.product} • ${review.date}</div>
            </div>
        `).join('');

        return `
            <section class="section" style="background: white; padding: var(--spacing-xxl) 0;">
                <div class="container">
                    <div style="text-align: center; margin-bottom: var(--spacing-xl);">
                        <p class="section-label">${data.label || 'CUSTOMER REVIEWS'}</p>
                        <h2 class="section-title">${data.title || 'What Our Customers Say'}</h2>
                        <div style="display: flex; justify-content: center; align-items: center; gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                            <span style="color: #f59e0b; font-size: 1.5rem;">★★★★★</span>
                            <span style="font-weight: 600; color: var(--color-sage-darker);">${data.rating || '4.9 out of 5'}</span>
                            <span style="color: var(--color-text-light);">${data.reviewCount || 'based on 2,847 reviews'}</span>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-lg);">
                        ${reviewsHTML}
                    </div>
                    <div style="text-align: center; margin-top: var(--spacing-xl);">
                        <a href="${this.fixPath(data.buttonLink || 'customer/products.html')}" class="btn btn-secondary btn-large">${data.buttonText || 'Read All Reviews'}</a>
                    </div>
                </div>
            </section>
        `;
    }

    renderNewsletterSection(data) {
        return `
            <section class="section" style="background: var(--color-sage); padding: var(--spacing-xxl) 0;">
                <div class="container" style="text-align: center;">
                    <h2 class="section-title" style="color: white;">${data.title || 'Stay Connected'}</h2>
                    <p class="section-description" style="color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto var(--spacing-lg);">
                        ${data.description || 'Join our calm letters — quiet updates, new collections, and exclusive releases.<br>No noise. Only meaningful moments.'}
                    </p>
                    <div style="display: flex; gap: var(--spacing-sm); justify-content: center; flex-wrap: wrap; max-width: 500px; margin: 0 auto;">
                        <input type="email" placeholder="${data.placeholder || 'Enter your email'}" class="form-input" style="flex: 1; min-width: 250px;">
                        <button class="btn" style="background: white; color: var(--color-sage-dark);">${data.buttonText || 'Subscribe'}</button>
                    </div>
                </div>
            </section>
        `;
    }

    // Default theme (standard)
    getDefaultTheme() {
        return {
            id: 'standard',
            name: 'Standard',
            colors: {
                'color-sage-light': '#E8EDE8',
                'color-sage': '#A8B5A0',
                'color-sage-dark': '#6B8A6B',
                'color-sage-darker': '#4A6B4A'
            }
        };
    }

    // Default content structure
    getDefaultContent(pageId = 'homepage') {
        if (pageId === 'about') {
            return {
                sections: [
                    {
                        id: 'about_hero',
                        type: 'hero',
                        order: 1,
                        active: true,
                        data: {
                            title: 'Our Story',
                            tagline: 'Crafting light, warmth, and serenity.',
                            description: 'Studio Akira began with a simple belief: that the objects we surround ourselves with effectively shape our daily rituals.',
                            image: 'assets/images/banners/hero.png'
                        }
                    }
                ]
            };
        }

        return {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    order: 1,
                    active: true,
                    data: {
                        title: 'studio<br>akira',
                        tagline: 'Where light becomes ritual.',
                        description: 'Handcrafted luxury candles that transform your space into a sanctuary',
                        buttonText: 'Explore Collections',
                        buttonLink: 'customer/products.html',
                        image: 'assets/images/banners/Copilot_20260107_162550.png',
                        imageAlt: 'Studio Akira - Lavender & Sandal Botanical Composition'
                    }
                }
            ]
        };
    }

    // Render navigation links to all menu containers
    renderNavigation(containerSelector = '.navbar-menu') {
        const containers = document.querySelectorAll(containerSelector);
        if (!containers.length) return;

        const navHTML = this.navigation.map(link => {
            const path = this.fixPath(link.url);
            // Handle special onclick actions if any (like requireLogin)
            const onclick = link.action ? `onclick="${link.action}; return false;"` : '';
            return `<li><a href="${path}" class="navbar-link" ${onclick}>${link.label}</a></li>`;
        }).join('');

        containers.forEach(container => {
            container.innerHTML = navHTML;
        });
    }

    // Default navigation structure
    getDefaultNavigation() {
        return [
            { label: 'Home', url: 'index.html' },
            { label: 'Collections', url: '#', action: "requireLogin('collections')" },
            { label: 'About', url: 'about.html' },
            { label: 'Contact', url: 'contact.html' },
            { label: 'Orders', url: '#', action: "requireLogin('orders')" }
        ];
    }
}

// Initialize CMS globally
const cms = new ContentManagementSystem();
