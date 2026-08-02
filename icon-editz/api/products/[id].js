import { handleGetProduct } from '../products.js';
import { withApi } from '../../server/lib/handler.js';

export default withApi({ GET: (req, res) => handleGetProduct(req, res, req.query.id) });
