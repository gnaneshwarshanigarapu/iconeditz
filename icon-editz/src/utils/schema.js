export const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Icon Editz",
    "url": "https://iconeditz.com/",
    "logo": "https://iconeditz.com/assets/logos/favicon.svg",
    "sameAs": [
      "https://www.facebook.com/iconeditz",
      "https://twitter.com/iconeditz",
      "https://www.instagram.com/iconeditz/",
      "https://www.linkedin.com/company/iconeditz"
    ]
  };
  
  export const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://iconeditz.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://iconeditz.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  
  export const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Icon Editz",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hyderabad",
      "addressRegion": "TG",
      "postalCode": "500001",
      "addressCountry": "IN"
    },
    "telephone": "+91-123-456-7890",
    "url": "https://iconeditz.com/"
  };
  