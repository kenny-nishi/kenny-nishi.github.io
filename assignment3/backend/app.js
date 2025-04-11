// backend/app.js
const express = require('express');
const connectDB = require('./db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const axios = require('axios');
require('dotenv').config();

const app = express();

const JWT_SECRET = 'Kenny_Wan_Csci_571_assignment3';

app.use(cors({
  // origin: "http://localhost:4200",
  origin: "https://frontend-824257223293.us-west2.run.app",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsInN1YmplY3RfYXBwbGljYXRpb24iOiJlOTdjNWU4ZC02OWVkLTQyMjEtOWIxZi1lZGU0OGZhN2U1NzgiLCJleHAiOjE3NDQ1ODM5MzgsImlhdCI6MTc0Mzk3OTEzOCwiYXVkIjoiZTk3YzVlOGQtNjllZC00MjIxLTliMWYtZWRlNDhmYTdlNTc4IiwiaXNzIjoiR3Jhdml0eSIsImp0aSI6IjY3ZjMwMjgyNzc1MDQyMDAxNGZhMzg2NiJ9.aJZ950Wajtc6BgV1vN6XY2Ohhf4_d0cUq0XFhVdI4XQ"

app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
connectDB();
const User = require('./models/User');



app.post('/register', async (req, res) => {
  const { fullname, email, password} = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);


  const hash_email = crypto.createHash('sha256').update(email).digest('hex');
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash_email}?d=identicon`;

  const newUser = new User({
    fullname,
    email,
    hashed_password: hashedPassword,
    profileImageUrl: gravatarUrl,
  });


  try {
    await newUser.save(); 
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'MongoDB connection error' });
  }

  //crete JWT token
  const token = jwt.sign({ userId: newUser._id },JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 3600000, //1hour
  });

  res.status(200).json({
    user: {
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profileImageUrl: newUser.profileImageUrl,
    },
  });
});

//login logout?
app.post('/login',async (req, res) => {
  const { email, password } = req.body;
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  // Check password
  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  // Create JWT token
  const token = jwt.sign({ userId: user._id },JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 3600000,
  });

  res.status(200).json({
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    },
  });
});

app.get('/logout', (req, res) => {
  // Clear the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'Logged out successfully' });
}
);


app.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(402).json({ error: "Unauthorized" });

  // Verify JWT
  jwt.verify(token,JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    const user = await User.findById(decoded.userId).select('-hashed_Password');
    res.status(200).json({
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  });
});


app.delete('/delete_favorites/:id', async (req, res) => {
  try{

      const { id } = req.params;
      const user_token = req.cookies.token;
      const decoded = jwt.verify(user_token,JWT_SECRET);
      const userId = decoded.userId;
      // Find the user in MongoDB
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.favorites = user.favorites.filter(fav => fav.id !== id);

      await user.save();

      res.status(200).json(user.favorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Failed to remove artist from favorites' });
    }
  }
);

app.post('/add_favorites', async (req, res) => {
  try{
    const { id, image } = req.body;
    console.log(id,image);
    const response = await axios.get(`https://api.artsy.net/api/artists/${id}`, {
      headers: { 'X-XAPP-Token': token }
      });
      const artist = response.data;
      const name = artist.name;
      const birthday = artist.birthday ;
      const deathday = artist.deathday ;
      const nationality = artist.nationality;
      let biography = "";
      if(artist.biography) {
        biography = artist.biography.replace(/-\s+/g, '');
      }
      const timestamp = new Date();

      const user_token = req.cookies.token;
      const decoded = jwt.verify(user_token,JWT_SECRET);
      const userId = decoded.userId;
      console.log("return message from artsy ok");
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log("finding user ok");
      const favorite = {
        id: id,
        image: image,
        name: name,
        nationality: nationality,
        birthday: birthday,
        deathday: deathday,
        biography: biography,
        addedAt: timestamp,
      };
      // update
      user.favorites.push(favorite);
      await user.save();
      console.log("update user ok");
      //return
      res.status(200).json(favorite);
  } catch (error) {
    console.error('Full error adding favorite:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    res.status(500).json({ message: 'Failed to add artist to favorites', error: error.message });
  }
});

app.delete('/delete_user/:id', async (req, res) => {
  const userId = req.params.id;
  await User.deleteOne({ _id: userId });
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'User deleted successfully' });
});


app.get('/favorites', async (req, res) => {
  try {
    const user_token = req.cookies.token;
    const decoded = jwt.verify(user_token,JWT_SECRET);
    const userId = decoded.userId;
    // Find the user in MongoDB
    const user = await User.findById(userId);
    console.log(user.favorites);
    // Respond with the user's favorites
    res.status(200).json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});




// artsy API routes
app.get('/artist_search/:query', async (req, res) => {
    // tested, working
    const { query } = req.params;
    const response = await axios.get('https://api.artsy.net/api/search', {
        params: { q: query, size: 10, type: 'artist' },
        headers: { 'X-XAPP-Token': token }
    });
    const artists = response.data._embedded.results.map(artist => ({
        id: artist._links.self.href.split('/').pop(),
        name: artist.title,
        image: artist._links.thumbnail.href
    }));
    res.json({ status: 'success', output: artists });
});


app.get('/artist_detail/:id', async (req, res) => {
    // tested, working
    const { id } = req.params;
    const response = await axios.get(`https://api.artsy.net/api/artists/${id}`, {
        headers: { 'X-XAPP-Token': token }
    });
    const artist = response.data;
    const name = artist.name;
    const birthday = artist.birthday ;
    const deathday = artist.deathday ;
    const nationality = artist.nationality;
    let biography = "";
    if(artist.biography) {
        biography = artist.biography.replace(/-\s+/g, '');
    }
    res.json({
        status: 'success',
        output: {
            id: id,
            name: name,
            // second_line: `${nationality} (${birthday} - ${deathday})`,
            nationality: nationality,
            birthday: birthday,
            deathday: deathday,
            biography: biography,
        }
    });
});

app.get('/similar_artists/:id', async (req, res) => {
    // tested, working
    const { id } = req.params;
    const response = await axios.get(`https://api.artsy.net/api/artists`, {
        params: { similar_to_artist_id: id },
        headers: { 'X-XAPP-Token': token }
    });
    const artists = response.data._embedded.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
        image: artist._links.thumbnail?.href || 'No Image',
    }));
    res.json({ status: 'success', output: artists });
}
);

app.get("/artwork/:artist_id", async (req,res) => {
    // tested, working
    const { artist_id } = req.params;
    const response = await axios.get('https://api.artsy.net/api/artworks', {
        params: { artist_id:artist_id ,size : 10 },
        headers: { 'X-XAPP-Token': token }
    });
    const artwork = response.data._embedded.artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        date: artwork.date || 'No Date',
        image: artwork._links.thumbnail.href,
    }));
    res.json({
        status: 'success',
        output: artwork
    });
});

app.get('/genes/:id', async (req, res) => {
    // tested, working
    const { id } = req.params;
    const response = await axios.get('https://api.artsy.net/api/genes', {
        params:{artwork_id:id},
        headers: { 'X-XAPP-Token': token }
    });
    const category = response.data._embedded.genes.map(gene => ({
        id: gene.id,
        name: gene.name,
        image: gene._links.thumbnail.href
    }));
    res.json({
        status: 'success',
        output: category
    });
});


const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});

