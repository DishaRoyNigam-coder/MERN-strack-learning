// src/store/counterSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
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
});

// Export actions
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Selectors
export const selectCount = (state) => state.counter.value;
export const selectStatus = (state) => state.counter.status;

// Export reducer
export default counterSlice.reducer;