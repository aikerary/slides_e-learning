/**
 * Presentation script - Completely rewritten to fix recursion issues
 */

// Global variables for state tracking
let isProcessingLanguageChange = false;
let initialLoad = true;

// Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Presentation script loaded - DOM ready');
    loadPresentation();
});

/**
 * Main function to load the presentation
 */
function loadPresentation() {
    // Show loading indicator
    const slidesContainer = document.getElementById('presentation-slides');
    slidesContainer.innerHTML = `
        <section class="loading-section">
            <h2>Cargando presentación...</h2>
            <div class="loader"></div>
        </section>
    `;
    
    // Fetch content
    console.log('Fetching presentation content...');
    fetch('content.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Get current language
            const currentLang = localStorage.getItem('presentationLanguage') || 'es';
            console.log(`Initial presentation language: ${currentLang}`);
            
            // Process slides ONLY ONCE
            processSlides(data, currentLang);
            
            // Initialize RevealJS
            initReveal();
            
            // Mark initial load as complete
            setTimeout(() => {
                initialLoad = false;
                console.log('Initial presentation load complete');
            }, 1000);
        })
        .catch(error => {
            console.error('Error loading presentation:', error);
            slidesContainer.innerHTML = `
                <section>
                    <h2>Error al cargar la presentación</h2>
                    <p>Lo sentimos, ocurrió un error al cargar el contenido: ${error.message}</p>
                    <p><button onclick="location.reload()">Reintentar</button></p>
                </section>
            `;
        });
}

/**
 * Update presentation when language changes - improved loading display
 * This function is called externally by the language toggle
 */
window.updatePresentationLanguage = function(lang) {
    console.log(`Language change requested: ${lang}`);
    
    // Prevent operation if Reveal isn't loaded
    if (typeof Reveal === 'undefined') {
        console.error('Reveal.js not loaded, cannot update language');
        return false;
    }
    
    // Get current slide
    const currentIndex = window.lastSlideIndex || Reveal.getIndices().h;
    console.log(`Current slide index: ${currentIndex}`);
    
    try {
        // Add loading classes to body FIRST to hide content immediately
        document.body.classList.add('language-loading');
        document.body.classList.add('language-loading-active');
        
        // Hide all slide content immediately while we create loading indicator
        const slidesContainer = document.querySelector('.reveal .slides');
        if (slidesContainer) {
            slidesContainer.style.opacity = '0';
            slidesContainer.style.visibility = 'hidden';
        }
        
        // Create and show loading indicator
        showLanguageLoadingIndicator();
        
        // Short delay to ensure UI updates before fetching
        setTimeout(() => {
            // Fetch content
            console.log('Fetching content for language update...');
            fetch('content.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch content');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Content fetched successfully, updating slides');
                    
                    // Process slides with new language
                    processSlides(data, lang);
                    
                    // Restore position after a delay to ensure rendering is complete
                    setTimeout(() => {
                        try {
                            console.log(`Navigating to slide ${currentIndex}`);
                            Reveal.slide(currentIndex);
                            
                            // Final adjustments
                            fixIconPositioning();
                            
                            // IMPORTANTE: Añadir botones de índice de nuevo después de actualizar el contenido
                            addBackToIndexButtonsToAllSlides();
                            
                            // After everything is ready, remove loading classes and show slides
                            setTimeout(() => {
                                hideLanguageLoadingIndicator();
                                
                                // Show slides again
                                if (slidesContainer) {
                                    slidesContainer.style.opacity = '';
                                    slidesContainer.style.visibility = '';
                                }
                                
                                // Remove loading classes from body
                                document.body.classList.remove('language-loading');
                                document.body.classList.remove('language-loading-active');
                                
                                console.log('Language update complete and slides visible');
                                
                                // Final check to ensure buttons are visible
                                setTimeout(addBackToIndexButtonsToAllSlides, 300);
                            }, 400);
                        } catch (e) {
                            console.error('Error navigating to slide:', e);
                            hideLanguageLoadingIndicator();
                            document.body.classList.remove('language-loading');
                            document.body.classList.remove('language-loading-active');
                        }
                    }, 600);
                })
                .catch(error => {
                    console.error('Error updating language:', error);
                    hideLanguageLoadingIndicator();
                    document.body.classList.remove('language-loading');
                    document.body.classList.remove('language-loading-active');
                    alert(`Error updating language: ${error.message}. The page will reload.`);
                    location.reload();
                });
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Critical error during language update:', error);
        hideLanguageLoadingIndicator();
        document.body.classList.remove('language-loading');
        document.body.classList.remove('language-loading-active');
        return false;
    }
};

/**
 * Show language loading indicator
 */
