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
    document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

         // Basic form validation
        if (name === '' || email === '' || message === '') {
            alert('Please fill in all fields.');
            return;
        }

        const templateParams = {
            user_name: name,
            user_email: email,
            message: message
        };

        emailjs.send('service_icon143', 'service_icon143', templateParams)
            .then(function () {
                alert(`Thank you, ${name}! Your message has been sent.`);
                contactForm.reset();
            }, function (error) {
                console.error('EmailJS Error:', error);
                alert('Failed to send the message. Please try again later.');
            });
        });
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
