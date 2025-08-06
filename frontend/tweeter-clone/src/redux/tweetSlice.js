import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

const getAuthHeader = (thunkAPI) => {
  const token = thunkAPI.getState().user.userInfo?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Get All Tweets
export const getAllTweets = createAsyncThunk('tweet/getAll', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/tweet', getAuthHeader(thunkAPI));
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Get Single Tweet (for Tweet Detail Page)
export const getSingleTweet = createAsyncThunk('tweet/getSingle', async (id, thunkAPI) => {
  try {
    const res = await axios.get(`/tweet/${id}`, getAuthHeader(thunkAPI));
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Create Tweet
export const createTweet = createAsyncThunk('tweet/create', async (formData, thunkAPI) => {
  try {
    const res = await axios.post('/tweet', formData, {
      ...getAuthHeader(thunkAPI),
      headers: {
        ...getAuthHeader(thunkAPI).headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Like Tweet
export const likeTweet = createAsyncThunk('tweet/like', async (id, thunkAPI) => {
  try {
    await axios.post(`/tweet/${id}/like`, {}, getAuthHeader(thunkAPI));
    const { user } = thunkAPI.getState();
    return { tweetId: id, userId: user.userInfo._id };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Dislike Tweet
export const dislikeTweet = createAsyncThunk('tweet/dislike', async (id, thunkAPI) => {
  try {
    await axios.post(`/tweet/${id}/dislike`, {}, getAuthHeader(thunkAPI));
    const { user } = thunkAPI.getState();
    return { tweetId: id, userId: user.userInfo._id };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Delete Tweet
export const deleteTweet = createAsyncThunk('tweet/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`/tweet/${id}`, getAuthHeader(thunkAPI));
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Retweet
export const retweetTweet = createAsyncThunk('tweet/retweet', async (tweetId, thunkAPI) => {
  try {
    await axios.post(`/tweet/${tweetId}/retweet`, {}, getAuthHeader(thunkAPI));
    const { user } = thunkAPI.getState();
    return { tweetId, userId: user.userInfo._id };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Reply to Tweet
export const replyTweet = createAsyncThunk('tweet/reply', async ({ id, content }, thunkAPI) => {
  try {
    const res = await axios.post(`/tweet/${id}/reply`, { content }, getAuthHeader(thunkAPI));
    return res.data; // { tweetId, reply }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

// Slice setup
const tweetSlice = createSlice({
  name: 'tweet',
  initialState: {
    tweets: [],
    singleTweet: null, 
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All Tweets
      .addCase(getAllTweets.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTweets.fulfilled, (state, action) => {
        state.loading = false;
        state.tweets = action.payload;
      })
      .addCase(getAllTweets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single Tweet
      .addCase(getSingleTweet.pending, (state) => {
        state.loading = true;
        state.singleTweet = null;
      })
      .addCase(getSingleTweet.fulfilled, (state, action) => {
        state.loading = false;
        state.singleTweet = action.payload;
      })
      .addCase(getSingleTweet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createTweet.fulfilled, (state, action) => {
        state.tweets.unshift(action.payload);
      })

      // Like
      .addCase(likeTweet.fulfilled, (state, action) => {
        const { tweetId, userId } = action.payload;
        const tweet = state.tweets.find(t => t._id === tweetId);
        if (tweet && !tweet.likes.includes(userId)) {
          tweet.likes.push(userId);
        }
      })

      // Dislike
      .addCase(dislikeTweet.fulfilled, (state, action) => {
        const { tweetId, userId } = action.payload;
        const tweet = state.tweets.find(t => t._id === tweetId);
        if (tweet) {
          tweet.likes = tweet.likes.filter(id => id !== userId);
        }
      })

      // Delete
      .addCase(deleteTweet.fulfilled, (state, action) => {
        state.tweets = state.tweets.filter(t => t._id !== action.payload);
      })

      // Retweet
      .addCase(retweetTweet.fulfilled, (state, action) => {
        const { tweetId, userId } = action.payload;
        const tweet = state.tweets.find(t => t._id === tweetId);
        if (tweet) {
          tweet.retweetBy = tweet.retweetBy || [];
          if (!tweet.retweetBy.includes(userId)) {
            tweet.retweetBy.push(userId);
          }
        }
      })

      // Reply
      .addCase(replyTweet.fulfilled, (state, action) => {
        const { tweetId, reply } = action.payload;
        const tweet = state.tweets.find(t => t._id === tweetId);
        if (tweet) {
          tweet.replies = tweet.replies || [];
          tweet.replies.push(reply);
        }
        if (state.singleTweet && state.singleTweet._id === tweetId) {
          state.singleTweet.replies.push(reply);
        }
      });
  },
});

export default tweetSlice.reducer;