function showLanguageLoadingIndicator() {
    // Remove any existing indicator
    const existingIndicator = document.getElementById('language-loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'language-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Cambiando idioma / Changing language...</p>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(loadingIndicator);
    
    console.log('Loading indicator displayed');
}

/**
 * Hide language loading indicator
 */
function hideLanguageLoadingIndicator() {
    const loadingIndicator = document.getElementById('language-loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.opacity = '0';
        
        // Remove from DOM after fade out
        setTimeout(() => {
            loadingIndicator.remove();
            console.log('Loading indicator removed');
        }, 300);
    }
}

/**
 * Process slide content and create HTML
 */
function processSlides(contentData, language) {
    if (!contentData || !Array.isArray(contentData)) {
        console.error('Invalid content data:', contentData);
        return;
    }
    
    console.log(`Processing ${contentData.length} slides in ${language}`);
    const slidesContainer = document.getElementById('presentation-slides');
    
    // Safety check
    if (!slidesContainer) {
        console.error('Slides container not found');
        return;
    }
    
    // Clear existing content
    slidesContainer.innerHTML = '';
    
    // Process each slide
    contentData.forEach((item, index) => {
        // Create slide element
        const slide = document.createElement('section');
        slide.className = 'with-icon';
        
        // Get icon
        const iconClass = (item.icon && item.icon.startsWith('fa-')) 
            ? item.icon 
            : `fa-${item.icon || 'file-alt'}`;
        
        // Get content based on selected language
        let title = item.titulo;
        let points = item.puntos ? [...item.puntos] : []; // Clone the array to avoid modifying the original
        
        if (language === 'en' && item.en) {
            title = item.en.titulo || title;
            points = item.en.puntos ? [...item.en.puntos] : points; // Clone the array
        }
        
        // Reemplazar fecha en la diapositiva de título (primera diapositiva)
        if (index === 0) {
            // Buscar y reemplazar la fecha en el array de puntos
            points = points.map(point => {
                // Buscar patrones de fecha y reemplazarlos
                if (point.includes('Fecha:') || point.includes('Date:')) {
                    // Obtener la fecha actual formateada
                    const currentDate = window.dateFormatter ? 
                        window.dateFormatter.getCurrentDate(language) : 
                        new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
                    
                    // Reemplazar con el nuevo formato
                    return language === 'es' ? 
                        `Fecha: ${currentDate}` : 
                        `Date: ${currentDate}`;
                }
                return point;
            });
        }
        
        // Generate slide HTML based on slide type
        let slideContent = '';
        
        // Title slide (first slide)
        if (index === 0) {
            slide.className += ' title-slide';
            slideContent = `
                <i class="fas ${iconClass} slide-icon"></i>
                <h1>${title}</h1>
                ${points.map(point => `<p>${point}</p>`).join('')}
            `;
        }
        // Index slide (second slide)
        else if (index === 1 && (item.type === 'index' || title.toLowerCase() === 'índice' || title.toLowerCase() === 'index')) {
            slide.className += ' index-slide';
            
            // Create index list with data-target attributes for navigation
            // Use regular list items with their natural numbers
            const indexItems = points.map((point, i) => {
                // Calculate target slide (index + 1 to account for title and index slides)
                const targetSlide = i + 2;
                
                // Just use the point text as is, without extracting the number manually
                return `<li data-target="${targetSlide}" class="index-item">${point}</li>`;
            }).join('');
            
            slideContent = `
                <h2>${title}</h2>
                <ol class="index-list">
                    ${indexItems}
                </ol>
                <i class="fas ${iconClass} slide-icon"></i>
            `;
        }
        // LMS Examples slide (special format with images)
        else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            // Create a gallery of LMS examples with images
            slide.className += ' lms-examples-slide';
            
            // Start with the slide title
            slideContent = `<h2>${title}</h2>`;
            
            // Create the gallery container
            slideContent += '<div class="lms-gallery">';
            
            // Add each LMS with its image and description
            for (let i = 0; i < Math.min(points.length, item.images.length); i++) {
                // Extract name and description from bullet points
                const bulletPoint = points[i];
                const colonPos = bulletPoint.indexOf(':');
                let name = '', description = '';
                
                if (colonPos > 0) {
                    name = bulletPoint.substring(0, colonPos);
                    description = bulletPoint.substring(colonPos + 1).trim();
                } else {
                    name = bulletPoint;
                }
                
                // Get the URL if available
                const url = item.links && item.links[i] ? item.links[i] : '#';
                
                // Create the LMS item as a link
                slideContent += `
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="lms-item" tabindex="0">
                        <div class="lms-image-container">
                            <img src="${item.images[i]}" alt="${name}" class="lms-image">
                        </div>
                        <div class="lms-name">${name}</div>
                        <div class="lms-description">${description}</div>
                    </a>
                `;
            }
            
            // Close the gallery container
            slideContent += '</div>';
            
            // Add the icon
            slideContent += `<i class="fas ${iconClass} slide-icon"></i>`;
        }
        // References slide (last slide)
        else if (index === contentData.length - 1) {
            slideContent = `
                <h2>${title}</h2>
                <ul>
                    ${points.map(point => `<li>${formatText(point, language)}</li>`).join('')}
                </ul>
                <i class="fas ${iconClass} slide-icon"></i>
            `;
        }
        // Regular content slide
        else {
            // Process bullet points with proper indentation
            const bulletPoints = processBulletPoints(points, language);
            
            slideContent = `
                <h2>${title}</h2>
                <ul>${bulletPoints}</ul>
                <i class="fas ${iconClass} slide-icon"></i>
            `;
        }
        
        // Set the slide content
        slide.innerHTML = slideContent;
        
        // Add to container
        slidesContainer.appendChild(slide);
    });
    
    // Add click events to index items after all slides are created
    const indexItems = document.querySelectorAll('.index-item');
    indexItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSlide = parseInt(this.getAttribute('data-target'), 10);
            if (!isNaN(targetSlide)) {
                // Navigate to the target slide when clicked
                if (typeof Reveal !== 'undefined') {
                    Reveal.slide(targetSlide);
                }
            }
        });
    });
    
    // Fix icon positioning after slides are created
    setTimeout(fixIconPositioning, 100);
}

