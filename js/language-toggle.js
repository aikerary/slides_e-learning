/**
 * Language toggle functionality with improved loading indicator
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Language toggle module loaded');
    
    // Initialize the language toggle
    initLanguageToggle();
});

/**
 * Initialize the language toggle functionality
 */
function initLanguageToggle() {
    const toggleBtn = document.getElementById('language-toggle-btn');
    if (!toggleBtn) {
        console.error('Language toggle button not found');
        return;
    }
    
    // Get stored language preference or default to Spanish
    const currentLang = localStorage.getItem('presentationLanguage') || 'es';
    
    // Update UI to reflect current language
    updateToggleUI(currentLang);
    
    // Set the document language attribute
    document.documentElement.lang = currentLang;
    
    // Add click event handler
    toggleBtn.addEventListener('click', handleLanguageToggle);
    
    // Mark as initialized
    toggleBtn.setAttribute('data-language-toggle-initialized', 'true');
    
    console.log(`Language toggle initialized with language: ${currentLang}`);
}

/**
 * Handle language toggle click
 */
window.handleLanguageToggle = function() {
    console.log('Language toggle clicked');
    
    // Get current language
    const currentLang = localStorage.getItem('presentationLanguage') || 'es';
    const newLang = currentLang === 'es' ? 'en' : 'es';
    
    // Update UI immediately to give feedback
    updateToggleUI(newLang);
    
    // Store preference
    localStorage.setItem('presentationLanguage', newLang);
    
    // Set the document language attribute
    document.documentElement.lang = newLang;
    
    console.log(`Language changed to ${newLang}`);
    
    // Show loading indicator first before making any content changes
    showCenteredLoadingIndicator();
    
    // Update content - Add a small delay to ensure loading UI is visible first
    setTimeout(() => {
        if (typeof window.updatePresentationLanguage === 'function') {
            const success = window.updatePresentationLanguage(newLang);
            
            if (!success) {
                console.log('Content update failed, reloading page instead');
                location.reload();
            }
        } else {
            console.log('Update function not available, reloading page instead');
            location.reload();
        }
        
        // Dispatch custom event for language change
        const event = new CustomEvent('languageChanged', { detail: { language: newLang } });
        document.dispatchEvent(event);
    }, 100);
};

/**
 * Update the toggle UI to reflect the current language
 */
function updateToggleUI(lang) {
    const toggleBtn = document.getElementById('language-toggle-btn');
    if (!toggleBtn) return;
    
    const textElement = toggleBtn.querySelector('.language-text');
    if (textElement) {
        textElement.textContent = lang.toUpperCase();
    }
}

/**
 * Show a perfectly centered loading indicator
 */
function showCenteredLoadingIndicator() {
    // Create a centered loading indicator element
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'language-loading-indicator';
    
    // Explicitly set all positioning styles inline to ensure they take effect
    Object.assign(loadingIndicator.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999999',
        margin: '0',
        padding: '0',
        pointerEvents: 'all',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        boxSizing: 'border-box',
        overflow: 'hidden'
    });
    
    // Create the inner content with guaranteed centering
    const spinnerSize = '6rem';
    const spinnerBorder = '0.4rem';
    
    // Set the inner HTML using a template string with inline styles
    loadingIndicator.innerHTML = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;margin:0;padding:0;">
            <div style="width:${spinnerSize};height:${spinnerSize};margin:0 auto 2rem;border:${spinnerBorder} solid rgba(255,255,255,0.3);border-top:${spinnerBorder} solid #0077cc;border-radius:50%;animation:spin 1s linear infinite;"></div>
            <p style="width:100%;max-width:80%;color:white;font-size:1.6rem;font-weight:500;text-align:center;margin:1rem auto;padding:0;">Cambiando idioma / Changing language...</p>
        </div>
    `;
    
    // Remove any existing loading indicator
    const existingIndicator = document.getElementById('language-loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add to body
    document.body.appendChild(loadingIndicator);
    
    // Lock body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Add loading class to body
    document.body.classList.add('language-loading');
    document.body.classList.add('language-loading-active');
    
    console.log('Centered loading indicator displayed');
}
