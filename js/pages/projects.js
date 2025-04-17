import { isInViewport, smoothScrollTo } from '../utils/helpers.js';

export function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    function handleScroll() {
        projectCards.forEach(card => {
            if (isInViewport(card)) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

document.addEventListener('DOMContentLoaded', function() {
    initProjectCards();
}); 