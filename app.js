/**
 * 
 * Importing all my data from another file for ease on scaling later.
 * 
 */
import { level1Objects, level2Objects, level3Objects, nobleObjects } from './csv.js';


// Global Variables
const colorToClass = {
    Green : 'colorG',
    Blue : 'colorU',
    Red : 'colorR',
    White : 'colorW',
    Black : 'colorB'
}

const cardAreaZone3 = document.getElementById('Level3Zone')
const cardAreaZone2 = document.getElementById('Level2Zone')
const cardAreaZone1 = document.getElementById('Level1Zone')
const otherPlayers = document.getElementById('OtherPlayers')
const nobleArea = document.getElementById('NobleZone')

//
class Game {
    /**
     * Each array is a deck of Deck Objects predefined in the database
     * @param {[Object]} oneDeck 
     * @param {[Object]} twoDeck 
     * @param {[Object]} threeDeck 
     * @param {[Object]} nobleDeck 
     */
    constructor(oneDeck, twoDeck, threeDeck, nobleDeck,...players) {
        this.playerCount = 0;
        this.players = players;
        this.currentPlayer = 0;
        this.lvlOneDeck = shuffleArray(oneDeck)
        this.lvlTwoDeck = shuffleArray(twoDeck)
        this.lvlThreeDeck = shuffleArray(threeDeck)
        //noting that noblesRevealed === playerCount+1
        this.nobleDeck = shuffleArray(nobleDeck)
        this.tokens = {
            Green: 7,
            Blue: 7,
            Red: 7,
            White: 7,
            Black: 7,
            Yellow: 5
        }
    }
    /**
     * Initializes available tokens for the game based on the number of players
     *  Sets number of players eleement
     */
    setPlayerCountInit = () => {

        if (this.players.length == 2) {
            this.this.players.length = this.players.length;
            this.tokens = {
                Green: 4,
                Blue: 4,
                Red: 4,
                White: 4,
                Black: 4,
                Yellow: 5
            }
        }
        else if (this.players.length == 3) {
            this.playerCount = this.players.length;
            this.tokens = {
                Green: 5,
                Blue: 5,
                Red: 5,
                White: 5,
                Black: 5,
                Yellow: 5
            }
        }
        else if (this.players.length == 4) {
            this.playerCount = this.players.length;

        }
        else {
            throw new Error('Invalid Number of Players assigned!');
        }
    }
    /**
     * assigns a random index depending on the amount of players.
     */
    chooseStartingPlayer = () => {
        this.currentPlayer = Math.floor(Math.random() * this.playerCount); 
    }
    /**
     * Adds a player to the Game
     * @param {Player} playerObject 
     */
    addPlayer = (playerObject) => {
        this.players.push(playerObject)
        this.playerCount += 1
    }
    /**
     * @param {number} number 1,2,3
     * @returns nextCardObject In Array
     */
    dealNewCardlevel = (number) => {
        if(number === 1){
            return this.lvlOneDeck.pop()
        }else if(number === 2){
            return this.lvlTwoDeck.pop()
        }else if(number === 3){
            return this.lvlThreeDeck.pop()
        }
        else{
            throw new Error('Invalid level of card!');
        }
    }
    dealNewNobleCard = () => {
        return this.nobleDeck.pop()
    }
    /**
 * Initializes the gamestate
 * 
 */
initateGame = () => {
    //There should be a prompt for asking how many players.

    this.setPlayerCountInit()
    
    //create new lvl1 cards
    cardAreaZone1.appendChild(createNewCardElement(this.dealNewCardlevel(1)))
    cardAreaZone1.appendChild(createNewCardElement(this.dealNewCardlevel(1)))
    cardAreaZone1.appendChild(createNewCardElement(this.dealNewCardlevel(1)))
    //create new lvl2 cards
    cardAreaZone2.appendChild(createNewCardElement(this.dealNewCardlevel(2)))
    cardAreaZone2.appendChild(createNewCardElement(this.dealNewCardlevel(2)))
    cardAreaZone2.appendChild(createNewCardElement(this.dealNewCardlevel(2)))
    //create new lvl3 cards
    cardAreaZone3.appendChild(createNewCardElement(this.dealNewCardlevel(3)))
    cardAreaZone3.appendChild(createNewCardElement(this.dealNewCardlevel(3)))
    cardAreaZone3.appendChild(createNewCardElement(this.dealNewCardlevel(3)))
    //Draw noble tokens
    for(let i = 0; i <= this.playerCount; i++){
        createNobleCardAddToNobleZone(this.dealNewNobleCard())
    }
    //Initialize global tokens
    const startingResources = {
        "ResourceG": this.tokens.Green,
        "ResourceR": this.tokens.Red,
        "ResourceU": this.tokens.Blue,
        "ResourceB": this.tokens.Black,
        "ResourceW": this.tokens.White,
        "ResourceY": this.tokens.Yellow
    }

    updateResourceNumbers(startingResources)

    //Randomly choose starting player and then from there, set them to index0 in the players array.
    this.chooseStartingPlayer()
    console.log(this.currentPlayer)
    let playerThatIWant = this.players[this.currentPlayer].name;
    console.log(playerThatIWant)
    while(playerThatIWant == this.players[0].name){
        this.players.push(this.players.shift());
    }

    //initialize Player one.
        //  NOT DONE

    //skipping element 0 as that player will fill the current player field.
    for (let index = 1; index < this.players.length; index++) {
        console.log(this.players[index])
        let html = generateOtherPlayerDetails(this.players[index])
        otherPlayers.insertAdjacentHTML('beforeend',html)
    }
}
}

