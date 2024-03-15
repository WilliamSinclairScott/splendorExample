/*
Thinking out sudo code logic
gameState ()
Init(playerCount){
    lvl1Deck.shuffle()
    lvl2Deck.shuffle()
    lvl3Deck.shuffle()
    nobleDeck.shuffle()
    setBoardSzie(playerCount){
        if 2{
            tokens.foreach((color)=>remove 3 tokens)
            boardState.nobles = 3
        }
        else if 3{
            tokens.foreach((color)=>remove 2 tokens)
            boardState.nobles = 4
        }
        else if 4{
            boardState.nobles = 5
        }
        else if 4{
            boardState.nobles = 4
        }
    }
}

Player.actions
    click card ? buyCard : throw(ErrorYou'rePoor)
    Click Gold(pile)
        clickCard ? canReserve : throw(ErrorYouCan't)
    Click Token
        clickSameToken
        clickDifToken
        clickDDifToken

Player.cleanup
*/

class gameState {
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
        this.lvlOneDeck = oneDeck
        this.lvlTwoDeck = twoDeck
        this.lvlThreeDeck = threeDeck
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
     * @param {number} numberOfPlayers 
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
     * Adds a player to the gameState
     * @param {Player} playerObject 
     */
    addPlayer = (playerObject) => {
        this.players.push(playerObject)
        this.playerCount += 1
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
const testGame = new gameState([], [], [], [])




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