/**
 * Process bullet points with proper indentation levels
 */
function processBulletPoints(points, language) {
    if (!points || !Array.isArray(points)) return '';
    
    let result = '';
    
    points.forEach(point => {
        // Determine indentation level
        let level = 0;
        let content = point;
        
        if (point.startsWith('  - ')) {
            level = 1;
            content = point.substring(4);
        } else if (/^\s{2}[1-6]\./.test(point)) {
            level = 1;
            content = point.substring(4);
        } else if (point.startsWith('    ')) {
            level = 2;
            content = point.substring(4);
        }
        
        // Check if it's a source reference
        if (point.startsWith('(Fuente:') || point.startsWith('(Source:')) {
            result += `<p class="source-reference">${formatText(content, language)}</p>`;
        } else {
            const levelClass = level > 0 ? ` class="level-${level}"` : '';
            result += `<li${levelClass}>${formatText(content, language)}</li>`;
        }
    });
    
    return result;
}

/**
 * Format text with bold terms and links
 */
function formatText(text, language) {
    try {
        // Highlight key terms based on language
        if (language === 'es') {
            text = text.replace(/(Nuevo Paradigma|Roles Cambiantes|Comunicación Mediada|Flexibilidad|Entorno Virtual|Análisis del Contexto|Definición de Objetivos|Selección de Plataforma|Diseño de Estructura|Modelo de Comunicación|Recursos y Materiales|Soporte Técnico|Enfoque Centrado en el Estudiante|Componentes Clave|Objetivos de Aprendizaje|Contenidos|Actividades|Evaluación|Interacción y Colaboración|Retroalimentación):/g, '<strong>$1:</strong>');
        } else {
            text = text.replace(/(New Paradigm|Changing Roles|Mediated Communication|Flexibility|Virtual Environment|Context and Audience Analysis|Learning Objectives Definition|Platform and Tools Selection|Structure and Navigation Design|Communication and Interaction Model|Resources and Materials|Technical and Pedagogical Support|Student-Centered Approach|Key Components|Learning Objectives|Content|Activities|Assessment|Interaction and Collaboration|Feedback):/g, '<strong>$1:</strong>');
        }
        
        // Convert URLs to clickable links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        return text;
    } catch (error) {
        console.error('Error formatting text:', error);
        return text; // Return original text if formatting fails
    }
}

/**
 * Fix icon positioning
 */
function fixIconPositioning() {
    const icons = document.querySelectorAll('.slide-icon');
    
    icons.forEach(icon => {
        const slide = icon.closest('section');
        if (!slide) return;
        
        if (slide.classList.contains('title-slide')) {
            // Title slide icon centered
            icon.style.position = 'static';
            icon.style.textAlign = 'center';
            icon.style.margin = '0.5rem auto 1.5rem auto';
            icon.style.display = 'block';
        } else {
            // Regular slide icon in top right
            icon.style.position = 'absolute';
            icon.style.top = '10px';
            icon.style.right = '10px';
            icon.style.zIndex = '1000';
        }
    });
}

/**
 * Initialize Reveal.js
 */
