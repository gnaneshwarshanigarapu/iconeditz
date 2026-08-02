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

export const trackGaCommerce = (eventName, product, transactionId) => {
  const value = Number(product.discountPrice ?? product.discount_price ?? product.price ?? 0)
  const payload = { currency: 'INR', value, items: [{ item_id: product.id, item_name: product.title, item_category: product.category || 'Digital product', price: value, quantity: 1 }] }
  if (transactionId) payload.transaction_id = transactionId
  if (window.gtag) window.gtag('event', eventName, payload)
  pushToDataLayer(eventName, payload)
}
