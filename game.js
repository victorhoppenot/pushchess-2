var board = [
    ['__','__','__','__','__','__','__','bQ'],
    ['__','__','__','wB','bB','__','__','__'],
    ['__','__','wH','__','__','bH','__','__'],
    ['__','__','__','wK','bR','__','__','__'],
    ['__','__','__','wR','bK','__','__','__'],
    ['__','__','wH','__','__','bH','__','__'],
    ['__','__','__','wB','bB','__','__','__'],
    ['wQ','__','__','__','__','__','__','__']
]
var highlights = [];

var mousePlaceX = 0;
var mousePlaceY = 0;

var selected = false;
var selectX = 0;
var selectY = 0;
var selectedMoveset = {
    empty : [],
    moved : []
};

var assets = ['board','bB','bH','bK','bP','bQ','bR','wB','wH','wK','wP','wQ','wR'];
var imagesToBeLoaded = assets.length;

var ip = document.getElementById("ip");
var nom = document.getElementById("name");
var key = document.getElementById("key");
var playButton = document.getElementById("play");
var player = '';
var play = 'b';

playButton.onclick = function() {
    ip = ip.value;
    key = key.value;
    nom = nom.value;

    webSocket = new WebSocket("ws://" + ip);
    webSocket.onclose = webSocketClose;
    webSocket.onopen = webSocketOpen;
    webSocket.onmessage = webSocketMessage;

    c = document.getElementById('gc');
    ctx = c.getContext('2d');

    width = c.width;
    height = c.height;
    colDivider = width/8;
    rowDivider = height/8;

    images = loadImages();

    c.addEventListener('mousemove', onMouseMove);
    c.addEventListener('click', onLeftClick);
    c.addEventListener('contextmenu', onRightClick);
};

function onMouseMove(evt){
    let mousepos = getMousePos(evt);
    
    mousePlaceX = bound(mousepos.x, 0, width);
    mousePlaceY = bound(mousepos.y, 0, height);
    mousePlaceX = Math.floor(mousePlaceX/colDivider);
    mousePlaceY = Math.floor(mousePlaceY/rowDivider);
    displayBoard();
}

function onLeftClick(){
    let peice = board[mousePlaceY][mousePlaceX];
    let type = peice.charAt(0);
    if(type == player){
        selected = true;
        selectX = mousePlaceX;
        selectY = mousePlaceY;
    }else if(selected && player == play){
        if(isArrayInArray(selectedMoveset.empty,[mousePlaceY,mousePlaceX])){
            selected = false;
            webSocket.send("play " + key + " " + mousePlaceX + "," + mousePlaceY + "," + board[selectY][selectX] + "," + selectX + "," + selectY + ",__");
            webSocket.send("switch");
        }else{
             for(let item of selectedMoveset.moved){
                if(item[0] == mousePlaceY && item[1] == mousePlaceX){
                    selected = false;
                    if(item[2] != -99 && item[3] != -99){
                        webSocket.send("play " + key + " " + item[3] + "," + item[2] + "," + board[mousePlaceY][mousePlaceX]);
                    }
                    webSocket.send("play " + key + " " + mousePlaceX + "," + mousePlaceY + "," + board[selectY][selectX] + "," + selectX + "," + selectY + ",__");
                    webSocket.send("switch");
                }
            }
        }
    }
    selectedMoveset = getMoveSet(selectX,selectY);
    displayBoard();
}

function onRightClick(evt){
    evt.preventDefault();
    selected = false;
    displayBoard();
}

function loadImages(){
    let temp = {};

    for(const name of assets){
        let img = new Image();
        img.addEventListener('load', function() {
            imagesToBeLoaded--;
            if(imagesToBeLoaded <= 0){
                onAllImagesLoaded();
            }
        });
        img.src = 'assets/' + name + '.png';
        temp[name] = img;
    }
    return temp;
}

function onAllImagesLoaded(){
    displayBoard();
}

