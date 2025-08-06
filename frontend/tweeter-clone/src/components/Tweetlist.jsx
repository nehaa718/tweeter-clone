import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTweets, createTweet } from '../redux/tweetSlice';
import TweetCard from './TweetCard';
import './Tweetlist.css';

const TweetList = () => {
  const dispatch = useDispatch();
  const { tweets, loading, error } = useSelector((state) => state.tweet);

  const [showModal, setShowModal] = useState(false);
  const [tweetContent, setTweetContent] = useState('');
  const [tweetImage, setTweetImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleShow = () => setShowModal(true);

  const handleClose = () => {
    setTweetContent('');
    setTweetImage(null);
    setPreviewImage(null);
    setShowModal(false);
  };

  const handleTweetSubmit = async (e) => {
    e.preventDefault();

    if (!tweetContent.trim()) {
      alert('Tweet content cannot be empty.');
      return;
    }

    const formData = new FormData();
    formData.append('content', tweetContent);
    if (tweetImage) {
      formData.append('image', tweetImage);
    }

    try {
      await dispatch(createTweet(formData)).unwrap();
      handleClose();
    } catch (err) {
      console.error('Tweet Post Error:', err);
    }
  };

  useEffect(() => {
    dispatch(getAllTweets());
  }, [dispatch]);

  return (
    <div className="content flex-grow-1 p-3">
      {/* Header */}
      <div className="heading d-flex justify-content-between align-items-center mb-3">
        <p className="h5 m-0">Home</p>
        <Button className="btn btn-primary" onClick={handleShow}>Tweet</Button>
      </div>

      {/* Error Message */}
      {error && <p className="text-danger">{error}</p>}

      {/* Tweet Cards */}
      {loading ? (
        <p>Loading tweets...</p>
      ) : (
        tweets.map((item) => (
          <TweetCard key={item._id} item={item} />
        ))
      )}

      {/* Modal for New Tweet */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Tweet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTweetSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What's happening?"
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="tweetImage" className="d-block">
                <i className="fa-solid fa-image me-2"></i> Upload Image (optional)
              </Form.Label>
              <Form.Control
                type="file"
                id="tweetImage"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setTweetImage(file);
                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="preview"
                  className="img-fluid mt-2 rounded"
                  style={{ maxHeight: '200px' }}
                />
              )}
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button type="submit" className="ms-2">Tweet</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TweetList;
