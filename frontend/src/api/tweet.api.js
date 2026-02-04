import api from './axios';

// Create Tweet
export const createTweet = (data) => {
    return api.post('/tweet/create-tweet', data);
};

// Get User Tweets
export const getUserTweets = () => {
    return api.get('/tweet/get-user-tweets');
};

// Get All Tweets (Feed)
export const getAllTweets = (page = 1, limit = 10) => {
    return api.get(`/tweet/view-tweets?page=${page}&limit=${limit}`);
};

// Update Tweet
export const updateTweet = (tweetId, data) => {
    return api.patch(`/tweet/update-tweet/${tweetId}`, data);
};

// Delete Tweet
export const deleteTweet = (tweetId) => {
    return api.delete(`/tweet/delete-tweet/${tweetId}`);
};

// Delete All Tweets By User
export const deleteAllTweetsByUser = (data) => {
    return api.delete('/tweet/delete-all-tweets-by-user', { data });
};
