import React, { useState } from 'react';

const NewTweetForm = ({ tweetService, onError, onCreated }) => {
  const [tweet, setTweet] = useState('');
  const [submitChk, setSubmitChk] = useState(true);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitChk) {
      tweetService
        .postTweet(tweet)
        .then((created) => {
          setTweet('');
          onCreated(created);
          setSubmitChk((prev) => !prev);
        })
        .catch(onError);
      setSubmitChk((prev) => !prev);
    }
  };

  const onChange = (event) => {
    setTweet(event.target.value);
  };

  return (
    <form className='tweet-form' onSubmit={onSubmit}>
      <input
        type='text'
        placeholder='Edit your tweet'
        value={tweet}
        required
        autoFocus
        onChange={onChange}
        className='form-input tweet-input'
      />
      <button type='submit' className='form-btn'>
        Post
      </button>
    </form>
  );
};

export default NewTweetForm;
