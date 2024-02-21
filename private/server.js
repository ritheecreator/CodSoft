// Import necessary modules
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


// Create Express app
const app = express();

// Set up middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '338628c87e139a21f3bca50f7a24285058dd2265f5d2835b3abb82ad163e4abd',
    resave: true,
    saveUninitialized: true
}));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Clement@71', // Change this to your MySQL password
    database: 'blog'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected');
});

const uploadDir = path.join(__dirname, 'public', 'uploads', 'profile_pictures');

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define a route for the root URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Ensure this uploads directory exists
        cb(null, 'public/uploads/profile_pictures');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Check if the username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).send('Error checking username');
        }

        if (results.length > 0) {
            // Username already exists
            return res.status(400).send('Username taken, please use another username');
        } else {
            // Proceed with user registration since username is unique
            bcrypt.hash(password, 10, (hashErr, hash) => {
                if (hashErr) {
                    return res.status(500).send('Error hashing password');
                }

                // Begin transaction for inserting user
                db.beginTransaction(txnErr => {
                    if (txnErr) {
                        return res.status(500).send('Error starting transaction');
                    }

                    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], (insertErr, result) => {
                        if (insertErr) {
                            db.rollback(() => {
                                // Check if the error is because of a duplicate entry
                                if (insertErr.code === 'ER_DUP_ENTRY' || insertErr.errno === 1062) {
                                    return res.status(400).send('Username taken, please use another username');
                                } else {
                                    console.error('Error inserting user:', insertErr);
                                    return res.status(500).send('Failed to register user');
                                }
                            });
                        } else {
                            const userId = result.insertId;
                            db.query('INSERT INTO user_profiles (user_id) VALUES (?)', [userId], (profileErr, profileResult) => {
                                if (profileErr) {
                                    db.rollback(() => {
                                        console.error('Error creating user profile:', profileErr);
                                        return res.status(500).send('Failed to create user profile');
                                    });
                                } else {
                                    db.commit(commitErr => {
                                        if (commitErr) {
                                            db.rollback(() => {
                                                console.error('Error committing transaction:', commitErr);
                                                return res.status(500).send('Failed to complete registration');
                                            });
                                        } else {
                                            // User registration successful
                                            res.send('User registered successfully');
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            });
        }
    });
});



// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Retrieve user from database
    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, result) => {
            if (err) {
                throw err;
            }
            if (result.length > 0) {
                // Compare passwords
                bcrypt.compare(password, result[0].password, (err, match) => {
                    if (err) {
                        throw err;
                    }
                    if (match) {
                        // Here is where you set session variables upon successful login
                        req.session.loggedin = true;
                        req.session.username = username;
                        req.session.userId = result[0].id; // Store user ID in session
                        res.redirect('/dashboard'); // Redirect to the dashboard
                    } else {
                        res.send('Incorrect username or password');
                    }
                });
            } else {
                res.send('User not found');
            }
        }
    );
});

app.get('/get-username', (req, res) => {
    if (req.session.loggedin) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).send('User not logged in');
    }
});

app.post('/user/update-profile-picture', upload.single('profilePicture'), (req, res) => {
    if (!req.session.loggedin) {
        return res.status(403).send({ success: false, message: 'Please log in to update your profile picture.' });
    }

    const userId = req.session.userId; // Assuming this is correctly capturing the user's ID
    const profilePicturePath = '/uploads/profile_pictures/' + req.file.filename;

    // Adjusted to update user_profiles table
    const sql = 'UPDATE user_profiles SET profilePicture = ? WHERE user_id = ?';
    db.query(sql, [profilePicturePath, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile picture:', err);
            return res.status(500).send({ success: false, message: 'Error updating profile picture' });
        }
        res.send({ success: true, message: 'Profile picture updated successfully', profilePictureUrl: profilePicturePath });
    });
});

app.post('/user/profile/picture/remove', (req, res) => {
    if (!req.session.loggedin) {
        res.status(403).send('Please login to remove profile picture');
        return;
    }

    const userId = req.session.userId;
    // Define the path to your default profile picture
    // Ensure this path is correct and the image exists in your project's public directory
    const defaultPicturePath = '/uploads/profile_pictures/defaultProfilePicture.jpeg';

    db.query('UPDATE user_profiles SET profilePicture = ? WHERE user_id = ?', [defaultPicturePath, userId], (err, result) => {
        if (err) {
            res.status(500).send('Error setting profile picture to default');
            return;
        }
        res.send({ success: true, message: 'Profile picture set to default successfully' });
    });
});