function displayBoard(){
    ctx.drawImage(images['board'],0,0,width,height);
    
    ctx.globalAlpha = 0.5;

    ctx.fillStyle = '#03fc2c';
    ctx.fillRect(mousePlaceX*colDivider,mousePlaceY*rowDivider,colDivider,rowDivider);

    if(selected){
        ctx.fillStyle = '#307ff0';
        ctx.fillRect(selectX*colDivider,selectY*rowDivider,colDivider,rowDivider);
        for(const square of selectedMoveset.empty){
            ctx.fillStyle = '#f2ff3d';
            let y = square[0];
            let x = square[1];
            ctx.fillRect(x*colDivider,y*rowDivider,colDivider,rowDivider);
        }
        for(const square of selectedMoveset.moved){
            ctx.fillStyle = '#ff0363';
            let y = square[0];
            let x = square[1];
            ctx.fillRect(x*colDivider,y*rowDivider,colDivider,rowDivider);
        }
    }

    ctx.globalAlpha = 1;

    let rowN = 0;
    for(const row of board){
        let colN = 0;
        for(const peice of row){
            if(peice == '__'){
                colN++
                continue;
            }
            ctx.drawImage(images[peice], colDivider*colN, rowDivider*rowN, colDivider, rowDivider);
            colN++;
        }
        rowN++;
    }
}

function getMousePos(evt){
    let rect = c.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    }
}

function bound(v, a, b){
    return Math.max(Math.min(v, b), a);
}

function getMoveSet(col, row){
    let peice = board[row][col];
    let type = peice.charAt(1);
    let color = peice.charAt(0);
    let moveset = {
        empty : [],
        moved : []
    };

    if(type == 'R' || type == 'Q'){
        let i = 1;
        //left
        while(true){
            if(col - i < 0){
                break;
            }
            let p = board[row][col - i];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row,col-i]);
            }else{
                if(col - i < 1){
                    moveset.moved.push([row,col-i,-99,-99]);
                    break;
                }
                if(board[row][col - i - 1] == '__'){
                    moveset.moved.push([row,col-i,row,col-i-1]);
                }
                break;
            }
            i++;
        }
        i = 1;
        //up
        while(true){
            if(row - i < 0){
                break;
            }
            let p = board[row - i][col];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row - i,col]);
            }else{
                if(row - i < 1){
                    moveset.moved.push([row-i,col,-99,-99]);
                    break;
                }
                if(board[row - i - 1][col] == '__'){
                    moveset.moved.push([row-i,col,row-i-1,col]);
                }
                break;
            }
            i++;
        }
        i = 1;
        //right
        while(true){
            if(col + i > 7){
                break;
            }
            let p = board[row][col + i];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row,col+i]);
            }else{
                if(col + i > 6){
                    moveset.moved.push([row,col+i,-99,-99]);
                    break;
                }
                if(board[row][col + i + 1] == '__'){
                    moveset.moved.push([row,col+i,row,col+i+1]);
                }
                break;
            }
            i++;
        }
        i = 1;
        //down
        while(true){
            if(row + i > 7){
                break;
            }
            let p = board[row + i][col];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row + i,col]);;
            }else{
                if(row + i > 6){
                    moveset.moved.push([row+i,col,-99,-99]);
                    break;
                }
                if(board[row + i + 1][col] == '__'){
                    moveset.moved.push([row+i,col,row+i+1,col]);
                }
                break;
            }
            i++;
        }
    }

    if(type == 'B' || type == 'Q'){
        let i = 1;
        //upLeft
        while(true){
            if(row - i < 0 || col - i < 0){
                break;
            }
            let p = board[row - i][col - i];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row - i, col - i]);
            }else{
                if(row - i < 1 || col - i < 1){
                    moveset.moved.push([row-i,col-i,-99,-99])
                    break;
                }
                if(board[row - i - 1][col - i - 1] == '__'){
                    moveset.moved.push([row-i,col-i,row-i-1,col-i-1]);
                }
                break;
            }
            
            i++;
        }
        i = 1;
        //downRight
        while(true){
            if(row + i > 7 || col + i > 7){
                break;
            }
            let p = board[row + i][col + i];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row + i, col + i]);
            }else{
                if(row + i > 6 || col + i > 6){
                    moveset.moved.push([row+i,col+i,-99,-99]);
                    break;
                }
                if(board[row + i + 1][col + i + 1] == '__'){
                    moveset.moved.push([row+i,col+i,row+i+1,col+i+1]);
                }
                break;
            }
            
            i++;
        }
        i = 1;
        //upRight
        while(true){
            if(row - i < 0 || col + i > 7){
                break;
            }
            let p = board[row - i][col + i];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row - i, col + i]);
            }else{
                if(row - i < 1 || col + i > 6){
                    moveset.moved.push([row-i,col+i,-99,-99]);
                    break;
                }
                if(board[row - i - 1][col + i + 1] == '__'){
                    moveset.moved.push([row-i,col+i,row-i-1,col+i+1]);
                }
                break;
            }
            
            i++;
        }
        i = 1
        //downLeft
        while(true){
            if(row + i > 7 || col - i < 0){
                break;
            }
            let p = board[row + i][col - i];
            if(p.charAt(0) == color){
                break;
            }
            if(p == '__'){
                moveset.empty.push([row + i, col - i]);
            }else{
                if(row + i > 6 || col - i < 1){
                    moveset.moved.push([row+i,col-i,-99,-99]);
                    break;
                }
                if(board[row + i + 1][col - i - 1] == '__'){
                    moveset.moved.push([row+i,col-i,row+i+1,col-i-1]);
                }
                break;
            }
            
            i++;
        }
    }

    if(type == 'K'){
        let moves = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]];
        for(const move of moves){
            let down = move[0];
            let right = move[1];
            if(bound(row + down, 0, 7) != row + down || bound(col + right,0,7) != col + right){
                continue;
            }
            if(board[row + down][col + right] == '__'){
                moveset.empty.push([row+down,col+right]);
            }
        }
    }

    if(type == 'H'){
        let moves = [[-2,1],[-2,-1],[2,1],[2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];
        for(const move of moves){
            let down = move[0];
            let right = move[1];
            if(bound(row + down, 0, 7) != row + down || bound(col + right,0,7) != col + right){
                continue;
            }
            let p = (board[row + down][col + right]);
            if(p.charAt(0) == color){
                continue;
            }
            if(p == '__'){
                moveset.empty.push([row+down,col+right]);
            }else{
                let directionDown = bound(down,-1,1);
                let directionRight = bound(right,-1,1);
                if(bound(row + down + directionDown, 0, 7) ==  row + down + directionDown || bound(col + right + directionRight, 0, 7) == col + right + directionRight){
                    if(board[row + down + directionDown][col + right + directionRight] == '__'){
                        moveset.moved.push([row+down,col+right,row+down+directionDown,col+right+directionRight]);
                    }
                }else{
                    moveset.moved.push([row+down,col+right,-99,-99]);
                }
            }
        }
    }

    return moveset;
}

