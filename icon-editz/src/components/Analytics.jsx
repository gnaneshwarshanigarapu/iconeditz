import React, { useEffect, useState } from 'react';
import { getCms } from '../services/cms';

const Analytics = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getCms({ section: 'settings' });
        if (data) setSettings(data.analytics);
      } catch (error) {
        console.warn('CMS analytics settings unavailable; using no analytics settings.', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      // Google Tag Manager
      if (settings.gtmId) {
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtmId}');`;
        document.head.appendChild(gtmScript);

        const gtmNoScript = document.createElement('noscript');
        gtmNoScript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtmId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.prepend(gtmNoScript);
      }

      // Meta Pixel
      if (settings.metaPixelId) {
        const metaPixelScript = document.createElement('script');
        metaPixelScript.innerHTML = `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.metaPixelId}');
        fbq('track', 'PageView');`;
        document.head.appendChild(metaPixelScript);

        const metaPixelNoScript = document.createElement('noscript');
        metaPixelNoScript.innerHTML = `<img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${settings.metaPixelId}&ev=PageView&noscript=1"
        />`;
        document.head.appendChild(metaPixelNoScript);
      }

      // Microsoft Clarity
      if (settings.clarityId) {
        const clarityScript = document.createElement('script');
        clarityScript.innerHTML = `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${settings.clarityId}");`;
        document.head.appendChild(clarityScript);
      }
    }
  }, [settings]);

  return null;
};

export default Analytics;
