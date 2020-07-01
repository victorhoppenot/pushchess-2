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

var hoverX = 0;
var hoverY = 0;

var assets = ['board','bB','bH','bK','bP','bQ','bR','wB','wH','wK','wP','wQ','wR'];
var imagesToBeLoaded = assets.length;

window.onload = function() {
    c = document.getElementById('gc');
    ctx = c.getContext('2d');

    width = c.width;
    height = c.height;
    colDivider = width/8;
    rowDivider = height/8;

    images = loadImages();

    c.addEventListener('mousemove', onMouseMove);
};

function onMouseMove(evt){
    let mousepos = getMousePos(evt);
    
    hoverX = bound(mousepos.x, 0, width);
    hoverY = bound(mousepos.y, 0, height);
    hoverX = Math.floor(hoverX/colDivider)*colDivider;
    hoverY = Math.floor(hoverY/rowDivider)*rowDivider;
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
    ctx.fillRect(hoverX,hoverY,colDivider,rowDivider);
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

