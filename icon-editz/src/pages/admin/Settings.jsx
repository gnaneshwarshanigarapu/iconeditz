import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const Settings = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const response = await fetch('/api/settings');
      const { data } = await response.json();
      if (data) {
        reset({
          'analytics.gtmId': data.analytics?.gtmId,
          'analytics.gaId': data.analytics?.gaId,
          'analytics.metaPixelId': data.analytics?.metaPixelId,
          'analytics.clarityId': data.analytics?.clarityId,
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (formData) => {
    const settings = {
        analytics: {
            gtmId: formData['analytics.gtmId'],
            gaId: formData['analytics.gaId'],
            metaPixelId: formData['analytics.metaPixelId'],
            clarityId: formData['analytics.clarityId'],
        }
    };

    const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
    });

    if (response.ok) {
        alert('Settings saved successfully');
    } else {
        alert('Error saving settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">SEO & Analytics Settings</h2>
        <p className="text-text-muted">Manage your site's tracking IDs and meta information.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="gtm-id" className="block text-sm font-medium">Google Tag Manager ID</label>
            <input type="text" {...register('analytics.gtmId')} id="gtm-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background-light text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="GTM-XXXXXX" />
          </div>
          <div>
            <label htmlFor="ga-id" className="block text-sm font-medium">Google Analytics ID</label>
            <input type="text" {...register('analytics.gaId')} id="ga-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background-light text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <label htmlFor="meta-pixel-id" className="block text-sm font-medium">Meta Pixel ID</label>
            <input type="text" {...register('analytics.metaPixelId')} id="meta-pixel-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background-light text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="META_PIXEL_ID" />
          </div>
          <div>
            <label htmlFor="clarity-id" className="block text-sm font-medium">Microsoft Clarity Project ID</label>
            <input type="text" {...register('analytics.clarityId')} id="clarity-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background-light text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="CLARITY_PROJECT_ID" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