app.get('/user/profile', (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).send({ success: false, message: 'User not logged in' });
    }

    const userId = req.session.userId;
    // Fetching from user_profiles table
    db.query('SELECT profilePicture FROM user_profiles WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching profile picture:', err);
            return res.status(500).send({ success: false, message: 'Error fetching profile picture' });
        }
        if (results.length > 0) {
            const profilePicturePath = results[0].profilePicture;
            res.send({ success: true, profilePicturePath: profilePicturePath });
        } else {
            res.status(404).send({ success: false, message: 'Profile not found' });
        }
    });
});

// Update bio endpoint
app.post('/update-bio', (req, res) => {
    const { userId, newBio } = req.body;
  
    const sql = 'UPDATE user_profiles SET bio = ? WHERE user_id = ?';
    db.query(sql, [newBio, userId], (err, result) => {
      if (err) {
        console.error('Error updating bio: ' + err.stack);
        res.status(500).json({ success: false, error: 'Error updating bio' });
        return;
      }
      console.log('Bio updated successfully');
      res.json({ success: true });
    });
});

app.get('/user/:userId/profile', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.execute('SELECT posts, followers, following, likes FROM user_profiles WHERE user_id = ?', [userId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Profile not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/create-post', upload.single('image'), (req, res) => {
    const userId = req.session.userId; 
    const { content } = req.body;
    let imageUrl = req.file ? '/uploads/profile_pictures/' + req.file.filename : null; // If an image is uploaded, set its URL

    const query = 'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)';
    db.query(query, [userId, content, imageUrl], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating post');
            return;
        }
        res.send('Post created successfully' );
    });
});


app.get('/fetch-comments', (req, res) => {
    const { postId } = req.query;
    const query = 'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY created_at DESC';
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});





app.get('/fetch-posts', (req, res) => {
    const sql = `
        SELECT posts.*, users.username, user_profiles.profilePicture,
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likeCount
        FROM posts
        JOIN users ON posts.user_id = users.id
        JOIN user_profiles ON posts.user_id = user_profiles.user_id
        ORDER BY posts.created_at DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).send('Error fetching posts');
        }
        res.json(results);
    });
});




app.get('/user/profile/:username', (req, res) => {
    const { username } =  req.session.username;
    
    // Query your database for the user's information
    // This is a placeholder; replace it with your actual database query
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('User not found');
        }
        
        const user = results[0];
        // Assuming 'user-profile.ejs' is your EJS template for the profile page
        res.render('user-profile', { user });
    });
});

   // Define the posts outside of the route handlers to make them accessible in both route handlers
const examplePost1 = {
    id: 1,
    title: 'Beginner Makeup Tips',
    username: 'Opulence',
    image_url: '/Images/beginnerMakeup.jpeg',
    content: 'This is a sample post added directly from the server-side for testing purposes.',
    created_at: new Date().toISOString()
};

const examplePost2 = {
    id: 2,
    title: 'Advanced Skincare Routines',
    username: 'SkinGuru',
    image_url: '/Images/skincare.jpg',
    content: 'Dive into the world of advanced skincare with our comprehensive guide.',
    created_at: new Date().toISOString()
};

const examplePost3 = {
    id: 3,
    title: 'Fashion',
    username: 'Outfit101',
    image_url: '/Images/flowyDress.jpeg',
    content: 'Explore the latest in fashion trends and tips.',
    created_at: new Date().toISOString()
};

// Array of all posts
const posts = [examplePost1, examplePost2, examplePost3];

// Route for fetching all posts
app.get('/api/posts', (req, res) => {
    // Adjust your SQL query to only fetch posts with IDs 1, 2, and 3
    db.query('SELECT * FROM recent_posts WHERE id IN (1, 2, 3)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/index', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (4, 5, 6)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

let shuffledPosts = null; 

app.get('/api/posts/makeup', (req, res) => {
    // If we've already shuffled the posts, use the stored shuffled array
    if (shuffledPosts) {
        res.json(shuffledPosts);
        return;
    }
    
    // Otherwise, fetch from the database and shuffle
    db.query('SELECT * FROM recent_posts WHERE id IN (1, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        // Shuffle the results
        for (let i = results.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [results[i], results[j]] = [results[j], results[i]]; // Swap elements
        }
        
        // Store the shuffled results for subsequent requests
        shuffledPosts = results;

        res.json(shuffledPosts);
    });
});

app.get('/api/posts/makeupTips', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (12, 13, 14)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});
app.get('/api/posts/foundations', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (10, 15, 16)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/skinCare', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (2, 17, 18, 5, 19, 20)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/BeginnerSkinCare', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (2, 5, 18)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/skinProducts', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (17, 19, 20)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/clothing', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (3)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/bags', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (17, 19, 20)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/shoes', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (21, 22, 23)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/posts/styles', (req, res) => {
    // Query to select all posts from the recent_posts table
    db.query('SELECT * FROM recent_posts WHERE id IN (4, 6, 22)', (err, results) => {
        if (err) {
            console.error('Error fetching posts from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// Route for accessing individual posts by ID
app.get('/post/:id', (req, res) => {
    const postId = req.params.id;
    db.query('SELECT * FROM recent_posts WHERE id = ?', [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post from the database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('Post not found');
        }
    });
});


// Endpoint to get the post count for a user
app.get('/api/user/post-count', (req, res) => {
    // Directly access userId from the session without destructuring
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    db.query('SELECT COUNT(*) AS postCount FROM posts WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching post count:', err);
            return res.status(500).send('Error fetching post count');
        }
        // Make sure to access the postCount correctly from the query result
        const count = results[0]['postCount'] || 0; // Adjust based on your SQL driver if needed
        res.json({ userId, count });
    });
});

app.get('api/user/total-likes', (req, res) => {
    const { userId } = req.session.userId;

    const query = `
        SELECT SUM(l.likeCount) AS totalLikes
        FROM (
            SELECT COUNT(*) as likeCount
            FROM likes
            JOIN posts ON likes.post_id = posts.id
            WHERE posts.user_id = ?
        ) l
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error calculating total likes for user:', err);
            res.status(500).send('Error fetching total likes');
            return;
        }
        const totalLikes = results[0].totalLikes || 0; // Ensure a default of 0 if no likes
        res.json({ totalLikes });
    });
});


