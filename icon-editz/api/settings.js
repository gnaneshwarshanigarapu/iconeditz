import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authorizeAdmin } from './lib/auth.js';
import { withApi } from './lib/handler.js';

async function getSettings(req, res) {
  authorizeAdmin(req);
  const { data, error } = await supabaseAdmin.from('settings').select('*');
  if (error) throw error;
  
  const settings = data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});

  res.json({ data: settings });
}

async function updateSettings(req, res) {
    authorizeAdmin(req);
    const { settings } = req.body;
  
    const updates = Object.entries(settings).map(([key, value]) =>
      supabaseAdmin.from('settings').update({ value }).eq('key', key)
    );
  
    const results = await Promise.all(updates);
    const error = results.find(r => r.error);

    if (error) throw error;
  
    res.json({ success: true });
}

export default withApi({
    GET: getSettings,
    POST: updateSettings,
});
