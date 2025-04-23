const canvas = document.getElementById("planner-canvas");
const ctx = canvas.getContext("2d");
const shapeOptions = document.querySelectorAll(".shape-option");
const layoutSelector = document.getElementById("layout-selector");
const floorSelector = document.getElementById("floor-selector");

// State variables
let hoverCell = { x: -1, y: -1 };
let isRotated = false;
let baseWidth = 2;
let baseHeight = 2;
let currentShapeName = "Pot";

// Multi-floor support
let currentFloor = 1;
const floorPlans = {
    1: { 
        placedObjects: [], 
        gridSize: 30, 
        canvasWidth: 810, 
        canvasHeight: 810,
        currentLayout: "empty" 
    },
    2: { 
        placedObjects: [], 
        gridSize: 30, 
        canvasWidth: 810, 
        canvasHeight: 810,
        currentLayout: "empty" 
    }
};

// Layout configuration
let gridSize = 30;
let canvasWidth = 810;
let canvasHeight = 810;
let gridWidth = canvasWidth / gridSize;
let gridHeight = canvasHeight / gridSize;

// Object type colors
const objectColors = {
    "Pot": "#5a915d",
    "Packing Station": "#8a6d3b",
    "Bed": "#7b6888",
    "Large Storage Rack": "#a87c6f",
    "Medium Storage Rack": "#a87c6f",
    "Small Storage Rack": "#a87c6f",
    "Trash Can": "#666666",
    "Mixing Station": "#d0738c",
    "Drying Rack": "#d0a38c",
    "Brick Press": "#8c9fd0",
    "Chemistry Station": "#d08cbc",
    "Lab Oven": "#d08c8c",
    "Cauldron": "#8cbcd0",
    "Safe": "#18191a",
    "1x1": "#5a6270"
};

const objectPrices = {
    //"Air Pot w/ FSG": 360,
    "Pot": 360,
    "Packing Station": 750,
    "Bed": 150,
    "Large Storage Rack": 60,
    "Medium Storage Rack": 45,
    "Small Storage Rack": 30,
    "Trash Can": 25,
    "Mixing Station": 2000,
    "Drying Rack": 250,
    "Brick Press": 800,
    "Chemistry Station": 1000,
    "Lab Oven": 1000,
    "Cauldron": 3000,
    "Safe": 500,
    "1x1": 0
};

