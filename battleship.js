//Logan Keach
//Code from Ania Kubow and freecodecamp.org

//IDS connecting to HTML
const optionContainer = document.querySelector('.option-container')
const rotateButton = document.querySelector('#rotate-button')
const gamesBoardContainer = document.querySelector('#gamesboard-container')
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')
const scoreDisplay = document.querySelector('#score')

//set rotate button to rotate the ships when the button is clicked
let angle = 0;

function rotate(){
    const optionShips = Array.from(optionContainer.children);
    angle = angle === 0 ? 90 : 0
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`);
}

rotateButton.addEventListener('click', rotate);


//Creates the game boards for the users
const width = 10

function createBoard(color, user){
    const gameBoardContainer = document.createElement('div')
    gameBoardContainer.classList.add('game-board')
    gameBoardContainer.style.backgroundColor = color
    gameBoardContainer.id = user

    //adds the block function from the css file into the game boards
    for (let i = 0; i < 100; i++){
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i
        gameBoardContainer.append(block)
    }

    gamesBoardContainer.append(gameBoardContainer)
}

createBoard('#40a4ee', 'player')
createBoard('#0cde29', 'computer')


//creates the five individual ships
class Ship {
    constructor(name, length){
        this.name = name;
        this.length = length;
    }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]

//Checks for validity in the game board by making sure the pieces in the opponent's board are placed
let notDropped

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart
    if (isHorizontal) { //Checks to see if the ship is placed horizontally
        validStart = startIndex <= 100 - ship.length ? startIndex : 100 - ship.length
    } else { //Vertical
        validStart = startIndex <= 100 - width * ship.length ? startIndex : startIndex - ship.length * width + width
    }

    const shipBlocks = []
    for (let i = 0; i < ship.length; i++) {
        const index = isHorizontal ? Number(validStart) + i : Number(validStart) + i * width
        shipBlocks.push(allBoardBlocks[index])
    }

    let valid;
    if (isHorizontal) {
        valid = shipBlocks.every((_shipBlock, index) =>
            _shipBlock.id % width !== width - (shipBlocks.length - (index + 1))
        )
    } else {
        valid = shipBlocks.every((_shipBlock, index) =>
            _shipBlock.id < 90 + (width * index + 1)
        )
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

    return { shipBlocks, valid, notTaken }
}

//adds the ships to the computer's board
function addShipPiece(user, ship, startId){
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomBoolean = Math.random() < 0.5
    let isHorizontal = user === 'player' ? angle === 0: randomBoolean
    let randomStartIndex = Math.floor(Math.random() * width * width) //randomly places on board

    let startIndex = startId ? startId : randomStartIndex

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) { //makes sure the space is not occupied
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
        })
    } else {
        if (user === 'computer') addShipPiece(user, ship, startId)
        if (user === 'player') notDropped = true
    }
}

ships.forEach(ship => addShipPiece('computer', ship))

//detects when a player is dragging a ship into the board
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e){
    notDropped = false
    draggedShip = e.target
}

//Displays a drop shadow over the board so the player knows where the ship is being placed
function dragOver(e){
    e.preventDefault()
    const ship = ships[parseInt(draggedShip.id)]
    highlightArea(e.target.id, ship)
}

//Drops ship on the game board and removes it from the container
function dropShip(e){
    const startId = parseInt(e.target.id)
    const ship = ships[parseInt(draggedShip.id)]
    addShipPiece('player', ship, startId)
    if (!notDropped) {
        draggedShip.remove()
    }
}

function highlightArea(startIndex, ship){
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const {shipBlocks, valid, notTaken} = getValidity(allPlayerBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken){ //Checks to see if the blocks are occupied
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout(() => shipBlock.classList.remove('hover'), 500)
        })
    }
}

//Starts game 
startButton.addEventListener('click', startGame)
let gameOver = false
let playerTurn
let score = 1


function startGame(){
    if (playerTurn === undefined){
        if (optionContainer.children.length != 0){ //Checks to see if all the ships are placed on the game board
            infoDisplay.textContent = 'Please place all your pieces first before starting!'
        } else {
            const allBoardBlocks = document.querySelectorAll('#computer div') //Switches to the player's turn
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
            playerTurn = true
            turnDisplay.textContent = 'Your Turn'
            infoDisplay.textContent = 'The game has started'
            }

        }
}

//Empty arrays to store the scores of each player
let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

//Checks to see if the block is occupied by a ship and determines if it has hit a ship or not
function handleClick(e){
    if (!gameOver){
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = "You hit the computer's ship!"
            let classes =  Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
            checkScore('player', playerHits, playerSunkShips)
        } else {
            infoDisplay.textContent = 'Miss!'
            e.target.classList.add('empty')
            }

        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 3000)
    }
}

//Computer picks a random spot 
function computerGo(){
    if (!gameOver){
        turnDisplay.textContent = "Computer's Turn"
        infoDisplay.textContent = 'The computer is thinking...'

        setTimeout(() => {
            let randomGo = Math.floor(Math.random() * 100)
            const allBoardBlocks = document.querySelectorAll('#player div')

            if (allBoardBlocks[randomGo].classList.contains('taken') && 
            allBoardBlocks[randomGo].classList.contains('boom')
        ) {
            computerGo()
            return
        } else if (
            allBoardBlocks[randomGo].classList.contains('taken') && 
            !allBoardBlocks[randomGo].classList.contains('boom')
        ) {
            allBoardBlocks[randomGo].classList.add('boom')
            infoDisplay.textContent = 'The computer hit your ship!'
            let classes =  Array.from(allBoardBlocks[randomGo].classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            computerHits.push(...classes)
            checkScore('computer', computerHits, computerSunkShips)
        } else {
            infoDisplay.textContent = 'Miss!'
            allBoardBlocks[randomGo].classList.add('empty')
        }
        }, 3000)

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = 'Your turn'
            infoDisplay.textContent = 'Select a space'
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 6000)
    }
}


//Checks which ships have sunk
function checkScore(user, userHits, userSunkShips){
    function checkShip(shipName, shipLength){
        if (userHits.filter(storedShipName => storedShipName === shipName).length === shipLength){
            if (user === 'player'){
                infoDisplay.textContent = `You sunk the computer's ${shipName}!`
                scoreDisplay.textContent = `${score}`
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
                score = score+=1 
            }
            if (user === 'computer'){
                infoDisplay.textContent = `You sunk the player's ${shipName}!`
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
            
            }
        }
        checkShip('destroyer', 2)
        checkShip('submarine', 3)
        checkShip('cruiser', 3)
        checkShip('battleship', 4)
        checkShip('carrier', 5)

        //Displays text if the player has wom or lost based off of the results of checkScore()
        if(playerSunkShips.length === 5){
            infoDisplay.textContent = 'YOU WIN!! :D'
            gameOver = true
        }
        if(computerSunkShips.length === 5){
            infoDisplay.textContent = 'YOU LOSE... :('
            gameOver = true
        }

    }
    console.log(score)



   


