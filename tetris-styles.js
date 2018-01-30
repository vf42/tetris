
/*
Default brick style.
*/
function DefaultBrickStyle() {
	this.N = function(b) {
		b.css("background-color", "#F5F5F5")
		.css("outline-style", "solid")
		.css("outline-width", "1px")
		.css("outline-color", "#D3D3D3")
		.css("opacity", "1.0");
	}
	this.I = function(b) {
		b.css("background-color", "#00CED1")
		.css("outline-color", "#008B8B")
		.css("opacity", "1.0");
	}
	this.J = function(b) {
		b.css("background-color", "#1E90FF")
			.css("outline-color", "#000080")
			.css("opacity", "1.0");
	}
	this.L = function(b) {
		b.css("background-color", "#FFA500")
		.css("outline-color", "#DD8000")
		.css("opacity", "1.0");
	}
	this.O = function(b) {
		b.css("background-color", "#CCCC00")
		.css("outline-color", "#999900")
		.css("opacity", "1.0");
	}
	this.S = function(b) {
		b.css("background-color", "#9EFD38")
		.css("outline-color", "#32CD32")
		.css("opacity", "1.0");
	}
	this.T = function(b) {
		b.css("background-color", "#9932CC")
		.css("outline-color", "#800080")
		.css("opacity", "1.0");
	}
	this.Z = function(b) {
		b.css("background-color", "#DC143C")
		.css("outline-color", "#800000")
		.css("opacity", "1.0");
	}
}

/*
Default brick style with transparent BG for empty bricks.
*/
function DefaultBrickStyleTransparentBG(bgOpacity) {
	this.bgOpacity = bgOpacity
	this.N = function(b) {
		b.css("background-color", "#F5F5F5")
		.css("opacity", this.bgOpacity);
	}
}
DefaultBrickStyleTransparentBG.prototype = new DefaultBrickStyle();


/*
 * Bricks styled with CSS gradient.
 */
function GradientBrickStyle() {
	this.N = function(b) {
		b.css("background", "#F5F5F5")
		.css("outline-style", "solid")
		.css("outline-width", "1px")
		.css("outline-color", "#D3D3D3")
		.css("opacity", "1.0");
	}
	this.I = function(b) {
		b.css("background", "radial-gradient(#008B8B, #00CED1")
		.css("outline-style", "solid")
		.css("outline-color", "#008B8B")
		.css("opacity", "1.0");
	}
	this.J = function(b) {
		b.css("background", "radial-gradient(#000080, #1E90FF")
		.css("outline-style", "solid")
		.css("outline-color", "#000080")
		.css("opacity", "1.0");
	}
	this.L = function(b) {
		b.css("background", "radial-gradient(#EE8C00, #FFA500")
		.css("outline-style", "solid")
		.css("outline-color", "#EE8C00")
		.css("opacity", "1.0");
	}
	this.O = function(b) {
		b.css("background", "radial-gradient(#999900, #CCCC00")
		.css("outline-style", "solid")
		.css("outline-color", "#999900")
		.css("opacity", "1.0");
	}
	this.S = function(b) {
		b.css("background", "radial-gradient(#32CD32, #9EFD38")
		.css("outline-style", "solid")
		.css("outline-color", "#32CD32")
		.css("opacity", "1.0");
	}
	this.T = function(b) {
		b.css("background", "radial-gradient(#800080, #9932CC")
		.css("outline-style", "solid")
		.css("outline-color", "#800080")
		.css("opacity", "1.0");
	}
	this.Z = function(b) {
		b.css("background", "radial-gradient(#800000, #DC143C")
		.css("outline-style", "solid")
		.css("outline-color", "#800000")
		.css("opacity", "1.0");
	}
}
function GradientBrickStyleTransparentBG() {
	this.N = function(b) {
		b.css("opacity", "0.0")
		.css("outline-width", "1px");
	}
}
GradientBrickStyleTransparentBG.prototype = new GradientBrickStyle();