function webSocketOpen(evt){
    console.log("Connected to WebServer")
    webSocket.send("join " + key + " " + nom);
}

function webSocketClose(evt){
    location.reload();
}

function webSocketMessage(evt){
    let message = evt.data;
    console.log("WebServer says: " + message);
    let obj = message.split(" ");
    if(obj.length < 1){
        return;
    }
    switch(obj[0]){
        case "play":
            if(obj.length < 2){
                break;
            }
            let played = obj[1];
            let plays = played.split(",");
        
            let x = 0;
            let y = 0;
            let place = '__';
            let j = 0;
            for(let i = 0; i < plays.length; i++){
                let item = plays[i];
                switch(j){
                    case 0:
                        x = parseInt(item);
                        j++;
                        break;

                    case 1:
                        y = parseInt(item);
                        j++;
                        break;

                    case 2:
                        place = item;
                        j = 0;
                        board[y][x] = place;
                        console.log("placed " + place + " at " + x + " : " + y);
                        break;
                }
            }
            break;
        case "setplayer":
            if(obj.length < 2){
                break;
            }
            player = obj[1];
            break;
        case "switch":
            if(play == 'b'){
                play = 'w';
            }else{
                play = 'b';
            }
            break;

    }
    displayBoard();
}

function isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);
  
    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
}
