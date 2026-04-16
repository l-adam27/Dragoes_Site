// ================================
// DRAGÕES METÁLICOS - SCRIPTS
// ================================

// Language Toggle System
const translations = {
    pt: {},
    en: {}
};

let currentLang = 'pt';

// Initialize language system
document.addEventListener('DOMContentLoaded', () => {
    initLanguageToggle();
    initSmoothScroll();
    initMobileMenu();
    initFormHandling();
    loadDonors();
});

// ================================
// LANGUAGE TOGGLE
// ================================

function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    const langOptions = langToggle.querySelectorAll('.lang-option');

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        updateLanguage();

        langOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === currentLang);
        });
    });
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-en]');

    elements.forEach(element => {
        if (currentLang === 'en') {
            const translation = element.getAttribute('data-en');
            // Check if element has child elements (like LIVE badge)
            const childElements = element.querySelectorAll('*');
            if (childElements.length > 0) {
                element.dataset.originalHtml = element.innerHTML;
                // Preserve child elements by only replacing the text node
                const childHtml = Array.from(childElements).map(el => el.outerHTML).join('');
                element.innerHTML = translation + ' ' + childHtml;
            } else {
                element.dataset.originalText = element.textContent;
                element.textContent = translation;
            }
        } else {
            if (element.dataset.originalHtml) {
                element.innerHTML = element.dataset.originalHtml;
                delete element.dataset.originalHtml;
            } else if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        }
    });

    // Handle nav-live-link (no data-en, manual toggle)
    const navLiveLink = document.querySelector('.nav-live-link');
    if (navLiveLink) {
        const badge = navLiveLink.querySelector('.live-badge');
        const badgeHtml = badge ? badge.outerHTML : '';
        if (currentLang === 'en') {
            navLiveLink.innerHTML = 'Donors ' + badgeHtml;
        } else {
            navLiveLink.innerHTML = 'Doadores ' + badgeHtml;
        }
    }

    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-en-placeholder]');
    placeholderElements.forEach(element => {
        if (currentLang === 'en') {
            const translation = element.getAttribute('data-en-placeholder');
            element.dataset.originalPlaceholder = element.placeholder;
            element.placeholder = translation;
        } else {
            if (element.dataset.originalPlaceholder) {
                element.placeholder = element.dataset.originalPlaceholder;
            }
        }
    });
}

// ================================
// SMOOTH SCROLLING
// ================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================
// MOBILE MENU (HAMBURGER)
// ================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fechar ao clicar em qualquer link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Fechar ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// ================================
// FORM HANDLING
// ================================

function initFormHandling() {
    const sponsorForm = document.getElementById('sponsorForm');

    sponsorForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(sponsorForm);
        const data = Object.fromEntries(formData);

        console.log('Form submitted:', data);

        // TODO: Integrate with Google Forms or backend
        // For now, show success message
        alert(currentLang === 'pt'
            ? 'Obrigado pelo interesse! Entraremos em contato em breve.'
            : 'Thank you for your interest! We will contact you soon.'
        );

        sponsorForm.reset();
    });
}

// ================================
// DONORS TABLE - GOOGLE SHEETS INTEGRATION
// ================================

// SETUP INSTRUCTIONS:
// 1. Create a Google Sheet with columns: Nome, Valor, Plataforma, Data, Anônimo
// 2. Go to Extensions > Apps Script
// 3. Copy and paste the code from GOOGLE_SHEETS_SCRIPT.md
// 4. Deploy as Web App
// 5. Copy the deployment URL and paste it in the SHEET_URL variable below

const SHEET_URL = 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE';

async function loadDonors() {
    const tableBody = document.getElementById('donorsTableBody');

    // Check if Sheet URL is configured
    if (SHEET_URL === 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE') {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; opacity: 0.6;">
                    ${currentLang === 'pt'
                ? 'Configure a integração com Google Sheets para exibir doações.'
                : 'Configure Google Sheets integration to display donations.'}
                    <br>
                    <small style="font-size: 0.85rem; margin-top: 0.5rem; display: block;">
                        ${currentLang === 'pt'
                ? 'Veja instruções em GOOGLE_SHEETS_SETUP.md'
                : 'See instructions in GOOGLE_SHEETS_SETUP.md'}
                    </small>
                </td>
            </tr>
        `;
        return;
    }

    try {
        const response = await fetch(SHEET_URL);
        const donors = await response.json();

        if (!donors || donors.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; opacity: 0.6;">
                        ${currentLang === 'pt' ? 'Nenhuma doação registrada ainda.' : 'No donations recorded yet.'}
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = donors.map(donor => `
            <tr>
                <td>${donor.anonimo ? (currentLang === 'pt' ? 'Anônimo' : 'Anonymous') : donor.nome}</td>
                <td>${donor.valor}</td>
                <td>${donor.plataforma}</td>
                <td>${formatDate(donor.data)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading donors:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: #870000;">
                    ${currentLang === 'pt'
                ? 'Erro ao carregar doações. Verifique a configuração.'
                : 'Error loading donations. Check configuration.'}
                </td>
            </tr>
        `;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return currentLang === 'pt'
        ? date.toLocaleDateString('pt-BR')
        : date.toLocaleDateString('en-US');
}

// Reload donors when language changes
const originalUpdateLanguage = updateLanguage;
updateLanguage = function () {
    originalUpdateLanguage();
    loadDonors();
};
