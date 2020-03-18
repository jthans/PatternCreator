$(document).ready(function () {
	var App = new Vue({
		el: '#drawSection',
		data: {
			gridSizeX: 12, // how many grid squares horizontally
			gridSizeY: 12, // how many grid squares vertically
			gridDotTolerance: 20, // number of pixels that trigger dot selection.ontext('2d');
			gridDots: [], // List of dots available in the App currently.
			drawnComponents: [], // any components that have been drawn on the screen
			drawnPolygons: [] // all detected polygons on this pattern, to be calculated.
		},
		methods: {

		}
	});

	class Draw {
		constructor() {
			this.c = $('#drawCanvas')[0];
			this.context = this.c.getContext("2d");

			this.gridDotDiameter = 10.0;
			this.gridEnabled = true;

			this.mouseDown = false;
			this.mouseX = 0;
			this.mouseY = 0;

			this.closestNode = null
			this.selectedNode = null

			this.registerEvents();
			this.reDraw();
		};

		calculatePolygons() {
			for (var i = 0; i < App.gridDots.length; i++) {
				this.calculatePolygonLoop(App.gridDots[i].index, App.gridDots[i].index, []);
			}

			this.cleanupPolygons();
			console.log(JSON.stringify(App.drawnPolygons));
		}

		calculatePolygonLoop(nextPoint, origPoint, visitedNodes) {
			var nextLines = this.getLinesWithPoint(nextPoint, origPoint, visitedNodes); 

			if (nextPoint == origPoint &&
				visitedNodes.length > 1) {
				if (isNull(App.drawnPolygons.filter(poly => areArraysEqual(poly.points, visitedNodes)))) {
					App.drawnPolygons.unshift(new Polygon(visitedNodes));
					return true;
				}

				return false;
			}

			if (isNull(nextLines)) {
				return false;
			}
			
			for (var i = 0; i < nextLines.length; i++) {
				var visitedNodesCopy = [...visitedNodes];
				var visitedNode = nextLines[i].points[0] == nextPoint ? nextLines[i].points[1] : nextLines[i].points[0];
				visitedNodesCopy.unshift(visitedNode);
				
				this.calculatePolygonLoop(visitedNode,
											origPoint,
											visitedNodesCopy);
			}
		}

		cleanupPolygons() {
			App.drawnPolygons.sort((a, b) => (a.points.length > b.points.length) ? 1 : -1); // Sorts the list of polygons by # of points, to make the algorithm a little more efficient.
			for (var i = 0; i < App.drawnPolygons.length; i++) {
				for (var j = 0; j < App.drawnPolygons.length; j++) {
					if (i == j) {
						continue; // We don't need to compare this polygon to itself.
					}

					var nonIntersectingPoints = App.drawnPolygons[i].points.filter(p => !App.drawnPolygons[j].points.includes(p));
					if (nonIntersectingPoints.length == App.drawnPolygons[i].points.length) {
						continue; // If this shape isn't touching other ones, we won't have any issues in merging polygons together.
					}

					for (var p = 0; p < nonIntersectingPoints.length; p++) {
						if (App.drawnPolygons[j].containsPoint(nonIntersectingPoints[p])) {
							App.drawnPolygons[j].isNested = true;
							break;
						}
					}
				}
			}

			App.drawnPolygons = App.drawnPolygons.filter(p => !p.isNested);
		}

		createGridDots() {
			// Draw a dot for each point needed in the grid.
			for (var i = 1; i < App.gridSizeY; i++) {
				var yLoc = i * (this.c.height / App.gridSizeY);

				for (var j = 1; j < App.gridSizeX; j++) {
					var xLoc = j * (this.c.width / App.gridSizeX);

					// Add the new dot to the cache.
					App.gridDots.push({
						index: App.gridDots.length,
						xLoc: xLoc,
						yLoc: yLoc,
						selected: false
					});
				}
			}
		}

		drawComponent(comp) {
			// Determine brush shape.
			this.context.lineCap = 'round';
			this.context.lineJoin = 'round';

			this.context.strokeStyle = 'rgba(0, 0, 0, 1)';
			this.context.lineWidth = 4;

			this.context.beginPath();

			this.context.moveTo(comp.x1, comp.y1);
			this.context.lineTo(comp.x2, comp.y2);

			this.context.stroke();

			this.context.closePath();
		}

		drawGridDots() {
			var defaultFillStyle = 'rgba(0, 0, 0, .2)';
			var selectedFillStyle = 'rgba(0, 0, 128, .2)';
			this.context.fillStyle = defaultFillStyle;

			for (var i = 0; i < App.gridDots.length; i++) {
				this.context.beginPath();

				var dotSize = this.gridDotDiameter;
				var fillColor = defaultFillStyle;

				if (App.gridDots[i].selected) {
					dotSize = 15;
					fillColor = selectedFillStyle;
				}

				this.context.rect(App.gridDots[i].xLoc - (dotSize / 2.0), App.gridDots[i].yLoc - (dotSize / 2.0), dotSize, dotSize);
				this.context.fillStyle = fillColor;

				this.context.fill();
				this.context.closePath();
			}
		};

		getLinesWithPoint(pointNum, origPoint, visitedNodes) {
			var foundLines = App.drawnComponents.filter(line => line.points.includes(pointNum));
			var finalLines = [];

			for (var i = 0; i < foundLines.length; i++) {
				if (((foundLines[i].points[0] == pointNum &&
					 !visitedNodes.includes(foundLines[i].points[1])) ||
					(foundLines[i].points[1] == pointNum &&
						!visitedNodes.includes(foundLines[i].points[0]))) &&
					(!foundLines[i].points.includes(origPoint) ||
						visitedNodes.length != 1)) {
					finalLines.unshift(foundLines[i]);
				}
			}
			
			return finalLines;
		}

		reDraw() {
			this.resizeCanvas();

			this.context.clearRect(0, 0, this.c.width, this.c.height);
			if (this.gridEnabled) {
				if (isNull(App.gridDots) ||
					App.gridDots.length <= 0) {
					this.createGridDots();
				}

				this.drawGridDots();
			}

			App.drawnComponents.forEach((item, i) => {
				this.drawComponent(item);
			});
		}

		registerEvents() {
			// Mouse Click
			this.c.addEventListener('mousedown', (e) => {
				if (!isNull(this.closestNode) &&
					!isNull(this.selectedNode) &&
					this.closestNode != this.selectedNode) {
					var matchingLine = App.drawnComponents.filter(line => line.isDrawn && isPair(line.points, this.selectedNode.index, this.closestNode.index));
					if (isNull(matchingLine)) {
						// "Harden" the given line.
						App.drawnComponents[0].isDrawn = true;
						App.drawnComponents[0].x2 = this.closestNode.xLoc;
						App.drawnComponents[0].y2 = this.closestNode.yLoc;
						App.drawnComponents[0].points = [this.selectedNode.index, this.closestNode.index];

						this.selectedNode = null;
						this.calculatePolygons();
					} else {
						App.drawnComponents.splice(0, 1);
						this.selectedNode = null;
					}
				} else if (!isNull(this.closestNode)) {
					this.selectedNode = this.closestNode;
				} else if (!isNull(this.selectedNode)) {
					App.drawnComponents.splice(0, 1);
					this.selectedNode = null;
				}

				this.reDraw();
			});

			// Mouse Click
			this.c.addEventListener('mousemove', (e) => {
				this.mouseX = e.offsetX;
				this.mouseY = e.offsetY;

				if (!isNull(this.selectedNode)) {
					if (App.drawnComponents.length > 0 &&
						!App.drawnComponents[0].isDrawn) {
						App.drawnComponents.splice(0, 1);
					}

					App.drawnComponents.unshift(new Line(this.selectedNode.xLoc, this.selectedNode.yLoc, this.mouseX, this.mouseY));
				}

				if (this.gridEnabled) {
					App.gridDots.forEach((item, i) => { item.selected = false; });

					// Search for the closest dot.
					var closestDotX = 0;
					var closestDotXLoc = 99999;

					// Iterate horizontally until we find the closest mapped X coordinate.
					for (var i = 0; i < App.gridSizeX; i++) {
						if (closestDotXLoc !== 99999 &&
							Math.abs(App.gridDots[i].xLoc - e.offsetX) > closestDotXLoc) {
							break;
						}

						if (Math.abs(App.gridDots[i].xLoc - e.offsetX) < closestDotXLoc) {
							closestDotX = i;
							closestDotXLoc = Math.abs(App.gridDots[i].xLoc - e.offsetX);
						}
					}

					var closestDotY = 0;
					var closestDotYLoc = 99999;

					// Now iterate vertically to find the closest Y coordinate.
					for (var j = 0; j < App.gridSizeY - 1; j++) {
						if (closestDotYLoc !== 99999 &&
							Math.abs(App.gridDots[(j * (App.gridSizeX - 1)) + closestDotX].yLoc - e.offsetY) > closestDotYLoc) {
							break;
						}

						if (Math.abs(App.gridDots[(j * (App.gridSizeX - 1)) + closestDotX].yLoc - e.offsetY) < closestDotYLoc) {
							closestDotY = j;
							closestDotYLoc = Math.abs(App.gridDots[(j * (App.gridSizeX - 1)) + closestDotX].yLoc - e.offsetY);
						}
					}

					// If the grid dot is within our range we need to highlight it as selected.
					if (closestDotXLoc <= App.gridDotTolerance &&
						closestDotYLoc <= App.gridDotTolerance) {
						App.gridDots[(closestDotY * (App.gridSizeX - 1)) + closestDotX].selected = true;
						this.closestNode = App.gridDots[(closestDotY * (App.gridSizeX - 1)) + closestDotX];
					}
					else {
						this.closestNode = null
					}

					this.reDraw();
				}
			});
		}

		resizeCanvas() {
			this.c.height = this.c.getBoundingClientRect().height;
			this.c.width =	this.c.getBoundingClientRect().width;
		}
	};

	class Line {
		constructor(xValOne, yValOne, xValTwo, yValTwo, points = null, isDrawn = false) {
			this.x1 = xValOne;
			this.y1 = yValOne;
			this.x2 = xValTwo;
			this.y2 = yValTwo;

			this.points = points;
			this.isDrawn = isDrawn;
		}
	}

	class Polygon {
		constructor(points) {
			this.isNested = false;
			this.points = points;
		}

		//	Determines if a given point exists within this polygon (within the confines of the lines created). This algorithm was found online, and modified to
		//   be more efficient for these cases.  For the point given, send a line from the point to the right (positive X) forever.  If this line intersects an odd
		//   number of lines on the polygon, it is inside the polygon.  If it's none or even, it is outside the polygon.  We'll go on a line-by-line basis here.
		containsPoint(p) {
			var pointInQuestion = App.gridDots[p];
			var numIntersections = 0;
			var intersectedX = [];

			for (var i = 0; i < this.points.length - 1; i++) {
				var polyLine = App.drawnComponents.filter(l => isPair(l.points, this.points[i], this.points[i + 1]))[0];
				var p1 = App.gridDots[polyLine.points[0]];
				var p2 = App.gridDots[polyLine.points[1]];

				// If this line of the polygon is entirely above or below the point, or if it's to the left of the point, it won't hit the line so skip it.
				if ((p1.yLoc > pointInQuestion.yLoc && // Line is entirely above the point.
					 p2.yLoc > pointInQuestion.yLoc) ||
					(p1.yLoc < pointInQuestion.yLoc && // Line is entirely below the point.
					 p2.yLoc < pointInQuestion.yLoc) ||
					(p1.xLoc <= pointInQuestion.xLoc && // Line is entirely to the left of the point.
					 p2.xLoc <= pointInQuestion.xLoc)) {
					continue;
				}

				// Calculating the equation of the line.
				var lineM = lineSlope(p1, p2);
				if (lineM == 0) {
					numIntersections++; // If it's a flat line, it definitely intersects if it's showing up now.
					continue;
				}

				var lineB = p2.yLoc - (lineM * p1.xLoc);
				
				// Calculate the intersection on the X axis - If it's greater than 
				var xIntersection = (pointInQuestion.yLoc - lineB) / lineM;
				if (xIntersection > pointInQuestion.xLoc &&
					!intersectedX.includes(xIntersection)) {
					numIntersections++;
					intersectedX.push(xIntersection);
				}
			}
			
			return numIntersections % 2 !== 0;
		}
	}

	var drawClass = new Draw();
});