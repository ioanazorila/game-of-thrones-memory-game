///////////////////////////////////// Card values /////////////////////////////////////

const cardValues = ["fa-anchor", "fa-bicycle", "fa-bolt", "fa-bomb", "fa-cube", "fa-diamond", "fa-leaf", "fa-paper-plane-o"];
const allCardValues = cardValues.concat(cardValues);


// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}



/////////////////////////////////// Score panel timer ///////////////////////////////////

// Based on code from https://jsfiddle.net/Daniel_Hug/pvk6p/
const timeTag = document.getElementsByTagName('time')[0];
let seconds, minutes, hours, t;

function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    
    timeTag.textContent = (hours > 9 ? hours : "0" + hours) + ":" + (minutes > 9 ? minutes : "0" + minutes) + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer();
}

function timer() {
    t = setTimeout(add, 1000);
}



///////////////////////////////////// New game /////////////////////////////////////

let openCards = [];                     // list of visible cards
let moves = 0;                          // number of moves
let startTime;                          // start time for game
let endTime;                            // end time for game
let deltaTime;                          // time spent playing the current game, before the latest pause
let clickAllowed = true;                // determines if the user is allowed to reveal another card at a given time


function newGame() {
    shuffle(allCardValues);             // shuffle card values

    // select all card elements and update the value of each card
    const cards = document.querySelectorAll('li.card');
    cards.forEach(function(card, i) {
        card.removeChild(card.firstElementChild);
        card.insertAdjacentHTML('afterbegin', `<i class="fa ${allCardValues[i]}"></i>`);
    });

    startTime = performance.now();      // update start time
    deltaTime = 0;

    // start timer visible to user in Score Panel
    seconds = 0;
    minutes = 0;
    hours = 0;
    timer();
}


// Start a new game when the page is reloaded
newGame();



////////////////////////////////// Restart the game /////////////////////////////////

function restartGame() {
    // show deck, hide win message
    document.querySelector('.deck').classList.remove('hide');
    document.querySelector('.win-message').classList.add('hide');

    openCards = [];                     // reset array that lists visible cards
    moves = -1;                         // reset the number of moves
    incrementMoves();

    // hide visible cards
    const cards = document.querySelectorAll('li.card');
    for (card of cards) {
        card.classList.remove('open');
        card.classList.remove('show');
        card.classList.remove('match');
    }

    // un-hide the 3 stars
    const stars = document.querySelectorAll('.fa-star');
    for (star of stars) {
        star.classList.add('star-visible');
    }

    // reset timer visible to user in Score panel
    clearTimeout(t);
    timeTag.textContent = "00:00:00";

    // if click was disabled after pausing the game, re-enable it when the user restarts the game (bug fix)
    clickAllowed = true;

    // shuffle and update card values
    newGame();
}


// Restart game when the restart button is clicked
document.querySelector('.fa-repeat').addEventListener('click', function () {
    restartGame();
});



/////////////////////////////////// Play the game ///////////////////////////////////

const deck = document.querySelector('ul.deck');         // element that includes all cards


// Event listener for click on a card
deck.addEventListener('click', function (evt) {
    const currentCard = evt.target;                     // card that was clicked

    // do nothing if:
    // - user clicks on an already visible card
    // - user clicks on the deck background (outside the cards)
    // - while waiting for non-matching cards to be hidden
    // - while the game is paused
    if (currentCard.classList.contains('open') || currentCard.tagName != "LI" || !clickAllowed)
        return;

    showCard(currentCard);                              // display the card's symbol
    addToOpenCards(currentCard);                        // add to list of visible cards

    const noOfOpenCards = openCards.length;

    // when the user is trying to find matching cards:
    // 1st card that is clicked -> odd number of visible cards (pairs of already visible matching cards + the most recently clicked card)
    // 2nd card that is clicked -> even number of visible cards
    // only if the number of visible cards is even, test if the most recently clicked card matches the previously clicked card

    if (!(noOfOpenCards%2)) {

        const prevCard = openCards[noOfOpenCards-2];    // previously clicked card
        incrementMoves();

        if (moves === 10 || moves === 20)
            removeStar();

        // cards match if their "fa-..." classes match (2nd class of each card)
        if (currentCard.firstElementChild.classList.item(1) === prevCard.firstElementChild.classList.item(1)) {
            lockCards(currentCard, prevCard);
            
            // at this point, if the 2 most recently clicked cards matched, and all 16 cards are visible, the user has won
            if (noOfOpenCards === 16) {
                clearTimeout(t);                        // stop timer visible to user in Score Panel
                endTime = performance.now();            // store end time for game
                setTimeout(function(){ 
                    winMessage();
                 }, 2000);                              // show all cards for 2 seconds before displaying win message
            }

        } else {
            clickAllowed = false;                       // do not allow user to reveal other cards until the non-matching cards are hidden
            setTimeout(function(){                      // hide non-matching cards after 1 second
                hideCards(currentCard, prevCard);
            }, 1000);
        }
    }
});


// Display the card's symbol
function showCard(currentCard) {
    currentCard.classList.add('open');
    currentCard.classList.add('show');
}


// Add to list of visible cards
function addToOpenCards(currentCard) {
    openCards.push(currentCard);
}


// Increment number of moves
function incrementMoves() {
    document.querySelector('.moves').innerHTML = ++moves;
}


// Lock the matching cards in open position
function lockCards(currentCard, prevCard) {
    currentCard.classList.add('match');
    prevCard.classList.add('match');
}


// If the most recently clicked card does not match the previously clicked card, hide the two cards
function hideCards(currentCard, prevCard) {
    currentCard.classList.remove('open');
    currentCard.classList.remove('show');
    prevCard.classList.remove('open');
    prevCard.classList.remove('show');
    openCards.splice(-2);
    clickAllowed = true;                // allow user to click other cards
}


// Remove star
function removeStar() {
    document.querySelector('.star-visible').classList.remove('star-visible');
}



///////////////////////////// Pause or resume the game /////////////////////////////


// Pause game (pause timer, disable click on cards) when the pause button is clicked
document.querySelector('.fa-pause').addEventListener('click', function () {
    deltaTime += performance.now() - startTime;         // store the time spent playing before pausing the game
    clearTimeout(t);
    clickAllowed = false;
});


// Resume game (resume timer, enable click on cards) when the play button is clicked
document.querySelector('.fa-play').addEventListener('click', function () {
    timer();
    startTime = performance.now();
    clickAllowed = true;
});



/////////////////////////////////// Win the game ///////////////////////////////////

// Display win message
function winMessage() {
    const playTime = ((endTime - startTime + deltaTime)/1000).toFixed(2);
    const stars = document.querySelectorAll('.star-visible').length;

    // update content of win message
    document.querySelector('.play-time').innerHTML = playTime;
    document.querySelector('.no-of-moves').innerHTML = moves;
    document.querySelector('.no-of-stars').innerHTML = (stars === 1) ? `${stars} star` : `${stars} stars`;

    // hide deck and display win message
    document.querySelector('.deck').classList.add('hide');
    document.querySelector('.win-message').classList.remove('hide');
}
