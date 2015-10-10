

// http://stackoverflow.com/questions/8934877/obtain-smallest-value-from-array-in-javascript
Array.max = function( array ){
    return Math.max.apply( Math, array );
};

// Basically indexOf, but returns an array of all matching indices
//  rather than the index of the first match.
function indicesOf(array, value) {
    var indices = [];
    for (var i=0; i<array.length; i++) {
        if (array[i] == value) {
            indices.push(i);
        };
    };
    
    return indices;
};

function toRadians (degrees) {
    return degrees * (Math.PI/180);
}

// Draw a triangle at a specified point, with
//  a specified color & angle (in degrees; 0 is vertical)
function drawTriangle(ctx, x, y, angle, color) {
    var oldFillStyle = ctx.fillStyle;
    //var angle = angle+180;
    ctx.fillStyle = color;
    
    var length = 5;
    var radians = toRadians(angle);
    var radians1 = toRadians(angle + 120);
    var radians2 = toRadians(angle + 240);
    
    // Cosine = vertical transformation.
    // Sine = horizontal transformation.
    
    
    var path = new Path2D();
    path.moveTo(x + Math.sin(radians)*length, y + Math.cos(radians)*length); 
    path.lineTo(x + Math.sin(radians1)*length, y + Math.cos(radians1)*length); 
    path.lineTo(x + Math.sin(radians2)*length, y + Math.cos(radians2)*length); 
    ctx.fill(path);
    ctx.fillStyle = oldFillStyle;
    
    
    //ctx.fillText(direction.toString(), center_x, center_y);
};

// Flow direction proceeds clockwise starting top left;
//  0 = NW, 1 = N, 2 = NE, etc.
//  -1 = sink & edges.
// This is the D8 "lowest height" method:
//  http://spatial-analyst.net/ILWIS/htm/ilwisapp/flow_direction_algorithm.htm
function flowDirection(dem) {
    var height = dem.length;
    var width  = dem[0].length;
    var flowDirection = [];
    
    for (var i=0; i<height; i++) {
    //for (var i=0; i<2; i++) {
        flowDirection[i] = [];
        for (var j=0; j<width; j++) {
        //for (var j=0; j<2; j++) {
            // Edges are always assigned -1.
            if (i == 0 || j == 0 || i == (height-1) || j == (width-1)) {
                flowDirection[i][j] = -1;
            } else {
                var elev = dem[i][j];
                
                var nw = elev - dem[i-1][j-1];
                var n  = elev - dem[i-1][j];
                var ne = elev - dem[i-1][j+1];
                var w  = elev - dem[i][j-1];
                var e  = elev - dem[i][j+1];
                var sw = elev - dem[i+1][j-1];
                var s  = elev - dem[i+1][j];
                var se = elev - dem[i+1][j+1];
                
                var neighborHeightDiff = [nw, n, ne, e, se, s, sw, w];
                var max = Array.max(neighborHeightDiff);
                
                if (max < 0) {
                    flowDirection[i][j] = -1;
                } else {
                    var directions = indicesOf(neighborHeightDiff, max);
                    var k = Math.floor(Math.random() * directions.length);
                    flowDirection[i][j] = directions[k];
                };
            };
        };
    };
    return flowDirection;
};

var landscape = [
    [1,2,3,4,5,4,3,2,1,1],
    [1,2,3,4,5,4,3,2,1,1],
    [1,2,3,4,5,4,3,2,1,1],
    [1,2,3,4,4,4,3,2,1,1],
    [1,2,3,4,3,4,3,2,1,1],
    [1,2,3,4,3,4,3,2,1,1],
    [1,2,3,4,4,4,3,2,1,1],
    [1,2,3,4,5,4,3,2,1,1],
    [1,2,3,4,5,4,3,2,1,1],
    [1,2,3,4,5,4,3,2,1,1],
];

var rasterHeight = 10;
var rasterWidth  = 10;

var canvasHeight = 500;
var canvasWidth  = 500;

var cellHeight = canvasHeight / rasterHeight;
var cellWidth  = canvasWidth  / rasterWidth;

var flowDir = flowDirection(landscape);

var max = 0;
for (var i=0; i<landscape.length; i++) {
    var currentRow = landscape[i];
    var rowMax = Array.max(currentRow);
    max =  rowMax > max ? rowMax : max;
};

var elevationColorScale = 255/max;

var canvas = document.getElementById("gameViewport");
var ctx = canvas.getContext("2d");

// Draw the DEM as a raster on a canvas
for (var i=0; i<landscape.length; i++) {
    for (var j=0; j<landscape[i].length; j++) {
        var color = "rgb(" + Math.round(landscape[i][j]*elevationColorScale).toString() + ", 50, 50)";
        ctx.fillStyle = color;
        ctx.fillRect(j*cellHeight, i*cellWidth, cellHeight, cellWidth);
    };
};

// Draw the flow direction raster on a canvas
//  On each cycle, draw the arrow for the neighboring
//  cells ONLY if they flow into the center cell.
for (var i=0; i<flowDir.length; i++) {
    for (var j=0; j<flowDir[i].length; j++) {
        var height = flowDir.length;
        var width  = flowDir[0].length;
        var direction = flowDir[i][j];
        
        // Direction is from 0 to 7.  
        //  -1 means no outflow.
        //  0 is NW, 1 is N, etc.
        if (direction >= 0) {
            var color = "rgb(255, 255, 255)";
            var arrowColor = "rgb(200,200,200";
            ctx.fillStyle = color;
            
            var center_x = (j * cellHeight) + (cellWidth/2);
            var center_y = (i * cellWidth) + (cellHeight/2);
            
            var west_x = center_x - cellWidth;
            var east_x = center_x + cellWidth;
            
            var north_y = center_y - cellWidth;
            var south_y = center_y + cellWidth;
            
            var path = new Path2D();
            
            if (direction == 0) {
                path.moveTo(center_x,center_y); 
                path.lineTo(west_x, north_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 225, arrowColor);
            };
            if (direction == 1) {
                path.moveTo(center_x,center_y); 
                path.lineTo(center_x, north_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 180, arrowColor);
            };
            if (direction == 2) {
                path.moveTo(center_x,center_y); 
                path.lineTo(east_x, north_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 135, arrowColor);
            };
            if (direction == 3) {
                path.moveTo(center_x,center_y); 
                path.lineTo(east_x, center_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 90, arrowColor);
            };
            if (direction == 4) {
                path.moveTo(center_x,center_y); 
                path.lineTo(east_x, south_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 45, arrowColor);
            };
            if (direction == 5) {
                path.moveTo(center_x,center_y); 
                path.lineTo(center_x, south_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 0, arrowColor);
            };
            if (direction == 6) {
                path.moveTo(center_x,center_y); 
                path.lineTo(west_x, south_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 315, arrowColor);
            };
            if (direction == 7) {
                path.moveTo(center_x,center_y); 
                path.lineTo(west_x, center_y);
                ctx.stroke(path);
                
                drawTriangle(ctx, center_x, center_y, 270, arrowColor);
            };
            
        };
    };
};

