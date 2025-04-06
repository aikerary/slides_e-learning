/**
 * Theme toggle functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    // Detect system preference if no saved preference
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Toggle theme when switch is clicked
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            enableDarkTheme();
        } else {
            enableLightTheme();
        }
    });
    
    // Function to enable dark theme
    function enableDarkTheme() {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        
        // Change base Reveal theme
        document.getElementById('theme-base').href = 'https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/black.css';
        
        // Notify Reveal.js of theme change
        if (typeof Reveal !== 'undefined') {
            setTimeout(() => {
                Reveal.layout();
            }, 200);
        }
    }
    
    // Function to enable light theme
    function enableLightTheme() {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        
        // Change base Reveal theme
        document.getElementById('theme-base').href = 'https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/white.css';
        
        // Notify Reveal.js of theme change
        if (typeof Reveal !== 'undefined') {
            setTimeout(() => {
                Reveal.layout();
            }, 200);
        }
    }
    
    // Handle keyboard shortcut (Alt+T) for toggling theme
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 't') {
            themeToggle.checked = !themeToggle.checked;
            
            if (themeToggle.checked) {
                enableDarkTheme();
            } else {
                enableLightTheme();
            }
        }
    });
    
    // Ensure theme toggle is visible in all contexts
    function ensureToggleVisibility() {
        const themeToggleWrapper = document.querySelector('.theme-toggle-wrapper');
        document.body.appendChild(themeToggleWrapper);
    }
    
    // Apply after slight delay to ensure DOM is fully loaded
    setTimeout(ensureToggleVisibility, 500);
});

// Ensure toggle works even if loaded dynamically
window.addEventListener('load', function() {
    // Double-check toggle is working after everything is loaded
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && document.body.classList.contains('dark-theme')) {
        themeToggle.checked = true;
    }
});
