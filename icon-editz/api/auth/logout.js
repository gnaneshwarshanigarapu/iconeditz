import { withApi } from '../lib/handler.js'; import { authenticate } from '../lib/auth.js'
export default withApi(['POST'],async(req,res)=>{authenticate(req);res.status(204).end()})
