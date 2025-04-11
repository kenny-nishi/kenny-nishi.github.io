const express = require('express');
const axios = require('axios');
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: "http://localhost:4200", // Frontend origin
    credentials: true, // Allow cookies to be sent
  }));
const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsInN1YmplY3RfYXBwbGljYXRpb24iOiJlOTdjNWU4ZC02OWVkLTQyMjEtOWIxZi1lZGU0OGZhN2U1NzgiLCJleHAiOjE3NDQ1ODM5MzgsImlhdCI6MTc0Mzk3OTEzOCwiYXVkIjoiZTk3YzVlOGQtNjllZC00MjIxLTliMWYtZWRlNDhmYTdlNTc4IiwiaXNzIjoiR3Jhdml0eSIsImp0aSI6IjY3ZjMwMjgyNzc1MDQyMDAxNGZhMzg2NiJ9.aJZ950Wajtc6BgV1vN6XY2Ohhf4_d0cUq0XFhVdI4XQ"

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
    const biography = artist.biography.replace(/-\s+/g, '');
    res.json({
        status: 'success',
        output: {
            name: name,
            second_line: `${nationality} (${birthday} - ${deathday})`,
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


app.listen(3000, () => console.log('Server running on http://localhost:3000'));
