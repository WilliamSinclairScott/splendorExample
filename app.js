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
    ResourceB : `Black`,
    ResourceY : `Yellow`
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
        this.gameEndsIn = 100
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
    /**
     *
     *
     */
    goToNextPlayer = () => {
        //Check for conditions before moving to next player

        //TooManyTokens
        console.log(`start:`,new Date().getMilliseconds())
        if((this.players[0].hasTooManyTokens)){
            logToScreen(`${this.players[0].name} has too many tokens! Select a token to be taken away!`)
            this.players[0].waitForInput()
            // while(this.players[0].hasTooManyTokens){
            // setTimeout(() => {console.log(`freezeframe`)},20000)
            // }
            
        }
        console.log(`end: `, new Date().getMilliseconds())
        //Nobles
        this.checkForNobles()

        ////console.log(this.gameEndsIn)
        if (this.gameEndsIn === 100) {
            ////console.log(`Check if game is going to end`, this.players[0].victoryPoints)
            if(this.players[0].victoryPoints >= 15){
                //countDownInitiated to end so that everyone else get one extra turn
                this.gameEndsIn = this.players.length-2
                if (this.gameEndsIn !== 0){logToScreen(`the Game will end in ${this.gameEndsIn} turns.`)}
            }
        }
        else if (this.gameEndsIn > 0 ){
            this.gameEndsIn -= 1
            if (this.gameEndsIn !== 0){logToScreen(`the Game will end in ${this.gameEndsIn} turns.`)}
            
        }
        else if (this.gameEndsIn === 0){
            //!End the Game

            //disable all click events
            this.disableClickListenersForResourceCards()
            for(let color in globalResourcePool){
                globalResourcePool[color].classList.add('disabled')
            }
            let kidArea = currentPlayerArea.children;
            kidArea = kidArea[1].children;
            for (let i = 0; i < kidArea.length; i++) {
                kidArea[i].classList.add('disabled');
            }

            //figure out who won
            let winner = this.players[this.players.length-1]
            this.players.forEach(player => {
                winner.victoryPoints < player.victoryPoints ? winner = player : winner = winner
            })
            logToScreen(`Congratulations ${winner.name}, you won!`)
        }
        
        console.log(`TooFar: `, new Date().getMilliseconds())
        this.players.push(this.players.shift());
        //clear otherPlayers Area
        removeAllChildren(otherPlayers)
        //clear out currPlayer
        removeAllChildren(currentPlayerArea)
        //initialize Player one.
        let player1Details = generatePlayerDetails(this.players[0])
        otherPlayers.insertAdjacentHTML('beforeend',player1Details.nameTag)
        currentPlayerArea.appendChild(player1Details.resources)
        currentPlayerArea.appendChild(player1Details.resources)
        currentPlayerArea.appendChild(player1Details.reserved)
        this.players[0].reservedCards.forEach(reservedCard => {
            const reservedArea = document.getElementById(`ReservedCards`)
            reservedArea.appendChild(createNewCardElement(reservedCard))
        });
        //skipping element 0 as that player will fill the current player field.
        for (let index = 1; index < this.players.length; index++) {
            let html = generateOtherPlayerDetails(this.players[index])
            otherPlayers.insertAdjacentHTML('beforeend',html)
        }

        //resetlisteners if you need to 
        this.createClickListenersForResourceCards()
        this.createClickListenersForReservedCardsandButtons()
        let p = this.gameEndsIn === 0 
        ? `This is the Last Turn ${this.players[0].name}!` 
        : `It is ${this.players[0].name}'s turn.`
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
     * 
     */
    createClickListenersForResourceCards = () => {  
        for (let k = 1; k < 4; k++) {
            let areaInQuestion;
            // Determine areaInQuestion based on 'loop'
            if (3 === k) areaInQuestion = cardAreaZone3;
            else if (2 === k) areaInQuestion = cardAreaZone2;
            else if (1 === k) areaInQuestion = cardAreaZone1;
            
            const children = areaInQuestion.children;
            
            // Create a recursive event listener function with proper scoping
            const recursiveAddEventListener = () => {
                return (event) => {
                    const clickedElement = event.currentTarget;
                    const dynamicIndex = Array.from(clickedElement.parentElement.children).indexOf(clickedElement);
                    // dynamicIndex is the index of clickedElement relative to its parent
                    let answer = this.players[0].queryPlayerToBuy(this.cardsOutOnTable[k][dynamicIndex])
                    if (answer.didWe) {
                        //repenishTokens
                        console.log("Pay it back",answer.tokensUsed)
                        updateResourceNumbers(answer.tokensUsed)
                        // Remove the clicked card
                        areaInQuestion.removeChild(clickedElement);
                        // Remove the card from the 'this.cardsOutOnTable' array
                        this.cardsOutOnTable[k].splice(dynamicIndex, 1);
                        
                        // Replace the removed card with a new one and append a new event listener
                        areaInQuestion.appendChild(createNewCardElement(this.dealNewCardlevel(k)));
                        const newCard = areaInQuestion.lastElementChild; // Get the newly added card
                        // Add event listener to the new card
                        newCard.addEventListener('click', recursiveAddEventListener());
                        
                        this.goToNextPlayer();
                    }
                };
            };
            
    
            // Add event listeners to all children
            for (let i = 0; i < children.length; i++) {
                if (!children[i].hasEventListener) {
                    children[i].addEventListener('click', recursiveAddEventListener());
                    children[i].hasEventListener = true;
                }
            }
        }
    }
    /**
     *
     */
    createClickListenersForReservedCardsandButtons = () => {
        let areaInQuestion = currentPlayerArea
        let children = areaInQuestion.children;
        children = children[1].children
        // Add event listeners to all children
        for (let i = 0; i < children.length; i++) {
            console.log(`there are ${this.players[0].reservedCards.length} reserved cards`)
            if (!children[i].hasEventListener) {
                children[i].addEventListener('click', (event) =>{
                    const clickedElement = event.currentTarget;
                    let index = i;
                    //try buy the reserved card
                    let answer = this.players[0].queryPlayerToBuy(this.players[0].reservedCards[index])
                    if (answer.didWe) {
                        //repenishTokens
                        updateResourceNumbers(answer.tokensUsed)
                        // Remove the clicked card
                        areaInQuestion.removeChild(clickedElement);
                        // Remove the card from that player's reserved array
                        this.players[0].reservedCards.splice(index, 1);
                        this.goToNextPlayer();
                    }
                });
                children[i].hasEventListener = true;
            }
        }
    }
    /**
     * 
     */
    createClickListenersForGlobalResources = () => {
        const resources = document.querySelectorAll('.Resources > div');
        let lasterClickedResource = null;
        let lastClickedResource = null;
    
        resources.forEach(resource => {
            if (!(resource.id === 'ResourceY')) {
                resource.addEventListener('click', () => {
                    // Disable the cards
                    this.disableClickListenersForResourceCards();
                    let hateY = document.getElementById('ResourceY');
                    hateY.classList.add('disabled');
    
                    const color = resource.id;
                    const childDiv = resource.querySelector('div');
                    const count = parseInt(childDiv.textContent);
    
                    if ((lastClickedResource !== color) && (count !== 0)) { //first time
                        // Subtract 1 from the clicked resource's count add it to the resources 
                        // of the current player's tokens
                        childDiv.textContent = count - 1;
                        //Check to see if any of the tokens are too low to take from and disable them
                        for (let color in globalResourcePool) {
                            if (parseInt(globalResourcePool[color].querySelector('div').textContent) === 0) {
                                globalResourcePool[color].classList.add('disabled');
                            }
                        }
                        this.players[0].tokens[classToColor[color]] += 1;
    
                        // Check if the resource can be clicked again
                        if (lastClickedResource === null) lastClickedResource = resource.id; //first time
                        else if (lasterClickedResource !== null) { //third time alt END
                            //remove disables
                            let otherOne = document.getElementById(lastClickedResource);
                            let otherOtherOne = document.getElementById(lasterClickedResource);
                            let hateY = document.getElementById('ResourceY');
                            otherOne.classList.remove('disabled');
                            otherOtherOne.classList.remove('disabled');
                            hateY.classList.remove('disabled');
                            resource.classList.remove('disabled');
    
                            logToScreen(`${this.players[0].name} picked up 1 ${classToColor[color]} token, 1 ${classToColor[lastClickedResource]} token, and 1${classToColor[lasterClickedResource]} token.`);
                            lastClickedResource = null;
                            lasterClickedResource = null;
                            this.goToNextPlayer();
                            this.enableClickListenersForResourceCards();
                        } else if (lastClickedResource !== null) { //second time
                            let otherOne = document.getElementById(lastClickedResource);
                            resource.classList.add('disabled');
                            otherOne.classList.add('disabled');
                            lasterClickedResource = color;
                        }
                    } else if (lastClickedResource === color) { //second time alt END
                        childDiv.textContent = count - 1;
                        this.players[0].tokens[classToColor[color]] += 1;
                        //reset Logic
                        let hateY = document.getElementById('ResourceY');
                        hateY.classList.remove('disabled');
                        resource.classList.remove('disabled');
                        this.enableClickListenersForResourceCards();
    
                        logToScreen(`${this.players[0].name} picked up 2 ${classToColor[color]} tokens`);
                        lastClickedResource = null;
                        this.goToNextPlayer();
    
                    }
                    //must check first time at the end if that last resource is too small for the double click
                    if (lastClickedResource !== null) {
                        let prev = document.getElementById(lastClickedResource);
                        const childDiv = resource.querySelector('div');
                        const numberIn = parseInt(childDiv.textContent);
                        if (numberIn < 3) prev.classList.add('disabled');
                    }
                    
                    // Check if all resources are disabled or have count 0 and go to the next player
                    let allResourcesDisabled = true;
                    resources.forEach(resource => {
                        if (!resource.classList.contains('disabled') && parseInt(resource.querySelector('div').textContent) > 0) {
                            allResourcesDisabled = false;
                        }
                    });
                    if (allResourcesDisabled) {//Sad ending
                        logToScreen(`${this.players[0].name} took what they could and only ended up with 1 ${classToColor[color]} ${lastClickedResource !== null ? (`and 1 `+classToColor[lastClickedResource]+`.`) : `.`}`)
                        //reEnable all other resources
                        for(let color in globalResourcePool){
                            globalResourcePool[color].classList.remove('disabled')
                        }
                        this.enableClickListenersForResourceCards();
                        this.goToNextPlayer();
                    }
                });
            }
        });
    }
    /**
     * 
     */
    createClickLisnersForYellowAndReservations = () => {
        //everything starts when Yellow Resource get's clicked
        let resourceY = document.getElementById('ResourceY')
        resourceY.addEventListener('click', () => {
            if (!(this.players[0].reservedCards.length >= 3)){
                const childDiv = resourceY.querySelector('div')
                const count = parseInt(childDiv.textContent)
                //Add the gold to the player if there are any left
                if (count !== 0){
                    this.players[0].tokens[`Yellow`] += 1
                    childDiv.textContent = count - 1
                }
                // Remove all event listeners from the element
                function removeAllEventListeners(parentElement){
                    const children = parentElement.children;
                    Array.from(children).forEach(element => {
                        
                        const clonedElement = element.cloneNode(true);
                        element.parentNode.replaceChild(clonedElement, element);
                    });
                }
                removeAllEventListeners(cardAreaZone1)
                removeAllEventListeners(cardAreaZone2)
                removeAllEventListeners(cardAreaZone3)

                //and disable all the other resources
                for(let color in globalResourcePool){
                    globalResourcePool[color].classList.add('disabled')
                }
                //and disable all reserved cards
                //Note: Don't have to reEnable because we just delete these each time!
                let kidArea = currentPlayerArea.children;
                kidArea = kidArea[1].children;
                for (let i = 0; i < kidArea.length; i++) {
                    kidArea[i].classList.add('disabled');
                }

                
                //Add a reservation listener to each card available.
                for (let k = 1; k < 4; k++) {
                    let areaInQuestion;
                    // Determine areaInQuestion based on 'loop'
                    if (3 === k) areaInQuestion = cardAreaZone3;
                    else if (2 === k) areaInQuestion = cardAreaZone2;
                    else if (1 === k) areaInQuestion = cardAreaZone1;
                    
                    const children = areaInQuestion.children;
                    console.log()
                    // Add event listeners to all children
                    for (let i = 0; i < children.length; i++) {
                        if (!children[i].hasEventListener) {
                            children[i].addEventListener('click', (event) =>{
                                const clickedElement = event.currentTarget;
                                let index = i;
                                //const dynamicIndex = Array.from(clickedElement.parentElement.children).indexOf(clickedElement);
                                //reserve the card
                                ////console.log("462 Here I am reserving: ",this.cardsOutOnTable[k][index])
                                this.players[0].reserveCard(this.cardsOutOnTable[k][index])
                                ////console.log(this.players[0].reservedCards)
                                // Remove the clicked card
                                areaInQuestion.removeChild(clickedElement);
                                // Remove the card from the 'this.cardsOutOnTable' array
                                this.cardsOutOnTable[k].splice(index, 1);
                                // Replace the removed card with a new one and append a new event listener
                                areaInQuestion.appendChild(createNewCardElement(this.dealNewCardlevel(k)));
                                //Remove all of the Reservation Listeners
                                removeAllEventListeners(cardAreaZone1)
                                removeAllEventListeners(cardAreaZone2)
                                removeAllEventListeners(cardAreaZone3)
                                //Add the normal buy card listeners
                                this.createClickListenersForResourceCards()
                                //reEnable all other resources
                                for(let color in globalResourcePool){
                                    globalResourcePool[color].classList.remove('disabled')
                                }
                                logToScreen((count === 0) ? `${this.players[0].name} just reserved a card` : `${this.players[0].name} took a gold and reserved a card`)
                                this.goToNextPlayer();
                            });
                            children[i].hasEventListener = true;
                        }
                    }
                }
            }
            else if(count !== 0){
                const childDiv = resourceY.querySelector('div')
                const count = parseInt(childDiv.textContent)
                this.players[0].tokens[`Yellow`] += 1
                childDiv.textContent = count - 1
                logToScreen(`${this.players[0].name} took a gold but could not reserve a card`)
                this.goToNextPlayer();
            }
        })
    }
    /**
     *  checkes to see if current player gains any nobles
     *  Known error when multiple noble tokens are taken at the same, the middle one doesn't seem to be taken
     */
    checkForNobles() {
        this.cardsOutOnTable[0].forEach((noble, index) => {
            if (this.players[0].shouldHaveNoble(noble)) {
                // Player should have the noble, implement take it logic
                //// console.log(`Take it`)
                //// console.log(`PV: `,this.players[0].victoryPoints, noble.PV)
                this.players[0].victoryPoints += noble.PV;
                ////console.log(`PV: `,this.players[0].victoryPoints, noble.PV)
                // Remove noble element from cardsOutOnTable
                this.cardsOutOnTable[0].splice(index, 1);
                //Remove noble element from HTML
                nobleArea.children[index].remove()
                //reset index as we just got rid of one
                index -= 1
                ////console.log(`Nobles on Board after: `, this.cardsOutOnTable[0])
                
            }
            ////console.log(`Dont Take`)
        });
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
        for(let i = 0; i <= this.players.length; i++){
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
        this.chooseStartingPlayer();

        // Determine the number of rotations needed to bring the starting player to index 0
        const rotations = this.currentPlayer;
        
        // Rotate the array
        for (let i = 0; i < rotations; i++) {
            this.players.push(this.players.shift());
        }
        let p = `${this.players[0].name} is going first!`
        logToScreen(p)

        //initialize Player one.
        let player1Details = generatePlayerDetails(this.players[0])
        otherPlayers.insertAdjacentHTML('beforeend',player1Details.nameTag)
        currentPlayerArea.appendChild(player1Details.resources)
        currentPlayerArea.appendChild(player1Details.reserved)
        this.players[0].reservedCards.forEach(reservedCard => {
            const reservedArea = document.getElementById(`ReservedCards`)
            reservedArea.appendChild(reservedCard)
        });
        //skipping element 0 as that player will fill the current player field.
        for (let index = 1; index < this.players.length; index++) {
            let html = generateOtherPlayerDetails(this.players[index])
            otherPlayers.insertAdjacentHTML('beforeend',html)
        }

        //create listeners for the cards. 
        this.createClickListenersForResourceCards()
        this.createClickListenersForGlobalResources()
        this.createClickLisnersForYellowAndReservations()
        //noting never need to reserve cards at init
        this.createClickListenersForReservedCardsandButtons()
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
     * 
     */
    async waitForInput() {
        console.log(`waiting...`)
        console.log(new Date().getMilliseconds())
        const result = await this.waitForTokenSlection()
        try{
            
            console.log(result)
            console.log(`Done. Moving on`)
        }
        catch(error){
            console.error(`An error occurred: `, error)
            console.error('Reason for rejection:', error.message); // Access the error message
            console.error('Additional information:', error.data); // Access any additional data provided
        }
        console.log(`Done waiting`)
    }
    /**
     * 
     * @returns a promise for the button
     */
    waitForTokenSlection() {
        console.log(`freezeframe: `,new Date().getMilliseconds())
        setTimeout(() => {console.log(`freezeframe`)},2000)
        return new Promise((resolve, reject) => {
            // console.log(`Looking for children to brand`);
            const playerResourcesDiv = currentPlayerArea.querySelector('.PlayerResources');
            // console.log(playerResourcesDiv)
            if (playerResourcesDiv) {
                const children = playerResourcesDiv.children;
                // console.log(children)
                if (Array.from(children).length > 0) {
                    //technically need to go another child deep
                    console.log(new Date().getMilliseconds())
                    Array.from(children).forEach((child) => {
                        if (!child.hasEventListener) {
                            console.log(`made it inside`)
                            child.addEventListener('click', () => {
                                console.log(`got here`,child)
                                console.log(child)
                                this.tokens[child]--
                                resolve(`${child} has been clicked`);
                            });
                            // console.log(`did the thing`)
                            // setTimeout(() => {console.log(`freezeframe`)},2000)
                            // console.log(`Freeze!`)
                            //child.hasEventListener = true;
                        }
                    })
                    
                } else {
                    console.log('No children found in playerResourcesDiv');
                    reject('No children found in playerResourcesDiv');
                }
            } else {
                console.log('PlayerResources div not found');
                reject('PlayerResources div not found');
            }
        });
    }
    
    
        /**
     * Asks if player1 (current player) can buy the input card
     * @param {*} cardInQuestion 
     * @param {*} locationOfCard 
     * @returns {didWe boolean,tokensUsed {}} Bool of if player1 can or cannot buy input card
     * 
     */
    queryPlayerToBuy = (cardInQuestion) => {
            let canI = this.canBuyCard(cardInQuestion)
            if (canI) {
                let spent = this.buyCard(cardInQuestion,canI)
                return { didWe:true, tokensUsed: spent}
            }
    
            else {
                
                let noGo = `You can not buy that card at this time! It is still ${this.name}'s turn`
                logToScreen(noGo)
                return { didWe:false, tokensUsed: {}}
            }
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
            let sum = 0;
            colorTotals.forEach(total => {
                if (total < 0) {
                    sum = sum - total
                }
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
     * 
     * @param {*} cardObject the card that player wants to buy.
     * @param {*} canBuyCard boolean used to make sure that we can actually buy the card!
     * @returns special object used to replenish the tokens used by the player
     */
    buyCard = (cardObject,canBuyCard) => {
        //have error check, if canBuyCard flase, throw error, we shouldn't be here.
        if (!canBuyCard){
            throw new Error('You can not buy this card, why did this happen!?');
        }
        console.log(cardObject)

        //do all the math before hand

        //reduce cost using cards the player has first to 0 or the difference.
        let black = cardObject.Black  < this.cards.Black ? 0 : cardObject.Black  - this.cards.Black
        let blue  = cardObject.Blue  < this.cards.Blue  ? 0 : cardObject.Blue  - this.cards.Blue 
        let green = cardObject.Green < this.cards.Green ? 0 : cardObject.Green - this.cards.Green
        let red   = cardObject.Red < this.cards.Red   ? 0 : cardObject.Red - this.cards.Red  
        let white = cardObject.White < this.cards.White ? 0 : cardObject.White - this.cards.White
        console.log(`After card reduce: black: ${black}, blue: ${blue}, green: ${green}, red: ${red}, white: ${white}`)
        //Figure out how much we can buy without yellow
        black = this.tokens.Black - black
        blue = this.tokens.Blue   - blue 
        green = this.tokens.Green - green
        red = this.tokens.Red     - red  
        white = this.tokens.White - white
        let colorTotals = [black,blue,green,red,white]
        //rather than trying to use yellow tokens to buy with, see how many we need total
        //because we already know we can buy the card.
        let sum = 0;
        colorTotals.forEach(total => {
            if (total < 0) {
                sum = sum - total
            }
        });
        console.log(`black: ${black}, blue: ${blue}, green: ${green}, red: ${red}, white: ${white}, yellow: ${sum}`)
        //keep track what we spent to return to the global pool
        const tokensUsed = {
            "ResourceG": green < 0 ? this.tokens.Green: 0 -( green-this.tokens.Green) ,
            "ResourceR":red < 0 ? this.tokens.Red :  0 - (red- this.tokens.Red),
            "ResourceU": blue < 0 ? this.tokens.Blue : 0 - (blue- this.tokens.Blue),
            "ResourceB": black < 0 ? this.tokens.Black: 0 - (black- this.tokens.Black),
            "ResourceW": white < 0 ? this.tokens.White: 0 - (white- this.tokens.White),
            "ResourceY": sum
        }
        //updates values of the players tokens,
        this.tokens.Black  = black < 0 ? 0 : black
        this.tokens.Blue =   blue < 0 ? 0 : blue
        this.tokens.Green =  green < 0 ? 0 : green
        this.tokens.Red =    red < 0 ? 0 : red
        this.tokens.White =  white < 0 ? 0 : white

        this.tokens.Yellow = this.tokens.Yellow - sum

        // the color of the card aquired,
        this.cards[cardObject.Color] += 1
        
        //and the pv.
        ////console.log(`PV: `, this.victoryPoints, `+`, cardObject.PV)
        this.victoryPoints += cardObject.PV
        //Announce that it happened
        logToScreen(`${this.name} just purchased a ${cardObject.Color} worth ${cardObject.PV} points!`)

        return tokensUsed
    }

    reserveCard = (cardObject) => {
        this.reservedCards.push(cardObject)
    }
    /**
     * class noble {
        constructor(PV,black,blue,green,red,white){
        this.PV = PV
        this.Black = black
        this.Blue = blue
        this.Green = green
        this.Red = red
        this.White = white
        }
        }
     * @param {*} noble 
     * @returns bool if the player should have that noble
     */
    shouldHaveNoble = (noble) => {
        ////console.log(`check if ${this.name} gains,`, noble ,this.cards)
        let should = true
        for(let keys in noble){
            if(keys !== `PV`)
            if(this.cards[keys] < noble[keys]) {
                ////console.log(`No`)
                should = false
            }
        }
        ////should ? console.log('yes') : console.log(`No`)
        return should
    }
}
/* Thinking out sudo code logic
Player.cleanup
    Check to see if they have more than 10 tokens, if so, prompt player to choose which tokens to discard.
         discard one token then RE: Player.cleanup
   

*/

/* --------------------------------------Actual Code Begins ------------------------------------------------------- */

const testPlayer1 = new Player(`William`,12345)
const testPlayer2 = new Player(`Lily`,23456)
const testPlayer3 = new Player(`Callum`,34657)
const testPlayer4 = new Player(`Sara`,45678)
//  
const testGame = new Game(level1Objects,level2Objects, level3Objects, nobleObjects,
    testPlayer1,testPlayer2,testPlayer3,testPlayer4)
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
 * @returns {nameTag : nameTagHTML, resources : playerResourcesDiv, reserved: playerReservedDiv }
 * 
 */
function generatePlayerDetails(player) {
    //make tag for player 1
    let nameTag = `<span id="player${player.id}">${player.name}(${player.victoryPoints} VP)</span>`
    // Create the div element for player resources
    const playerResourcesDiv = document.createElement('div')
    playerResourcesDiv.className = 'PlayerResources'
    // Create the div element for the player's reserved cards
    const playerReservedDiv = document.createElement('div')
    playerReservedDiv.id = `ReservedCards`

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

    return {nameTag : nameTag, resources : playerResourcesDiv, reserved: playerReservedDiv };
}
/**
 * 
 * @param {*} player the player that needs to be added to OtherPlayers
 * @returns the html that contains that player's info to be appended to .OtherPlayers
 */
function generateOtherPlayerDetails(player) {
    let html = `<div id="player${player.id}" class="otherPlayerBox">
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
            resourceDiv.querySelector('div').textContent = newNumbers[resourceId]  
                + parseInt(resourceDiv.querySelector('div').textContent)
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
