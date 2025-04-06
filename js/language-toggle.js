/**
 * Language Toggle Functionality
 * Allows switching between Spanish and English for the presentation
 */

// Language state management
let currentLanguage = localStorage.getItem('presentationLanguage') || 'es';
let isChangingLanguage = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Language toggle initializing...');
    
    // Create date formatter utility
    window.dateFormatter = {
        getCurrentDate: function(lang) {
            const today = new Date();
            if (lang === 'en') {
                // English format: Month Day, Year
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return today.toLocaleDateString('en-US', options);
            } else {
                // Spanish format: Day de Month de Year
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return today.toLocaleDateString('es-ES', options);
            }
        }
    };
    
    // Initialize toggle element and add event listeners
    initLanguageToggle();
    
    // Set initial language based on localStorage
    updateLanguageUI(currentLanguage);
    
    // Apply language attribute to HTML
    document.documentElement.lang = currentLanguage;
    
    console.log('Language toggle initialized with language:', currentLanguage);
});

/**
 * Initialize language toggle functionality
 */
function initLanguageToggle() {
    // Get language toggle button
    const languageToggle = document.getElementById('language-toggle-btn');
    
    if (!languageToggle) {
        console.error('Language toggle button not found in the DOM');
        return;
    }
    
    // Add click event handler
    languageToggle.addEventListener('click', handleLanguageToggle);
    
    // Add keyboard handler for accessibility
    languageToggle.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleLanguageToggle();
        }
    });
    
    // Mark as initialized
    languageToggle.setAttribute('data-language-toggle-initialized', 'true');
    
    // Create global handler for emergency script
    window.handleLanguageToggle = handleLanguageToggle;
    
    // Create loading indicator in advance
    createLoadingIndicator();
}

/**
 * Language toggle click handler
 */
