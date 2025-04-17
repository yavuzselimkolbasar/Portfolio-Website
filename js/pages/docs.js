import { debounce } from '../utils/helpers.js';

let scrollHint;
let activeSection = null;

function initScrollHint() {
    scrollHint = document.createElement('div');
    scrollHint.className = 'scroll-hint';
    scrollHint.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M7 10l5 5 5-5z"/>
        </svg>
        <span>Scroll to view content</span>
    `;
    document.body.appendChild(scrollHint);
    
    scrollHint.addEventListener('click', function() {
        if (activeSection) {
            const sectionRect = activeSection.getBoundingClientRect();
            const scrollTo = window.pageYOffset + sectionRect.top - 80;
            
            window.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
            
            hideScrollHint();
        }
    });
    
    let scrollTimer;
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollThreshold = 15;
    
    window.addEventListener('scroll', debounce(function() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDifference = Math.abs(currentScrollTop - lastScrollTop);
        
        if (scrollDifference > scrollThreshold) {
            hideScrollHint();
        } else if (scrollDifference > 0) {
            scrollHint.classList.add('fade-out');
        }
        
        lastScrollTop = currentScrollTop;
        
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            if (activeSection) {
                const sectionRect = activeSection.getBoundingClientRect();
                if (sectionRect.top > window.innerHeight || sectionRect.bottom < 0) {
                    showScrollHint();
                }
            }
        }, 100);
    }, 50));
}

function showScrollHint() {
    if (!scrollHint) return;
    scrollHint.classList.remove('fade-out');
    scrollHint.style.display = 'flex';
    scrollHint.classList.add('visible');
}

function hideScrollHint() {
    if (!scrollHint || scrollHint.style.display !== 'flex') return;
    scrollHint.classList.add('fade-out');
    setTimeout(() => {
        scrollHint.style.display = 'none';
        scrollHint.classList.remove('fade-out');
        scrollHint.classList.remove('visible');
    }, 300);
}

function initBackToTop() {
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 4l-7 7h4v7h6v-7h4z"/>
        </svg>
    `;
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }, 50));
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function cleanUrlString(str) {
    return str.trim().replace(/\s+/g, '');
}

function initDocLinks() {
    const docLinks = document.querySelectorAll('.doc-link');
    const docSections = document.querySelectorAll('.doc-section');
    
    if (!docLinks.length) return;
    
    docLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            hideScrollHint();
            
            const fileName = this.textContent;
            const targetId = this.getAttribute('href').split('#')[1];
            const targetSection = document.getElementById(targetId);
            
            if (!targetSection) return;
            
            docSections.forEach(section => {
                section.style.display = 'none';
            });
            
            targetSection.style.display = 'block';
            activeSection = targetSection;

            const cleanFileName = cleanUrlString(fileName);
            history.pushState(null, null, `#${cleanFileName}`);

            showScrollHint();

            docLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });

    if (window.location.hash) {
        const hashValue = window.location.hash.substring(1);
        
        if (hashValue) {
            const fileLink = Array.from(docLinks).find(link => 
                cleanUrlString(link.textContent).toLowerCase() === hashValue.toLowerCase()
            );
            
            if (fileLink) {
                const folder = fileLink.closest('.folder');
                if (folder) {
                    folder.classList.add('open');
                    const folderContent = folder.querySelector('.folder-content');
                    if (folderContent) {
                        folderContent.style.display = 'block';
                    }
                }

                setTimeout(() => {
                    fileLink.click();
                }, 100);
            } else {
                const targetSection = document.getElementById(hashValue.toLowerCase());
                
                if (targetSection) {
                    const matchingLink = Array.from(docLinks).find(link => 
                        link.getAttribute('href').split('#')[1] === hashValue.toLowerCase()
                    );
                    
                    if (matchingLink) {
                        const folder = matchingLink.closest('.folder');
                        if (folder) {
                            folder.classList.add('open');
                            const folderContent = folder.querySelector('.folder-content');
                            if (folderContent) {
                                folderContent.style.display = 'block';
                            }
                        }
                        
                        docSections.forEach(section => {
                            section.style.display = 'none';
                        });
                        
                        targetSection.style.display = 'block';
                        activeSection = targetSection;

                        docLinks.forEach(link => link.classList.remove('active'));
                        matchingLink.classList.add('active');
                        
                        setTimeout(() => {
                            showScrollHint();
                        }, 500);
                    }
                }
            }
        }
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchDocs');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const docLinks = document.querySelectorAll('.doc-link');
            
            docLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                const parent = link.closest('.folder-content');
                if (text.includes(searchTerm)) {
                    link.style.display = 'block';
                    if (parent) {
                        parent.style.display = 'block';
                        parent.closest('.folder').classList.add('open');
                    }
                } else {
                    link.style.display = 'none';
                }
            });
        });
    }
}

function initFolderToggle() {
    const folders = document.querySelectorAll('.folder');
    if (!folders.length) return;
    
    folders.forEach(folder => {
        const header = folder.querySelector('.folder-header');
        const content = folder.querySelector('.folder-content');
        const folderNameElement = folder.querySelector('.folder-name');
        
        if (header && folderNameElement) {
            const folderName = folderNameElement.textContent;
            
            header.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') return;
                
                folder.classList.toggle('open');
                
                if (content) {
                    if (folder.classList.contains('open')) {
                        content.style.display = 'block';
                        const cleanFolderName = cleanUrlString(folderName);
                        history.pushState(null, null, `#${cleanFolderName}`);
                    } else {
                        content.style.display = 'none';
                        const cleanFolderName = cleanUrlString(folderName);
                        if (window.location.hash === `#${cleanFolderName}`) {
                            history.pushState("", document.title, window.location.pathname + window.location.search);
                        }
                    }
                }
            });
        }
    });
    
    if (window.location.hash) {
        const hashValue = window.location.hash.substring(1);
        
        const targetFolder = Array.from(folders).find(folder => {
            const folderNameElement = folder.querySelector('.folder-name');
            return folderNameElement && 
                   cleanUrlString(folderNameElement.textContent).toLowerCase() === hashValue.toLowerCase();
        });
        
        if (targetFolder) {
            targetFolder.classList.add('open');
            const folderContent = targetFolder.querySelector('.folder-content');
            if (folderContent) {
                folderContent.style.display = 'block';
            }
        }
    }
}
export function initDocsPage() {
    initScrollHint();
    initBackToTop();
    initDocLinks();
    initFolderToggle();
    initSearch();

    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
}

document.addEventListener('DOMContentLoaded', initDocsPage);