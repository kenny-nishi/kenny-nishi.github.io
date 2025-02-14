import { details } from './details.js';

export function searchArtists(query) {
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const scrollableCard = document.getElementById('card-container');
  const no_result_box = document.getElementById('no-result-box');
  const details_box = document.getElementById('details');
  let previous_card = null;

  // Show loading
  loading.classList.remove('hidden');
  details_box.classList.add('hidden');

  // Send request
  // fetch('/process', {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ input: query })
  // })
  fetch (`/artist_search/${query}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => response.json())
  .then(data => {
      if(data.status === 'success') {
        // Clear the content
        scrollableCard.innerHTML = '';

        if (data.output.length === 0) {
          // Show no result message
          no_result_box.classList.remove('hidden');
          result.classList.add('hidden');
          details_box.classList.add('hidden');
        }else{
          no_result_box.classList.add('hidden');
          // Create and append new cards based on the output
          data.output.forEach(item => {
            // each card is clickable for further details
            const card = document.createElement('button');
            card.className = 'card';

            const img = document.createElement('img');
            if (item.image === '/assets/shared/missing_image.png'){
              // missing images replace with artsy logo
              item.image = 'static/images/images/artsy_logo.svg';
            }
            img.src = item.image;
            img.alt = item.name;

            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = item.name;

            card.appendChild(img);
            card.appendChild(name);

            // Add event listener to each card
            card.addEventListener('click', () => {
              card.classList.add('clicked');
              if (previous_card !== null){
                previous_card.classList.remove('clicked');
              }
              previous_card = card;
              loading.classList.remove('hidden');
              details(item);
            });
            scrollableCard.appendChild(card);
          });
        }
      } else {
        result.textContent = 'Failed to fetch data.';
      }
  })
  .catch(error => {
      console.error('Error:', error);
      result.textContent = error.message;
      result.classList.remove('hidden');
  })
  .finally(() => {
    loading.classList.add('hidden');
    result.classList.remove('hidden');
  });
}
