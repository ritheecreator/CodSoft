document.addEventListener('DOMContentLoaded', function () {


    // Initialize Swiper
    var swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        autoplay: {
            delay: 5000, // Time in milliseconds (adjust as needed)
        },
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
    fetch('/api/posts/index')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('index-blog');
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
    fetch('/api/posts/skinProducts')
      .then(response => response.json())
      .then(posts => {
        const recentPostsContainer = document.getElementById('skinProducts-blog');
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
