import { searchArtists } from './Request.js';
const searchInput = document.getElementById('search-input');
const clearButton = document.getElementById('clear-button');
const searchButton = document.getElementById('search-button');
const details = document.getElementById('details');
// const loading = document.getElementsByClassName('loading-gif');

// Clear input on click
clearButton.addEventListener('click', () => {
  searchInput.value = ''; // Clear input
  searchInput.focus(); //focus on the search bar 
});

// when user press enter key to do the same with clicking the search button
addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (searchInput.value === '') {
            searchInput.reportValidity(); //do the pop up alert
            searchInput.focus();
        }else{
            // alert("You have searched for: " + searchInput.value);
            searchArtists(searchInput.value);
            details.classList.add('hidden');
        }
    }
});

//when the user click the button, allow user to input in the search bar
searchButton.addEventListener('click', () => {
    if (searchInput.value === '') {
        searchInput.reportValidity(); //do the pop up alert
        // alert("Please enter a search term");
        searchInput.focus();
        details.classList.add('hidden');
    }else{
        searchArtists(searchInput.value);
    }
});

