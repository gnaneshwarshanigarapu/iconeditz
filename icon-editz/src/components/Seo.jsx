import React, { useEffect } from 'react';

const Seo = ({ title, description, keywords, openGraph, twitter, canonical, schema }) => {
  useEffect(() => {
    document.title = title || 'Icon Editz';

    const setMeta = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    const setProperty = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    const setLink = (rel, href) => {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', rel);
          document.head.appendChild(element);
        }
        element.setAttribute('href', href || '');
    }

    setMeta('description', description);
    setMeta('keywords', keywords);

    // Open Graph
    setProperty('og:title', openGraph?.title || title);
    setProperty('og:description', openGraph?.description || description);
    setProperty('og:image', openGraph?.image || '/assets/images/og-icon-editz.png');
    setProperty('og:url', openGraph?.url || window.location.href);
    setProperty('og:type', openGraph?.type || 'website');

    // Twitter
    setProperty('twitter:card', twitter?.card || 'summary_large_image');
    setProperty('twitter:title', twitter?.title || title);
    setProperty('twitter:description', twitter?.description || description);
    setProperty('twitter:image', twitter?.image || '/assets/images/og-icon-editz.png');

    // Canonical URL
    if (canonical) {
        setLink('canonical', canonical);
    }

    // JSON-LD Schema
    const scripts = [];
    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach(s => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(s);
        document.head.appendChild(script);
        scripts.push(script);
      });
    }

    return () => {
      scripts.forEach(s => document.head.removeChild(s));
    }

  }, [title, description, keywords, openGraph, twitter, canonical, schema]);

  return null;
};

export default Seo;
