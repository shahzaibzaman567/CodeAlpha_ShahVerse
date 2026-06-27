import { createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

const cartFromStorage = localStorage.getItem('shahverse_cart')
  ? JSON.parse(localStorage.getItem('shahverse_cart'))
  : []

const saveCart = (items) => localStorage.setItem('shahverse_cart', JSON.stringify(items))

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: cartFromStorage,
    coupon: null,
    discount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size = '', color = '' } = action.payload
      const existing = state.items.find(
        (i) => i.product._id === product._id && i.size === size && i.color === color
      )
      if (existing) {
        existing.quantity += quantity
        toast.success('Cart updated!')
      } else {
        state.items.push({ product, quantity, size, color })
        toast.success('Added to cart!')
      }
      saveCart(state.items)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((_, i) => i !== action.payload)
      saveCart(state.items)
      toast.success('Removed from cart')
    },
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload
      if (quantity <= 0) {
        state.items.splice(index, 1)
      } else {
        state.items[index].quantity = quantity
      }
      saveCart(state.items)
    },
    clearCart: (state) => {
      state.items = []
      state.coupon = null
      state.discount = 0
      localStorage.removeItem('shahverse_cart')
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload.coupon
      state.discount = action.payload.discount
      toast.success(`Coupon applied! Saved PKR ${action.payload.discount.toLocaleString()}`)
    },
    removeCoupon: (state) => {
      state.coupon = null
      state.discount = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions

export const selectCartTotal = (state) => {
  const itemsTotal = state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const shipping = itemsTotal > 5000 ? 0 : 200
  const tax = Math.round(itemsTotal * 0.05)
  const discount = state.cart.discount || 0
  return {
    itemsTotal,
    shipping,
    tax,
    discount,
    total: itemsTotal + shipping + tax - discount,
    itemCount: state.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

export default cartSlice.reducer
