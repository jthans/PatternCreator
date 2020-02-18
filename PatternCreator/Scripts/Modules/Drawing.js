var App = new Vue({
	el: '#drawSection',
	data: {

	},
	methods: {

	}
});

class Draw {
	constructor() {
		this.c = $('#drawCanvas');
		this.context = this.c.getContext('2d');

		this.mouseDown = false;
		this.mouseX = 0;
		this.mouseY = 0;
	}
};