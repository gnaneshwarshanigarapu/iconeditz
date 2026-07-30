export const pushToDataLayer = (event, data) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...data,
    });
  };
  
  export const trackPageView = (path) => {
    pushToDataLayer('page_view', {
      page: {
        path,
        url: window.location.href,
      },
    });
    trackCapiEvent('PageView', {});
  };
  
  export const trackEvent = (eventName, eventData) => {
    pushToDataLayer(eventName, eventData);
  };
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  export const trackCapiEvent = async (eventName, eventData) => {
    try {
      const fbp = getCookie('_fbp');
      const fbc = getCookie('_fbc');
  
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName,
          eventData,
          fbp,
          fbc,
        }),
      });
    } catch (error) {
      console.error('Error tracking CAPI event:', error);
    }
  };