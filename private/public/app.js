document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupToggle = document.getElementById('signup-toggle');
    const loginToggle = document.getElementById('login-toggle');
    fetchAndUpdateUserProfilePicture(); 
  

    // Initially hide login form and show signup form
    loginForm.style.display = 'none';
    signupForm.style.display = '';

    // Function to toggle visibility of forms
    function toggleForm() {
        if (loginForm.style.display === 'none') {
            loginForm.style.display = '';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = '';
        }
    }

    // Set up toggle buttons
    loginToggle.innerHTML = '<button type="button" onclick="toggleForm()">Not a member? Register now</button>';
    signupToggle.innerHTML = '<button type="button" onclick="toggleForm()">Already a member? Log in</button>';

    // Use global function for toggle to access it inline
    window.toggleForm = toggleForm;

    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(signupForm);
        fetch('/signup', {
            method: 'POST',
            body: new URLSearchParams(formData),
        })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error('Error:', error));
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        fetch('/login', {
            method: 'POST',
            body: new URLSearchParams(formData),
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                return response.text();
            }
        })
        .then(data => {
            if (data) {
                alert(data);
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
});

function fetchAndUpdateUserProfilePicture() {
    fetch('/user/profile')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.profilePicturePath) {
            const profilePicElement = document.getElementById('profile-picture');
            if (profilePicElement) {
                profilePicElement.src = data.profilePicturePath;
            }
        }
    })
    .catch(error => console.error('Error fetching user profile:', error));
}


document.addEventListener('DOMContentLoaded', function() {
    // Check and display the stored profile picture
    const storedImage = localStorage.getItem('profilePicture');
    if (storedImage) {
        document.getElementById('profile-picture').src = storedImage;
    }

    document.getElementById('change-picture-btn').addEventListener('click', function() {
        document.getElementById('profile-picture-input').click();
    });

    document.getElementById('profile-picture-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePicture', file);
    
            // Assuming you have an endpoint to handle the profile picture update
            fetch('/user/update-profile-picture', {
                method: 'POST',
                body: formData,
                // Additional headers might be necessary depending on session handling
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    // Update the profile picture on the client side as needed
                    document.getElementById('profile-picture').src = data.profilePictureUrl;
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });
    

    document.getElementById('remove-picture-btn').addEventListener('click', function() {
        localStorage.removeItem('profilePicture');
        document.getElementById('profile-picture').src = 'Images/defaultProfilePicture.jpeg'; // Set to default or desired placeholder
    });
});

function clearUserData() {
    localStorage.removeItem('profilePicture'); // Clear the profile picture from local storage
    // Redirect to login page or refresh the page to clear the session
    window.location.href = '/login'; // Adjust the URL to your login page
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('change-picture-btn').addEventListener('click', function() {
        document.getElementById('profile-picture-input').click();
    });

    // Added event listener for the "Remove" button
    document.getElementById('remove-picture-btn').addEventListener('click', removePicture);

    function removePicture() {
        fetch('/user/profile/picture/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // You may want to adjust the body according to your server requirements
            body: JSON.stringify({}),
        })
        .then(response => response.json())
        .then(data => {
            // Assuming the server responds with a confirmation or some data
            // Update the profile picture src only after successful removal
            document.getElementById('profile-picture').src = 'Images/defaultProfilePicture.jpeg';
        })
        .catch(error => console.error('Error removing profile picture:', error));
    }
});

document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-username')
    .then(response => {
        if (!response.ok) {
            throw new Error('Could not fetch username');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('user-name').textContent = data.username;
    })
    .catch(error => console.error('Error fetching username:', error));
});

document.getElementById('user-bio').addEventListener('click', function() {
    document.getElementById('bio-edit-popup').style.display = 'block';
    // Pre-fill the textarea with the current bio
    document.getElementById('bio-textarea').value = document.getElementById('user-bio').innerText;
});

document.getElementById('save-bio').addEventListener('click', function() {
    // Save the new bio and hide the popup
    var newBio = document.getElementById('bio-textarea').value;
    document.getElementById('user-bio').innerText = newBio;
    document.getElementById('bio-edit-popup').style.display = 'none';
});