// Layout Templates with floor-specific configurations
const layoutTemplates = {
    empty: {
        name: "Empty Grid",
        floors: {
            1: {
                canvasWidth: 810,
                canvasHeight: 810,
                gridSize: 30,
                grid: []
            },
            2: {
                canvasWidth: 810,
                canvasHeight: 810,
                gridSize: 30,
                grid: []
            }
        }
    },
    bungalow: {
        name: "Bungalow Layout",
        floors: {
            1: {
                canvasWidth: 810, //27x27
                canvasHeight: 810,
                gridSize: 30,
                grid: [
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
                    {x: 1, y: 21, w: 2, h: 5, rotated: false, fixed: true},
                    {x: 3, y: 24, w: 6, h: 2, rotated: false, fixed: true}
                ]
            },
            2: {
                canvasWidth: 810,
                canvasHeight: 810,
                gridSize: 30,
                grid: [
                    {x: 0, y: 0, w: 27, h: 27, rotated: false, fixed: true}
                ]
            }
        }
    },
    motel: {
        name: "Motel Layout",
        floors: {
            1: {
                canvasWidth: 728,
                canvasHeight: 624,
                gridSize: 52,
                grid: [
                    {x: 0, y: 0, w: 14, h: 1, rotated: false, fixed: true},
                    {x: 0, y: 1, w: 1, h: 11, rotated: false, fixed: true},
                    {x: 1, y: 11, w: 12, h: 1, rotated: false, fixed: true},
                    {x: 13, y: 1, w: 1, h: 11, rotated: false, fixed: true},
                    {x: 8, y: 7, w: 6, h: 5, rotated: false, fixed: true},
                    {x: 1, y: 2, w: 2, h: 3, rotated: false, fixed: true}
                ]
            },
            2: {
                canvasWidth: 728,
                canvasHeight: 624,
                gridSize: 52,
                grid: [
                    {x: 0, y: 0, w: 14, h: 1, rotated: false, fixed: true},
                    {x: 0, y: 1, w: 1, h: 11, rotated: false, fixed: true},
                    {x: 13, y: 1, w: 1, h: 11, rotated: false, fixed: true},
                    {x: 1, y: 11, w: 12, h: 1, rotated: false, fixed: true},
                    {x: 3, y: 3, w: 8, h: 6, rotated: false, fixed: true}
                ]
            }
        }
    },
    sweatshop: {
        name: "Sweatshop",
        floors: {
            1: {
                canvasWidth: 798,
                canvasHeight: 588,
                gridSize: 42,
                grid: [
                    {x: 0, y: 0, w: 19, h: 1, rotated: false, fixed: true},
                    {x: 0, y: 1, w: 1, h: 13, rotated: false, fixed: true},
                    {x: 1, y: 1, w: 2, h: 2, rotated: false, fixed: true},
                    {x: 1, y: 13, w: 18, h: 1, rotated: false, fixed: true},
                    {x: 18, y: 1, w: 1, h: 13, rotated: false, fixed: true},
                    {x: 10, y: 1, w: 2, h: 2, rotated: false, fixed: true},
                    {x: 10, y: 7, w: 9, h: 7, rotated: false, fixed: true}
                ]
            },
            2: {
                canvasWidth: 798,
                canvasHeight: 588,
                gridSize: 42,
                grid: [
                    {x: 0, y: 0, w: 19, h: 1, rotated: false, fixed: true},
                    {x: 0, y: 1, w: 1, h: 13, rotated: false, fixed: true},
                    {x: 18, y: 1, w: 1, h: 13, rotated: false, fixed: true},
                    {x: 1, y: 13, w: 17, h: 1, rotated: false, fixed: true},
                    {x: 5, y: 5, w: 9, h: 4, rotated: false, fixed: true}
                ]
            }
        }
    },
    barn: {
        name: "Barn",
        floors: {
            1: {
                canvasWidth: 800, //32x39
                canvasHeight: 975,
                gridSize: 25,
                grid: [
                    {x: 0, y: 0, w: 32, h: 1, rotated: false, fixed: true},
                    {x: 0, y: 1, w: 1, h: 38, rotated: false, fixed: true},
                    {x: 1, y: 38, w: 31, h: 1, rotated: false, fixed: true},
                    {x: 31, y: 1, w: 1, h: 37, rotated: false, fixed: true},

                    {x: 10, y: 1, w: 8, h: 4, rotated: false, fixed: true},

                    {x: 1, y: 1, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 21, y: 1, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 30, y: 1, w: 1, h: 1, rotated: false, fixed: true},

                    {x: 1, y: 10, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 10, y: 10, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 21, y: 10, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 30, y: 10, w: 1, h: 1, rotated: false, fixed: true},

                    {x: 1, y: 19, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 10, y: 19, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 21, y: 19, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 30, y: 19, w: 1, h: 1, rotated: false, fixed: true},

                    {x: 1, y: 28, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 10, y: 28, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 21, y: 28, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 30, y: 28, w: 1, h: 1, rotated: false, fixed: true},

                    {x: 1, y: 37, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 10, y: 37, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 21, y: 37, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 30, y: 37, w: 1, h: 1, rotated: false, fixed: true},
                ]
            },
            2: {
                canvasWidth: 800, //32x39
                canvasHeight: 975,
                gridSize: 25,
                grid: [
                    {x: 10, y: 10, w: 1, h: 1, rotated: false, fixed: true},
                    {x: 20, y: 10, w: 1, h: 1, rotated: false, fixed: true},

                    {x: 9, y: 0, w: 1, h: 20, rotated: false, fixed: true},
                    {x: 21, y: 0, w: 1, h: 20, rotated: false, fixed: true},

                    {x: 10, y: 0, w: 11, h: 5, rotated: false, fixed: true},
                    {x: 10, y: 19, w: 11, h: 1, rotated: false, fixed: true},
                ]
            }
        }
    }
};

// Initialize with empty layout
initializeCanvas(layoutTemplates.empty.floors[1]);

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

// Floor selection
floorSelector.addEventListener("change", () => {
    currentFloor = parseInt(floorSelector.value);
    loadFloor(currentFloor);
});

function initializeCanvas(layout) {
    canvasWidth = layout.canvasWidth;
    canvasHeight = layout.canvasHeight;
    gridSize = layout.gridSize;
    gridWidth = canvasWidth / gridSize;
    gridHeight = canvasHeight / gridSize;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
}

function applyLayout(layoutName) {
    // Update both floors to use this layout
    floorPlans[1].currentLayout = layoutName;
    floorPlans[2].currentLayout = layoutName;
    
    // Clear only non-fixed objects for current floor
    floorPlans[currentFloor].placedObjects = 
        floorPlans[currentFloor].placedObjects.filter(obj => !obj.fixed);
    
    if (layoutName !== "empty" && layoutTemplates[layoutName]) {
        const layout = layoutTemplates[layoutName];
        
        // Apply layout to current floor
        const floorLayout = layout.floors[currentFloor] || layout.floors[1];
        initializeCanvas(floorLayout);
        
        // Update floor dimensions
        floorPlans[currentFloor].canvasWidth = floorLayout.canvasWidth;
        floorPlans[currentFloor].canvasHeight = floorLayout.canvasHeight;
        floorPlans[currentFloor].gridSize = floorLayout.gridSize;
        
        // Add fixed objects from layout
        floorPlans[currentFloor].placedObjects.push(...JSON.parse(JSON.stringify(floorLayout.grid)));
    } else {
        const emptyLayout = layoutTemplates.empty.floors[currentFloor] || layoutTemplates.empty.floors[1];
        initializeCanvas(emptyLayout);
        
        // Update floor dimensions
        floorPlans[currentFloor].canvasWidth = emptyLayout.canvasWidth;
        floorPlans[currentFloor].canvasHeight = emptyLayout.canvasHeight;
        floorPlans[currentFloor].gridSize = emptyLayout.gridSize;
    }
    
    drawGrid();
    updateCostCalculator();
}

