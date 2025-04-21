const canvas = document.getElementById("planner-canvas");
const ctx = canvas.getContext("2d");
const shapeOptions = document.querySelectorAll(".shape-option");
const layoutSelector = document.getElementById("layout-selector");

// Grid configuration
const gridSize = 30;
const canvasWidth = 810;
const canvasHeight = 810;
const gridWidth = canvasWidth / gridSize;
const gridHeight = canvasHeight / gridSize;

// State variables
let placedObjects = [];
let hoverCell = { x: -1, y: -1 };
let isRotated = false;
let baseWidth = 2;
let baseHeight = 2;
let currentShapeName = "Pot or Grow tent";

// Object type colors
const objectColors = {
    "Pot or Grow tent": "#5a915d", // Green
    "Packing Station": "#8a6d3b", // Brown
    "Bed": "#7b6888", // Purple
    "Large Storage Rack": "#a87c6f", // Tan
    "Medium Storage Rack": "#a87c6f", // Tan
    "Small Storage Rack": "#a87c6f", // Tan
    "Trash Can": "#666666", // Gray
    "Mixing Station": "#d0738c", // Pink
    "Drying Rack": "#d0a38c", // Light brown
    "Brick Press": "#8c9fd0", // Blue
    "Chemistry Station": "#d08cbc", // Light purple
    "Lab Oven": "#d08c8c", // Red
    "Cauldron": "#8cbcd0" // Teal
};

// Layout Templates
const layoutTemplates = {
    empty: {
        name: "Empty Grid",
        grid: []
    },
    bungalow: {
        name: "Bungalow Layout",
        grid: [
            // Outer walls
            {x: 0, y: 0, w: 13, h: 1, rotated: false, fixed: true},
            {x: 13, y: 0, w: 14, h: 14, rotated: false, fixed: true},
            {x: 0, y: 1, w: 1, h: 26, rotated: false, fixed: true},
            {x: 26, y: 14, w: 1, h: 13, rotated: false, fixed: true},
            {x: 1, y: 26, w: 25, h: 1, rotated: false, fixed: true},
            {x: 16, y: 14, w: 2, h: 2, rotated: false, fixed: true},
            {x: 13, y: 14, w: 1, h: 1, rotated: false, fixed: true},
            {x: 13, y: 17, w: 1, h: 6, rotated: false, fixed: true},
            {x: 13, y: 25, w: 1, h: 1, rotated: false, fixed: true},
            {x: 1, y: 13, w: 12, h: 1, rotated: false, fixed: true},
            {x: 6, y: 11, w: 2, h: 5, rotated: false, fixed: true},
            // Central blocks
            {x: 1, y: 21, w: 2, h: 5, rotated: false, fixed: true},
            {x: 3, y: 24, w: 6, h: 2, rotated: false, fixed: true}
        ]
    },
    stadium: {
        name: "Stadium Layout",
        grid: [
            // Outer walls
            {x: 0, y: 0, w: 20, h: 1, rotated: false, fixed: true},
            {x: 0, y: 14, w: 20, h: 1, rotated: false, fixed: true},
            {x: 0, y: 1, w: 1, h: 13, rotated: false, fixed: true},
            {x: 19, y: 1, w: 1, h: 13, rotated: false, fixed: true},
            // Central pitch
            {x: 6, y: 4, w: 8, h: 6, rotated: false, fixed: true}
        ]
    },
    divided: {
        name: "Divided Layout",
        grid: [
            // Outer walls
            {x: 0, y: 0, w: 20, h: 1, rotated: false, fixed: true},
            {x: 0, y: 14, w: 20, h: 1, rotated: false, fixed: true},
            {x: 0, y: 1, w: 1, h: 13, rotated: false, fixed: true},
            {x: 19, y: 1, w: 1, h: 13, rotated: false, fixed: true},
            // Dividing walls
            {x: 7, y: 1, w: 1, h: 13, rotated: false, fixed: true},
            {x: 13, y: 1, w: 1, h: 13, rotated: false, fixed: true}
        ]
    }
};

// Initialize canvas
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Shape selection
shapeOptions.forEach(option => {
    option.addEventListener("click", () => {
        shapeOptions.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
        baseWidth = parseInt(option.dataset.width);
        baseHeight = parseInt(option.dataset.height);
        currentShapeName = option.textContent;
        drawGrid();
    });
});

// Layout selection
layoutSelector.addEventListener("change", () => {
    const selectedLayout = layoutSelector.value;
    applyLayout(selectedLayout);
});

