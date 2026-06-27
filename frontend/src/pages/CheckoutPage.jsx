import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CreditCard, MapPin, Package, ChevronRight,
  Lock, Check, Shield, Truck
} from 'lucide-react'
import { selectCartTotal, clearCart } from '../store/slices/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const steps = ['Address', 'Payment', 'Review']

const fmt4 = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
const fmtExp = (v) => v.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2')

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, coupon } = useSelector((s) => s.cart)
  const { user } = useSelector((s) => s.auth)
  const { itemsTotal, shipping, tax, discount, total } = useSelector(selectCartTotal)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const [address, setAddress] = useState({
    street:  user?.addresses?.[0]?.street  || '',
    city:    user?.addresses?.[0]?.city    || '',
    state:   user?.addresses?.[0]?.state   || '',
    zipCode: user?.addresses?.[0]?.zipCode || '',
    country: 'Pakistan',
    phone:   user?.phone || '',
  })

  const [card, setCard] = useState({ name: user?.name || '', number: '', expiry: '', cvv: '' })

  const validateAddress = () => {
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      toast.error('Please fill all address fields'); return false
    }
    return true
  }

  const validateCard = () => {
    if (paymentMethod !== 'stripe') return true
    if (card.number.replace(/\s/g,'').length < 16) { toast.error('Enter valid 16-digit card number'); return false }
    if (card.expiry.length < 5) { toast.error('Enter valid expiry MM/YY'); return false }
    if (card.cvv.length < 3) { toast.error('Enter valid CVV'); return false }
    if (!card.name.trim()) { toast.error('Enter cardholder name'); return false }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateCard()) return
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        orderItems: items.map(i => ({
          product: i.product._id, quantity: i.quantity,
          size: i.size || '', color: i.color || '',
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || '',
      })
      const { order } = res.data

      // Mark as paid for card payments
      if (paymentMethod === 'stripe') {
        await api.put(`/orders/${order._id}/pay`, {
          id: 'ch_' + Date.now(),
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: user.email,
        })
      }

      dispatch(clearCart())
      toast.success('Order placed! 🎉')
      navigate(`/order-success/${order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setLoading(false) }
  }

  // Sidebar
  const Summary = () => (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 sticky top-24">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
      <div className="space-y-2.5 text-sm mb-4">
        <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>PKR {itemsTotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Shipping</span>
          <span>{shipping === 0 ? <span className="text-green-500 font-medium">Free</span> : `PKR ${shipping}`}</span>
        </div>
        <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Tax (5%)</span><span>PKR {tax.toLocaleString()}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-500 font-medium"><span>Discount</span><span>-PKR {discount.toLocaleString()}</span></div>}
        <div className="divider-gold"/>
        <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white">
          <span>Total</span><span className="gradient-text">PKR {total.toLocaleString()}</span>
        </div>
      </div>
      {/* mini cart */}
      <div className="space-y-2 border-t border-gray-100 dark:border-white/10 pt-3">
        {items.slice(0,3).map((item,i) => (
          <div key={i} className="flex items-center gap-2">
            <img src={item.product.images?.[0]?.url} alt="" className="w-9 h-9 object-cover rounded-lg flex-shrink-0"/>
            <p className="text-xs text-gray-500 truncate flex-1">{item.product.name}</p>
            <span className="text-xs font-semibold text-gray-400">×{item.quantity}</span>
          </div>
        ))}
        {items.length > 3 && <p className="text-xs text-gray-400 text-center">+{items.length-3} more</p>}
      </div>
      {/* trust badges */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { icon: Lock, label: 'Secure Pay' },
          { icon: Shield, label: 'Encrypted' },
          { icon: Truck, label: 'Fast Ship' },
          { icon: Check, label: 'Easy Return' },
        ].map(({icon:Icon, label}) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon size={12} className="text-primary-400 flex-shrink-0"/>{label}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-charcoal-950">
      <div className="page-container py-10">
        <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center mb-10">
          {steps.map((s,i) => (
            <div key={s} className={`flex items-center ${i < steps.length-1 ? 'flex-1':''}`}>
              <button onClick={() => i < step && setStep(i)} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step ? 'bg-primary-500 border-primary-500 text-white'
                  : i === step ? 'border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-gray-200 dark:border-white/20 text-gray-400'
                }`}>
                  {i < step ? <Check size={13}/> : i+1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i===step?'text-primary-500':i<step?'text-gray-700 dark:text-gray-300':'text-gray-400'}`}>{s}</span>
              </button>
              {i < steps.length-1 && <div className={`flex-1 h-0.5 mx-3 rounded-full ${i<step?'bg-primary-500':'bg-gray-200 dark:bg-white/10'}`}/>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* ── STEP 0: Address ── */}
            {step === 0 && (
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-500"/> Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address *</label>
                    <input value={address.street} onChange={e=>setAddress({...address,street:e.target.value})} placeholder="House #, Street, Area" className="input-luxury"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                    <input value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} placeholder="Karachi" className="input-luxury"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State *</label>
                    <input value={address.state} onChange={e=>setAddress({...address,state:e.target.value})} placeholder="Sindh" className="input-luxury"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postal Code *</label>
                    <input value={address.zipCode} onChange={e=>setAddress({...address,zipCode:e.target.value})} placeholder="75500" className="input-luxury"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                    <input value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value})} placeholder="+92 300 0000000" className="input-luxury"/>
                  </div>
                </div>
                <button onClick={()=>{if(validateAddress())setStep(1)}} className="btn-gold mt-6 flex items-center gap-2">
                  Continue to Payment <ChevronRight size={16}/>
                </button>
              </motion.div>
            )}

            {/* ── STEP 1: Payment ── */}
            {step === 1 && (
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-500"/> Payment Method
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    {id:'stripe', label:'Credit / Debit Card', sub:'Visa, Mastercard, Amex'},
                    {id:'cod',    label:'Cash on Delivery',    sub:'Pay when you receive'},
                  ].map(m => (
                    <label key={m.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod===m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'border-gray-200 dark:border-white/10 hover:border-primary-300'
                    }`}>
                      <input type="radio" name="pm" value={m.id} checked={paymentMethod===m.id} onChange={()=>setPaymentMethod(m.id)} className="accent-primary-500"/>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.sub}</p>
                      </div>
                      {m.id==='stripe' && (
                        <div className="flex gap-1">
                          {['VISA','MC','AMEX'].map(b=>(
                            <span key={b} className="text-xs bg-gray-100 dark:bg-white/10 text-gray-500 px-1.5 py-0.5 rounded font-mono">{b}</span>
                          ))}
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                {/* Card form */}
                {paymentMethod === 'stripe' && (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-white/10 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Lock size={13} className="text-green-500 flex-shrink-0"/>
                      <span>Secured with 256-bit SSL encryption</span>
                      <Shield size={13} className="text-green-500 ml-auto flex-shrink-0"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cardholder Name</label>
                      <input value={card.name} onChange={e=>setCard({...card,name:e.target.value})} placeholder="Shahzaib Zaman" className="input-luxury"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Number</label>
                      <div className="relative">
                        <input value={card.number} onChange={e=>setCard({...card,number:fmt4(e.target.value)})} placeholder="4242 4242 4242 4242" maxLength={19} className="input-luxury font-mono pr-10"/>
                        <CreditCard size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry</label>
                        <input value={card.expiry} onChange={e=>setCard({...card,expiry:fmtExp(e.target.value)})} placeholder="MM/YY" maxLength={5} className="input-luxury font-mono"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV</label>
                        <input value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="•••" maxLength={4} type="password" className="input-luxury font-mono"/>
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                      🧪 <strong>Test:</strong> 4242 4242 4242 4242 &nbsp;·&nbsp; 12/26 &nbsp;·&nbsp; 123
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-400">
                    💵 You will pay <strong>PKR {total.toLocaleString()}</strong> in cash on delivery.
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={()=>setStep(0)} className="btn-outline-gold flex-shrink-0">Back</button>
                  <button onClick={()=>setStep(2)} className="btn-gold flex items-center gap-2 flex-1 justify-center">
                    Review Order <ChevronRight size={16}/>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Review ── */}
            {step === 2 && (
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-4">
                <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package size={18} className="text-primary-500"/> Order Items ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((item,i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <img src={item.product.images?.[0]?.url} alt={item.product.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{item.size&&`Size: ${item.size} · `}Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          PKR {(item.product.price*item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">📍 Shipping</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{address.street}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{address.city}, {address.state} {address.zipCode}</p>
                    <p className="text-xs text-gray-500 mt-1">{address.phone}</p>
                  </div>
                  <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">💳 Payment</p>
                    {paymentMethod==='stripe' ? (
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Credit / Debit Card</p>
                        <p className="font-mono text-primary-500 font-bold mt-1">
                          •••• {card.number.replace(/\s/g,'').slice(-4)||'????'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">💵 Cash on Delivery</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={()=>setStep(1)} className="btn-outline-gold flex-shrink-0">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-gold flex items-center gap-2 flex-1 justify-center py-3.5 text-base disabled:opacity-50"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      : `Place Order · PKR ${total.toLocaleString()}`
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <Summary/>
        </div>
      </div>
    </div>
  )
}