function loadFloor(floorNumber) {
    currentFloor = floorNumber;
    const floor = floorPlans[floorNumber];
    
    // Load the current layout for this floor
    const layoutName = floor.currentLayout || "empty";
    
    if (layoutName !== "empty" && layoutTemplates[layoutName]) {
        const layout = layoutTemplates[layoutName];
        const floorLayout = layout.floors[floorNumber] || layout.floors[1];
        
        initializeCanvas(floorLayout);
        
        // Update floor dimensions
        floorPlans[floorNumber].canvasWidth = floorLayout.canvasWidth;
        floorPlans[floorNumber].canvasHeight = floorLayout.canvasHeight;
        floorPlans[floorNumber].gridSize = floorLayout.gridSize;
        
        // Clear only non-fixed objects
        floorPlans[floorNumber].placedObjects = 
            floorPlans[floorNumber].placedObjects.filter(obj => !obj.fixed);
        
        // Add fixed objects from layout
        floorPlans[floorNumber].placedObjects.push(...JSON.parse(JSON.stringify(floorLayout.grid)));
    } else {
        const emptyLayout = layoutTemplates.empty.floors[floorNumber] || layoutTemplates.empty.floors[1];
        initializeCanvas(emptyLayout);
        
        // Update floor dimensions
        floorPlans[floorNumber].canvasWidth = emptyLayout.canvasWidth;
        floorPlans[floorNumber].canvasHeight = emptyLayout.canvasHeight;
        floorPlans[floorNumber].gridSize = emptyLayout.gridSize;
    }
    
    drawGrid();
    
    // Update the layout selector to show current floor's layout
    layoutSelector.value = floor.currentLayout || "empty";
    updateCostCalculator();
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

    // Draw placed objects for current floor
    for (const obj of floorPlans[currentFloor].placedObjects) {
        const color = obj.fixed ? "#6a6a6a" : (objectColors[obj.name] || "#5a915d");
        drawObject(obj.x, obj.y, obj.w, obj.h, obj.rotated, false, color, obj.fixed, obj.name);
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
            baseWidth,  // Use original dimensions
            baseHeight, // Use original dimensions
            isRotated,  // Pass the rotation state
            true, 
            canPlace ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 0, 0, 0.5)"
        );
    }
}


function drawObject(x, y, w, h, rotated, isPreview, fillColor, isFixed = false, name = "") {
    function darkenColor(color, percent) {
        if (color === "#6a6a6a") return "#444";
        if (color.startsWith("rgba")) return "rgba(0, 0, 0, 0.7)";
        
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    const outline = isPreview ? "rgba(0, 0, 0, 0.7)" : darkenColor(fillColor, 30);
    
    ctx.save();
    
    // For preview and placed objects, use the same rotation logic
    if (rotated) {
        // Calculate center point for rotation
        const centerX = x * gridSize + (h * gridSize) / 2;
        const centerY = y * gridSize + (w * gridSize) / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(-w*gridSize/2, -h*gridSize/2, w*gridSize, h*gridSize);
        
        if (!isPreview) {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 2;
            ctx.strokeRect(-w*gridSize/2, -h*gridSize/2, w*gridSize, h*gridSize);
            
            if (name) {
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(name, 0, 0, w*gridSize - 10);
            }
        }
    } else {
        ctx.translate(x * gridSize, y * gridSize);
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, w*gridSize, h*gridSize);
        
        if (!isPreview) {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, w*gridSize, h*gridSize);
            
            if (name) {
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    name, 
                    w*gridSize/2, 
                    h*gridSize/2, 
                    w*gridSize - 10
                );
            }
        }
    }
    ctx.restore();
}

