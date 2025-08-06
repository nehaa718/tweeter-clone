import React from 'react';
import Sidebar from '../components/Sidebar';
import TweetList from '../components/Tweetlist';


function Home() {
 

  return (
    <div className="main-layout d-flex">
      <Sidebar />
      <TweetList />
    </div>
       
  );
}


export default Home;


