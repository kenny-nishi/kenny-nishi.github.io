export function details(item){
    const details_box = document.getElementById('details');
    const first_line = document.getElementById('first-line');
    const nationality = document.getElementById('nationality');
    const alternative = document.getElementById('alternative');
    const biography = document.getElementById('biography');

    // fetch('/details', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ id: item.id })
    // })
    fetch(`/artist_detail/${item.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            first_line.innerHTML = data.output.first_line;
            nationality.innerHTML= data.output.nationality;
            // if(data.output.alternative !== null){
            //     alternative.innerHTML = data.output.alternative;
            //     biography.innerHTML = data.output.biography;
            // }else {
            //     alternative.innerHTML = data.output.alternative;
            //     biography.innerHTML = data.output.biography;
            // }
            // console.log(data.output.biography);
            // console.log(data.output.alternative);
            if(data.output.biography === ""){
                // show the information in alternative field
                alternative.innerHTML = data.output.alternative;
                biography.innerHTML = '';
            }else{
                // show the information in biography field
                alternative.innerHTML = "";
                biography.innerHTML = data.output.biography;
            }
            details_box.classList.remove('hidden');
        } else {
            alert('Error in fetching details');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .finally(() => {
        loading.classList.add('hidden');
        // result.classList.remove('hidden');
        details_box.classList.remove('hidden');
    });
}