function checkOverlap(x, y, w, h) {
    for (const obj of floorPlans[currentFloor].placedObjects) {
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
            const index = floorPlans[currentFloor].placedObjects.findIndex(obj => {
                if (obj.fixed) return false;
                
                const objW = obj.rotated ? obj.h : obj.w;
                const objH = obj.rotated ? obj.w : obj.h;
                return gridX >= obj.x &&
                       gridX < obj.x + objW &&
                       gridY >= obj.y &&
                       gridY < obj.y + objH;
            });
            if (index !== -1) {
                floorPlans[currentFloor].placedObjects.splice(index, 1);
                drawGrid();
            }
        } else {
            const displayWidth = isRotated ? baseHeight : baseWidth;
            const displayHeight = isRotated ? baseWidth : baseHeight;
            
            if (gridX >= 0 && gridY >= 0 &&
                gridX + displayWidth <= gridWidth &&
                gridY + displayHeight <= gridHeight &&
                !checkOverlap(gridX, gridY, displayWidth, displayHeight)) {
                floorPlans[currentFloor].placedObjects.push({
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
    updateCostCalculator();
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



document.getElementById('clear-button').addEventListener('click', clearAllFloors);

// Add clear button event listener
// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the buttons
    const clearButton = document.getElementById('clear-button');
    const exportButton = document.getElementById('export-button');
    const importButton = document.getElementById('import-button');
    
    // Add event listeners
    if (clearButton) {
        clearButton.addEventListener('click', clearAllFloors);
    } else {
        console.error("Clear button not found!");
    }
    
    if (exportButton) {
        exportButton.addEventListener('click', exportLayout);
    }
    
    if (importButton) {
        importButton.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.addEventListener('change', handleFileImport);
            fileInput.click();
        });
    }
});

function clearAllFloors() {
    // Reset both floors completely
    floorPlans[1] = { 
        placedObjects: [], 
        gridSize: 30, 
        canvasWidth: 810, 
        canvasHeight: 810,
        currentLayout: "empty"
    };
    floorPlans[2] = { 
        placedObjects: [], 
        gridSize: 30, 
        canvasWidth: 810, 
        canvasHeight: 810,
        currentLayout: "empty"
    };
    
    // Reset UI and apply empty layout
    currentFloor = 1;
    document.getElementById('floor-selector').value = "1";
    document.getElementById('layout-selector').value = "empty";
    applyLayout("empty");
    
    console.log("All floors cleared");
    updateCostCalculator();
}

function exportLayout() {
    const exportData = {
        version: 1,
        floors: {},
        currentFloor: currentFloor,
        currentLayout: floorPlans[currentFloor].currentLayout
    };

    // Prepare floor data for export
    for (const floorNum in floorPlans) {
        exportData.floors[floorNum] = {
            placedObjects: floorPlans[floorNum].placedObjects,
            canvasWidth: floorPlans[floorNum].canvasWidth,
            canvasHeight: floorPlans[floorNum].canvasHeight,
            gridSize: floorPlans[floorNum].gridSize,
            currentLayout: floorPlans[floorNum].currentLayout
        };
    }

    // Create download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `property-layout-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the imported data
            if (!importedData.floors || !importedData.currentFloor) {
                throw new Error("Invalid file format");
            }

            // Import each floor
            for (const floorNum in importedData.floors) {
                if (floorPlans[floorNum]) {
                    floorPlans[floorNum] = {
                        ...floorPlans[floorNum],
                        ...importedData.floors[floorNum]
                    };
                }
            }

            // Set current floor and layout
            currentFloor = importedData.currentFloor;
            floorSelector.value = currentFloor;
            
            // Load the imported layout
            const layoutToLoad = importedData.currentLayout || "empty";
            layoutSelector.value = layoutToLoad;
            applyLayout(layoutToLoad);

            alert('Layout imported successfully!');
        } catch (error) {
            console.error("Import error:", error);
            alert('Error importing layout. Please check the file and try again.');
        }
    };
    reader.readAsText(file);
}

function updateCostCalculator() {
    const costItemsContainer = document.getElementById('cost-items');
    const costTotalElement = document.getElementById('cost-total');
    
    if (!costItemsContainer || !costTotalElement) return;
    
    // Clear previous items
    costItemsContainer.innerHTML = '';
    
    let totalCost = 0;
    const itemCounts = {};
    
    // Count all items from both floors
    for (const floorNum in floorPlans) {
        floorPlans[floorNum].placedObjects.forEach(obj => {
            if (!obj.fixed && objectPrices[obj.name] !== undefined) {
                const price = objectPrices[obj.name];
                if (!itemCounts[obj.name]) {
                    itemCounts[obj.name] = { count: 0, price: price };
                }
                itemCounts[obj.name].count++;
                totalCost += price;
            }
        });
    }
    
    // Add items to display
    for (const [itemName, data] of Object.entries(itemCounts)) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cost-item';
        itemElement.innerHTML = `
            <span>${itemName} (${data.count})</span>
            <span>$${data.price * data.count}</span>
        `;
        costItemsContainer.appendChild(itemElement);
    }
    
    // Update total
    costTotalElement.textContent = `Total: $${totalCost}`;
}

// Initialize with empty grid
applyLayout("empty");
updateCostCalculator();