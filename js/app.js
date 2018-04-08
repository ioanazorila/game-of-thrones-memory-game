///////////////////////////////////// Card values /////////////////////////////////////

const cardValues = [
    ['ned', 'Winter is coming.'],
    ['syrio', 'Not today.'],
    ['jaime', 'The things I do for love.'],
    ['littlefinger', 'Chaos is a ladder.'],
    ['ygritte', 'You know nothing, Jon Snow.'],
    ['cersei', 'When you play the game of thrones, you win or you die.'],
    ['melisandre', 'The night is dark and full of terrors.'],
    ['tywin', 'A lion does not concern himself with the opinion of sheep.'],
    ['hodor', 'Hodor!'],
    ['ramsay', 'If you think this has a happy ending, you haven\'t been paying attention.'],
    ['brienne', 'Nothing\'s more hateful than failing to protect the one you love.'],
    ['sam', 'I read it in a book.'],
    ['tyrion', 'All dwarfs are bastards in their father\'s eyes.'],
    ['arya', 'Joffrey. Cersei. Walder Frey. Meryn Trant. Tywin Lannister. Ilyn Payne. The Mountain.'],
    ['varys', 'I serve the realm, my lord. Someone must.'],
    ['daenerys', 'Dracarys!']
];


// Shuffle function from http://stackoverflow.com/a/2450976
/**
* @description Shuffles elements of an array
* @param {array} array
* @returns {array} shuffled array
*/
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


/**
* @description Starts a new game
*/
function newGame() {
    shuffle(cardValues);                            // shuffle card values
    const cardValuesImage = cardValues.slice(0,8);  // image cards - select first 8 elements from shuffled array
    let cardValuesQuote = cardValues.slice(0,8);    // quote cards - select same elements as for image cards and shuffle them
    shuffle(cardValuesQuote);

    // select all card elements on left side (images) and update their background images
    const cardsImages = document.querySelectorAll('ul.left-images li.card');
    cardsImages.forEach(function(card, i) {
        card.classList.remove(card.classList.item(1));
        card.removeChild(card.firstElementChild);
        card.insertAdjacentHTML('afterbegin', `<i class="${cardValuesImage[i][0]}"></i>`);
    });

    // select all card elements on right side (quotes) and update their text content
    const cardsQuotes = document.querySelectorAll('ul.right-quotes li.card');
    cardsQuotes.forEach(function(card, i) {
        card.removeChild(card.firstElementChild);
        card.insertAdjacentHTML('afterbegin', `<i class="${cardValuesQuote[i][0]}">${cardValuesQuote[i][1]}</i>`);
    });

    startTime = performance.now();      // update start time
    deltaTime = 0;

    // start timer visible to user in Score Panel
    seconds = 0;
    minutes = 0;
    hours = 0;
    timer();
}


// Start a new game when the page is loaded
newGame();



////////////////////////////////// Restart the game /////////////////////////////////

/**
* @description Restarts the game
*/
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

    // un-hide the 3 hearts
    const hearts = document.querySelectorAll('.fa-heart');
    for (heart of hearts) {
        heart.classList.remove('far');
        heart.classList.add('fas');
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
document.querySelector('.fa-sync-alt').addEventListener('click', function () {
    restartGame();
});



/////////////////////////////////// Play the game ///////////////////////////////////

const deck = document.querySelector('section.deck');         // element that includes all cards


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
    console.log
    showCard(currentCard);                              // display the card's image or quote
    addToOpenCards(currentCard);                        // add to list of visible cards

    const noOfOpenCards = openCards.length;

    // when the user is trying to find matching cards:
    // 1st card that is clicked -> odd number of visible cards (pairs of already visible matching cards + the most recently clicked card)
    // 2nd card that is clicked -> even number of visible cards
    // only if the number of visible cards is even, test if the most recently clicked card matches the previously clicked card

    if (!(noOfOpenCards%2)) {

        const prevCard = openCards[noOfOpenCards-2];    // previously clicked card
        incrementMoves();

        switch (moves) {
            case 8:
                removeHeart();
                break;
            case 16:
                removeHeart();
                break;
            case 24:
                removeHeart();
                clearTimeout(t);                        // stop timer visible to user in Score Panel
                endTime = performance.now();            // store end time for game
                endMessage("lose");
                return;
        }

        // cards match if their "character" classes match (2nd class of each card)
        if (currentCard.firstElementChild.classList.item(0) === prevCard.firstElementChild.classList.item(0)) {
            lockCards(currentCard, prevCard);
            
            // at this point, if the 2 most recently clicked cards matched, and all 16 cards are visible, the user has won
            if (noOfOpenCards === 16) {
                clearTimeout(t);                        // stop timer visible to user in Score Panel
                endTime = performance.now();            // store end time for game
                setTimeout(function(){ 
                    endMessage("win");
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



/**
* @description Displays the card's image or quote
* @param {element} currentCard - the most recently clicked card
*/
function showCard(currentCard) {
    currentCard.classList.add('open');
    currentCard.classList.add(currentCard.parentElement.classList.contains('left-images') ? 
                                currentCard.firstElementChild.classList.item(0) : 'show');
}


/**
* @description Adds current card to a list of visible cards
* @param {element} currentCard - the most recently clicked card
*/
function addToOpenCards(currentCard) {
    openCards.push(currentCard);
}


/**
* @description Increments the number of moves
*/
function incrementMoves() {
    document.querySelector('.moves').innerHTML = ++moves;
}


/**
* @description Locks the matching cards in open position
* @param {element} currentCard - the most recently clicked card
* @param {element} prevCard - the previously clicked card
*/
function lockCards(currentCard, prevCard) {
    currentCard.classList.add('match');
    prevCard.classList.add('match');
}


/**
* @description If the most recently clicked card does not match the previously clicked card, hides the two cards
* @param {element} currentCard - the most recently clicked card
* @param {element} prevCard - the previously clicked card
*/
function hideCards(currentCard, prevCard) {
    currentCard.classList.remove('open');
    currentCard.classList.remove(currentCard.parentElement.classList.contains('left-images') ?
                                currentCard.firstElementChild.classList.item(0) : 'show');
    prevCard.classList.remove('open');
    prevCard.classList.remove(prevCard.parentElement.classList.contains('left-images') ?
                                prevCard.firstElementChild.classList.item(0) : 'show');
    openCards.splice(-2);
    clickAllowed = true;                // allow user to click other cards
}


/**
* @description Removes a heart from the user's "life"
*/
function removeHeart() {
    document.querySelector('.fas.fa-heart').classList.add('far');
    document.querySelector('.fas.fa-heart').classList.remove('fas');    
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



/////////////////////////////// Win or lose the game ///////////////////////////////

/**
* @description Displays the end-of-game message
* @param {string} result - the result of the game ("win" or "lose")
*/
function endMessage(result) {
    const playTime = ((endTime - startTime + deltaTime)/1000).toFixed(2);
    const hearts = document.querySelectorAll('.fas.fa-heart').length;

    // update content of message
    document.querySelector(`.${result}-message .play-time`).innerHTML = playTime;
    document.querySelector(`.${result}-message .no-of-moves`).innerHTML = moves;
    document.querySelector(`.${result}-message .no-of-hearts`).innerHTML = document.querySelector('.hearts').innerHTML;

    // hide deck and display message
    document.querySelector('.deck').classList.add('hide');
    document.querySelector(`.${result}-message`).classList.remove('hide');
}
