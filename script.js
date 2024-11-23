const $ = el => document.querySelector(el);

const canvas = $('canvas');
const ctx = canvas.getContext('2d');

const $globalSprite = $('.general-sprite');
const $bricksSprite = $('.bricks-sprite');
const modal = $('dialog');
const message = modal.querySelector('.message');

const ballRadius = 5;
let colorBall = "#fff";
let xCoordinateBall = canvas.width / 2;
let yCoordinateBall = canvas.height - 46;
let growBallInX = -4;
let growBallInY = -4;

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = colorBall;
  ctx.arc(xCoordinateBall, yCoordinateBall, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function ballMovement() {
  if (
    xCoordinateBall + growBallInX > canvas.width - ballRadius ||
    xCoordinateBall + growBallInX < ballRadius
  ) {
    growBallInX = -growBallInX;
  }
  if (yCoordinateBall + growBallInY < ballRadius) {
    growBallInY = -growBallInY;
  }
  if (
    xCoordinateBall > paddleX &&
    xCoordinateBall < paddleX + paddleWidth &&
    yCoordinateBall > paddleY &&
    yCoordinateBall < paddleY + ballRadius
  ) {
    growBallInY = -growBallInY;
  } else if (yCoordinateBall + growBallInY > canvas.height - ballRadius) {
    modal.showModal();
  }
  xCoordinateBall += growBallInX;
  yCoordinateBall += growBallInY;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const paddleWidth = 52;
const paddleHeight = 14;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - 40;
let keyCapLeftPressed = false;
let keyCapRightPressed = false;
let growPaddleInX = 7;

function drawPaddle() {
  ctx.drawImage(
    $globalSprite,
    28,
    173,
    paddleWidth,
    paddleHeight,
    paddleX,
    paddleY,
    paddleWidth,
    paddleHeight
  );
}

function initEvents() {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });

  function handleKeydown({ key }) {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      keyCapLeftPressed = true;
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      keyCapRightPressed = true;
    }
  }

  function handleKeyUp({ key }) {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      keyCapLeftPressed = false;
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      keyCapRightPressed = false;
    }
  }

  function handleTouchStart({ target }) {
    if (target.matches('.pad-right')) {
      keyCapRightPressed = true;
    } else if (target.matches('.pad-left')) {
      keyCapLeftPressed = true;
    }
  }

  function handleTouchEnd({ target }) {
    if (target.matches('.pad-right')) {
      keyCapRightPressed = false;
    } else if (target.matches('.pad-left')) {
      keyCapLeftPressed = false;
    }
  }
}

const bricksColumnCount = 8;
const bricksRowCount = 6;
const brickWidth = 34;
const brickHeight = 14;
const brickPadding = 2;
const brickOffsetLeft = 50;
const brickOffsetTop = 30;
const STATUS = {
  ACTIVE: 1,
  DESTROYED: 0
};
let bricks = [];

for (let c = 0; c < bricksColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < bricksRowCount; r++) {
    const brickX = c * (brickPadding + brickWidth) + brickOffsetLeft;
    const brickY = r * (brickPadding + brickHeight) + brickOffsetTop;
    const randomColor = Math.floor(Math.random() * 8);
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      color: randomColor,
      status: STATUS.ACTIVE
    };
  }
}

function drawBricks() {
  for (let c = 0; c < bricksColumnCount; c++) {
    for (let r = 0; r < bricksRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === STATUS.DESTROYED) continue;
      ctx.drawImage(
        $bricksSprite,
        currentBrick.color * 32,
        0,
        32,
        14,
        currentBrick.x,
        currentBrick.y,
        brickWidth,
        brickHeight
      );
    }
  }
}

function collisionDetectionBricks() {
  let arrayDeStatus = [];

  for (let c = 0; c < bricksColumnCount; c++) {
    for (let r = 0; r < bricksRowCount; r++) {
      let newArray = bricks.flat(2);
      const currentBrick = bricks[c][r];
      if (currentBrick.status === STATUS.DESTROYED) continue;
      if (
        xCoordinateBall > currentBrick.x &&
        xCoordinateBall < currentBrick.x + brickWidth &&
        yCoordinateBall > currentBrick.y &&
        yCoordinateBall < currentBrick.y + brickHeight
      ) {
        growBallInY = -growBallInY;
        currentBrick.status = STATUS.DESTROYED;
      }
    }
  }

  for (let c = 0; c < bricksColumnCount; c++) {
    for (let r = 0; r < bricksRowCount; r++) {
      arrayDeStatus.push(bricks[c][r].status);
    }
  }

  let allBricksDestroyed = arrayDeStatus.every(status => status === 0);
  if (allBricksDestroyed) {
    modal.showModal();
    message.innerHTML = 'You win <span>🏆<span>';
    colorBall = "transparent";
  }
}

function paddleMovement() {
  if (keyCapLeftPressed && paddleX > 0) {
    paddleX -= growPaddleInX;
  } else if (keyCapRightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += growPaddleInX;
  }
}

function drawCanvas() {
  clearCanvas();
  drawBall();
  drawBricks();
  drawPaddle();
  collisionDetectionBricks();
  paddleMovement();
  ballMovement();
  requestAnimationFrame(drawCanvas);
}

document.addEventListener('DOMContentLoaded', () => {
  drawCanvas();
  initEvents();
});

document.addEventListener('click', e => {
  if (e.target.matches('.button-play-again')) {
    location.reload();
  }
});
