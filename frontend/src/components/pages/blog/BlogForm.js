import React, { useState } from 'react';

const PostForm = () => {
  const [postContent, setPostContent] = useState('');

  const handlePostChange = (e) => {
    setPostContent(e.target.value);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    console.log('Post Submitted:', postContent);
    setPostContent('');
  };

  return (
    <form onSubmit={handlePostSubmit} className="post-form">
      <textarea
        value={postContent}
        onChange={handlePostChange}
        placeholder="What's on your mind?"
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default PostForm;
