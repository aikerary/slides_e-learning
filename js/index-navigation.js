/**
 * Index navigation functionality
 * Manages the "Back to Index" buttons with BLUE color in TOP LEFT corner
 */

(function() {
    // Main function to add back-to-index buttons
    function addBackToIndexButtons() {
        console.log('Adding back-to-index buttons to slides - BLUE in TOP LEFT');
        
        // Get all content slides (not title or index slides)
        const contentSlides = document.querySelectorAll('.reveal .slides > section:not(.title-slide):not(.index-slide)');
        
        // Get current language
        const currentLang = document.documentElement.lang || 'es';
        const buttonTitle = currentLang === 'en' ? 'Back to index' : 'Volver al índice';
        
        contentSlides.forEach(slide => {
            // Check if button already exists
            const existingButton = slide.querySelector('.back-to-index');
            
            if (existingButton) {
                // Update existing button title
                existingButton.title = buttonTitle;
                
                // Force styling
                forceButtonStyling(existingButton);
            } else {
                // Create new button with just the icon
                const backButton = document.createElement('div');
                backButton.className = 'back-to-index';
                
                // Set content with icon only
                backButton.innerHTML = `<i class="fas fa-list"></i>`;
                backButton.title = buttonTitle;
                backButton.tabIndex = 0; // Make focusable for accessibility
                
                // Add click event
                backButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof Reveal !== 'undefined') {
                        Reveal.slide(1); // Navigate to index slide (usually slide 1)
                    }
                });
                
                // Add keyboard event for accessibility
                backButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (typeof Reveal !== 'undefined') {
                            Reveal.slide(1);
                        }
                    }
                });
                
                // Force styling
                forceButtonStyling(backButton);
                
                // Insert at beginning of slide
                slide.insertBefore(backButton, slide.firstChild);
            }
        });
    }
    
    // Helper function to force button styling
    function forceButtonStyling(button) {
        // Force position to top left
        button.style.position = 'absolute';
        button.style.top = '10px';
        button.style.left = '10px';
        button.style.right = 'auto';
        button.style.bottom = 'auto';
        button.style.zIndex = '9999';
        
        // Force color to blue
        button.style.color = '#0077cc';
        
        // Force sizing
        button.style.width = 'auto';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.padding = '5px 8px';
        
        // Force icon color to blue
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.color = '#0077cc';
        }
    }
    
    // Run on DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Add buttons after everything is loaded with delays to ensure proper execution
        setTimeout(addBackToIndexButtons, 1000);
        setTimeout(addBackToIndexButtons, 2000);
    });
    
    // Run after Reveal.js is initialized
    window.addEventListener('load', function() {
        if (typeof Reveal !== 'undefined') {
            Reveal.addEventListener('ready', function() {
                addBackToIndexButtons();
                // Run again after a short delay to be sure
                setTimeout(addBackToIndexButtons, 500);
            });
            
            // Also run when slides change
            Reveal.addEventListener('slidechanged', function() {
                // Force styling on all existing buttons
                document.querySelectorAll('.back-to-index').forEach(forceButtonStyling);
                
                // Add missing buttons
                addBackToIndexButtons();
            });
        }
        
        // Run periodically to ensure buttons stay visible and properly styled
        setInterval(function() {
            document.querySelectorAll('.back-to-index').forEach(forceButtonStyling);
        }, 2000);
    });
    
    // Add event listener for language changes
    document.addEventListener('languageChanged', addBackToIndexButtons);
    
    // Make functions available globally
    window.addBackToIndexButtons = addBackToIndexButtons;
    window.forceIndexButtonStyling = function() {
        document.querySelectorAll('.back-to-index').forEach(forceButtonStyling);
    };
})();
