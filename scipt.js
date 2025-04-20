const canvas = document.getElementById("planner-canvas");
const ctx = canvas.getContext("2d");

const gridSize = 40;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;

// Draw grid
function drawGrid() {
  ctx.strokeStyle = "#444";
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

drawGrid();
