document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list'); // Corrected selector
    const mainNav = document.getElementById('mainNav'); // For sticky check and height calc
    const navLinks = document.querySelectorAll('#mainNav .nav-list a[href^="#"]'); // Target links within nav list
    const goTopBtn = document.getElementById('goTopBtn');
    const footerYearSpan = document.getElementById('footer-year');
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    // Select sections to track for active link highlighting
    const sections = document.querySelectorAll('main section[id]'); // Target sections within main with an ID

    // --- Mobile Menu Toggle ---
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');

            // Toggle hamburger/close icon
            const icon = menuToggle.querySelector('i');
            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                // Optional: Prevent body scroll when menu is open
                // document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                // Optional: Allow body scroll when menu is closed
                // document.body.style.overflow = '';
            }
        });
    }

    // --- Smooth Scroll & Close Mobile Menu on Link Click ---
    if (navLinks.length > 0 && mainNav) {
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const navHeight = mainNav.offsetHeight;
                    // Adjust offset: consider nav height and a small buffer
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }

                // Close mobile menu if it's open after clicking a link
                if (navList && navList.classList.contains('active')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    // Reset icon
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    // document.body.style.overflow = ''; // Restore scroll
                }
            });
        });
    }

    // --- Close Mobile Menu on Click Outside ---
    if (menuToggle && navList && mainNav) {
        document.addEventListener('click', (e) => {
            // Check if the click is outside the nav element AND the menu toggle itself, AND the menu is active
             if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && navList.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('active');
                // Reset icon
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                 // document.body.style.overflow = ''; // Restore scroll
            }
        });
    }

    // --- Active Navigation Link Highlighting on Scroll ---
    const activateNavLink = () => {
        if (!mainNav || sections.length === 0 || navLinks.length === 0) return;

        let currentSectionId = '';
        // Use a slightly lower point than the very top of the viewport for activation
        const scrollPosition = window.pageYOffset;
        const navHeight = mainNav.offsetHeight;
        const offsetThreshold = navHeight + 80; // Increased threshold for better accuracy

        sections.forEach(section => {
            const sectionTop = section.offsetTop - offsetThreshold;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

             // Check if the scroll position is within the section's bounds
             if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = sectionId;
             }
        });

         // Handle edge case: If scrolled nearly to the bottom, highlight the last section
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 100 && sections.length > 0) {
             currentSectionId = sections[sections.length - 1].getAttribute('id');
        }
        // Handle edge case: If scrolled near the top before the first section, remove all active states
        else if (scrollPosition < sections[0].offsetTop - offsetThreshold) {
            currentSectionId = ''; // No section is active
        }


        navLinks.forEach(link => {
            link.classList.remove('active-link');
            // Check if the link's href matches the current section ID
            // Use encodeURIComponent for robustness if IDs might have special characters
             if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active-link');
            }
        });
    };

    // Debounce function to limit the rate activateNavLink is called
    function debounce(func, wait = 15, immediate = false) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Attach debounced scroll listener if sections exist
    if (sections.length > 0) {
        const debouncedActivateNavLink = debounce(activateNavLink, 50);
        window.addEventListener('scroll', debouncedActivateNavLink);
        activateNavLink(); // Initial check on load
    }


    // --- Go Top Button Logic ---
    if (goTopBtn) {
        const showGoTopButton = () => {
            // Show button when scrolled down approx 60% of the viewport height
            const triggerHeight = window.innerHeight * 0.6;
            if (window.pageYOffset > triggerHeight) {
                goTopBtn.classList.add('show');
            } else {
                goTopBtn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', showGoTopButton);
        goTopBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default button behavior
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        showGoTopButton(); // Initial check in case the page loads scrolled down
    }


    // --- Scroll Animations using Intersection Observer ---
    if ('IntersectionObserver' in window && elementsToAnimate.length > 0) {
        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                // When element becomes visible
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        elementsToAnimate.forEach(el => observer.observe(el));

    } else {
        // Fallback for browsers that don't support Intersection Observer
        // Simply make all elements visible immediately
        console.warn("IntersectionObserver not supported, animations disabled.");
        elementsToAnimate.forEach(el => el.classList.add('animated')); // Apply 'animated' to remove initial transform/opacity
    }


    // --- Update Footer Year ---
    if (footerYearSpan) {
        footerYearSpan.textContent = new Date().getFullYear();
    }

    // --- Schema Injection Confirmation (already handled inline) ---
    // Check if schema was injected correctly
    const schemaTagContent = document.getElementById('person-schema')?.textContent;
    if (schemaTagContent && schemaTagContent.length > 2) { // Check if not empty {}
        console.log("Person Schema likely injected successfully.");
    } else {
        console.warn("Person Schema script tag content seems empty or missing.");
    }
    console.log("Avnish Kr Jaiswal Portfolio Script Loaded Successfully.");

}); // End of DOMContentLoaded