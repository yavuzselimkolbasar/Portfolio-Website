import { debounce } from '../utils/helpers.js';

// Responsive navbar functionality
export function initNavbarResponsive() {
    function adjustNavbarElements() {
        const navWrapper = document.querySelector('.nav-wrapper');
        const navLinks = document.querySelector('.nav-links');
        const themeBtn = document.querySelector('.theme-toggle-btn');
        
        if (!navWrapper || !navLinks || !themeBtn) return;
        
        const availableWidth = navWrapper.offsetWidth;
        const linksWidth = navLinks.offsetWidth;
        const btnWidth = themeBtn.offsetWidth;
        
        if (linksWidth + btnWidth + 20 > availableWidth) {
            navLinks.style.gap = '2px';
            
            if (window.innerWidth < 400) {
                const navItems = document.querySelectorAll('.nav-links a');
                navItems.forEach(item => {
                    item.style.padding = '6px 6px';
                    item.style.fontSize = '0.78rem';
                });
            }
        }
    }
    
    adjustNavbarElements();
    
    window.addEventListener('resize', debounce(adjustNavbarElements, 100));
}

document.addEventListener('DOMContentLoaded', function() {
    initNavbarResponsive();
}); 