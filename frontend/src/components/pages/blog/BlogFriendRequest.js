import React from 'react';

const FriendRequest = () => {
    return (
        <div class="friend-requests">
            <h4>Requests</h4>
            <div class="request">
                <div class="info">
                    <div class="profile-photo">
                        <img src="../../../assets/blog-images/profile-20.jpg"></img>
                    </div>
                    <div>
                        <h5>Hajia Bintu</h5>
                        <p class="text-muted">8 mutual friends</p>
                    </div>
                </div>
                <div class="action">
                    <button class="btn btn-primary">
                        Accept
                    </button>
                    <button class="btn">
                        Decline
                    </button>
                </div>
            </div>
            <div class="request">
                <div class="info">
                    <div class="profile-photo">
                        <img src="../../../assets/blog-images/profile-18.jpg"></img>
                    </div>
                    <div>
                        <h5>Edelson Mandela</h5>
                        <p class="text-muted">2 mutual friends</p>
                    </div>
                </div>
                <div class="action">
                    <button class="btn btn-primary">
                        Accept
                    </button>
                    <button class="btn">
                        Decline
                    </button>
                </div>
            </div>
            <div class="request">
                <div class="info">
                    <div class="profile-photo">
                        <img src="../../../assets/blog-images/profile-17.jpg"></img>
                    </div>
                    <div>
                        <h5>Megan Baldwin</h5>
                        <p class="text-muted">5 mutual friends</p>
                    </div>
                </div>
                <div class="action">
                    <button class="btn btn-primary">
                        Accept
                    </button>
                    <button class="btn">
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FriendRequest;