function handleLanguageToggle() {
    // Prevent multiple rapid clicks
    if (isChangingLanguage) {
        console.log('Language change already in progress, ignoring click');
        return;
    }
    
    // Set busy state
    isChangingLanguage = true;
    
    // Toggle language
    const newLanguage = currentLanguage === 'es' ? 'en' : 'es';
    console.log(`Changing language from ${currentLanguage} to ${newLanguage}`);
    
    // Show loading indicator immediately
    showLoadingIndicator();
    
    // Add loading class to body 
    document.body.classList.add('language-loading');
    document.body.classList.add('language-loading-active');
    
    // Update UI immediately for responsive feel
    updateLanguageUI(newLanguage);
    
    // Store the new language
    localStorage.setItem('presentationLanguage', newLanguage);
    currentLanguage = newLanguage;
    
    // Update HTML lang attribute
    document.documentElement.lang = newLanguage;
    
    // Use the presentation's update function if available
    if (typeof window.updatePresentationLanguage === 'function') {
        try {
            const success = window.updatePresentationLanguage(newLanguage);
            
            if (success) {
                // Trigger custom event for other components
                triggerLanguageChangedEvent(newLanguage);
                
                // Reset busy state after a delay to prevent rapid toggling
                setTimeout(() => {
                    isChangingLanguage = false;
                }, 1000);
            } else {
                console.error('Failed to update presentation language');
                handleLanguageChangeFailure();
            }
        } catch (error) {
            console.error('Error updating presentation language:', error);
            handleLanguageChangeFailure();
        }
    } else {
        console.warn('updatePresentationLanguage function not available, falling back to page reload');
        
        // If the update function isn't available, reload the page
        // This is a fallback approach that ensures content is updated
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

/**
 * Update UI elements to reflect current language
 */
function updateLanguageUI(language) {
    // Update toggle button text
    const toggleButton = document.getElementById('language-toggle-btn');
    if (toggleButton) {
        const textElement = toggleButton.querySelector('.language-text');
        if (textElement) {
            textElement.textContent = language.toUpperCase();
        }
    }
    
    // Update page title based on language
    updatePageTitle(language);
}

/**
 * Update page title based on language
 */
function updatePageTitle(language) {
    const titleElement = document.querySelector('title');
    if (!titleElement) return;
    
    if (language === 'es') {
        titleElement.textContent = 'Presentación: Educación en Ambientes Virtuales';
    } else {
        titleElement.textContent = 'Presentation: Education in Virtual Environments';
    }
}

/**
 * Handle language change failure
 */
function handleLanguageChangeFailure() {
    // Revert to previous language in localStorage
    localStorage.setItem('presentationLanguage', currentLanguage);
    
    // Update UI to reflect the reversion
    updateLanguageUI(currentLanguage);
    
    // Reset busy state
    isChangingLanguage = false;
    
    // Inform the user
    alert('No se pudo cambiar el idioma. / Could not change language.');
}

/**
 * Trigger custom event for language change
 */
function triggerLanguageChangedEvent(language) {
    const event = new CustomEvent('languageChanged', { 
        detail: { language: language },
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
    console.log('Language changed event triggered');
}

/**
 * Create loading indicator
 */
function createLoadingIndicator() {
    // Check if indicator already exists
    if (document.getElementById('language-loading-indicator')) {
        return;
    }
    
    // Create new loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'language-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Cambiando idioma / Changing language...</p>
            <p class="loading-message-small">Por favor espere / Please wait</p>
        </div>
    `;
    
    // Add custom styling for small message
    const style = document.createElement('style');
    style.textContent = `
        .loading-message-small {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
    
    // Add to body
    document.body.appendChild(loadingIndicator);
}

/**
 * Show language loading indicator
 */
function showLoadingIndicator() {
    let indicator = document.getElementById('language-loading-indicator');
    
    // Create indicator if it doesn't exist
    if (!indicator) {
        createLoadingIndicator();
        indicator = document.getElementById('language-loading-indicator');
    }
    
    // Display the indicator
    indicator.style.display = 'flex';
    
    // Trigger reflow before adding opacity for transition
    void indicator.offsetWidth;
    
    // Fade in
    indicator.style.opacity = '1';
}

/**
 * Hide language loading indicator
 */
function hideLoadingIndicator() {
    const indicator = document.getElementById('language-loading-indicator');
    if (indicator) {
        // Fade out
        indicator.style.opacity = '0';
        
        // Remove loading classes from body
        document.body.classList.remove('language-loading');
        document.body.classList.remove('language-loading-active');
        
        // Remove after transition
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }
}

/**
 * Public API for other scripts
 */
window.languageToggle = {
    getCurrentLanguage: function() {
        return currentLanguage;
    },
    
    setLanguage: function(language) {
        if (language !== 'es' && language !== 'en') {
            console.error('Invalid language code. Use "es" or "en".');
            return false;
        }
        
        // Only proceed if different from current language
        if (language !== currentLanguage && !isChangingLanguage) {
            currentLanguage = language;
            localStorage.setItem('presentationLanguage', language);
            updateLanguageUI(language);
            
            if (typeof window.updatePresentationLanguage === 'function') {
                return window.updatePresentationLanguage(language);
            } else {
                location.reload();
                return true;
            }
        }
        
        return false;
    },
    
    toggleLanguage: function() {
        handleLanguageToggle();
    },
    
    formatDate: function(date, language) {
        const lang = language || currentLanguage;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        if (lang === 'en') {
            return date.toLocaleDateString('en-US', options);
        } else {
            return date.toLocaleDateString('es-ES', options);
        }
    }
};

// Handle window load event to ensure initialization
window.addEventListener('load', function() {
    // Double-check toggle initialization
    const toggleButton = document.getElementById('language-toggle-btn');
    if (toggleButton && !toggleButton.hasAttribute('data-language-toggle-initialized')) {
        console.warn('Language toggle not initialized in DOMContentLoaded, initializing now');
        initLanguageToggle();
    }
    
    // Create loading indicator on load to ensure it's ready
    createLoadingIndicator();
});