document.getElementById('close-popup').addEventListener('click', function() {
    // Simply hide the popup without saving
    document.getElementById('bio-edit-popup').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    const userId =  req.session.userId; 
    fetch(`/user/${userId}/profile`)
        .then(response => {
            if (!response.ok) throw new Error('Profile fetch failed');
            return response.json();
        })
        .then(data => {
            document.getElementById('user-posts').textContent = data.posts;
            document.getElementById('user-likes').textContent = data.likes;
            document.getElementById('user-followers').textContent = data.followers;
            document.getElementById('user-following').textContent = data.following;
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

//search users
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchResultsDiv = document.getElementById('search-results');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length > 0) {
            fetch(`/search/users?term=${encodeURIComponent(searchTerm)}`)
                .then(response => response.json())
                .then(users => {
                    searchResultsDiv.innerHTML = ''; // Clear existing results
                    searchResultsDiv.style.display = 'block'; // Show dropdown

                    users.forEach(user => {
                        const userDiv = document.createElement('div');
                        userDiv.textContent = user.username;
                        userDiv.classList.add('search-result-item'); // Add any necessary classes for styling

                        // Event listener for click on user
                        userDiv.addEventListener('click', () => {
                            window.location.href = `/user/profile/${user.username}`; // Navigate to user's profile
                        });

                        searchResultsDiv.appendChild(userDiv);
                    });

                    if (users.length === 0) {
                        searchResultsDiv.innerHTML = '<div>No users found</div>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
        } else {
            searchResultsDiv.style.display = 'none'; // Hide dropdown if input is empty
        }
    });

    // Optionally, hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target)) {
            searchResultsDiv.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const username = window.location.pathname.split('/').pop(); // Extract username from URL

    // Fetch user details and display them
    fetchUserDetails(username);

    // Event listener for the follow button
    document.getElementById('follow-user-btn').addEventListener('click', () => followUser(username));
});

//searched users profile
function fetchUserDetails(username) {
    fetch(`/api/users/${username}`)
        .then(response => response.json())
        .then(user => {
            // Update UI with user details
            document.getElementById('profile-picture').src = user.profilePicture || 'Images/defaultProfilePicture.jpeg';
            document.getElementById('user-name').textContent = user.username;
            document.getElementById('user-bio').textContent = user.bio || 'This user has not added a bio yet.';
            document.getElementById('user-posts').textContent = user.posts;
            document.getElementById('user-likes').textContent = user.likes;
            document.getElementById('user-followers').textContent = user.followers;
            document.getElementById('user-following').textContent = user.following;
        })
        .catch(error => console.error('Error:', error));
}

//create posts
document.addEventListener('DOMContentLoaded', function() {
    const createPostForm = document.getElementById('create-post-form');

    createPostForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', document.getElementById('post-content').value);
        if (document.getElementById('post-image').files[0]) {
            formData.append('image', document.getElementById('post-image').files[0]);
        }

        fetch('/create-post', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(data => {
            alert('Post created successfully');
            updatePostCount(1);
            fetchPosts(); // Refresh the posts displayed
        })
        .catch(error => console.error('Error:', error));
    });

    //rendering posts
    function fetchPosts() {
        fetch('/fetch-posts')
            .then(response => response.json())
            .then(posts => {
                const postsContainer = document.getElementById('posts-container');
                postsContainer.innerHTML = ''; // Clear existing posts
                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'post';
                    const postDate = timestamp(new Date(post.created_at)); 
                    let postHTML = `
                        <div class="post-header">
                            <img src="${post.profilePicture || '/uploads/defaultProfilePicture.jpeg'}" alt="Profile picture" class="post-profile-pic"> 
                            <span class="post-author">${post.username}</span>
                            <span class="post-date">. posted ${postDate}</span>
                        </div>
                        <div class="post-content">${post.content}</div>`;
    
                    if (post.image_url) {
                        postHTML += `<img src="${post.image_url}" alt="Post Image" class="post-image">`;
                    }
    
                    postHTML += `
                    <div class="post-actions">
                    <span class="post-action like-btn" data-post-id="${post.id}">Like</span>
                    <span class="post-action comment-btn" data-post-id="${post.id}">Comment</span>
                    <span class="post-action share-btn" data-post-id="${post.id}">Share</span>
                    </div>
                    <div class="comments-section" id="comments-section-${post.id}"></div>
                    `;
    
                    postElement.innerHTML = postHTML;
                    postsContainer.appendChild(postElement);
                });
    
                attachEventListeners();
            })
            .catch(error => console.error('Error fetching posts:', error));
    }

    function timestamp(date) {
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
    
        if (seconds < 60) {
            return 'Just now';
        } else if (minutes === 1) {
            return '1 minute ago';
        } else if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (hours === 1) {
            return '1 hour ago';
        } else if (hours < 24) {
            return `${hours} hours ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-post-id');
                likePost(postId);
            });
        });

        document.querySelectorAll('.comment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-post-id');
                const commentText = prompt("Enter your comment:"); 
                if (commentText) {
                    addComment(postId, commentText);
                }
            });
        });
    }

    function likePost(postId) {
        fetch('/like-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: postId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Post liked:', data);
            // Optionally, update the UI to reflect the new like status
        })
        .catch(error => console.error('Error liking post:', error));
    }

    function addComment(postId, commentText) {
        fetch('/add-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: postId, comment: commentText }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Comment added:', data);
            // Optionally, update the UI to show the new comment
        })
        .catch(error => console.error('Error adding comment:', error));
    }

    function fetchComments(postId) {
        fetch(`/fetch-comments?postId=${postId}`)
            .then(response => response.json())
            .then(comments => {
                const commentsSection = document.getElementById(`comments-section-${postId}`);
                commentsSection.innerHTML = ''; // Clear existing comments
                comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    const commentDate = timestamp(new Date(comment.created_at));
                    let commentHTML = `
                        <div class="comment-author">${comment.username}</div>
                        <div class="comment-date">${commentDate}</div>
                        <div class="comment-content">${comment.comment}</div>
                    `;
                    commentElement.innerHTML = commentHTML;
                    commentsSection.appendChild(commentElement);
                });
            })
            .catch(error => console.error('Error fetching comments:', error));
    }

    fetchPosts(); // Initial fetch to load posts
});


//logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');

    logoutBtn.addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST',
        })
        .then(response => {
            // Assuming the server clears the session and responds with a success status
            if (response.ok) {
                // Redirect to login page or home page after successful logout
                window.location.href = '/signup.html';
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});

//bio
document.getElementById('save-bio').addEventListener('click', async () => {
    const userId = document.getElementById('save-bio').dataset.userid;
    const newBio = document.getElementById('bio-textarea').value;

    try {
        const response = await fetch('/update-bio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, newBio })
        });
        
        if (response.ok) {
            console.log('Bio updated successfully');
            // Optionally, update UI to reflect the change
        } else {
            console.error('Failed to update bio');
        }
    } catch (error) {
        console.error('Error updating bio:', error);
    }
});

//follow users
document.addEventListener('DOMContentLoaded', () => {
    // Assuming 'search-results' is the ID of your search results container
    const searchResultsContainer = document.getElementById('search-results');

    searchResultsContainer.addEventListener('click', (e) => {
        if (e.target && e.target.matches(".search-result-item")) {
            const username = e.target.getAttribute('data-username');
            window.location.href = `/user/profile/${username}`; // Redirect to user's profile page
        }
    });
});

// recent posts sidebar
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('recent-posts');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          // Assuming post.created_at exists and is formatted as you like, or use post.formattedTimestamp if you've formatted it in the backend
          const postDate = new Date(post.created_at).toLocaleString(); // Converts timestamp to a readable string, adjust formatting as needed
          postElement.innerHTML = `
            <div class="recent-posts-border">
            <h3>${post.title}</h3>
              <img src="${post.image_url}" alt="Post image" class="recent-post-image">
              <p>${post.summary}</p>
              <p>Posted by ${post.username} on ${postDate}</p> <!-- Include the timestamp here -->
              <a href="posts.html?id=${post.id}">Read more</a>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});



//user posts count
function fetchPostCount() {
    fetch(`/api/user/post-count`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('user-posts').textContent = data.count;
        })
        .catch(error => console.error('Error fetching post count:', error));
}
document.addEventListener('DOMContentLoaded', fetchPostCount);




