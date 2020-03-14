$(document).ready(function () {
	var App = new Vue({
		el: '#drawSection',
		data: {
			gridSizeX: 12, // how many grid squares horizontally
			gridSizeY: 12, // how many grid squares vertically
			gridDotTolerance: 20, // number of pixels that trigger dot selection.
			drawnComponents: [], // any components that have been drawn on the screen
			drawnPolygons: [] // all detected polygons on this pattern, to be calculated.
		},
		methods: {

		}
	});

	class Draw {	
		constructor() {
			this.c = $('#drawCanvas')[0];
			this.context = this.c.getContext('2d');

			this.gridDots = [];
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
			for (var i = 0; i < this.gridDots.length; i++) {
				this.calculatePolygonLoop(null, this.gridDots[i].index, []);
			}

			alert(JSON.stringify(App.drawnPolygons));
		}

		calculatePolygonLoop(nextPoint, origPoint, visitedNodes) {
			var nextLines = this.getLinesWithPoint(nextPoint, visitedNodes);
			if (nextPoint = origPoint) {
				visitedNodes.unshift(origPoint);
				App.drawnPolygons.unshift(new Polygon(visitedNodes));
				return true;
			}

			if (isNull(nextLines)) {
				return false;
			}

			for (var i = 0; i < nextLines.length; i++) {
				visitedNodes.unshift(nextPoint);
				return this.calculatePolygonLoop(nextLines[i].points[0] == nextPoint ? nextLines[i].points[1] : nextLines[i].points[0],
													origPoint,
													visitedNodes);
			}
		}

		createGridDots() {
			// Draw a dot for each point needed in the grid.
			var dotIndex = 0;
			for (var i = 1; i < App.gridSizeY; i++) {
				var yLoc = i * (this.c.height / App.gridSizeY);

				for (var j = 1; j < App.gridSizeX; j++) {
					var xLoc = j * (this.c.width / App.gridSizeX);

					// Add the new dot to the cache.
					this.gridDots.push({
						index: dotIndex++,
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

			for (var i = 0; i < this.gridDots.length; i++) {
				this.context.beginPath();

				var dotSize = this.gridDotDiameter;
				var fillColor = defaultFillStyle;

				if (this.gridDots[i].selected) {
					dotSize = 15;
					fillColor = selectedFillStyle;
				}

				this.context.rect(this.gridDots[i].xLoc - (dotSize / 2.0), this.gridDots[i].yLoc - (dotSize / 2.0), dotSize, dotSize);
				this.context.fillStyle = fillColor;

				this.context.fill();
				this.context.closePath();
			}
		};

		getLinesWithPoint(pointNum, visitedNodes) {
			var foundLines = App.drawnComponents.filter(line => line.points.includes(pointNum));
			var finalLines = [];

			for (var i = 0; i < foundLines.length; i++) {
				if ((foundLines[i].points[0] == pointNum &&
					 !visitedNodes.includes(foundLines[i].points[1])) ||
					(foundLines[i].points[1] == pointNum &&
					 !visitedNodes.includes(foundLines[i].points[0]))) {
					finalLines.unshift(foundLines[i]);
				}
			}

			return finalLines;
		}

		reDraw() {
			this.resizeCanvas();

			this.context.clearRect(0, 0, this.c.width, this.c.height);
			if (this.gridEnabled) {
				if (isNull(this.gridDots) ||
					this.gridDots.length <= 0) {
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
					!isNull(this.selectedNode)) {
					// "Harden" the given line.
					App.drawnComponents[0].isDrawn = true;
					App.drawnComponents[0].x2 = this.closestNode.xLoc;
					App.drawnComponents[0].y2 = this.closestNode.yLoc;
					App.drawnComponents[0].points = [this.selectedNode, this.closestNode];

					this.selectedNode = null;
				} else if (!isNull(this.closestNode)) {
					this.selectedNode = this.closestNode;
				} else if (!isNull(this.selectedNode)) {
					App.drawnComponents.splice(0, 1);
					this.selectedNode = null;
				}

				this.reDraw();
				this.calculatePolygons();
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
					this.gridDots.forEach((item, i) => { item.selected = false; });

					// Search for the closest dot.
					var closestDotX = 0;
					var closestDotXLoc = 99999;

					// Iterate horizontally until we find the closest mapped X coordinate.
					for (var i = 0; i < App.gridSizeX; i++) {
						if (closestDotXLoc !== 99999 &&
							Math.abs(this.gridDots[i].xLoc - e.offsetX) > closestDotXLoc) {
							break;
						}

						if (Math.abs(this.gridDots[i].xLoc - e.offsetX) < closestDotXLoc) {
							closestDotX = i;
							closestDotXLoc = Math.abs(this.gridDots[i].xLoc - e.offsetX);
						}
					}

					var closestDotY = 0;
					var closestDotYLoc = 99999;

					// Now iterate vertically to find the closest Y coordinate.
					for (var j = 0; j < App.gridSizeY - 1; j++) {
						if (closestDotYLoc !== 99999 &&
							Math.abs(this.gridDots[(j * (App.gridSizeX - 1)) + closestDotX].yLoc - e.offsetY) > closestDotYLoc) {
							break;
						}

						if (Math.abs(this.gridDots[(j * (App.gridSizeX - 1)) + closestDotX].yLoc - e.offsetY) < closestDotYLoc) {
							closestDotY = j;
							closestDotYLoc = Math.abs(this.gridDots[(j * (App.gridSizeX - 1)) + closestDotX].yLoc - e.offsetY);
						}
					}

					// If the grid dot is within our range we need to highlight it as selected.
					if (closestDotXLoc <= App.gridDotTolerance &&
						closestDotYLoc <= App.gridDotTolerance) {
						this.gridDots[(closestDotY * (App.gridSizeX - 1)) + closestDotX].selected = true;
						this.closestNode = this.gridDots[(closestDotY * (App.gridSizeX - 1)) + closestDotX];
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
			this.points = points;
		}
	}

	var drawClass = new Draw();
});