/**
 * Fecha dinámica para presentaciones
 * Formatea la fecha actual en español e inglés
 */

// Objeto global para acceso desde otros scripts
window.dateFormatter = {
    // Obtiene la fecha actual formateada según el idioma
    getCurrentDate: function(language = 'es') {
        const now = new Date();
        
        if (language === 'en') {
            return this.formatDateEnglish(now);
        } else {
            return this.formatDateSpanish(now);
        }
    },
    
    // Formato en español: "6 de Abril de 2025"
    formatDateSpanish: function(date) {
        const day = date.getDate();
        const month = this.getSpanishMonth(date.getMonth());
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    },
    
    // Formato en inglés: "April 6, 2025"
    formatDateEnglish: function(date) {
        const day = date.getDate();
        const month = this.getEnglishMonth(date.getMonth());
        const year = date.getFullYear();
        
        return `${month} ${day}, ${year}`;
    },
    
    // Nombres de meses en español
    getSpanishMonth: function(monthIndex) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[monthIndex];
    },
    
    // Nombres de meses en inglés
    getEnglishMonth: function(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }
};
