document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = this.getAttribute('data-target');

            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            document.getElementById(target).classList.add('active');

            // Smooth scrolling
            document.getElementById(target).scrollIntoView({ behavior: 'smooth' });
        });
    });

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

        // Here you can add code to handle the form submission, like sending an email or saving to a database
        alert(`Thank you, ${name}! Your message has been sent.`);
        contactForm.reset();
    });

    // Setup and start animation!
    var typed = new Typed('#element', {
        strings: ['Video Editor.','Content Creator.'],
        typeSpeed: 50,
        backSpeed: 50,
        loop: true // Added loop property to continuously loop the animation
    });
});
