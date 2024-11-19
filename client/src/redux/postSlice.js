import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
    isPostLoading: false,
  },
  reducers: {
    setPost: (state, action) => {
      state.posts = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    setLoading: (state, action) => {
      state.isPostLoading = action.payload;
    },
  },
});

export const { setPost, setSelectedPost, setLoading } = postSlice.actions;
export default postSlice.reducer;
