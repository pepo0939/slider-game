/**
 * HI. This is a Slider Game. This works as a demo of what I can do. Take the liberty of read and criticize.
 * This file will contains all the JavaScript necessary to run the game. The rest can be find on the slider.html and slider.css.
 *
 */
let PIXELS_MOVE=6;

window.onload = () => { Game() };

/**
 * Game will set all the parameters for the game.
 * x, y and imgSrc are parameters so they can be set by the user in the future when a setting window is implemented.
 * 
 * x: the number of tiles horizontal.
 * y: the number of tiles vertical.
 * canvasId: the Id of the element canvas.
 * imgSrc: contains the path of the image used in the game.
 * startButton: the Id of the element button that will start the game.
 */
let Game = function( x=4, y=4, canvasId='slider', imgSrc='/monks.jpg',startButton='start'){
  this.ctx = document.getElementById(canvasId).getContext('2d');
  let img = new Image();/*global Image*/
  img.src = imgSrc;
  img.onload = () => { 
    PIXELS_MOVE = img.width / 60;
    document.getElementById(startButton).addEventListener('click', () => {  new Board(canvasId,this.ctx, img, x, y)}, false);
    this.ctx.drawImage(img, 0, 0, img.width, img.height);
  };
};

/**
 * Board will draw the image on the canvas and will control the movement of the tiles.
 */
class Board {
  
  constructor (canvasId, ctx, img, x, y){
    this.ctx = ctx;
    this.img = img;
    this.x = x;
    this.y = y;
    //tiles contains all the tiles except the empty one.
    this.tiles = [];
    this.width = img.width;
    this.height = img.height;
    this.tileWidth = img.width / x;
    this.tileHeight = img.height / y;
    this.emptyTile = new Tile({ x: x-1, y: y-1}, { width: this.tileWidth, height: this.tileHeight });
    this.clickedTile = false;
    this.correctPositions = [];
    
    this.generateTiles(img, x, y);
    this.draw();
    
    //Event of the click on the canvas.
    document.getElementById(canvasId).onclick = (e)=>{
      let clickedPosition={};
      //Determinate the position of the click in the canvas.
      clickedPosition.x = Math.floor((e.pageX - e.currentTarget.getBoundingClientRect().left) / this.tileWidth);
      clickedPosition.y = Math.floor((e.pageY - e.currentTarget.getBoundingClientRect().top) / this.tileHeight);
      
      //Check if the click is on a tile next to the empty tile.
      if (Math.abs(clickedPosition.x - this.emptyTile.boardPosition.x) + 
        Math.abs(clickedPosition.y - this.emptyTile.boardPosition.y) == 1
        && !this.clickedTile) {
          
        this.clickedTile=this.tiles.find( t => {
          return t.boardPosition.x == clickedPosition.x && t.boardPosition.y == clickedPosition.y;
        });
        
        window.requestAnimationFrame(this.gameFrame.bind(this));
      }
    };
  }
  
  //Generates the initial tiles.
  generateTiles (img, x, y){
    let tilesRndPositions = [];
    
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        this.tiles.push(new Tile({ x: i, y: j }, { width: this.tileWidth, height: this.tileHeight }));
        this.correctPositions.push({ x: i, y: j });
      }
    }
    
    this.tiles.pop();
    this.correctPositions.pop();
    
    //The position of the tiles is randomize and then set on the tiles.
    tilesRndPositions = this.shuffle([...this.correctPositions]);
    // tilesRndPositions = this.correctPositions; //To test. Fast win!!!
    tilesRndPositions.forEach( (p,i) => {
      this.tiles[i].boardPosition = { x:p.x, y:p.y };
    });
  }
  
  //Function to shuffle an array.
  shuffle (arr) {
		let temp, j, i = arr.length;
		while (--i) {
			j = ~~(Math.random() * i);
			temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}
  
  //Draw each tile on the canvas.
  draw () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.tiles.forEach( tile => {
      this.ctx.drawImage(this.img, tile.imgPosition.x, tile.imgPosition.y, tile.size.width, tile.size.height,
          tile.canvasPosition.x, tile.canvasPosition.y, tile.size.width, tile.size.height);
    });
  }
  
  //Chack if a tile needs to move and if the game is solved.
  gameFrame (e) {
    if (this.clickedTile.canvasPosition.x == this.emptyTile.canvasPosition.x && 
      this.clickedTile.canvasPosition.y == this.emptyTile.canvasPosition.y) {
        
      let temp = new Tile(this.clickedTile.boardPosition, this.clickedTile.size);
      this.clickedTile.boardPosition = this.emptyTile.boardPosition;
      this.clickedTile.canvasPosition = this.emptyTile.canvasPosition;
      this.emptyTile = temp;
      
      if (this.checkSolution()) {
        alert('Well Done');
      }
      else
        this.clickedTile = false;
      
    }
    else{
      if (this.clickedTile.boardPosition.x != this.emptyTile.boardPosition.x) {
        this.moveTile(this.clickedTile, this.emptyTile, 'h');
      }
      else{
        this.moveTile(this.clickedTile, this.emptyTile, 'v');
      }
      
      this.draw();
      window.requestAnimationFrame(this.gameFrame.bind(this));
    }
  }
  
  //Moves a tile to the empty space.
  moveTile (clicked, empty, direction) {
    let d = 'x';
    if (direction == 'v') {
      d = 'y';
    }
    
    if (Math.abs(clicked.canvasPosition[d] - empty.canvasPosition[d]) <= PIXELS_MOVE) {
      clicked.canvasPosition[d] = empty.canvasPosition[d];
    }
    else if ((clicked.canvasPosition[d] - empty.canvasPosition[d]) < PIXELS_MOVE) {
      clicked.canvasPosition[d] += PIXELS_MOVE;
    }
    else if ((clicked.canvasPosition[d] - empty.canvasPosition[d]) > PIXELS_MOVE){
      clicked.canvasPosition[d] -= PIXELS_MOVE;
    }
    
  }
  
  //Check if the game was solved.
  checkSolution () {
    let rtn = true;
    
    for (let i = 0; i < this.correctPositions.length; i++) {
      if (this.tiles[i].boardPosition.x != this.correctPositions[i].x || this.tiles[i].boardPosition.y != this.correctPositions[i].y) {
        rtn=false;
        break;
      }
    }
    
    return rtn;
  }

}

/**
 * Tile contains all the parameters necessary for the tiles.
 * 
 * boardPosition: an object where x is the horizontal position and y the vertial position on the Board.
 * size: an object where height and width.
 */
class Tile {
  
  constructor (boardPosition, size) {
    this._boardPosition = boardPosition;
    this.size = size;
    //canvasPosition is the position in the canvas and is calculated from the boardPosition and size.
    this.canvasPosition = { x: boardPosition.x * size.width, y: boardPosition.y * size.height };
    //imgPosition is the position in the img and is calculated from the boardPosition and size.
    this.imgPosition = { x: boardPosition.x * size.width, y: boardPosition.y * size.height };
  }
  
  //Everytime we set a new boardPosition we have to recalculat the canvasPosition.
  set boardPosition(v){
    this._boardPosition = {};
    this._boardPosition.x = v.x;
    this._boardPosition.y = v.y;
    this.canvasPosition = { x: this._boardPosition.x * this.size.width, y: this._boardPosition.y * this.size.height };
  }
  
  get boardPosition(){
    return this._boardPosition;
  }
}