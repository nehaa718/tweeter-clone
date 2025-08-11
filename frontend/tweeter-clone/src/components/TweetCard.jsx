import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  likeTweet,
  dislikeTweet,
  deleteTweet,
  retweetTweet,
  replyTweet,
} from '../redux/tweetSlice';
import { Modal, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Tweetlist.css';

const TweetCard = ({ item, refreshSingleTweet }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);

  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [retweetCount, setRetweetCount] = useState(0);

  const getFullImageUrl = (path) => {
  if (!path) return '/default.jpg';
  const baseUrl = 'https://tweeter-clone-fmm2.onrender.com'; // backend ka render URL
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
};


  useEffect(() => {
    setLiked(item.likes.includes(userInfo?._id));
    setRetweeted(item.retweetBy?.includes(userInfo?._id));
    setCommentCount(item.replies?.length || 0);
    setRetweetCount(item.retweetBy?.length || 0);
  }, [item, userInfo]);

  const handleLike = async () => {
    try {
      if (liked) {
        await dispatch(dislikeTweet(item._id)).unwrap();
        setLiked(false);
      } else {
        await dispatch(likeTweet(item._id)).unwrap();
        setLiked(true);
      }
      if (refreshSingleTweet) refreshSingleTweet();
    } catch {
      toast.error('Like/unlike failed');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this tweet?')) {
      try {
        await dispatch(deleteTweet(item._id)).unwrap();
        toast.success('Tweet deleted');
        if (refreshSingleTweet) refreshSingleTweet();
      } catch {
        toast.error('Delete failed');
      }
    }
  };

  const handleRetweet = async () => {
    if (item.tweetedBy?._id === userInfo?._id) {
      return toast.warning("You can't retweet your own tweet.");
    }
    try {
      await dispatch(retweetTweet(item._id)).unwrap();
      setRetweeted(true);
      setRetweetCount((prev) => prev + 1);
      if (refreshSingleTweet) refreshSingleTweet();
    } catch {
      toast.error('Retweet failed');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return toast.warning('Reply cannot be empty');
    try {
      await dispatch(replyTweet({ id: item._id, content: replyContent })).unwrap();
      setReplyContent('');
      setShowReply(false);
      toast.success('Reply posted');

      if (refreshSingleTweet) {
        refreshSingleTweet();
      } else {
        setCommentCount((prev) => prev + 1);
      }
    } catch {
      toast.error('Reply failed');
    }
  };

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body px-3 py-2">
        {retweeted && (
          <p className="text-muted small mb-1">
            <i className="fa-solid fa-retweet me-1"></i> You retweeted
          </p>
        )}

        {/* USER INFO ROW */}
        <div className="d-flex align-items-start mb-2">
          <img
            className="profile-pic-user me-2"
            src={getFullImageUrl(item.tweetedBy?.profilePic)}
            alt="profile"
            role="button"
            onClick={() => navigate(`/profile/${item.tweetedBy?._id}`)}
          />

          <div className="flex-grow-1">
            <div className="d-flex align-items-center">
              <p
                className="user-name mb-0"
                role="button"
                onClick={() => navigate(`/profile/${item.tweetedBy?._id}`)}
              >
                @{item.tweetedBy?.username}
              </p>
              <span className="user-time ms-2">
                · {new Date(item.createdAt).toDateString()}
              </span>
            </div>

            <p
              className="mt-1 mb-2"
              role="button"
              onClick={() => navigate(`/tweet/${item._id}`)}
            >
              {item.content}
            </p>

            {item.image && (
              <img
                className="post-img"
                src={getFullImageUrl(item.image)}
                alt="tweet-media"
                role="button"
                onClick={() => navigate(`/tweet/${item._id}`)}
              />
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="tweet-actions mt-2">
          <div role="button" onClick={handleLike}>
            <i className={`fa-heart ${liked ? 'fa-solid text-danger' : 'fa-regular'}`}></i>
            <span className="ms-1">{item.likes.length}</span>
          </div>

          <div role="button" onClick={() => setShowReply(true)}>
            <i className="fa-regular fa-comment"></i>
            <span className="ms-1">{commentCount}</span>
          </div>

          <div role="button" onClick={handleRetweet}>
            <i className={`fa-solid fa-retweet ${retweeted ? 'text-success' : ''}`}></i>
            <span className="ms-1">{retweetCount}</span>
          </div>

          {item.tweetedBy?._id === userInfo?._id && (
            <i
              className="fa-solid fa-trash text-danger ms-auto"
              role="button"
              onClick={handleDelete}
            ></i>
          )}
        </div>

        {/* REPLY MODAL */}
        <Modal show={showReply} onHide={() => setShowReply(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reply to Tweet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleReplySubmit}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
              </Form.Group>
              <div className="text-end mt-3">
                <Button variant="secondary" onClick={() => setShowReply(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="ms-2">
                  Reply
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default TweetCard;