document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                document.getElementById('dashboardLink').style.display = 'inline'; // Show "ME"
                document.getElementById('loginLink').style.display = 'none'; // Hide "LOG IN"
            } else {
                document.getElementById('dashboardLink').style.display = 'none'; // Hide "ME"
                document.getElementById('loginLink').style.display = 'inline'; // Ensure "LOG IN" is visible
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Ensure "LOG IN" is visible if there's an error fetching session state
            document.getElementById('dashboardLink').style.display = 'none';
            document.getElementById('loginLink').style.display = 'inline';
        });
});

document.getElementById('search-input').addEventListener('input', function(e) {
    const searchQuery = e.target.value;

    if (searchQuery.length > 0) {
        fetch(`/search?term=${encodeURIComponent(searchQuery)}`)
            .then(response => response.json())
            .then(data => {
                const searchResults = document.getElementById('search-results');
                searchResults.innerHTML = ''; // Clear previous results
                searchResults.style.display = 'block';

                if (data && data.posts.length > 0) {
                    data.posts.forEach(post => {
                        const postDiv = document.createElement('div');
                        postDiv.textContent = post.title;
                        postDiv.style.cursor = 'pointer';
                        postDiv.addEventListener('click', () => {
                            // Redirect to the detailed page with post ID as query parameter
                            window.location.href = `/posts.html?id=${post.id}`;
                        });
                        searchResults.appendChild(postDiv);
                    });
                } else {
                    searchResults.innerHTML = '<div>No results found</div>';
                }
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                searchResults.innerHTML = '<div>Error fetching results</div>';
                searchResults.style.display = 'block';
            });
    } else {
        document.getElementById('search-results').style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/makeup')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('makeup-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          // Assuming post.created_at exists and is formatted as you like, or use post.formattedTimestamp if you've formatted it in the backend
          const postDate = new Date(post.created_at).toLocaleString(); // Converts timestamp to a readable string, adjust formatting as needed
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/makeupTips')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('makeupTips-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          // Assuming post.created_at exists and is formatted as you like, or use post.formattedTimestamp if you've formatted it in the backend
          const postDate = new Date(post.created_at).toLocaleString(); // Converts timestamp to a readable string, adjust formatting as needed
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/foundations')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('foundations-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          // Assuming post.created_at exists and is formatted as you like, or use post.formattedTimestamp if you've formatted it in the backend
          const postDate = new Date(post.created_at).toLocaleString(); // Converts timestamp to a readable string, adjust formatting as needed
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    // Fetch gallery items from the server or define them here
    const galleryItems = [
        {
            image_url: 'Images/birthdayMakeup.jpeg',
        },
        {
            image_url: 'Images/galleryImage.jpeg', 
        },
        {
            image_url: 'Images/galleryImage1.jpeg', 
        },
        {
            image_url: 'Images/galleryImage2.jpeg', 
        },
        {
            image_url: 'Images/galleryImage3.jpeg',
        },
        {
            image_url: 'Images/galleryImage4.jpeg', 
        },
        {
            image_url: 'Images/galleryImage5.jpeg', 
        },
        {
            image_url: 'Images/galleryImage6.jpeg', 
        },
    ];

    galleryItems.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${item.image_url}" alt="Gallery image ${index + 1}">
            <button class="heart-button" data-post-id="${index}">Like ♥</button>
        `;
        gallery.appendChild(galleryItem);
    });

    initializeLikeButtons();
});

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.clothingGallery');
    // Fetch gallery items from the server or define them here
    const galleryItems = [
        {
            image_url: 'Images/birthdayMakeup.jpeg',
        },
        {
            image_url: 'Images/galleryImage.jpeg', 
        },
        {
            image_url: 'Images/galleryImage1.jpeg', 
        },
        {
            image_url: 'Images/galleryImage2.jpeg', 
        },
       
    ];

    galleryItems.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${item.image_url}" alt="Gallery image ${index + 1}">
            <button class="heart-button" data-post-id="${index}">Like ♥</button>
        `;
        gallery.appendChild(galleryItem);
    });

    initializeLikeButtons();
});

