/**
 * Grid-based loader implementation
 * This file provides a perfectly centered loading indicator using CSS Grid
 */

/**
 * Create a grid-centered loading indicator
 * Using CSS Grid with place-items: center for perfect centering
 */
function createGridCenteredLoader() {
    console.log("Creating grid-centered loading indicator");
    
    // Remove any existing indicator
    const existingIndicator = document.getElementById('language-loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create a static HTML string with critical inline styles
    const loaderHTML = `
        <div id="language-loading-indicator" style="display:grid !important; place-items:center !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; width:100vw !important; height:100vh !important; background-color:rgba(0,0,0,0.85) !important; z-index:999999 !important; margin:0 !important; padding:0 !important; pointer-events:all !important;">
            <div style="width:300px !important; margin:0 !important; padding:0 !important; text-align:center !important;">
                <div style="width:6rem !important; height:6rem !important; border:0.4rem solid rgba(255,255,255,0.3) !important; border-top-color:#0077cc !important; border-radius:50% !important; margin:0 auto 2rem auto !important; animation:grid-spin 1s linear infinite !important;"></div>
                <div style="color:white !important; font-size:1.6rem !important; font-weight:500 !important; text-align:center !important; width:100% !important; margin:0 !important; padding:0 !important;">Cambiando idioma / Changing language...</div>
            </div>
        </div>
    `;
    
    // Add the keyframes for the spinner animation if they don't exist
    if (!document.getElementById('grid-spin-keyframes')) {
        const keyframes = document.createElement('style');
        keyframes.id = 'grid-spin-keyframes';
        keyframes.textContent = `
            @keyframes grid-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(keyframes);
    }
    
    // Insert the HTML string into the document
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
    
    // Add loading classes to body
    document.body.classList.add('language-loading');
    document.body.classList.add('language-loading-active');
    
    // Lock body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    console.log('Grid-centered loading indicator created');
    return document.getElementById('language-loading-indicator');
}

/**
 * Hide the grid-centered loading indicator
 * @param {boolean} force - Whether to force immediate removal
 */
function hideGridLoader(force = false) {
    const indicator = document.getElementById('language-loading-indicator');
    if (!indicator) return;
    
    if (force) {
        // Immediately remove
        indicator.remove();
    } else {
        // Fade out then remove
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.3s ease-out';
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 300);
    }
    
    // Remove loading classes from body
    document.body.classList.remove('language-loading');
    document.body.classList.remove('language-loading-active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    console.log('Grid-centered loading indicator hidden');
}

// Export functions
window.createGridCenteredLoader = createGridCenteredLoader;
window.hideGridLoader = hideGridLoader;

// Replace the standard loading function with our grid-centered one
window.addEventListener('load', function() {
    // Replace the showLanguageLoadingIndicator function if it exists
    if (typeof window.showLanguageLoadingIndicator === 'function') {
        console.log('Replacing showLanguageLoadingIndicator with grid-centered version');
        window.originalShowLanguageLoadingIndicator = window.showLanguageLoadingIndicator;
        window.showLanguageLoadingIndicator = createGridCenteredLoader;
    }
});
