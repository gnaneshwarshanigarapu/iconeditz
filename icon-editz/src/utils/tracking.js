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
  };
  
export const trackEvent = (eventName, eventData) => {
  pushToDataLayer(eventName, eventData);
};
