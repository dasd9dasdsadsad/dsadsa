// Initialize highlight.js
document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll();
    initProgressBar();
    initTableOfContents();
    initThemeToggle();
    initBackToTop();
    initSmoothScroll();
    initCodeCopy();
});

// Reading Progress Bar
function initProgressBar() {
    const progressBar = document.getElementById('progressBar');

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;

        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

// Table of Contents
function initTableOfContents() {
    const tocNav = document.getElementById('tocNav');
    const sections = document.querySelectorAll('.article-content section[id]');

    if (!tocNav || sections.length === 0) return;

    // Build TOC
    const tocLinks = [];
    sections.forEach(section => {
        const heading = section.querySelector('h2');
        if (heading) {
            const link = document.createElement('a');
            link.href = `#${section.id}`;
            link.textContent = heading.textContent;
            link.dataset.section = section.id;
            tocNav.appendChild(link);
            tocLinks.push({ link, section });
        }
    });

    // Highlight active section
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const link = tocNav.querySelector(`a[data-section="${entry.target.id}"]`);
            if (link) {
                if (entry.isIntersecting) {
                    tocNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// Theme Toggle
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.dataset.theme = savedTheme;
    } else if (!systemDark) {
        html.dataset.theme = 'light';
    }

    toggle.addEventListener('click', () => {
        const currentTheme = html.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);

        // Add transition class
        html.classList.add('theme-transitioning');
        setTimeout(() => html.classList.remove('theme-transitioning'), 300);

        // Re-render Mermaid diagrams with new theme
        if (typeof updateDiagramTheme === 'function') {
            setTimeout(updateDiagramTheme, 100);
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.dataset.theme = e.matches ? 'dark' : 'light';
            // Re-render Mermaid diagrams with new theme
            if (typeof updateDiagramTheme === 'function') {
                setTimeout(updateDiagramTheme, 100);
            }
        }
    });
}

// Back to Top Button
function initBackToTop() {
    const button = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });
}

// Code Copy Button
function initCodeCopy() {
    document.querySelectorAll('pre').forEach(pre => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        wrapper.style.position = 'relative';

        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 6px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s, background 0.2s;
            color: var(--text-secondary);
        `;

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);

        wrapper.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });

        wrapper.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });

        button.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            const text = code ? code.textContent : pre.textContent;

            try {
                await navigator.clipboard.writeText(text);
                button.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                button.style.color = 'var(--success)';

                setTimeout(() => {
                    button.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    `;
                    button.style.color = 'var(--text-secondary)';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply fade-in to elements
document.querySelectorAll('.article-content section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeObserver.observe(section);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Press 't' to toggle theme
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            document.getElementById('themeToggle').click();
        }
    }

    // Press 'Home' to go to top
    if (e.key === 'Home' && !e.ctrlKey && !e.metaKey) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Add hover effect to code blocks
document.querySelectorAll('pre code').forEach(code => {
    code.addEventListener('mouseenter', () => {
        code.parentElement.style.borderColor = 'var(--accent)';
    });

    code.addEventListener('mouseleave', () => {
        code.parentElement.style.borderColor = 'var(--border)';
    });
});

// Console Easter Egg
console.log('%c Security Research Blog ', 'background: linear-gradient(135deg, #58a6ff, #a371f7); color: white; font-size: 16px; padding: 10px 20px; border-radius: 5px; font-weight: bold;');
console.log('%c Always verify who\'s asking. Always sanitize paths. ', 'color: #8b949e; font-style: italic;');
