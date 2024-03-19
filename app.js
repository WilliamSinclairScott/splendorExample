/**
 * 
 * Importing all my data from another file for ease on scaling later.
 * 
 */
import { level1Objects, level2Objects, level3Objects, nobleObjects } from './csv.js';


// Global Variables
const colorToClass = {
    Green : 'colorG',
    Blue  : 'colorU',
    Red   : 'colorR',
    White : 'colorW',
    Black : 'colorB'
}
const classToColor = {
    ResourceG : `Green`,
    ResourceU : `Blue`,
    ResourceR : `Red`,
    ResourceW : `White`,
    ResourceB : `Black`
}

const cardAreaZone3 = document.getElementById('Level3Zone')
const cardAreaZone2 = document.getElementById('Level2Zone')
const cardAreaZone1 = document.getElementById('Level1Zone')
const otherPlayers = document.getElementById('OtherPlayers')
const nobleArea = document.getElementById('NobleZone')
const currentPlayerArea = document.getElementById('CurrentPlayer')
const logArea = document.getElementById('LogBox')
const globalResourcePool = {
    'Green': document.getElementById('ResourceG'),
    'Red': document.getElementById('ResourceR'),
    'Blue': document.getElementById('ResourceU'),
    'Black': document.getElementById('ResourceB'),
    'White': document.getElementById('ResourceW'),
    'Yellow': document.getElementById('ResourceY')
};
let actionCounter = 0

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
        this.cardsOutOnTable = [[],[],[],[]] //where 0 = is noble cards and 1-3 are lvls for the cards.
    }
    /**
     * Initializes available tokens for the game based on the number of players
     *  Sets number of players eleement
     */
    setPlayerCountInit = () => {

        if (this.players.length == 2) {
            this.playerCount = this.players.length;
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

    goToNextPlayer = () => {
        this.players.push(this.players.shift());
        //clear otherPlayers Area
        removeAllChildren(otherPlayers)
        //clear out currPlayer
        removeAllChildren(currentPlayerArea)
        //initialize Player one.
        let player1Details = generatePlayerDetails(this.players[0])
        otherPlayers.insertAdjacentHTML('beforeend',player1Details.nameTag)
        currentPlayerArea.appendChild(player1Details.resources)
        //skipping element 0 as that player will fill the current player field.
        for (let index = 1; index < this.players.length; index++) {
            // console.log(this.players[index])
            let html = generateOtherPlayerDetails(this.players[index])
            otherPlayers.insertAdjacentHTML('beforeend',html)
        }

        //!resetlisteners if you need to 

        let p = `It is ${this.players[0].name}'s turn.`
        logToScreen(p)

    }
    /**
     * @param {number} number 1,2,3
     * @returns nextCardObject In Array
     */
    dealNewCardlevel = (number) => {
        if(number === 1){
            let card = this.lvlOneDeck.pop()
            this.cardsOutOnTable[number].push(card)
            return card
        }else if(number === 2){
            let card = this.lvlTwoDeck.pop()
            this.cardsOutOnTable[number].push(card)
            return card
        }else if(number === 3){
            let card = this.lvlThreeDeck.pop()
            this.cardsOutOnTable[number].push(card)
            return card
        }
        else{
            throw new Error('Invalid level of card!');
        }
    }
    dealNewNobleCard = () => {
        let card = this.nobleDeck.pop()
        this.cardsOutOnTable[0].push(card)
        return card
    }
    
    /**
     * Creates the "Buy card" Logic listener at each card. Recursive nature reassigns listener to new object when made
     * @param {*} areaInQuestion 
     * !NEED TO ADD NOBLE CHECK LOGIC
     */
    createClickListenersForResourceCards = () => {  
        let areaInQuestion;     
        for (let k = 1; k < 4; k++) {
            // Determine areaInQuestion based on 'loop'
            if (3 === k) areaInQuestion = cardAreaZone3;
            else if (2 === k) areaInQuestion = cardAreaZone2;
            else if (1 === k) areaInQuestion = cardAreaZone1;
            
            const children = areaInQuestion.children;
            
            
                
            // Create a recursive event listener function
            const recursiveAddEventListener = () => {
                return () => { 
                    // Returning a function to be used as an event listener
                    // Always check if the card is available for purchase
                    if (this.queryPlayerToBuy(this.cardsOutOnTable[k][2])) {
                        // Remove the clicked card
                        areaInQuestion.removeChild(this);
                        // Remove the card from the 'this.cardsOutOnTable' array
                        this.cardsOutOnTable[k].splice(2, 1); // Assuming you always remove the last card
                        console.log(`Removed card`);
                        
                        // Replace the removed card with a new one and append a new event listener
                        areaInQuestion.appendChild(createNewCardElement(this.dealNewCardlevel(k)));
                        const newCard = areaInQuestion.lastElementChild; // Get the newly added card
                        newCard.addEventListener('click', recursiveAddEventListener()); // Add event listener to the new card
                        
                        // !Check Noble conditions or proceed to the next player
                        this.goToNextPlayer();
                    }
                };
            };
        
            // Add event listeners to all children
            //!make sure that other functions that remove listeners and add listeners also have the hasEventListener prop
            for (let i = 0; i < children.length; i++) {
                if (!children[i].hasEventListener) {
                    children[i].addEventListener('click', recursiveAddEventListener());
                    children[i].hasEventListener = true;
                }
            }
        }
    }
    /**
     * disables all resource Card listeners
     */
    disableClickListenersForResourceCards = () => {
        let areaInQuestion;
        for (let k = 1; k < 4; k++) {
            // Determine areaInQuestion based on 'loop'
            if (3 === k) areaInQuestion = cardAreaZone3;
            else if (2 === k) areaInQuestion = cardAreaZone2;
            else if (1 === k) areaInQuestion = cardAreaZone1;
    
            const children = areaInQuestion.children;
            
            // Loop through each child and disable click event listeners
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                child.classList.add('disabled'); // Add the 'disable' class
            }
        }
    }
    /**
     * reEnables all resource Card listeners
     */
    enableClickListenersForResourceCards = () => {
        let areaInQuestion;
        for (let k = 1; k < 4; k++) {
            // Determine areaInQuestion based on 'loop'
            if (3 === k) areaInQuestion = cardAreaZone3;
            else if (2 === k) areaInQuestion = cardAreaZone2;
            else if (1 === k) areaInQuestion = cardAreaZone1;
    
            const children = areaInQuestion.children;
            
            // Loop through each child and disable click event listeners
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                child.classList.remove('disabled'); // removes the 'disable' class
            }
        }
    }
    //
    //!THIS IS WHERE YOU LEFT OFF
    //
    //!YOU NEED TO MAKE THIS LOGIC WORK CORRECTLY. SEE GPT FOR WHERE YOU WERE
    //
    //
    createClickListenersForGlobalResources = () => {
        const resources = document.querySelectorAll('.Resources > div');
        let lasterClickedResource = null;
        let lastClickedResource = null;

        resources.forEach(resource => {
            if(!(resource.id === 'ResourceY')){
                resource.addEventListener('click', () => {
                    //disable the cards
                    this.disableClickListenersForResourceCards()
                    let hateY = document.getElementById('ResourceY')
                    hateY.classList.add('disabled')
                    

                    const color = resource.id
                    const childDiv = resource.querySelector('div')
                    const count = parseInt(childDiv.textContent)

                    
                    if ((lastClickedResource !== color) && (count !== 0)) { //first time
                        // Subtract 1 from the clicked resource's count add it to the resources 
                        // and the current player's tokens
                        childDiv.textContent = count - 1
                        //!Check to see if any of the tokens are too low to take from and disable them
                        this.players[0].tokens[classToColor[color]] += 1

                        // Check if the resource can be clicked again
                        if(lastClickedResource === null)lastClickedResource = resource.id //first time
                        else if(lasterClickedResource !== null){//third time alt END
                            //remove disables
                            //!Check to see if any of the tokens are high to take from and ENABLE them
                            let otherOne = document.getElementById(lastClickedResource)
                            let otherOtherOne = document.getElementById(lasterClickedResource)
                            let hateY = document.getElementById('ResourceY')
                            otherOne.classList.remove('disabled')
                            otherOtherOne.classList.remove('disabled')
                            hateY.classList.remove('disabled')
                            resource.classList.remove('disabled')

                            logToScreen(`${this.players[0].name} picked up 1 ${classToColor[color]} token, 1 ${classToColor[lastClickedResource]} token, and 1${classToColor[lasterClickedResource]} token.`)
                            lastClickedResource = null
                            lasterClickedResource = null
                            this.goToNextPlayer()
                            this.enableClickListenersForResourceCards()
                        }
                        else if(lastClickedResource !== null){ //second time
                            let otherOne = document.getElementById(lastClickedResource)
                            resource.classList.add('disabled')
                            otherOne.classList.add('disabled')
                            lasterClickedResource = color
                        }
                    }
                    else if (lastClickedResource === color){ //second time alt END
                        childDiv.textContent = count - 1
                        this.players[0].tokens[classToColor[color]]+= 1
                        //reset Logic
                        //!Check to see if any of the tokens are high to take from and ENABLE them
                        let hateY = document.getElementById('ResourceY')
                        hateY.classList.remove('disabled')
                        resource.classList.remove('disabled')
                        this.enableClickListenersForResourceCards()

                        logToScreen(`${this.players[0].name} picked up 2 ${classToColor[color]} tokens`)
                        lastClickedResource = null;
                        this.goToNextPlayer()
                        
                    }
                });
        }
        });
    }
    /**
     * Asks if player1 (current player) can buy the input card
     * @param {*} cardInQuestion 
     * @param {*} locationOfCard 
     * @returns Bool of if player1 can or cannot buy input card
     * !BUG REPORTED: HAVE ENOUGH AND CANNOT BUY!
     */
    queryPlayerToBuy = (cardInQuestion) => {
        let canI = this.players[0].canBuyCard(cardInQuestion)
        if (canI) {
            this.players[0].buyCard(cardInQuestion,canI)
            return true
        }

        else {
            console.log(this.players[0].tokens)
            let noGo = `You can not buy that card at this time! It is still ${this.players[0].name}'s turn`
            logToScreen(noGo)
            return false
        }
    }
    /**
     * Initializes the gamestate
     * !NEEDS WORK
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
        for(let i = 0; i <= this.players.length; i++){
            createNobleCardAddToNobleZone(this.dealNewNobleCard())
        }
        let p = `Cards are placed!`
        logToScreen(p)
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
        this.chooseStartingPlayer();

        // Determine the number of rotations needed to bring the starting player to index 0
        const rotations = this.currentPlayer;
        
        // Rotate the array
        for (let i = 0; i < rotations; i++) {
            this.players.push(this.players.shift());
        }
        p = `Player ${this.players[0].name} is going first!`
        logToScreen(p)

        //initialize Player one.
        let player1Details = generatePlayerDetails(this.players[0])
        otherPlayers.insertAdjacentHTML('beforeend',player1Details.nameTag)
        currentPlayerArea.appendChild(player1Details.resources)
        //skipping element 0 as that player will fill the current player field.
        for (let index = 1; index < this.players.length; index++) {
            // console.log(this.players[index])
            let html = generateOtherPlayerDetails(this.players[index])
            otherPlayers.insertAdjacentHTML('beforeend',html)
        }

        //create listeners for the cards. 
        this.createClickListenersForResourceCards()
        this.createClickListenersForGlobalResources()
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
        //reduce cost using cards the player has first to 0 or the difference.
        let black = cardObject.Black  < this.cards.Black ? 0 : cardObject.Black  - this.cards.Black
        let blue  = cardObject.Blue  < this.cards.Blue  ? 0 : cardObject.Blue  - this.cards.Blue 
        let green = cardObject.Green < this.cards.Green ? 0 : cardObject.Green - this.cards.Green
        let red   = cardObject.Red < this.cards.Red   ? 0 : cardObject.Red - this.cards.Red  
        let white = cardObject.White < this.cards.White ? 0 : cardObject.White - this.cards.White
        // without the gold token (yellow)
        if (
            this.tokens.Black >= black &&
            this.tokens.Blue >=  blue  &&
            this.tokens.Green >= green &&
            this.tokens.Red >=   red   &&
            this.tokens.White >= white
        ){ return true}
        //Do we even check about for "yellow" logic?
        else if (this.tokens.Yellow > 0) {
            //have to check to see how many gold tokens we need.

            //init an array of all the tokens deficit
            black = this.tokens.Black - black
            blue = this.tokens.Blue   - blue 
            green = this.tokens.Green - green
            red = this.tokens.Red     - red  
            white = this.tokens.White - white
            let colorTotals = [black,blue,green,red,white]

            //add up how many gold coins that equates to (x -- y = x + y)
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
        return false //catchall
    }
    /**
     * method used to update the player object when it buys a card.
     * HAVE TO CALL `removeCard` AND `Game.dealNewCardlevel`!
     * !I need to make it so that the tokens removed from the player return to the pool of global
     * @param {*} cardObject the card that player wants to buy.
     * @param {*} canBuyCard boolean used to make sure that we can actually buy the card!
     */
    buyCard = (cardObject,canBuyCard) => {

        //have error check, if canBuyCard flase, throw error, we shouldn't be here.
        if (!canBuyCard){
            throw new Error('You can not buy this card, why did this happen!?');
        }


        //do all the math before hand

        //reduce cost using cards the player has first to 0 or the difference.
        let black = cardObject.Black  < this.cards.Black ? 0 : cardObject.Black  - this.cards.Black
        let blue  = cardObject.Blue  < this.cards.Blue  ? 0 : cardObject.Blue  - this.cards.Blue 
        let green = cardObject.Green < this.cards.Green ? 0 : cardObject.Green - this.cards.Green
        let red   = cardObject.Red < this.cards.Red   ? 0 : cardObject.Red - this.cards.Red  
        let white = cardObject.White < this.cards.White ? 0 : cardObject.White - this.cards.White

        //Figure out how much we can buy without yellow
        black = this.tokens.Black - black
        blue = this.tokens.Blue   - blue 
        green = this.tokens.Green - green
        red = this.tokens.Red     - red  
        white = this.tokens.White - white
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
        this.victoryPoints += cardObject.PV
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

/* --------------------------------------Actual Code Begins ------------------------------------------------------- */

const testPlayer1 = new Player(`William`,12345)
const testPlayer2 = new Player(`Lily`,23456)
// const testPlayer3 = new Player(`Callum`,34657)
// const testPlayer4 = new Player(`Sara`,45678)
//  ,testPlayer3,testPlayer4

const testGame = new Game(level1Objects,level2Objects, level3Objects, nobleObjects,
    testPlayer1,testPlayer2)

testGame.initateGame()

//------------------------functions below----------------------------------------

function removeAllChildren(parent) {
    if (parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    } else {
        console.error(`Parent element not found`);
    }
}
/**
 * Used in other functions and methods to log the details to the logbox area
 * should always make dynamic text as a variable before calling function.
 * @param {*} pHTML already made p HTML
 */
function logToScreen(pHTML){
    logArea.insertAdjacentHTML('beforeend', `<p>${pHTML} (${actionCounter++})</p>`)
    logArea.scrollTop = logArea.scrollHeight;
}
/**
 * reminder if there is a problem with tokens and card count.
 * Also Might add reserved cards and VP logic here
 * @param {*} player player 1 details
 * @returns object containing the nametag used in the OtherPlayer area, and the div for the Player Area resources
 * 
 */
function generatePlayerDetails(player) {
    //make tag for player 1
    let nameTag = `<span id="player${player.id}">${player.name}(${player.victoryPoints} VP)</span>`
    // Create the div element for player resources
    const playerResourcesDiv = document.createElement('div');
    playerResourcesDiv.className = 'PlayerResources';

    // Define resource types and their corresponding colors
    const resourceColors = {
        'Green': 'colorG',
        'Blue': 'colorU',
        'Red': 'colorR',
        'Black': 'colorB',
        'White': 'colorW',
    };

    // Loop through each resource type and create the corresponding divs
    for (let resourceType in player.tokens) {
        if (player.tokens.hasOwnProperty(resourceType) && resourceType !== 'Yellow') {
            const resourceTypeDiv = document.createElement('div');
            resourceTypeDiv.className = `PlayerR${resourceType}`;

            for (let i = 0; i < 2; i++) {
                const colorDiv = document.createElement('div');
                //console.log(player.tokens[resourceType])
                colorDiv.className = resourceColors[resourceType];
                //reminder if there is a problem with tokens and card count. 
                colorDiv.textContent = i ? player.tokens[resourceType] : player.cards[resourceType];
                resourceTypeDiv.appendChild(colorDiv);
            }

            playerResourcesDiv.appendChild(resourceTypeDiv);
        }
    }

    // Create a special div for Yellow resource type
    const yellowResourceDiv = document.createElement('div');
    yellowResourceDiv.className = 'PlayerRY';
    const yellowColorDiv = document.createElement('div');
    yellowColorDiv.id = 'currplayerYnum';
    yellowColorDiv.className = 'colorY';
    yellowColorDiv.textContent = player.tokens.Yellow; // Fill in actual Yellow resource count
    yellowResourceDiv.appendChild(yellowColorDiv);
    playerResourcesDiv.appendChild(yellowResourceDiv);

    return {nameTag : nameTag, resources : playerResourcesDiv };
}
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

