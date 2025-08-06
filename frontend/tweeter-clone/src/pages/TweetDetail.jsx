import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSingleTweet } from '../redux/tweetSlice';
import Sidebar from '../components/Sidebar';
import TweetCard from '../components/TweetCard'; 
import '../components/Tweetlist.css';

const TweetDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { singleTweet } = useSelector((state) => state.tweet);

  
  useEffect(() => {
    dispatch(getSingleTweet(id));
  }, [dispatch, id]);

  
  const refreshTweet = () => {
    dispatch(getSingleTweet(id));
  };

  return (
    <div className="main-layout d-flex">
      
      <div style={{ width: '250px', minHeight: '100vh', borderRight: '1px solid #ccc' }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="content p-4" style={{ width: '100%' }}>
        <h4 className="mb-4 text-center">Tweet Details</h4>

        {singleTweet && (
          <>
            {/* Original Tweet */}
            <TweetCard item={singleTweet} refreshSingleTweet={refreshTweet} />

            {/* Replies */}
            {singleTweet.replies?.length > 0 && (
              <>
                <h5 className="mt-4 mb-3">Replies</h5>
                {singleTweet.replies.map((reply) => (
                  <TweetCard key={reply._id} item={reply} refreshSingleTweet={refreshTweet} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TweetDetails;