function applyLayout(layoutName) {
    // Clear existing fixed objects
    placedObjects = placedObjects.filter(obj => !obj.fixed);
    
    // Add new layout objects if not empty
    if (layoutName !== "empty" && layoutTemplates[layoutName]) {
        placedObjects.push(...JSON.parse(JSON.stringify(layoutTemplates[layoutName].grid)));
    }
    
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width, y + 0.5);
        ctx.stroke();
    }

    // Draw placed objects with their specific colors
    for (const obj of placedObjects) {
        const color = obj.fixed ? "#6a6a6a" : (objectColors[obj.name] || "#5a915d");
        drawObject(obj.x, obj.y, obj.w, obj.h, obj.rotated, false, color, obj.fixed);
    }

    // Draw hover preview
    if (hoverCell.x >= 0 && hoverCell.y >= 0) {
        const displayWidth = isRotated ? baseHeight : baseWidth;
        const displayHeight = isRotated ? baseWidth : baseHeight;
        
        const outOfBounds = hoverCell.x < 0 || 
                          hoverCell.y < 0 ||
                          hoverCell.x + displayWidth > gridWidth || 
                          hoverCell.y + displayHeight > gridHeight;
        
        const canPlace = !outOfBounds && !checkOverlap(hoverCell.x, hoverCell.y, displayWidth, displayHeight);
        
        drawObject(
            hoverCell.x, 
            hoverCell.y, 
            baseWidth, 
            baseHeight, 
            isRotated, 
            true, 
            canPlace ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 0, 0, 0.5)"
        );
    }
}

function drawObject(x, y, w, h, rotated, isPreview, fillColor, isFixed = false) {
    const outline = isFixed ? "#444" : "rgb(0, 0, 0)";
    
    if (rotated) {
        ctx.save();
        ctx.translate(
            x * gridSize + (h * gridSize) / 2,
            y * gridSize + (w * gridSize) / 2
        );
        ctx.rotate(Math.PI / 2);
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(
            (-w * gridSize) / 2,
            (-h * gridSize) / 2,
            w * gridSize,
            h * gridSize
        );
        
        if (!isPreview) {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                (-w * gridSize) / 2,
                (-h * gridSize) / 2,
                w * gridSize,
                h * gridSize
            );
        }
        
        ctx.restore();
    } else {
        ctx.fillStyle = fillColor;
        ctx.fillRect(
            x * gridSize,
            y * gridSize,
            w * gridSize,
            h * gridSize
        );
        
        if (!isPreview) {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                x * gridSize,
                y * gridSize,
                w * gridSize,
                h * gridSize
            );
        }
    }
}

function checkOverlap(x, y, w, h) {
    for (const obj of placedObjects) {
        const objW = obj.rotated ? obj.h : obj.w;
        const objH = obj.rotated ? obj.w : obj.h;
        
        if (x < obj.x + objW &&
            x + w > obj.x &&
            y < obj.y + objH &&
            y + h > obj.y) {
            return true;
        }
    }
    return false;
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (mouseX >= 0 && mouseX < canvas.width && mouseY >= 0 && mouseY < canvas.height) {
        hoverCell = {
            x: Math.floor(mouseX / gridSize),
            y: Math.floor(mouseY / gridSize)
        };
        drawGrid();
    } else {
        hoverCell = { x: -1, y: -1 };
        drawGrid();
    }
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (mouseX >= 0 && mouseX < canvas.width && mouseY >= 0 && mouseY < canvas.height) {
        const gridX = Math.floor(mouseX / gridSize);
        const gridY = Math.floor(mouseY / gridSize);
        
        if (e.shiftKey) {
            // Delete object (but not fixed ones)
            const index = placedObjects.findIndex(obj => {
                if (obj.fixed) return false;
                
                const objW = obj.rotated ? obj.h : obj.w;
                const objH = obj.rotated ? obj.w : obj.h;
                return gridX >= obj.x &&
                       gridX < obj.x + objW &&
                       gridY >= obj.y &&
                       gridY < obj.y + objH;
            });
            if (index !== -1) {
                placedObjects.splice(index, 1);
                drawGrid();
            }
        } else {
            // Place object
            const displayWidth = isRotated ? baseHeight : baseWidth;
            const displayHeight = isRotated ? baseWidth : baseHeight;
            
            if (gridX >= 0 && gridY >= 0 &&
                gridX + displayWidth <= gridWidth &&
                gridY + displayHeight <= gridHeight &&
                !checkOverlap(gridX, gridY, displayWidth, displayHeight)) {
                placedObjects.push({
                    x: gridX,
                    y: gridY,
                    w: baseWidth,
                    h: baseHeight,
                    rotated: isRotated,
                    fixed: false,
                    name: currentShapeName
                });
                drawGrid();
            }
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

// Initialize with empty grid
applyLayout("empty");