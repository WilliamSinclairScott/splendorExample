/*
Thinking out sudo code logic

Player.actions
    click card ? buyCard : throw(ErrorYou'rePoor)
        if player.eachtokencolor >= game.thecardinquestioncost
            add card to player score & board
            remove card from game board and replace it
        else
            prompt player that they can't do that,
            RE: give this.player.anotherAction
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


*/
/**
 * 
 * Importing all my data from another file for ease on scaling later.
 * 
 * 
 */
import shipIt from "./csv";

class Game {
    /**
     * Each array is a deck of Deck Objects predefined in the database
     * @param {[Object]} oneDeck 
     * @param {[Object]} twoDeck 
     * @param {[Object]} threeDeck 
     * @param {[Object]} nobleDeck 
     */
    constructor(oneDeck, twoDeck, threeDeck, nobleDeck) {
        this.playerCount = 0;
        this.players = [];
        this.lvlOneDeck = shuffleArray(oneDeck)
        this.lvlTwoDeck = shuffleArray(twoDeck)
        this.lvlThreeDeck = shuffleArray(threeDeck)
        //noting that noblesRevealed === playerCount+1
        this.nobleDeck = nobleDeck
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
     * @param {number} numberOfPlayers 2,3,4
     */
    setPlayerCountInit = () => {

        if (this.numberOfPlayers === 2) {
            this.playerCount = numberOfPlayers;
            this.tokens = {
                Green: 4,
                Blue: 4,
                Red: 4,
                White: 4,
                Black: 4,
                Yellow: 5
            }
        }
        else if (this.numberOfPlayers === 3) {
            this.playerCount = numberOfPlayers;
            this.tokens = {
                Green: 5,
                Blue: 5,
                Red: 5,
                White: 5,
                Black: 5,
                Yellow: 5
            }
        }
        else if (this.numberOfPlayers === 4) {
            this.playerCount = numberOfPlayers;

        }
        else {
            throw new Error('Invalid Number of Players assigned!');
        }
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
            return this.lvlOneDeck.pop
        }else if(number === 2){
            return this.lvlTwoDeck.pop
        }else if(number === 3){
            return this.lvlThreeDeck.pop
        }
        else{
            throw new Error('Invalid level of card!');
        }
    }

}

class Player {

    constructor(playerName, playerID) {
        this.name = playerName
        this.id = playerID
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
const testGame = new Game(shipIt.level1Objects, shipIt.level2Objects, shipIt.level3Objects, shipIt.nobleObjects)
const testPlayer1 = new Player(William,12345)
const testPlayer2 = new Player(Callum,23456)
const testPlayer3 = new Player(Lily,34657)
const testPlayer4 = new Player(Sara,45678)




//------------------------functions below----------------------------------------
/**
 * Shuffles an array using Fisher Yates Shuffle 
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {Array} array 
 */
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}