import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// Load user from localStorage
const userFromStorage = localStorage.getItem('shahverse_user')
  ? JSON.parse(localStorage.getItem('shahverse_user'))
  : null

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('shahverse_user', JSON.stringify(res.data.user))
    localStorage.setItem('shahverse_token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    localStorage.setItem('shahverse_user', JSON.stringify(res.data.user))
    localStorage.setItem('shahverse_token', res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout')
  localStorage.removeItem('shahverse_user')
  localStorage.removeItem('shahverse_token')
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    localStorage.setItem('shahverse_user', JSON.stringify(res.data.user))
    return res.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data)
    localStorage.setItem('shahverse_user', JSON.stringify(res.data.user))
    return res.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: localStorage.getItem('shahverse_token'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser: (state, action) => { state.user = action.payload },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        toast.success(`Welcome to ShahVerse, ${action.payload.user.name}!`)
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
        toast.error(action.payload)
      })
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        toast.success(`Welcome back, ${action.payload.user.name}!`)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
        toast.error(action.payload)
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.token = null
        toast.success('Logged out successfully')
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => { state.user = action.payload })
      .addCase(getMe.rejected, (state) => {
        state.user = null; state.token = null
        localStorage.removeItem('shahverse_user')
        localStorage.removeItem('shahverse_token')
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
        toast.success('Profile updated!')
      })
      .addCase(updateProfile.rejected, (state, action) => { toast.error(action.payload) })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
