import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const Settings = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/cms?section=settings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch settings.');
        const { data } = await response.json();
        if (data) {
          // react-hook-form's reset expects the data structure to match the registered field names
          reset({ analytics: data.analytics });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (formData) => {
    // formData from react-hook-form will be a nested object, e.g., { analytics: { gtmId: '...' } }
    const settings = formData;

    try {
        const response = await fetch('/api/cms?section=settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ settings }), // Sends { settings: { analytics: { ... } } }
        });

        if (response.ok) {
            alert('Settings saved successfully');
        } else {
            const err = await response.json();
            throw new Error(err.message || 'Error saving settings');
        }
    } catch (err) {
        alert(err.message);
    }
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">SEO & Analytics Settings</h2>
        <p className="text-text-muted">Manage your site's tracking IDs and meta information.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 bg-background-light rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Analytics Tracking IDs</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="gtm-id" className="block text-sm font-medium">Google Tag Manager ID</label>
                <input type="text" {...register('analytics.gtmId')} id="gtm-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="GTM-XXXXXX" />
              </div>
              <div>
                <label htmlFor="ga-id" className="block text-sm font-medium">Google Analytics ID</label>
                <input type="text" {...register('analytics.gaId')} id="ga-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="G-XXXXXXXXXX" />
              </div>
              <div>
                <label htmlFor="meta-pixel-id" className="block text-sm font-medium">Meta Pixel ID</label>
                <input type="text" {...register('analytics.metaPixelId')} id="meta-pixel-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="META_PIXEL_ID" />
              </div>
              <div>
                <label htmlFor="clarity-id" className="block text-sm font-medium">Microsoft Clarity Project ID</label>
                <input type="text" {...register('analytics.clarityId')} id="clarity-id" className="mt-1 block w-full rounded-md border-gray-600 bg-background text-text shadow-sm focus:border-primary focus:ring-primary" placeholder="CLARITY_PROJECT_ID" />
              </div>
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
