document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    // Navigation link click event
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = this.getAttribute('data-target');

            // Remove active class from all sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            // Add active class to the clicked section
            const targetSection = document.getElementById(target);
            targetSection.classList.add('active');

            // Smooth scrolling to target section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Basic form validation
        if (name === '' || email === '' || message === '') {
            alert('Please fill in all fields.');
            return;
        }

        // You can replace this with actual form submission logic
        alert(`Thank you, ${name}! Your message has been sent.`);
        contactForm.reset();
    });

    // Typed.js animation setup
    var typed = new Typed('#element', {
        strings: ['Video Editor.', 'Content Creator.'],
        typeSpeed: 50,
        backSpeed: 50,
        backDelay: 1000, // Delay before backspacing starts
        loop: true,      // Loop the animation
        showCursor: false // Hide the typing cursor
    });
});