class Player {

    constructor(playerName, playerID) {
        this.name = playerName
        this.id = playerID
        this.reservedCards = []
        this.tokens = {
            Green: 0,
            Blue: 0,
            Red: 0,
            White: 0,
            Black: 0,
            Yellow: 0
        }
        this.cards = {
            Green: 0,
            Blue: 0,
            Red: 0,
            White: 0,
            Black: 0
        }
        this.victoryPoints = 0
        this.color = ''
    }
    /**
     * method used to check if the player needs to discard tokens
     * @returns boolean if player has > 10 tokens
     */
    hasTooManyTokens = () => {
        total = (this.tokens.Green + this.tokens.Blue + this.tokens.Red + 
                this.tokens.White + this.tokens.Black + this.tokens.Yellow)
        if (total > 10) {
            return true
        }
        return false
    }
    /**
     * Checks to see if the player can buy input card
     * @param {*} cardObject the card that you want to check if it can be bought
     * @returns boolean if player can buy the card
     */
    canBuyCard = (cardObject) => {
        // without the gold token (yellow)
        if (
            this.tokens.Black >= cardObject.black &&
            this.tokens.Blue >= cardObject.blue &&
            this.tokens.Green >= cardObject.green &&
            this.tokens.Red >= cardObject.red &&
            this.tokens.White >= cardObject.white
        ){ return true}
        //wDo we even check about for "yellow" logic?
        else if (this.tokens.Yellow > 0) {
            //have to check to see how many gold tokens we need.

            //init an array of all the tokens deficit
            let black = this.tokens.Black - cardObject.black 
            let blue = this.tokens.Blue - cardObject.blue 
            let green = this.tokens.Green - cardObject.green
            let red = this.tokens.Red - cardObject.red
            let white = this.tokens.White - cardObject.white
            let colorTotals = [black,blue,green,red,white]

            //add up how many gold coins that equates to
            let tokensReq = colorTotals.forEach(total => {
                let sum = 0;
                if (total < 0) {
                    sum = sum - total
                }
                return sum
            });

            //check to see if the ammount of yellow tokens the player has is enough
            if(this.tokens.Yellow >= sum){
                return true
            }
        }
        else{return false}
        
    }
    /**
     * method used to update the player object when it buys a card.
     * HAVE TO CALL `removeCard` AND `Game.dealNewCardlevel`!
     * @param {*} cardObject the card that player wants to buy.
     * @param {*} canBuyCard boolean used to make sure that we can actually buy the card!
     */
    buyCard = (cardObject,canBuyCard) => {

        //have error check, if canBuyCard flase, throw error, we shouldn't be here.
        if (!canBuyCard){
            throw new Error('You can not buy this card, why did this happen!?');
        }
        //do all the math before hand
        let black = this.tokens.Black - cardObject.black 
        let blue = this.tokens.Blue - cardObject.blue 
        let green = this.tokens.Green - cardObject.green
        let red = this.tokens.Red - cardObject.red
        let white = this.tokens.White - cardObject.white
        let colorTotals = [black,blue,green,red,white]

        //rather than trying to use yellow tokens to buy with, see how many we need total
        //because we already know we can buy the card.
        let yellowReq = colorTotals.forEach(total => {
            let sum = 0;
            if (total < 0) {
                sum = sum - total
            }
            return sum
        });

        //updates values of the players tokens,
        this.tokens.Black  = black < 0 ? 0 : black
        this.tokens.Blue = blue < 0 ? 0 : blue
        this.tokens.Green = green < 0 ? 0 : green
        this.tokens.Red = red < 0 ? 0 : red
        this.tokens.White = white < 0 ? 0 : white
        this.tokens.Yellow = this.tokens.Yellow - yellowReq

        // the color of the card aquired,
        this.cards[cardObject.color] += 1
        
        //and the pv.
        this.victoryPoints += cardObject.pv
    }
}
/* Thinking out sudo code logic

Player.actions
    Click Gold(pile)
        grey out UI on other tokens, dim everything but Card board
        clickCard ? canReserve : throw(ErrorYouCan't)
            Check player.reservedCards.length <= 3 ? 
            Add game.thecardinquestion to player.reservedcards : 
            prompt player that they can't do that, RE: give this.player.anotherAction
    Click Token
        check ammount of tokens in that set, redo listeners for just the coins available, grey out cards area.
        if sameToken Color has 4 tokens, clickSameToken available
            click it, subtract 2 from game.token[Color]. Add 2 to player.token[Color]
        clickDifToken
            regardless of sameToken, highlight OTHER colors.
            clickDDifToken
            RE above, this point two colors should be greyed out.
            click last color, subtract selected colors from game.token[Colors]. Add to player.token[colors]

Player.cleanup
    Check to see if they have more than 10 tokens, if so, prompt player to choose which tokens to discard.
         discard one token then RE: Player.cleanup
    Check to see if they have enough cards to gain any available nobles
    Check to see if they have initiated the END GAME
   

*/
// class cardObject {
//     constructor(color,pv,black,blue,green,red,white){
//         this.color= color,
//         this.pv   = pv,
//         this.black= black,
//         this.blue = blue,
//         this.green= green,
//         this.red  = red,
//         this.white= white
//     }
    