function initReveal() {
    if (typeof Reveal === 'undefined') {
        console.error('Reveal.js not loaded');
        return;
    }
    
    try {
        // Initialize with options
        Reveal.initialize({
            controls: true,
            progress: true,
            slideNumber: true,
            keyboard: true,
            overview: true,
            center: true,
            loop: false,
            rtl: false,
            mouseWheel: false,
            transition: 'slide',
            transitionSpeed: 'default',
            backgroundTransition: 'fade',
            overflow: 'scroll',
            width: '100%',
            height: '100%',
            margin: 0.15,
            minScale: 0.5,
            maxScale: 2.0,
            plugins: [ RevealMarkdown, RevealHighlight, RevealNotes, RevealZoom ],
            attributes: true,
            controlsLayout: 'bottom-right'
        });
        
        // Listen for slide changes
        Reveal.addEventListener('slidechanged', (event) => {
            checkContentOverflow();
            fixIconPositioning();
            
            // Asegurar que el botón de volver al índice está siempre visible
            const currentSlide = event.currentSlide;
            if (currentSlide && !currentSlide.classList.contains('title-slide') && 
                !currentSlide.classList.contains('index-slide')) {
                
                if (!currentSlide.querySelector('.back-to-index')) {
                    console.log('Adding missing back-to-index button');
                    addBackToIndexButton(currentSlide);
                }
            }
        });
        
        // Listen for ready event
        Reveal.addEventListener('ready', () => {
            checkContentOverflow();
            fixIconPositioning();
        });
        
        console.log('Reveal.js initialized successfully');
    } catch (error) {
        console.error('Error initializing Reveal.js:', error);
    }
}

/**
 * Add back-to-index button to all content slides
 * This is now an independent function that can be called after language changes
 */
function addBackToIndexButtonsToAllSlides() {
    console.log('Adding back-to-index buttons to all slides');
    
    // Get all content slides (not title or index slides)
    const contentSlides = document.querySelectorAll('.reveal .slides > section:not(.title-slide):not(.index-slide)');
    
    // Get current language
    const currentLang = document.documentElement.lang || 'es';
    const indexText = currentLang === 'en' ? 'Index' : 'Índice';
    const buttonTitle = currentLang === 'en' ? 'Back to index' : 'Volver al índice';
    
    contentSlides.forEach(slide => {
        // Check if button already exists
        const existingButton = slide.querySelector('.back-to-index');
        
        if (existingButton) {
            // Update existing button title and text if language changed
            existingButton.title = buttonTitle;
            const textSpan = existingButton.querySelector('.index-text');
            if (textSpan) {
                textSpan.textContent = indexText;
            }
        } else {
            // Create new button
            addBackToIndexButton(slide);
        }
    });
}

/**
 * Add back-to-index button to a slide
 */
function addBackToIndexButton(slide) {
    const backButton = document.createElement('div');
    backButton.className = 'back-to-index';
    
    // Determinar el idioma actual y usar el texto correspondiente
    const currentLang = document.documentElement.lang || 'es';
    const indexText = currentLang === 'en' ? 'Index' : 'Índice';
    
    // Establecer el contenido con el texto apropiado según idioma
    backButton.innerHTML = `<i class="fas fa-list"></i><span class="index-text">${indexText}</span>`;
    backButton.title = currentLang === 'en' ? 'Back to index' : 'Volver al índice';
    backButton.tabIndex = 0; // Make focusable for accessibility
    
    // Add click event
    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof Reveal !== 'undefined') {
            Reveal.slide(1); // Navigate to index slide
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
    
    // Insert at beginning of slide
    slide.insertBefore(backButton, slide.firstChild);
}

/**
 * Check for content overflow
 */
function checkContentOverflow() {
    if (!Reveal || !Reveal.getCurrentSlide) return;
    
    const slides = document.querySelectorAll('.reveal .slides section');
    
    slides.forEach(slide => {
        const contentHeight = slide.scrollHeight;
        const containerHeight = slide.parentNode.clientHeight;
        
        if (contentHeight > containerHeight * 0.85) {
            slide.classList.add('content-overflow');
        } else {
            slide.classList.remove('content-overflow');
        }
    });
}

// Add responsive handler
window.addEventListener('resize', () => {
    if (typeof Reveal !== 'undefined') {
        Reveal.layout();
        checkContentOverflow();
        fixIconPositioning();
    }
});

// Final init on window load
window.addEventListener('load', () => {
    fixIconPositioning();
    
    // Fix for theme toggle affecting layout
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            setTimeout(() => {
                if (typeof Reveal !== 'undefined') {
                    Reveal.layout();
                    fixIconPositioning();
                }
            }, 300);
        });
    }
    
    // Add back-to-index buttons after everything is loaded
    setTimeout(() => {
        if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
            addBackToIndexButtonsToAllSlides();
        }
    }, 500);
});

// Add an event listener to update buttons after language toggle
document.addEventListener('languageChanged', function(e) {
    console.log('Language change event received, updating index buttons');
    setTimeout(addBackToIndexButtonsToAllSlides, 100);
});
