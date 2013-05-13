/*
 @author spar2

 This plugin is built to basically draw lines similar to the stock 'lines'.
 However, parts of the lines called 'regions' will be shaded underneath and the line color will change.
 This plugin doesn't make much sense without the stacking plugin, and should be used with it.
 each series has the following:
 
 regions [ {
 	x1: the left x value
	x2: the right x value
	color: the color to shade under the region; note that the color of the area is automatically made transparent
 } ]
 
 Usage of this plugin requires each data series have a 'regions' array defined. It can be empty, but if it is null nothing will be rendered.
 Each array can have as many regions as desired, and it doesn't matter where on the x axis the regions are. If null, a line is drawn without any
 regions underneath.
*/
(function ($) {
	var options = {
		series: {
			regions: null
		}
	};

	function init(plot) {
		
		var seriesIndex = 0;
		
		// this function is just to get a y value given 2 points and an x value between the two points
		function interpolate(x1, y1, x2, y2, xnew) {
			// get slope
			m = (y1 - y2) / (x1 - x2);
			b = y1 - (m * x1);
			return (m * xnew) + b;
		}

		// this function is called by the processRawData flot hook, it just sets up the data formats so that the stacking plugin will work
		function processRawData(p, s, d, dp) {
			// add a y2 value
			// this tells the stacking plugin to go ahead and calculate stacked values for us
			dp.format = [];
			dp.format.push({ x: true, number: true, required: true });
			dp.format.push({ y: true, number: true, required: true });
			dp.format.push({ y: true, number: true, required: false, defaultValue: 0, autoscale: true });
		}

		// p - flot's plot object
		// ctx - html5 canvas context
		// s - individual series data
		function drawSeries(p, ctx, s) {
			if(s.regions == null) {
				return;
			} else {
				s.lines.show = false;
			}
			// draw a 'shadow'
			var ang = Math.PI/18;
			drawSeriesLines(Math.sin(ang)*2, Math.cos(ang)*2, p, ctx, s, 2, "rgba(0, 0, 0, 0.3)");
			// draw the area of the regions
			drawSeriesArea(p, ctx, s);
			// draw the main line
			drawSeriesLines(0, 0, p, ctx, s, 2, null);
		}
		
		function draw(p, ctx) {
			// this just is a hacky way of enabling 'item's being returned in plothover and plotclick event calls
			// since we don't want to actually graph lines, we don't want it activiated until after the series is drawn,
			// then we activiate it. It has to be activiated in order to return 'item's
			var data = p.getData();
			for(var i = 0; i < data.length; i++) {
				data[i].lines.show = true;
			}
		}

		// p - flot's plot object
		// ctx - html5 canvas context
		// s - individual series data
		function drawSeriesArea(p, ctx, s) {
			var offsetx = plot.getPlotOffset().left;
			var offsety = plot.getPlotOffset().top;
			
			var points = s.datapoints.points,
				ps = s.datapoints.pointsize,
				axisx = s.xaxis,
				axisy = s.yaxis;
			
			
			// only draw regions
			for(var i = 0; i < s.regions.length; i++) {
				var reg = s.regions[i];
				if((reg.x1 < axisx.min && reg.x2 < axisx.min) || (reg.x1 > axisx.max && reg.x2 > axisx.max)) {
					// skip this one, not within axis bounds
					continue;
				}
				
				var started = false;
				var drawingTop = true;
				for(var j = ps; j < points.length; j += (drawingTop?1:-1) * ps) {	
					// set up variables
					var x1 = points[j - ps], y1 = points[j - ps + 1],
						x2 = points[j], y2 = points[j + 1];
					var y1l, y2l;

					// this code is taken from the flot line drawing code -- it just clamps the points to the x/y axes
					if (x1 == null || x2 == null)
						continue;

					// clip with ymin
					if (y1 <= y2 && y1 < axisy.min) {
						if (y2 < axisy.min)
							continue;   // line segment is outside
						// compute new intersection point
						x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = axisy.min;
					}
					else if (y2 <= y1 && y2 < axisy.min) {
						if (y1 < axisy.min)
							continue;
						x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = axisy.min;
					}

					// clip with ymax
					if (y1 >= y2 && y1 > axisy.max) {
						if (y2 > axisy.max)
							continue;
						x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = axisy.max;
					}
					else if (y2 >= y1 && y2 > axisy.max) {
						if (y1 > axisy.max)
							continue;
						x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = axisy.max;
					}

					// clip with xmin
					if (x1 <= x2 && x1 < axisx.min) {
						if (x2 < axisx.min)
							continue;
						y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = axisx.min;
					}
					else if (x2 <= x1 && x2 < axisx.min) {
						if (x1 < axisx.min)
							continue;
						y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = axisx.min;
					}

					// clip with xmax
					if (x1 >= x2 && x1 > axisx.max) {
						if (x2 > axisx.max)
							continue;
						y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = axisx.max;
					}
					else if (x2 >= x1 && x2 > axisx.max) {
						if (x1 > axisx.max)
							continue;
						y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = axisx.max;
					}

					if(ps >= 3) {
						// there are low y's that are the y values for the series below
						y1l = points[j - ps + 2];
						y2l = points[j + 2];
					} else {
						y1l = 0;
						y2l = 0;
					}

					// go until we find the region
					if(!started && x2 > reg.x1) {
						started = true;
						// time to start drawing
						var ry1 = interpolate(x1, y1, x2, y2, reg.x1);
						ctx.beginPath();
						ctx.moveTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1) + offsety);
					}

					// to shade areas, we have to draw a polygon then call canvas.fill(), so we have to draw both the top and the bottom of these regions
					// this boolean is for if we are on the positive x trip, drawing the top
					if(drawingTop) {
						if(started && (x2 >= reg.x2 || x2 >= axisx.max || j + ps > points.length)) {
							// end of region
							var rx2 = Math.min(reg.x2, axisx.max);
							var ry2 = interpolate(x1, y1, x2, y2, rx2);
							var ry2l = interpolate(x1, y1l, x2, y2l, rx2);
							//
							ctx.lineTo(axisx.p2c(rx2) + offsetx, axisy.p2c(ry2) + offsety);
							ctx.lineTo(axisx.p2c(rx2) + offsetx, axisy.p2c(ry2l) + offsety);
							//ctx.lineTo(x1, y1l);
							drawingTop = false;
						} else if(started && x2 < reg.x2) {
							ctx.lineTo(axisx.p2c(x2) + offsetx, axisy.p2c(y2) + offsety);
						}
					}
					// if it is false, we are drawing the bottom part of the polygon, and are moving in the negative x direction
					if(!drawingTop) {
						if(x1 <= reg.x1 || x1 <= axisx.min || j == 0) {
							// end of region
							var rx1 = Math.max(reg.x1, axisx.min);
							var ry1 = interpolate(x1, y1, x2, y2, rx1);
							var ry1l = interpolate(x1, y1l, x2, y2l, rx1);
							// 
							ctx.lineTo(axisx.p2c(rx1) + offsetx, axisy.p2c(ry1l) + offsety);
							ctx.lineTo(axisx.p2c(rx1) + offsetx, axisy.p2c(ry1) + offsety);
							ctx.fillStyle = reg.color;
							ctx.globalAlpha = 0.5;
							ctx.fill();
							ctx.globalAlpha = 1.0;
							break;
						} else if(x1 > reg.x1) {
							ctx.lineTo(axisx.p2c(x1) + offsetx, axisy.p2c(y1l) + offsety);
						}
					}
				}
			}
		}

		/* old version -- this draws both regions and non regions

		// p - flot's plot object
		// ctx - html5 canvas context
		// s - individual series data
		function drawSeriesArea(p, ctx, s) {
			var offsetx = plot.getPlotOffset().left;
			var offsety = plot.getPlotOffset().top;

			var drawn = false;
			var drawingTop = true;
			var drawingReg = false;
			
			var points = s.datapoints.points,
				ps = s.datapoints.pointsize,
				axisx = s.xaxis,
				axisy = s.yaxis;
			
			var reg;
			var startIndex = ps, startX = points[0], startY = points[1];
			
			var endIndex, endX, endY;
			
			ctx.beginPath();
			ctx.fillStyle = s.color;
			ctx.moveTo(axisx.p2c(startX) + offsetx, axisy.p2c(startY) + offsety);
			
			var insideRegion = false;
			for(var j = 0; j < s.regions.length && !insideRegion; j++) {
				var reg = s.regions[j];
				if(reg.x1 < startX  && reg.x2 > startX) {
					// inside region to start
					insideRegion = true;
					ctx.fillStyle = reg.color;
				}
			}
			if(!insideRegion) {
				ctx.fillStyle = s.color;
			}
			
			var i = ps;
			
			while(i < points.length) {
				console.log(i);
				drawn = false;

				var x1 = points[i - ps], y1 = points[i - ps + 1],
					x2 = points[i], y2 = points[i + 1];
				var y1l, y1l;
				if(ps >= 3) {
					// there are low y's that are the y values for the series below
					y1l = points[i - ps + 2];
					y2l = points[i + 2];
				} else {
					y1l = 0;
					y2l = 0;
				}

				
				// draw line like normal until we hit a region
				if(drawingTop) {
					if(drawingReg) {
						if(x2 > reg.x2) {
							// exiting the region!
							// draw a boundary and turn around
							
							// region intercepts
							var ry2 = interpolate(x1, y1, x2, y2, reg.x2);
							var ry2l = interpolate(x1, y1l, x2, y2l, reg.x2);
							
							// rembmer this place
							endIndex = i;
							endX = reg.x2;
							endY = ry2;
							
							// draw the edge
							ctx.lineTo(axisx.p2c(reg.x2) + offsetx, axisy.p2c(ry2) + offsety);
							ctx.lineTo(axisx.p2c(reg.x2) + offsetx, axisy.p2c(ry2l) + offsety);
							ctx.lineTo(axisx.p2c(x1) + offsetx, axisy.p2c(y1l) + offsety);
							
							drawn = true;
							drawingTop = false;
						}
					} else {
						for(var j = 0; j < s.regions.length && !drawn; j++) {
							reg = s.regions[j];
							if(x2 > reg.x1 && reg.used == null) {
								// we've crossed a region boundary!
								// draw up to the boundary, and turn around
								
								// get region intercept
								var ry1 = interpolate(x1, y1, x2, y2, reg.x1);
								var ry1l = interpolate(x1, y1l, x2, y2l, reg.x1);
							
								// remember this place
								endIndex = i;
								endX = reg.x1;
								endY = ry1;
								
								// draw the edge
								ctx.lineTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1) + offsety);
								ctx.lineTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1l) + offsety);
								ctx.lineTo(axisx.p2c(x1) + offsetx, axisy.p2c(y1l) + offsety);
								
								drawn = true;
								drawingTop = false;
								reg.used = true;
							}
						}
						if(i == points.length - ps) {
							// turn around
							endIndex = i + ps;
							endX = x2;
							endY = y2;
							
							// draw the edge
							ctx.lineTo(axisx.p2c(x2) + offsetx, axisy.p2c(y2) + offsety);
							ctx.lineTo(axisx.p2c(x2) + offsetx, axisy.p2c(y2l) + offsety);
							ctx.lineTo(axisx.p2c(x1) + offsetx, axisy.p2c(y1l) + offsety);

							drawn = true;
							drawingTop = false;
						}
					}
				}
				
				
				if(!drawingTop && x1 <= startX) {
					// end of the line
					
					//interpolate bottom start intercept
					var syl = interpolate(x1, y1l, x2, y2l, startX);
					
					ctx.lineTo(axisx.p2c(startX) + offsetx, axisy.p2c(syl) + offsety);
					ctx.lineTo(axisx.p2c(startX) + offsetx, axisy.p2c(startY) + offsety);
					ctx.globalAlpha = 0.5;
					if(drawingReg) {
						ctx.fillStyle = reg.color;
					} else {
						ctx.fillStyle = s.color;
					}
					ctx.fill();
					ctx.globalAlpha = 1.0;
					
					// continue from where we left off
					startIndex = endIndex;
					startX = endX;
					startY = endY;
					
					drawingReg = !drawingReg;
					drawingTop = true;
					
					ctx.beginPath();
					ctx.moveTo(axisx.p2c(startX) + offsetx, axisy.p2c(startY) + offsety);
					i = startIndex - ps;
					drawn = true;
				}
				
				
				
				if(!drawn) {
					if(drawingTop) {
						if(!drawingReg || x2 <= reg.x2) {
							ctx.lineTo(axisx.p2c(x2) + offsetx, axisy.p2c(y2) + offsety);
						}
					} else {
						if(x1 > startX) {
							ctx.lineTo(axisx.p2c(x1) + offsetx, axisy.p2c(y1l) + offsety);
						}
					}
				}
				i += (drawingTop?1:-1) * ps;
			}
			for(var i = 0; i < s.regions.length; i++) {
				s.regions[i].used = null;
			}
		}*/

		// p - flot's plot object
		// ctx - html5 canvas context
		// s - individual series data
		function drawSeriesLines(offsetx, offsety, p, ctx, s, lw, shadow) {
			ctx.lineCap = 'round';
			// these x and y offsets are used for shadow effects
			offsetx += plot.getPlotOffset().left;
			offsety += plot.getPlotOffset().top;

			
			var points = s.datapoints.points,
				ps = s.datapoints.pointsize,
				axisx = s.xaxis,
				axisy = s.yaxis;

			var first = true;
			
			ctx.beginPath();
			ctx.lineWidth = lw;
			
			// begin drawing -- iterate points
			for (var i = ps; i < points.length; i += ps) {
				var x1 = points[i - ps], y1 = points[i - ps + 1],
					x2 = points[i], y2 = points[i + 1];
					
					// this is x/y axis clamping code from the flot line drawing code

					if (x1 == null || x2 == null)
						continue;

					// clip with ymin
					if (y1 <= y2 && y1 < axisy.min) {
						if (y2 < axisy.min)
							continue;   // line segment is outside
						// compute new intersection point
						x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = axisy.min;
					}
					else if (y2 <= y1 && y2 < axisy.min) {
						if (y1 < axisy.min)
							continue;
						x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = axisy.min;
					}

					// clip with ymax
					if (y1 >= y2 && y1 > axisy.max) {
						if (y2 > axisy.max)
							continue;
						x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = axisy.max;
					}
					else if (y2 >= y1 && y2 > axisy.max) {
						if (y1 > axisy.max)
							continue;
						x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = axisy.max;
					}

					// clip with xmin
					if (x1 <= x2 && x1 < axisx.min) {
						if (x2 < axisx.min)
							continue;
						y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = axisx.min;
					}
					else if (x2 <= x1 && x2 < axisx.min) {
						if (x1 < axisx.min)
							continue;
						y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = axisx.min;
					}

					// clip with xmax
					if (x1 >= x2 && x1 > axisx.max) {
						if (x2 > axisx.max)
							continue;
						y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = axisx.max;
					}
					else if (x2 >= x1 && x2 > axisx.max) {
						if (x1 > axisx.max)
							continue;
						y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = axisx.max;
					}
				
				// only exeucte this on the first iteration
				if(first) {
					first = false;
					ctx.moveTo(axisx.p2c(x1) + offsetx, axisy.p2c(y1) + offsety);
					
					// select color
					if(shadow == null) {
						var insideRegion = false;
						for(var j = 0; j < s.regions.length && !insideRegion; j++) {
							// are we in a region to start with?
							var reg = s.regions[j];
							if(reg.x1 < x1 && reg.x2 > x1) {
								insideRegion = true;
								ctx.strokeStyle = reg.color;
							}
						}
						if(!insideRegion) {
							ctx.strokeStyle = s.color;
						}
					} else {
						ctx.strokeStyle = shadow;
					}
				}
				
				//region code!!!
				for(var j = 0; j < s.regions.length; j++) {
					var reg = s.regions[j];
					if(x1 < reg.x1 && x2 >= reg.x1 && x2 < reg.x2) {
						// case 1: x1 on left of region, x2 in region
						// end line here and start new line
					
						// get region intercept
						ry1 = interpolate(x1, y1, x2, y2, reg.x1);
						
						// draw line to region intercept
						ctx.lineTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1) + offsety);
						// finish line
						ctx.stroke();
						
						// start line in region
						ctx.beginPath();
						ctx.moveTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1) + offsety);
						
						// get a new color
						if(shadow == null) {
							ctx.strokeStyle = reg.color;
						} else {
							ctx.strokeStyle = shadow;
						}
					} else if(x1 > reg.x1 && x1 <= reg.x2 && x2 > reg.x2) {
						// case 2: x1 inside region, x2 on right of region
						// end line and start new line
						
						// get region intercept
						ry2 = interpolate(x1, y1, x2, y2, reg.x2);
						
						// draw line to region intercept
						ctx.lineTo(axisx.p2c(reg.x2) + offsetx, axisy.p2c(ry2) + offsety);
						// finish line
						ctx.stroke();
						
						// start line out of region
						ctx.beginPath();
						ctx.moveTo(axisx.p2c(reg.x2) + offsetx, axisy.p2c(ry2) + offsety);
						
						// get new color
						if(shadow == null) {
							ctx.strokeStyle = s.color;
						} else {
							ctx.strokeStyle = shadow;
						}
					} else if(x1 < reg.x1 && x2 > reg.x2) {
						// case 3: x1 on left of region, x2 on right of region
						// end line and, start and end a line in region, start a new line
						
						// get region intercepts
						ry1 = interpolate(x1, y1, x2, y2, reg.x1);
						ry2 = interpolate(x1, y1, x2, y2, reg.x2);
						
						// draw line to region intercept
						ctx.lineTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1) + offsety);
						// finish line
						ctx.stroke();
						
						// draw internal line
						ctx.beginPath();
						ctx.moveTo(axisx.p2c(reg.x1) + offsetx, axisy.p2c(ry1) + offsety);
						ctx.lineTo(axisx.p2c(reg.x2) + offsetx, axisy.p2c(ry2) + offsety);
						if(shadow == null) {
							ctx.strokeStyle = reg.color;
						} else {
							ctx.strokeStyle = shadow;
						}
						ctx.stroke();
						
						// begin new path
						ctx.beginPath();
						ctx.moveTo(axisx.p2c(reg.x2) + offsetx, axisy.p2c(ry2) + offsety);
						
						// get new color
						if(shadow == null) {
							ctx.strokeStyle = s.color;
						} else {
							ctx.strokeStyle = shadow;
						}
					}
				}
				// finish the line
				ctx.lineTo(axisx.p2c(x2) + offsetx, axisy.p2c(y2) + offsety);
			}
			ctx.stroke();
		}
		
		// register our hooks with flot here
		plot.hooks.processRawData.push(processRawData);
		plot.hooks.drawSeries.push(drawSeries);
		plot.hooks.draw.push(draw);
	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'regions',
		version: '0.1'
	});
})(jQuery);