// };
//-------------------------------------Classes Above -----------------------------------------------

// console.log(level1Objects);
// console.log(level2Objects);
// console.log(level3Objects);
// console.log(nobleObjects);
const testPlayer1 = new Player(`William`,12345)
const testPlayer2 = new Player(`Callum`,23456)
const testPlayer3 = new Player(`Lily`,34657)
const testPlayer4 = new Player(`Sara`,45678)

const testGame = new Game(level1Objects,level2Objects, level3Objects, nobleObjects,
    testPlayer1,testPlayer2,testPlayer3,testPlayer4)

// console.log(testGame)
// console.log(Game);

testGame.initateGame(testGame,testPlayer1,testPlayer2,testPlayer3,testPlayer4)


//------------------------functions below----------------------------------------

/**
 * 
 * @param {*} player the player that needs to be added to OtherPlayers
 * @returns the html that contains that player's info to be appended to .OtherPlayers
 */
function generateOtherPlayerDetails(player) {
    let html = `<div id="player${player.id}">
        <span>${player.name}(${player.victoryPoints} VP)</span>
        <div>`;
    
    Object.entries(player.cards).forEach(([color, count]) => {
        html += `<div class="color${
            (color === `Blue`) ? 
            color.charAt(2).toUpperCase() : color.charAt(0).toUpperCase()
        }">${count}</div>`;
    });

    html += `<button class="reserved">${player.reservedCards.length}</button>`;
    
    Object.entries(player.tokens).forEach(([color, count]) => {
        if (color !== 'Yellow') {
            html += `<div class="color${
                (color === `Blue`) ? 
                color.charAt(2).toUpperCase() : color.charAt(0).toUpperCase()
            }">${count}</div>`;
        }
    });

    html += `<div class="colorY">${player.tokens.Yellow}</div>
        </div>
      </div>`;
    
    return html;
}


