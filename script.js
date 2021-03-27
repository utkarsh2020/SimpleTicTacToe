/*
This is the javascript for Tis Tac Toe game.
*/
const gameAreaDiv = document.getElementsByClassName("gameArea");
//array to keep game status. this will be used to check winner
const gameStatus = [["-","-","-"],["-","-","-"],["-","-","-"]];

//add event listener for click event
document.addEventListener("click",placeCellValue)

let turn = false; //false for X's turn and true for O's turn.
let counter = 0; //game turns. A game has max of 9 turns

//resets the game.
const resetGame = () =>{
    for (let i=0;i<3;i++){
       gameStatus[i][0] = "-";
       gameStatus[i][1] = "-";
       gameStatus[i][2] = "-";
    }
    turn = false;
    counter = 0;
    const pTags = document.getElementsByClassName("cellValue");  
    for (const pTag of pTags){
        pTag.innerText = "";
        pTag.style = null;
    }
}

//checks for winner after every turn
const checkWinner = (currentValue) =>{
    if (gameStatus[0][0] === currentValue && gameStatus[1][0] == currentValue && gameStatus[2][0] == currentValue){
        return true;
    }
    if (gameStatus[0][1] === currentValue && gameStatus[1][1] == currentValue && gameStatus[2][1] == currentValue){
        return true;
    }
    if (gameStatus[0][2] === currentValue && gameStatus[1][2] == currentValue && gameStatus[2][2] == currentValue){
        return true;
    }
    if (gameStatus[0][0] === currentValue && gameStatus[0][1] == currentValue && gameStatus[0][2] == currentValue){
        return true;
    }
    if (gameStatus[1][0] === currentValue && gameStatus[1][1] == currentValue && gameStatus[1][2] == currentValue){
        return true;
    }
    if (gameStatus[2][0] === currentValue && gameStatus[2][1] == currentValue && gameStatus[2][2] == currentValue){
        return true;
    }
    if (gameStatus[0][0] === currentValue && gameStatus[1][1] == currentValue && gameStatus[2][2] == currentValue){
        return true;
    }
    if (gameStatus[2][0] === currentValue && gameStatus[1][1] == currentValue && gameStatus[0][2] == currentValue){
        return true;
    }
    return false;

}

//prints status of game (debug)
const printStatus = () =>{
    for (let i=0;i<3;i++){
        console.log(i+":",gameStatus[i][0],gameStatus[i][1],gameStatus[i][2]);
    }
}

//place the next cell value
function placeCellValue(e){
    console.log(e);
    const gameCellDiv = e.target;
    if (gameCellDiv.classList.length && gameCellDiv.classList[0] == "gameCell"){
        const pTags = gameCellDiv.getElementsByClassName("cellValue");   
        if (pTags.length > 0 && pTags[0] && pTags[0].innerText === ""){
            const value = turn ? "O" : "X";
            pTags[0].innerText = value;
            pTags[0].style.color = turn ? "rgb(0,0,0)" : "rgb(255,0,0)";//set the color
            gameStatus[parseInt(gameCellDiv.classList[2]) -11][parseInt(gameCellDiv.classList[1]) -1] = value;
            turn = !turn;
            counter++;       
            if(checkWinner(value)){
                alert("Player("+ value + ") has won. Congratulations!!!");
                resetGame();
                return;
            }
            if(counter === 9){
                alert("It's a Cat's Game");
                resetGame();
            }
        }
    }
}
