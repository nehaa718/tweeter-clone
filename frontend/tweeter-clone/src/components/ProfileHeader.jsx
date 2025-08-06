import React from 'react';

const ProfileHeader = ({ user, isOwner, onEdit, onUpload }) => {
  return (
    <div>
      <div className="position-relative mb-5">
        <img
          className="cover-img"
          alt="background"
          src="https://plus.unsplash.com/premium_photo-1682309735318-934795084028?w=500&auto=format&fit=crop&q=60"
        />
        <img
          className="profile-pic"
          alt="profile"
          src={user?.profilePic || "/default.jpg"}
        />
      </div>

      <div className="profile-buttons d-flex justify-content-end gap-2 mb-3">
        {isOwner ? (
          <>
            <button className="btn btn-outline-primary" onClick={onUpload}>Upload Profile Photo</button>
            <button className="btn btn-outline-secondary" onClick={onEdit}>Edit</button>
          </>
        ) : (
          <FollowUnfollowButton userId={user?._id} />
        )}
      </div>

      <div className="ms-2">
        <h5>{user?.name}</h5>
        <p className="text-muted">@{user?.username}</p>
        <p className="mb-1"><i className="fa-regular fa-calendar"></i> Joined: {new Date(user?.createdAt).toDateString()}</p>
        <p className="mb-1"><i className="fa-solid fa-location-dot"></i> Location: {user?.location || 'N/A'}</p>
        <p><strong>{user?.following?.length || 0}</strong> Following &nbsp;&nbsp;
           <strong>{user?.followers?.length || 0}</strong> Followers
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
