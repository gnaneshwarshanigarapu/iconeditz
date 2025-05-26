document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const contactForm = document.getElementById('contactForm');

    // Navigation link click event
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = this.getAttribute('data-target');

            // Remove active class from all sections
            contentSections.forEach(section => section.classList.remove('active'));

            // Add active class to the clicked section
            const targetSection = document.getElementById(target);
            targetSection.classList.add('active');

            // Smooth scrolling
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            const templateParams = {
                user_name: name,
                user_email: email,
                message: message
            };

            emailjs.send('service_icon143', 'service_icon143', templateParams)
                .then(() => {
                    alert(`Thank you, ${name}! Your message has been sent.`);
                    contactForm.reset();
                }, (error) => {
                    console.error('EmailJS Error:', error);
                    alert('Failed to send the message. Please try again later.');
                });
        });
    }

    // Typed.js animation setup
    new Typed('#element', {
        strings: ['Video Editor.', 'Content Creator.'],
        typeSpeed: 50,
        backSpeed: 50,
        backDelay: 1000,
        loop: true,
        showCursor: false
    });
});
