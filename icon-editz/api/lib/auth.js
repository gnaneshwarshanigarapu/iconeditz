import jwt from 'jsonwebtoken'
export const authenticate = req => { const token=req.headers.authorization?.replace(/^Bearer\s+/i,''); if(!token) throw Object.assign(new Error('Authentication required'),{status:401}); try{return jwt.verify(token,process.env.JWT_SECRET)}catch{throw Object.assign(new Error('Invalid or expired token'),{status:401})} }
export const authorizeAdmin = req => { const user=authenticate(req); if(user.role!=='admin')throw Object.assign(new Error('Admin access required'),{status:403}); return user }
export const issueToken = user => jwt.sign({sub:user.id,email:user.email,role:user.app_metadata?.role||user.user_metadata?.role||'customer'},process.env.JWT_SECRET,{expiresIn:'8h'})
