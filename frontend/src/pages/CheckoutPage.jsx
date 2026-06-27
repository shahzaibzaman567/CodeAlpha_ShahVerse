import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, Package, ChevronRight, Lock, Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { selectCartTotal, clearCart } from '../store/slices/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const steps = ['Address', 'Payment', 'Review']

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111827',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
      iconColor: '#d4821e',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
}

function CheckoutInner() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const { items, coupon } = useSelector((s) => s.cart)
  const { user } = useSelector((s) => s.auth)
  const { itemsTotal, shipping, tax, discount, total } = useSelector(selectCartTotal)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zipCode: user?.addresses?.[0]?.zipCode || '',
    country: 'Pakistan',
    phone: user?.phone || '',
  })

  const validateAddress = () => {
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      toast.error('Please fill all address fields')
      return false
    }
    return true
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderData = {
        orderItems: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          size: i.size || '',
          color: i.color || '',
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || '',
      }

      const res = await api.post('/orders', orderData)
      const { order, clientSecret } = res.data

      if (paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          toast.error('Stripe not ready. Please refresh the page.')
          setLoading(false)
          return
        }

        // CardElement is always mounted (just hidden on other steps)
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          toast.error('Payment form error. Please refresh.')
          setLoading(false)
          return
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user.name,
              email: user.email,
            },
          },
        })

        if (error) {
          toast.error(error.message || 'Payment failed')
          setLoading(false)
          return
        }

        if (paymentIntent.status === 'succeeded') {
          await api.put(`/orders/${order._id}/pay`, {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: user.email,
          })
        }
      }

      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate(`/order-success/${order._id}`)
    } catch (err) {
      console.error('Order error:', err)
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-charcoal-950">
      <div className="page-container py-10">
        <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white mb-8">Checkout</h1>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-500' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : i === step
                    ? 'border-primary-500 text-primary-500'
                    : 'border-gray-300 dark:border-white/20 text-gray-400'
                }`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${i < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">

            {/* ── STEP 0: Address ── */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5"
              >
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-500" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address *</label>
                    <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="House #, Street, Area" className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                    <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Karachi" className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State *</label>
                    <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="Sindh" className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postal Code *</label>
                    <input value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} placeholder="75500" className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                    <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+92 300 0000000" className="input-luxury" />
                  </div>
                </div>
                <button
                  onClick={() => { if (validateAddress()) setStep(1) }}
                  className="btn-gold mt-6 flex items-center gap-2"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 1: Payment (always keep CardElement mounted) ── */}
            {/* We use display logic — CardElement must NEVER unmount once rendered */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5"
              >
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-500" /> Payment Method
                </h2>

                {/* Payment method radio buttons */}
                <div className="space-y-3 mb-5">
                  {[
                    { id: 'stripe', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex — secured by Stripe' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive' },
                  ].map((m) => (
                    <label key={m.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary-300'
                    }`}>
                      <input
                        type="radio" name="payment" value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                        className="accent-primary-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* CardElement — always rendered when stripe selected, stays in DOM */}
                <div className={paymentMethod === 'stripe' ? 'block' : 'hidden'}>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Lock size={14} className="text-green-500 flex-shrink-0" />
                      <span>Secured by Stripe — your card info is encrypted</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Card Details
                      </label>
                      <div className="bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5">
                        <CardElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        🧪 Test: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any CVC
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-outline-gold flex-shrink-0">Back</button>
                  <button
                    onClick={() => setStep(2)}
                    className="btn-gold flex items-center gap-2 flex-1 justify-center"
                  >
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* ── STEP 2: Review & Place Order ── */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Order items */}
                <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package size={18} className="text-primary-500" /> Order Items ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <img
                          src={item.product.images?.[0]?.url}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          PKR {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address + payment summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping To</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{address.street}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{address.city}, {address.state} {address.zipCode}</p>
                    <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                  </div>
                  <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {paymentMethod === 'stripe' ? '💳 Credit/Debit Card (Stripe)' : '💵 Cash on Delivery'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline-gold flex-shrink-0">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || (paymentMethod === 'stripe' && !stripe)}
                    className="btn-gold flex items-center gap-2 flex-1 justify-center py-3.5 disabled:opacity-50"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : `Place Order · PKR ${total.toLocaleString()}`
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>PKR {itemsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-500 font-medium">Free</span> : `PKR ${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (5%)</span><span>PKR {tax.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500 font-medium">
                  <span>Discount</span><span>-PKR {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="divider-gold" />
              <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-1">
                <span>Total</span>
                <span className="gradient-text">PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  )
}
