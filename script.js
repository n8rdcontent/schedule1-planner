const canvas = document.getElementById("planner-canvas");
const ctx = canvas.getContext("2d");

const gridSize = 40;
const gridWidth = Math.floor(canvas.width / gridSize);
const gridHeight = Math.floor(canvas.height / gridSize);
const placedObjects = [];
let hoverCell = { x: -1, y: -1 };
let isRotated = false;
const baseWidth = 4; // Original width (4 grid cells)
const baseHeight = 3; // Original height (3 grid cells)

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width, y + 0.5);
        ctx.stroke();
    }

    // Draw placed objects
    for (const obj of placedObjects) {
        ctx.fillStyle = "#4caf50";
        if (obj.rotated) {
            // Draw rotated (3x4)
            ctx.save();
            ctx.translate(
                obj.x * gridSize + (baseHeight * gridSize) / 2,
                obj.y * gridSize + (baseWidth * gridSize) / 2
            );
            ctx.rotate(Math.PI / 2);
            ctx.fillRect(
                (-baseWidth * gridSize) / 2,
                (-baseHeight * gridSize) / 2,
                baseWidth * gridSize,
                baseHeight * gridSize
            );
            ctx.restore();
        } else {
            // Draw normal (4x3)
            ctx.fillRect(
                obj.x * gridSize,
                obj.y * gridSize,
                baseWidth * gridSize,
                baseHeight * gridSize
            );
        }
    }

    // Draw hover preview
    if (hoverCell.x >= 0 && hoverCell.y >= 0) {
        const displayWidth = isRotated ? baseHeight : baseWidth;
        const displayHeight = isRotated ? baseWidth : baseHeight;
        
        // Check if placement would be out of bounds
        const outOfBounds = hoverCell.x + displayWidth > gridWidth || 
                          hoverCell.y + displayHeight > gridHeight;
        
        const canPlace = !outOfBounds && !checkOverlap(hoverCell.x, hoverCell.y, displayWidth, displayHeight);
        
        ctx.fillStyle = canPlace ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 0, 0, 0.5)";
        
        if (isRotated) {
            ctx.save();
            ctx.translate(
                hoverCell.x * gridSize + (baseHeight * gridSize) / 2,
                hoverCell.y * gridSize + (baseWidth * gridSize) / 2
            );
            ctx.rotate(Math.PI / 2);
            ctx.fillRect(
                (-baseWidth * gridSize) / 2,
                (-baseHeight * gridSize) / 2,
                baseWidth * gridSize,
                baseHeight * gridSize
            );
            ctx.restore();
        } else {
            ctx.fillRect(
                hoverCell.x * gridSize,
                hoverCell.y * gridSize,
                baseWidth * gridSize,
                baseHeight * gridSize
            );
        }
    }
}

function checkOverlap(x, y, w, h) {
    for (const obj of placedObjects) {
        const objW = obj.rotated ? baseHeight : baseWidth;
        const objH = obj.rotated ? baseWidth : baseHeight;
        
        if (x < obj.x + objW &&
            x + w > obj.x &&
            y < obj.y + objH &&
            y + h > obj.y) {
            return true;
        }
    }
    return false;
}

function isPlacementValid(x, y, w, h) {
    // Check if within grid bounds
    if (x + w > gridWidth || y + h > gridHeight) {
        return false;
    }
    // Check for overlaps
    return !checkOverlap(x, y, w, h);
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    hoverCell = {
        x: Math.floor((e.clientX - rect.left) / gridSize),
        y: Math.floor((e.clientY - rect.top) / gridSize)
    };
    drawGrid();
});

canvas.addEventListener("click", (e) => {
    if (!e.shiftKey) {
        // Place object only if valid position
        const displayWidth = isRotated ? baseHeight : baseWidth;
        const displayHeight = isRotated ? baseWidth : baseHeight;
        
        if (isPlacementValid(hoverCell.x, hoverCell.y, displayWidth, displayHeight)) {
            placedObjects.push({
                x: hoverCell.x,
                y: hoverCell.y,
                w: baseWidth,
                h: baseHeight,
                rotated: isRotated
            });
            drawGrid();
        }
    }
});

// Handle both delete and rotation
canvas.addEventListener("click", (e) => {
    if (e.shiftKey) {
        // Delete object
        const index = placedObjects.findIndex(obj => {
            const objW = obj.rotated ? baseHeight : baseWidth;
            const objH = obj.rotated ? baseWidth : baseHeight;
            return hoverCell.x >= obj.x &&
                   hoverCell.x < obj.x + objW &&
                   hoverCell.y >= obj.y &&
                   hoverCell.y < obj.y + objH;
        });
        if (index !== -1) {
            placedObjects.splice(index, 1);
            drawGrid();
        }
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === 'r') {
        isRotated = !isRotated;
        drawGrid();
    }
});

canvas.addEventListener("mouseleave", () => {
    hoverCell = { x: -1, y: -1 };
    drawGrid();
});

// Initialize
drawGrid();