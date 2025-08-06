import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// THUNKS 

// LOGIN
export const loginUser = createAsyncThunk('user/login', async ({ email, password }, thunkAPI) => {
  try {
    const res = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userInfo', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

// REGISTER
export const registerUser = createAsyncThunk('user/register', async (formData, thunkAPI) => {
  try {
    const res = await axios.post('/auth/register', formData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

// CURRENT USER PROFILE
export const getMyProfile = createAsyncThunk('user/getMyProfile', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/user/profile');
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Profile fetch failed');
  }
});

// OTHER USER PROFILE
export const getUserProfile = createAsyncThunk('user/getUserProfile', async (id, thunkAPI) => {
  try {
    const res = await axios.get(`/user/${id}`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Other user fetch failed');
  }
});

// USER'S TWEETS
export const getUserTweets = createAsyncThunk('user/getUserTweets', async (id, thunkAPI) => {
  try {
    const res = await axios.get(`/tweet/user/${id}`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Tweets fetch failed');
  }
});

// EDIT PROFILE
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const {
        user: { userInfo },
      } = getState();
      const res = await axios.put(`/user/${userInfo._id}`, formData);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// UPLOAD PROFILE PIC
export const uploadProfilePic = createAsyncThunk(
  'user/uploadProfilePic',
  async ({ data, userId }, thunkAPI) => {
    try {
      const res = await axios.put(`/user/${userId}/uploadProfilePic`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

// FOLLOW USER
export const followUser = createAsyncThunk('user/followUser', async (id, thunkAPI) => {
  try {
    const res = await axios.post(`/user/${id}/follow`);
    return res.data; // should return updated user profile
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Follow failed');
  }
});

// UNFOLLOW USER
export const unfollowUser = createAsyncThunk('user/unfollowUser', async (id, thunkAPI) => {
  try {
    const res = await axios.post(`/user/${id}/unfollow`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Unfollow failed');
  }
});

// SLICE 

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: userInfoFromStorage,
    profileUser: null,
    userTweets: [],
    loading: false,
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserTweets.fulfilled, (state, action) => {
        state.userTweets = action.payload;
      })

      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      })

      .addCase(uploadProfilePic.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        if (state.profileUser && state.profileUser._id === action.payload._id) {
          state.profileUser = action.payload;
        }
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      })

      .addCase(followUser.fulfilled, (state, action) => {
        // Action.payload should be updated profile of followed user
        state.profileUser = action.payload;

        if (!state.userInfo.following.includes(action.payload._id)) {
          state.userInfo.following.push(action.payload._id);
        }

        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      })

      .addCase(unfollowUser.fulfilled, (state, action) => {
        // Action.payload should be updated profile of unfollowed user
        state.profileUser = action.payload;

        state.userInfo.following = state.userInfo.following.filter(
          (id) => id !== action.payload._id
        );

        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
