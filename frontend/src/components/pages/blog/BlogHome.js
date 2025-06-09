import React from 'react';
import NavBar from '../../UI/NavBar'
import Sidebar from './BlogSidebar';
import Feed from './BlogFeed';
import Message from './BlogMessage';
import FriendRequest from './BlogFriendRequest';
import Theme from './BlogTheme';
import '../../../styles/bloghome.css';

const BlogHome = () => {
    return (
        <div className='body'>
            <main>
                <div class="container">
                    <div class="left">
                        <a class="profile">
                            <div class="profile-photo">
                                <img src="../../../assets/blog-images/profile-1.jpg"></img>
                            </div>
                            <div class="handle">
                                <h4>Nia Ridania</h4>
                                <p class="text-muted">
                                    @niaridania
                                </p>
                            </div>
                        </a>

                        <Sidebar />

                        <label class="btn btn-primary" for="create-post">Create Post</label>
                    </div>
                    <Feed />
                    <div class="right">
                        <Message />
                        <FriendRequest />
                    </div>
                </div>
            </main >

            <Theme />
        </div >
    );
};

export default BlogHome;