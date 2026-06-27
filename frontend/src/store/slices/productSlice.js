import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await api.get(`/products?${query}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`)
    return res.data.product
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchFeatured = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured')
    return res.data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories')
    return res.data.categories
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
    total: 0,
    pages: 1,
    currentPage: 1,
  },
  reducers: {
    clearProduct: (state) => { state.currentProduct = null },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.products
        state.total = action.payload.total
        state.pages = action.payload.pages
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchProduct.pending, (state) => { state.loading = true })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })
  },
})

export const { clearProduct, clearError } = productSlice.actions
export default productSlice.reducer
