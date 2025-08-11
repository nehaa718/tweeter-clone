import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMyProfile,
  getUserProfile,
  getUserTweets,
  updateUserProfile,
  uploadProfilePic,
  followUser,
  unfollowUser,
} from '../redux/userSlice';
import { useParams } from 'react-router-dom';
import TweetCard from './TweetCard';
import './Profile.css';
import { toast } from 'react-toastify';

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { userInfo, profileUser, userTweets } = useSelector((state) => state.user);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', dob: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isSelf = !id || id === userInfo?._id;
  const profileData = isSelf ? userInfo : profileUser;

  useEffect(() => {
    if (isSelf) {
      dispatch(getMyProfile());
      if (userInfo?._id) dispatch(getUserTweets(userInfo._id));
    } else {
      dispatch(getUserProfile(id));
      dispatch(getUserTweets(id));
    }
  }, [dispatch, id, isSelf, userInfo?._id]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        location: profileData.location || '',
        dob: profileData.dob ? profileData.dob.split('T')[0] : '',
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (!isSelf && profileUser && userInfo) {
      setIsFollowing(profileUser.followers.includes(userInfo._id));
    }
  }, [profileUser, userInfo, isSelf]);

  const handleEditSubmit = async () => {
    const { name, location, dob } = formData;

    if (!name || !location || !dob) {
      toast.error('All fields are required');
      return;
    }

    try {
      await dispatch(updateUserProfile({ ...formData, _id: userInfo._id })).unwrap();
      setShowEdit(false);
      toast.success('Profile updated successfully');
      if (isSelf) dispatch(getMyProfile());
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleUploadSubmit = async () => {
    if (!profilePic) {
      toast.error('Please select a profile picture');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(profilePic.type)) {
      toast.error('Only .jpg, .jpeg, and .png files are allowed');
      return;
    }

    const data = new FormData();
    data.append('profilePic', profilePic);

    if (!userInfo?._id) return;

    await dispatch(uploadProfilePic({ data, userId: userInfo._id }));
    setShowUpload(false);
    setProfilePic(null);
    setPreviewUrl('');
    if (isSelf) dispatch(getMyProfile());
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser || !userInfo) return;
    try {
      setLoadingFollow(true);
      if (isFollowing) {
        await dispatch(unfollowUser(profileUser._id)).unwrap();
        toast.info('Unfollowed');
      } else {
        await dispatch(followUser(profileUser._id)).unwrap();
        toast.success('Followed');
      }
      await dispatch(getUserProfile(id));
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingFollow(false);
    }
  };

  const tweets = userTweets?.filter((t) => !t.parent) || [];
  const replies = userTweets?.filter((t) => t.parent) || [];

  return (
    <div style={{ display: 'flex', backgroundColor: '#f8f9fa' }}>
      <Sidebar />

      <div className="profile-page content px-4 pt-3 pb-5" style={{ flex: 1 }}>
        <h5 className="mb-4 border-bottom pb-2">Profile</h5>

        <div className="position-relative mb-4">
          <img
            className="cover-img"
            alt="cover"
            src="https://plus.unsplash.com/premium_photo-1682309735318-934795084028?w=800"
          />
          <img
            className="profile-pic"
            alt="profile"
            src={
              profileData?.profilePic
                ? `https://tweeter-clone-fmm2.onrender.com${profileData.profilePic}`
                : '/default.jpg'
            }
          />
        </div>

        <div className="profile-buttons d-flex justify-content-end gap-2 mb-3">
          {isSelf ? (
            <>
              <button className="btn btn-outline-primary" onClick={() => setShowUpload(true)}>
                Upload Profile Pic
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowEdit(true)}>
                Edit
              </button>
            </>
          ) : (
            <button
              className="btn btn-dark"
              onClick={handleFollowToggle}
              disabled={loadingFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className="ms-2">
          <h5>{profileData?.name}</h5>
          <p className="text-muted">@{profileData?.username}</p>
          <p><i className="fa-solid fa-cake-candles"></i> Dob: {formData.dob || 'N/A'}</p>
          <p><i className="fa-solid fa-location-dot"></i> Location: {formData.location || 'N/A'}</p>
          <p><i className="fa-regular fa-calendar"></i> Joined: {new Date(profileData?.createdAt).toDateString()}</p>
          <p>
            <strong>{profileData?.following?.length || 0}</strong> Following &nbsp;
            <strong>{profileData?.followers?.length || 0}</strong> Followers
          </p>
        </div>

        <hr />
        <h4 className="mb-2">Tweets</h4>
        {tweets.length === 0 ? (
          <p>No tweets yet.</p>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet._id} item={tweet} />)
        )}

        <hr />
        <h4 className="mb-2 mt-4">Replies</h4>
        {replies.length === 0 ? (
          <p>No replies yet.</p>
        ) : (
          replies.map((reply) => <TweetCard key={reply._id} item={reply} />)
        )}

        {/* Edit Profile Modal */}
        <Modal show={showEdit} onHide={() => setShowEdit(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSubmit}>Save</Button>
          </Modal.Footer>
        </Modal>

        {/* Upload Profile Pic Modal */}
        <Modal show={showUpload} onHide={() => setShowUpload(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Profile Picture</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Note: Use square-shaped image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              {previewUrl && (
                <div className="mt-3">
                  <p>Preview:</p>
                  <img src={previewUrl} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUploadSubmit}>Upload</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
