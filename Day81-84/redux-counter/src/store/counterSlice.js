// src/store/counterSlice.js (updated)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 🚀 ASYNC THUNK: Fetch initial count from API
export const fetchCountAsync = createAsyncThunk(
  'counter/fetchCount',
  async (amount = 5) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Simulate API response
    return amount;
  }
);

// 🚀 ASYNC THUNK: Increment async
export const incrementAsync = createAsyncThunk(
  'counter/incrementAsync',
  async (amount = 1) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return amount;
  }
);

// 🚀 ASYNC THUNK: Decrement async
export const decrementAsync = createAsyncThunk(
  'counter/decrementAsync',
  async (amount = 1) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return amount;
  }
);

// 🚀 ASYNC THUNK: Reset async
export const resetAsync = createAsyncThunk(
  'counter/resetAsync',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return 0;
  }
);

const initialState = {
  value: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
  // 🚀 EXTRA REDUCERS: Handle async thunk states
  extraReducers: (builder) => {
    builder
      // Fetch count
      .addCase(fetchCountAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(fetchCountAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Increment async
      .addCase(incrementAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value += action.payload;
      })
      .addCase(incrementAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Decrement async
      .addCase(decrementAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(decrementAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value -= action.payload;
      })
      .addCase(decrementAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Reset async
      .addCase(resetAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetAsync.fulfilled, (state) => {
        state.status = 'succeeded';
        state.value = 0;
      })
      .addCase(resetAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Selectors
export const selectCount = (state) => state.counter.value;
export const selectStatus = (state) => state.counter.status;
export const selectError = (state) => state.counter.error;

// Export reducer
export default counterSlice.reducer;