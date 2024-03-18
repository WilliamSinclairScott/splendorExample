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
     * @returns nextCardObjectInArray
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
}
const testGame = new Game(shipIt.level1Objects, shipIt.level2Objects, shipIt.level3Objects, shipIt.nobleObjects)




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