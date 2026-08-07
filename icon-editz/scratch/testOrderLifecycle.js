import dotenv from 'dotenv'
dotenv.config()
import createOrder, { verifyPayment } from '../server/api/orders.js'

async function test() {
  console.log('Testing full order creation & DB binding...')
  let orderResult = null
  const reqCreate = {
    method: 'POST',
    body: {
      productId: 'edf8bb86-b687-4116-968f-3008dbc4667b',
      name: 'Nani Test',
      email: 'nani.test@example.com',
      phone: '9876543210',
    },
    headers: {},
  }
  const resCreate = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => {
        console.log('CREATE RESPONSE STATUS:', code)
        orderResult = data
      },
    }),
    json: (data) => {
      console.log('CREATE RESPONSE STATUS 200')
      orderResult = data
    },
  }

  await createOrder(reqCreate, resCreate)
  console.log('Order creation result:', orderResult)
}

test().catch(console.error)
