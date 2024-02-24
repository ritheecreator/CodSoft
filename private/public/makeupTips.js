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
                            <p>${post.content}</p>
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
