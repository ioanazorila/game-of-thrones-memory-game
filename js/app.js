/*
 * Create a list that holds all of your cards
 */
const cardValues = ["fa-anchor", "fa-bicycle", "fa-bolt", "fa-bomb", "fa-cube", "fa-diamond", "fa-leaf", "fa-paper-plane-o"];
const allCardValues = cardValues.concat(cardValues);


/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

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


let openCards = [];                     // list of visible cards
let moves = 0;                          // number of moves
let startTime;                          // start time for game


function newGame() {
    shuffle(allCardValues);             // shuffle card values

    // select all card elements and update the value of each card
    const cards = document.querySelectorAll('li.card');
    cards.forEach(function(card, i) {
        card.removeChild(card.firstElementChild);
        card.insertAdjacentHTML('afterbegin',`<i class="fa ${allCardValues[i]}"></i>`);
    });

    startTime = performance.now();      // update start time
}


// start a new game when the page is reloaded
newGame();


function restartGame() {
    openCards = [];                     // reset array that lists visible cards
    moves = -1;                          // reset the number of moves
    incrementMoves();

    //hide visible cards
    const cards = document.querySelectorAll('li.card');
    for (card of cards) {
        card.classList.remove('open');
        card.classList.remove('show');
        card.classList.remove('match');
    }

    // un-hide the 3 stars
    const stars = document.querySelectorAll('ul.stars li i');
    for (star of stars) {
        star.classList.add('fa-star');
    }

    // shuffle and update card values
    newGame();
}


// restart game when the restart button is clicked
document.querySelector('div.restart').addEventListener('click', function () {
    restartGame();
});


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */


const deck = document.querySelector('ul.deck');         // element that includes all cards
let clickAllowed = true;                                // determines if the user is allowed to reveal another card at a given time


// event listener for click on a card
deck.addEventListener('click', function (evt) {
    const currentCard = evt.target;                     // card that was clicked

    // do nothing if:
    // - user clicks on an already visible card
    // - user clicks on the deck background (outside the cards)
    // - while waiting for non-matching cards to be hidden
    if (currentCard.classList.contains('open') || currentCard.tagName != "LI" || !clickAllowed)
        return;

    showCard(currentCard);
    addToOpenCards(currentCard);

    const noOfOpenCards = openCards.length;

    // when trying to match two cards:
    // 1st card that is clicked -> odd number of visible cards (pairs of already visible matching cards + the most recently clicked card)
    // 2nd card that is clicked -> even number of visible cards
    // only if the number of visible cards is even, test if the most recently clicked card matches the previously clicked card
    if (!(noOfOpenCards%2)) {

        const prevCard = openCards[noOfOpenCards-2];    // previously clicked card
        incrementMoves();

        if (moves === 10 || moves === 16)
            removeStar();

        // cards match if their "fa-..." classes match
        if (currentCard.firstElementChild.classList.item(1) === prevCard.firstElementChild.classList.item(1)) {
            lockCards(currentCard, prevCard);
            
            // at this point, if the 2 most recently clicked cards match, and all 16 cards are visible, the user has won
            if (noOfOpenCards === 16) {
                const endTime = performance.now();
                console.log("win " + (endTime - startTime)/1000);
            }
        } else {
            clickAllowed = false;                       // do not allow user to reveal other cards until the non-matching cards are hidden
            setTimeout(function(){
                hideCards(currentCard, prevCard);
            }, 500);
        }
    }

});


// display the card's symbol
function showCard(currentCard) {
    currentCard.classList.add('open');
    currentCard.classList.add('show');
}


// add to list of visible cards
function addToOpenCards(currentCard) {
    openCards.push(currentCard);
}


// increment number of moves
function incrementMoves() {
    document.querySelector('.moves').innerHTML = ++moves;
}


// lock the matching cards in open position
function lockCards(currentCard, prevCard) {
    currentCard.classList.add('match');
    prevCard.classList.add('match');
}


// if the most recently clicked card does not match the previously clicked card, hide the two cards
function hideCards(currentCard, prevCard) {
    currentCard.classList.remove('open');
    currentCard.classList.remove('show');
    prevCard.classList.remove('open');
    prevCard.classList.remove('show');
    openCards.splice(-2);
    clickAllowed = true;                // allow user to click other cards
}


// remove star
function removeStar() {
    document.querySelector('.fa-star').classList.remove('fa-star');
}