import React from 'react';
import TweetCard from './TweetCard';

const TweetListByUser = ({ tweets, refresh }) => {
  return (
    <>
      <h4 className="mb-3">Tweets and Replies</h4>
      {tweets.map((tweet) => (
        <TweetCard key={tweet._id} item={tweet} refreshSingleTweet={refresh} />
      ))}
    </>
  );
};

export default TweetListByUser;