app.get('/search', (req, res) => {
    let searchTerm = req.query.term;
    if (!searchTerm) {
        res.json({ error: 'A search term is required' });
        return;
    }

    searchTerm = `%${searchTerm}%`;

    // Query to search for posts
    const postsQuery = `
        SELECT p.id, p.title, p.username, p.image_url, p.content, p.created_at, p.summary
        FROM recent_posts p
        WHERE p.title LIKE ? OR p.content LIKE ? OR p.summary LIKE ?
        ORDER BY p.created_at DESC`;

    // Query to search for users by username
    const usersQuery = `
        SELECT u.id, u.username, u.email
        FROM users u
        WHERE u.username LIKE ?`;

    // Object to hold the combined results
    const combinedResults = {
        users: [],
        posts: []
    };

    // Execute the query to search for posts
    db.query(postsQuery, [searchTerm, searchTerm, searchTerm], (error, postsResults) => {
        if (error) {
            res.json({ error: 'Error executing search query for posts' });
            console.error(error);
            return;
        }
        combinedResults.posts = postsResults;

        // Execute the query to search for users
        db.query(usersQuery, [searchTerm], (error, usersResults) => {
            if (error) {
                res.json({ error: 'Error executing search query for users' });
                console.error(error);
                return;
            }
            combinedResults.users = usersResults;

            // Send back the combined results
            res.json(combinedResults);
        });
    });
});


app.post('/logout', (req, res) => {
    if (req.session) {
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                res.status(500).send('Could not log out, please try again.');
            } else {
                res.send('Logged out successfully.');
            }
        });
    } else {
        res.end();
    }
});

// gallery like button

// Dashboard endpoint
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        // Adjust the path as necessary based on your file structure
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        // Redirect to login page
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/api/session', (req, res) => {
    res.json({ loggedIn: !!req.session.loggedin });
});

// Adjust the fetch-posts route to serve an HTML page instead of JSON, if needed
app.get('/index', (req, res) => {
    if (!req.session.loggedin) {
        res.redirect('/login');
        return;
    }
    // Fetch posts from the database and then render them using EJS or another templating engine
    // Alternatively, use client-side JavaScript to fetch and display posts dynamically
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
