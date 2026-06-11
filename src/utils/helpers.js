export const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId)
  if (section) {
    const header = document.querySelector('nav')
    const headerHeight = header?.offsetHeight || 80
    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight - 16
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
  }
}

export const getActiveSection = () => {
  const sections = ['hero', 'about', 'projects', 'tools', 'contact']
  const scrollPosition = window.scrollY + 100

  for (const sectionId of sections) {
    const section = document.getElementById(sectionId)
    if (section) {
      const { offsetTop, offsetHeight } = section
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        return sectionId
      }
    }
  }
  return 'hero'
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email) => emailRegex.test(email)

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
