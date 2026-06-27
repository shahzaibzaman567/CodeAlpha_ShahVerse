import { createSlice } from '@reduxjs/toolkit'

const theme = localStorage.getItem('shahverse_theme') || 'dark'
if (theme === 'dark') document.documentElement.classList.add('dark')

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme,
    cartOpen: false,
    mobileMenuOpen: false,
    searchOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('shahverse_theme', state.theme)
      document.documentElement.classList.toggle('dark')
    },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen },
    closeCart: (state) => { state.cartOpen = false },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen },
    closeSearch: (state) => { state.searchOpen = false },
  },
})

export const { toggleTheme, toggleCart, closeCart, toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch } = uiSlice.actions
export default uiSlice.reducer
