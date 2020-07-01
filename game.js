var board = [
    ['__','__','__','__','__','__','__','bQ'],
    ['__','__','__','wB','bB','__','__','__'],
    ['__','__','bH','__','__','wH','__','__'],
    ['__','__','__','bK','wR','__','__','__'],
    ['__','__','__','bR','wK','__','__','__'],
    ['__','__','wH','__','__','bH','__','__'],
    ['__','__','__','bB','wB','__','__','__'],
    ['wQ','__','__','__','__','__','__','__']
]

var assets = ['board','bB','bH','bK','bP','bQ','bR','wB','wH','wK','wP','wQ','wR'];
var imagesToBeLoaded = assets.length;

window.onload = function() {
    c = document.getElementById('gc');
    ctx = c.getContext('2d');

    width = c.width;
    height = c.height;

    images = loadImages();
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
    ctx.drawImage(images['board'],0,0,width,height);
    let colDivider = width/8;
    let rowDivider = height/8;
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

function displayBoard(){
    
}