function initializeLikeButtons() {
    document.querySelectorAll('.heart-button').forEach(button => {
        const postId = button.dataset.postId; // Now each button has a unique postId based on its index

        // Check if the post is liked in localStorage and update the button's class accordingly
        if (localStorage.getItem(`liked-${postId}`) === 'true') {
            button.classList.add('liked');
        }

        button.addEventListener('click', function() {
            const isLiked = this.classList.contains('liked');
            this.classList.toggle('liked');
            // Correctly update localStorage with the new like state
            localStorage.setItem(`liked-${postId}`, !isLiked);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/skinCare')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('skin-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          // Assuming post.created_at exists and is formatted as you like, or use post.formattedTimestamp if you've formatted it in the backend
          const postDate = new Date(post.created_at).toLocaleString(); // Converts timestamp to a readable string, adjust formatting as needed
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/BeginnerSkinCare')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('BeginnerSkin-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
        
          const postDate = new Date(post.created_at).toLocaleString(); 
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/skinProducts')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('skinProducts-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          const postDate = new Date(post.created_at).toLocaleString(); 
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/clothing')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('clothing-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          const postDate = new Date(post.created_at).toLocaleString(); 
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/bags')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('bags-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          const postDate = new Date(post.created_at).toLocaleString(); 
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/shoes')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('shoes-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          const postDate = new Date(post.created_at).toLocaleString(); 
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/styles')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('styles-blog');
        posts.forEach(post => {
          const postElement = document.createElement('div');
          const postDate = new Date(post.created_at).toLocaleString(); 
          postElement.innerHTML = `
            <div class="blog-post">
                <img src="${post.image_url}" alt="Post image">
                    <div class="blog-post-content" style="max-width:400px;">
                        <h2>${post.title}</h2>
                            <p>${post.summary}</p>
                            <p>Posted by ${post.username} on ${postDate}</p>
                            <a href="posts.html?id=${post.id}">Read more</a>
                    </div>
            </div>
          `;
          recentPostsContainer.appendChild(postElement);
        });
      })
      .catch(error => console.error('Error fetching posts:', error));
});