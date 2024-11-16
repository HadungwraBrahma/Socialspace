import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],
    followNotification: [],
    commentNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      if (action.payload.type === "like") {
        state.likeNotification.push(action.payload);
      } else if (action.payload.type === "dislike") {
        state.likeNotification = state.likeNotification.filter(
          (item) => item.userId !== action.payload.userId
        );
      }
    },
    setFollowNotification: (state, action) => {
      if (action.payload.type === "follow") {
        state.followNotification.push(action.payload);
      } else if (action.payload.type === "unfollow") {
        state.followNotification = state.followNotification.filter(
          (item) => item.userId !== action.payload.userId
        );
      }
    },
    setCommentNotification: (state, action) => {
      state.commentNotification.push(action.payload);
    },
    clearLikeNotifications: (state) => {
      state.likeNotification = [];
    },
    clearFollowNotifications: (state) => {
      state.followNotification = [];
    },
    clearCommentNotifications: (state) => {
      state.commentNotification = [];
    },
  },
});

export const {
  setLikeNotification,
  setFollowNotification,
  setCommentNotification,
  clearLikeNotifications,
  clearFollowNotifications,
  clearCommentNotifications,
} = rtnSlice.actions;

export default rtnSlice.reducer;
