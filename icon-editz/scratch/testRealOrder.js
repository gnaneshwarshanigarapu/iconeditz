import dotenv from 'dotenv'
dotenv.config()
import createOrder from '../server/api/orders.js'

async function test() {
  const req = {
    method: 'POST',
    body: {
      productId: 'edf8bb86-b687-4116-968f-3008dbc4667b',
      name: 'Nani',
      email: 'shanigarapugnaneshwar3@gmail.com',
      phone: '9346084649',
    },
    headers: {},
  }

  const res = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => console.log('RESPONSE:', code, data),
    }),
    json: (data) => console.log('RESPONSE:', 200, data),
  }

  await createOrder(req, res)
}

test().catch(console.error)
