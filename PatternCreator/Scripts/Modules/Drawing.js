$(document).ready(function () {
	var App = new Vue({
		el: '#drawSection',
		data: {
			gridSizeX: 12, // how many grid squares horizontally
			gridSizeY: 12, // how many grid squares vertically
			gridDotTolerance: 20, // number of pixels that trigger dot selection.
			drawnComponents: [] // any components that have been drawn on the screen
		},
		methods: {

		}
	});

	class Draw {
		constructor() {
			this.c = $('#drawCanvas')[0];
			this.context = this.c.getContext('2d');

			this.gridDots = [];
			this.gridDotDiameter = 10;
			this.gridEnabled = true;

			this.mouseDown = false;
			this.mouseX = 0;
			this.mouseY = 0;

			this.registerEvents();
			this.reDraw();
		};

		createGridDots() {
			// Draw a dot for each point needed in the grid.
			for (var i = 1; i < App.gridSizeY; i++) {
				var yLoc = i * (this.c.height / App.gridSizeY);

				for (var j = 1; j < App.gridSizeX; j++) {
					var xLoc = j * (this.c.width / App.gridSizeX);

					// Add the new dot to the cache.
					this.gridDots.push({
						xLoc: xLoc,
						yLoc: yLoc,
						selected: false
					});
				}
			}
		}

		drawComponent() {
			// Determine brush shape.
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
		}

		drawGridDots() {
			var defaultFillStyle = 'rgba(0, 0, 0, .2)';
			var selectedFillStyle = 'rgba(0, 0, 128, .2)';
			this.context.fillStyle = defaultFillStyle;

			for (var i = 0; i < this.gridDots.length; i++) {
				this.context.beginPath();

				if (this.gridDots[i].selected) {
					this.context.rect(this.gridDots[i].xLoc, this.gridDots[i].yLoc, 15, 15);
					this.context.fillStyle = selectedFillStyle;
				}
				else {
					this.context.rect(this.gridDots[i].xLoc, this.gridDots[i].yLoc, this.gridDotDiameter, this.gridDotDiameter);
					this.context.fillStyle = defaultFillStyle;
				}

				this.context.fill();
				this.context.closePath();
			}
		};

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

			});

			// Mouse Click
			this.c.addEventListener('mousemove', (e) => {
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
				}

				this.reDraw();
			});
		}

		resizeCanvas() {
			this.c.height = this.c.getBoundingClientRect().height;
			this.c.width =	this.c.getBoundingClientRect().width;
		}
	};

	var drawClass = new Draw();
});