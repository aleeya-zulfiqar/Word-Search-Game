const clickSound = new Howl({ src: ['sounds/click.mp3'] });
const successSound = new Howl({ src: ['sounds/success.mp3'] });
const failSound = new Howl({ src: ['sounds/fail.mp3'] });
const tryAgainSound = new Howl({ src: ['sounds/tryagain.mp3'] });

function celebrateConfetti() {
    confetti({
        particleCount: 120,
        spread: 95,
        origin: { y: 0.7 }
    });
}

let is_game_on = false;
let guesses = 0;
let load_more = 0;
let score = 0;
let query;
let key = 'jgOLgyKiBO6yCE7VFJOyI4gjPfL6aAEWKx1u3VYkkco';
let input = document.getElementById('guess_field');

input.addEventListener('keydown', function(event) {
    if(event.keyCode == 13) {
        event.preventDefault();
        document.getElementById('guess_button').click();
    }
})

function calculateScore(guesses, load_more) {
    const wrongGuesses = Math.max(guesses, 0);
    const extraPhotos = Math.max(load_more - 1, 0);

    score = Math.round(100 - (wrongGuesses * 10) - (extraPhotos * 5));
    if (score < 0) score = 0;
}

function updateBadges(guesses, load_more) {
    if (is_game_on) {
        calculateScore(guesses, load_more);
    }
    document.getElementById('guess_count').textContent = `Guesses: ${guesses}`;
    document.getElementById('photo_count').textContent = `Photos: ${load_more}`;
    document.getElementById('score').textContent = `Score: ${score}`;
}

function getPics(query, load_more)
{
    document.getElementById('guess').elements['guess'].value = '';

    let url = "https://api.unsplash.com/search/photos?query="+query+"&client_id="+key+"&per_page=50";
    let all_images = '';
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200)
        {
            let data = JSON.parse(this.responseText);
            console.log(data);
            //let limit = Math.min(load_more, data.results.length);
            for(let i = 0; i < load_more; i++)
            {
                if (!data.results[i] || !data.results[i].urls || !data.results[i].urls.regular) continue;

                let img_link = data.results[i].urls.regular;
                let image_text = `<div class='card' id='ex${i}'>
                    <img class='card-img-top' src='`+img_link+"'></div>"
                
                all_images += image_text
            }
            document.getElementById('pics').innerHTML = all_images;
            $(document).ready(function() {
                 for (let i = 0; i < load_more; i++) {
                    $(`#ex${i}`).zoom();
                }
            });
        }
    }
    xhttp.open('GET', url, true);
    xhttp.send();
}

function Play() {
    is_game_on = true;
    clickSound.play();
    number = Math.floor(Math.random() * 100);
    query = word_list[number];
    console.log(query)
    getPics(query, 1);
    guesses = 0;
    load_more = 1;
    updateBadges(guesses, load_more);
    
    document.getElementById('pics').style.justifyContent = 'center';
    document.getElementById('showMore').style.display = 'inline';
    document.getElementById('guess').elements['guess'].setAttribute('placeholder', 'ENTER YOUR GUESS!');
    document.getElementById('guess').elements['guess'].value = '';    
    document.getElementById('giveup_button').style.display = 'inline';
}

function loadMorePhotos() {
    clickSound.play();
    if(load_more < 11) {
        load_more += 1;
        getPics(query, load_more);
        updateBadges(guesses, load_more);

        if(load_more > 3) {
            document.getElementById('pics').style.justifyContent = 'flex-start';
        }
        if(load_more == 10) {
            document.getElementById('showMore').style.display = 'none';
        }
    }
    else {
        alert("Can't load anymore :(")
    }
}

function Check()
{
    let guess = document.getElementById('guess').elements['guess'].value;
    if (document.getElementById('pics').querySelectorAll('img').length == 0)
    {
        clickSound.play();
        document.getElementById('guess').elements['guess'].setAttribute('placeholder', 'CLICK THE PLAY BUTTON FIRST!');
    }
    else if (guess == '')
    {
        clickSound.play();
        document.getElementById('guess').elements['guess'].setAttribute('placeholder', 'ENTER YOUR GUESS!');
    }
    else
    {
        if (guess == query)
        {
            //alert('Congrats you got it right!');
            successSound.play();
            celebrateConfetti();
            updateBadges(guesses, load_more);

            all_images = '';
            document.getElementById('pics').innerHTML = `
            <div class="result-wrapper">
            <div id='message' class="result-message">
            <h2> Pretty Good 🥳 </h2>
            <br>
            <div class="w3-animate-opacity">
            <p><strong>Your Score:&nbsp; ${score}</strong></p>
            </div>
            <p>Let's play again :)</p>
            <br>
            <button class='btn btn-warning' id="playagain_button" onclick = 'Play()'>🔄 Play Again </button>
            </div>
            </div>
            `
            document.getElementById('playagain_button').addEventListener('click', () => { clickSound.play()});
            document.getElementById('showMore').style.display = 'none';
            document.getElementById('giveup_button').style.display = 'none';
            document.getElementById('guess_field').value = ""
        }
        else
        {
            guesses += 1;
            updateBadges(guesses, load_more);
            tryAgainSound.play();
            document.getElementById('guess').elements['guess'].setAttribute('placeholder', 'PLEASE TRY AGAIN')
            document.getElementById('guess').elements['guess'].value = ''
        }
    }
}

function GiveUp()
{
    is_game_on = false;
    score = 0;
    updateBadges(guesses, load_more);
    if (load_more < 1)
    {
        clickSound.play();
        document.getElementById('guess').elements['guess'].setAttribute('placeholder', 'CLICK THE PLAY BUTTON FIRST!');
    }
    else
    {
        failSound.play();
        document.getElementById('guess').elements['guess'].setAttribute('placeholder', '');
    
        all_images = '';
        document.getElementById('pics').innerHTML = `
        <div class="result-wrapper">
            <div id='message' class="result-message">
        <h2>The answer was '${query}' 😪</h2>
        <br>
        <div class="w3-animate-opacity">
        <p><strong>Your Score: 0</strong></p>
        </div>
        <p>Let's play again :)</p>
        <br>
        <button class = 'btn btn-warning' id="playagain_button" onclick = 'Play()'>🔄 Play Again </button>
        </div>
        </div>
        `
        document.getElementById('playagain_button').addEventListener('click', () => { clickSound.play()});
        document.getElementById('showMore').style.display = 'none';
        document.getElementById('giveup_button').style.display = 'none';
        document.getElementById('guess_field').value = '';
    }
}