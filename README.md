# Memory Game Project

Project created during the Udacity/Google Front-End Web Developer Nanodegree Program.

The project is based on a static version provided by Udacity, on top of which I have added the functionality of the game, responsive design for mobile/tablet, and a few extra features.


## Content of the project
1. **index.html** - describes the structure of the webpage, which includes the header, the score panel, the deck of cards and the (initially hidden) win message.

2. **css/app.css** - describes the style applied to the webpage. It is divided into several sections:
- general styles
- style for the score panel
- style for the deck of cards
- style for the win message
- animations
- responsive design

3. **js/app.js** - JavaScript code that implements the functionality of the game. It is divided into several sections, each of them including global variable declarations and functions that are used for a certain purpose, such as: 
- card values
- score panel timer
- new game
- restart the game
- play the game
- pause/resume the game
- win the game

4. **img** directory - includes the background image used for the webpage

5. **CONTRIBUTING.md** - describes the contributions that can be submitted by other users. Original content by Richard Kalehoff, it has not been modified.

6. **README.md** - provides a general description of the project, an overview of the content of the project and its features, a brief description of how the game is played, and a list of acknowledgements.


## Features
- Interactive gameplay
- Restart game, pause game, resume game buttons
- Player "loses" a star after 10 moves, and then one more star after 20 moves
- Timer indicating time spent in the current game
- Win message that includes the player's stats
- Animations when cards are shown and when cards match
- Responsive design for phone/tablet


## How to play
The objective of the game is to match all 8 pairs of cards.

Reload the webpage or click on the **⭮** button to start a new game.

Then click on the cards one by one, to flip them over. Matching cards will remain face up. Cards that do not match will be hidden after 1 second (try to memorize their position while they are visible 🙂). Then flip over some more cards until you match all of them.

If you need to be away from your computer for a while, you can pause the game's timer by clicking on the ⏸ button. To resume the game, click on the ▶ button.

When all cards have been matched, a "win message" will show your stats: time and number of moves needed to match all cards, and your "number of stars" score.

Enjoy the game! 🙂


## Sources
- The project is based on a static version provided by Udacity.
- Webpage background pattern from Subtle Patterns
- Animations from https://www.w3schools.com/css/css3_animations.asp
- CSS "font border" from https://stackoverflow.com/questions/2570972/css-font-border
- Shuffle function from http://stackoverflow.com/a/2450976
- Score panel timer based on code from https://jsfiddle.net/Daniel_Hug/pvk6p/
