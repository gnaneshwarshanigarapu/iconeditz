import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authenticate, issueToken } from './lib/auth.js';
import { withApi } from './lib/handler.js'

// This public client is used for user authentication (signInWithPassword).
// It uses the public-facing 'anon' key.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Auth Client uses ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Yes' : 'No');
const projectRef = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.split('.')[0].split('//')[1] : 'Not found';
console.log('Supabase Project Ref:', projectRef);


const credentials=z.object({email:z.string().email(),password:z.string().min(8)});
const safe=user=>({id:user.id,email:user.email,role:user.app_metadata?.role||user.user_metadata?.role||'customer',user_metadata:user.user_metadata||{},email_confirmed_at:user.email_confirmed_at});

export default withApi(['GET','POST'],async(req,res)=>{if(req.method==='GET'){const user=authenticate(req);const {data,error}=await supabaseAdmin.auth.admin.getUserById(user.sub);if(error)throw error;return res.json({user:safe(data.user)})}const action=req.body?.action;if(action==='logout'){authenticate(req);return res.status(204).end()}if(action!=='login')throw Object.assign(new Error('Unsupported auth action'),{status:400});const {email,password}=credentials.parse(req.body);const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error||!data.user)throw Object.assign(new Error('Invalid email or password'),{status:401});res.json({token:issueToken(data.user),user:safe(data.user)})})