/**
 * Used in initateGame to add the noble cards to the board
 * @param {*} nobleInstance 
 */
function createNobleCardAddToNobleZone(nobleInstance) {
    // Create the main container for the noble card
    const nobleCardContainer = document.createElement('div');
    nobleCardContainer.classList.add('nobleCardContainer');

    // Map resource colors to their corresponding values in the noble instance
    const resourceColors = {
        'Black': nobleInstance.Black,
        'Blue': nobleInstance.Blue,
        'Green': nobleInstance.Green,
        'Red': nobleInstance.Red,
        'White': nobleInstance.White
    };

    // Iterate over each resource color and add elements if the requirement is greater than 0
    for (const color in resourceColors) {
        const requirement = resourceColors[color];
        if (requirement > 0) {
            const nobleRequire = document.createElement('div');
            nobleRequire.classList.add('nobleRequire', `color${
                (color === `Blue`) ? 
                color.charAt(2).toUpperCase() : color.charAt(0).toUpperCase()
            }`);
            nobleRequire.textContent = requirement;
            nobleCardContainer.appendChild(nobleRequire);
        }
    }

    // Append the noble card container to the div with ID NobleZone
    const nobleZone = document.getElementById('NobleZone');
    if (nobleZone) {
        nobleZone.appendChild(nobleCardContainer);
    } else {
        console.error('Element with ID NobleZone not found.');
    }
}

/**
 * format input such that:
 * const newNumbers = {
    "ResourceG": X,
    "ResourceR": X,
    "ResourceU": X,
    "ResourceB": X,
    "ResourceW": X,
    "ResourceY": X
    };
 * @param {*} newNumbers 
 */
function updateResourceNumbers(newNumbers) {
    // Iterate over each resource ID
    Object.keys(newNumbers).forEach(resourceId => {
        // Find the div element with the corresponding ID
        const resourceDiv = document.getElementById(resourceId);
        if (resourceDiv) {
            // Update the number inside the div
            resourceDiv.querySelector('div').textContent = newNumbers[resourceId];
        }
    });
}

/**
 * Used to create a new div to display using the cardObject
 * @param {*} cardObject 
 * @returns a DOM of the new div element
 */
function createNewCardElement(cardObject) {
    // Create a new div element
    let cardContainer = document.createElement("div");
    cardContainer.classList.add("cardContainer", colorToClass[cardObject.Color]);

    // Create and append victory point value element
    let victorypointValue = document.createElement("div");
    victorypointValue.classList.add("victorypointValue");
    victorypointValue.textContent = `${cardObject.PV}`;
    cardContainer.appendChild(victorypointValue);

    // Create and append cost of card element
    let costOfCard = document.createElement("div");
    costOfCard.classList.add("costOfCard");

    // Create and append cost elements
    for (let key in cardObject) {
        if (key !== "Color" && key !== "PV" && cardObject[key] !== 0) {
            let costElement = document.createElement("div");
            costElement.classList.add("costElement", colorToClass[key]);
            costElement.textContent = `${cardObject[key]}`;
            costOfCard.appendChild(costElement);
        }
      }
    // Put them all together
    cardContainer.appendChild(costOfCard);

    return cardContainer
}
/**
 * Shuffles an array using Fisher Yates Shuffle 
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {Array} array
 * @returns {Array} shuffled
 */
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

