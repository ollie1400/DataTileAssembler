//define(function () {

//"use strict";

/*
 * main entry.  Cretae a DataTiler object with a reference to a canvas
 */
var DataTiler = function (tCanvas, tViewPort, uris, baseDir)
{
	var viewPort = tViewPort;
	var canvas = tCanvas;
	var canvasDefaultCursor = "default";
	
	var thisDataTiler = this;

	this.ImageArray = undefined;
	var lastDownTarget;
	
	this.mousescroll = null;
	this.mousedown = null;
	this.keydown = null;
	// event called when the mouse is moved over the canvas
	// should be function (evt, realPos) where evt is the low level event, and realPos is the calculated real position of the mouse
	this.mousemove = null;
	
	// dragging things
	var initialMousePos = null;
	var initialViewPort = null;
	var lastRealMousePoint = null;
	
	// draw grids?
	this.drawXGrid = true;
	this.drawYGrid = true;
	
	// METHODS
	
	// callback for when all images are loaded
	var onImagesAllLoaded = function(i)
	{
		console.log("Image " + i + " loaded.");
		imagesLoaded += 1;
		
		// all loaded?
		if (imagesLoaded < numImages) return;
		
		console.log("All images loaded");
		
		this.Draw();
	};
	
	
	
	/*
	 * Redraw.  Clear, then draw.
	 */
	this.Redraw = function()
	{
		this.Clear();
		this.Draw()
	}
	
	/*
	 * clear the canvas
	 */
	this.Clear = function()
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	
	/*
	 * main draw function
	 */
	this.Draw = function ()
	{
		// line style
		var lineStyle = "#AAAAAA";
		var markerTextStyle = "#000000";
		var borderBackgroundStyle = "#FFFFFF";
		//var borderStyle = "#000000";
		//var borderWidth = 1;
		var ImageArray = thisDataTiler.ImageArray;
		
		// map images
		saveStroke();
		for (var i=0; i< ImageArray.Images.length; i++)
		{
			var thisImage = ImageArray.Images[i];
			
			// skip if not visible
			if (!thisImage.Visible) continue;
			
			// is it cropped?
			var cropRect = ImageArray.Images[i].CropRetangle;
			var dRect = thisDataTiler.mapRectangleToViewPort(ImageArray.Images[i].BoundingRectangle);
			if (cropRect != undefined)
			{
				context.drawImage(ImageArray.Images[i].GetImage(), cropRect.x, cropRect.y, cropRect.width, cropRect.height, dRect.x, dRect.y, dRect.width, dRect.height);
			} else {
				context.drawImage(ImageArray.Images[i].GetImage(), dRect.x, dRect.y, dRect.width, dRect.height);
			}
		}
		restoreStroke();
		
		
		// draw bounding boxes if visible
		saveStroke();
		for (var i=0; i< ImageArray.Images.length; i++)
		{
			var thisImage = ImageArray.Images[i];
			
			// skip if not visible
			if (!thisImage.Visible) continue;
			
			// the bounding rectangle
			if (thisImage.DrawBoundingRectangle)
			{
				var dRect = thisDataTiler.mapRectangleToViewPort(ImageArray.Images[i].BoundingRectangle);
				var borderWidth = thisImage.BoundingRectangleThickness;
				context.strokeStyle = thisImage.BoundingRectangleColor;
				context.lineWidth=borderWidth;
				borderWidth *= 0.5;
				context.rect(dRect.x-borderWidth, dRect.y-borderWidth, dRect.width+2*borderWidth, dRect.height+2*borderWidth);
				context.stroke();
			}
		}
		restoreStroke();
		
		
		// draw x markers#
		var xmin = viewPort.x;
		var xmax = viewPort.x + viewPort.width;
		var numMarkers = 10;
		var tmarkerSpacing = viewPort.width / (numMarkers - 1); // initial spacing (in real space)
		var xdecimalPlaces = 0;
		if (tmarkerSpacing > 0.01) { markerSpacing = 0.05; xdecimalPlaces = 2; }
		if (tmarkerSpacing > 0.1) { markerSpacing = 0.2; xdecimalPlaces = 1; }
		if (tmarkerSpacing > 0.2) { markerSpacing = 0.5; xdecimalPlaces = 1; }
		if (tmarkerSpacing > 0.5) { markerSpacing = 1; xdecimalPlaces = 1; }
		if (tmarkerSpacing > 1) { markerSpacing = 2; xdecimalPlaces = 0; }
		if (tmarkerSpacing > 5) markerSpacing = 10;
		if (tmarkerSpacing > 15) markerSpacing = 20;
		if (tmarkerSpacing > 25) markerSpacing = 30;
		if (tmarkerSpacing > 45) markerSpacing = 50;
		
		context.font = "20px Arial";
		var x = Math.floor(viewPort.x/100)*100;	
		var xmarkerCanvasPositions = [];
		var xmarkerRealPositions = [];
		while(x < (viewPort.x + viewPort.width))
		{
			
			context.strokeStyle = lineStyle;
			p = thisDataTiler.mapPointToViewPort(new DataTiler.Point(x, 0));
				
			// line
			if (this.drawXGrid)
			{
				context.beginPath();
				context.moveTo(p.x,0);
				context.lineTo(p.x,canvas.height);
				context.stroke();
			}
			
			xmarkerCanvasPositions.push(p.x);
			xmarkerRealPositions.push(x);
			
			// increment
			x = x + markerSpacing;
		}
		
		
		// draw y markers
		var ymin = viewPort.y;
		var ymax = viewPort.y + viewPort.height;
		var numMarkers = 10;
		var tmarkerSpacing = viewPort.height / (numMarkers - 1); // initial spacing (in real space)
		var ydecimalPlaces = 0;
		if (tmarkerSpacing > 0.01) { markerSpacing = 0.05; ydecimalPlaces = 2; }
		if (tmarkerSpacing > 0.1) { markerSpacing = 0.2; ydecimalPlaces = 1; }
		if (tmarkerSpacing > 1) { markerSpacing = 2; ydecimalPlaces = 0; }
		if (tmarkerSpacing > 2) { markerSpacing = 5; ydecimalPlaces = 0; }
		if (tmarkerSpacing > 5) markerSpacing = 10;
		if (tmarkerSpacing > 15) markerSpacing = 20;
		if (tmarkerSpacing > 25) markerSpacing = 30;
		if (tmarkerSpacing > 45) markerSpacing = 50;
		
		context.font = "20px Arial";
		var y = Math.floor(viewPort.y/10)*10;
		context.fillStyle = markerTextStyle;
		var ymarkerCanvasPositions = [];
		var ymarkerRealPositions = [];
		while(y < (viewPort.y + viewPort.height))
		{
			
			context.strokeStyle = lineStyle;
			p = thisDataTiler.mapPointToViewPort(new DataTiler.Point(0,y));
			
			// line
			if (this.drawYGrid)
			{
				context.beginPath();
				context.moveTo(0,p.y);
				context.lineTo(canvas.width, p.y);
				context.stroke();
			}
			
			// add text
			//context.fillText(y.toFixed(decimalPlaces), 5, p.y);
			ymarkerCanvasPositions.push(p.y);
			ymarkerRealPositions.push(y);
			
			// increment
			y = y + markerSpacing;
		}
		
		
		// x labels
		// add white border
		context.globalAlpha = 0.5;
		context.fillStyle = borderBackgroundStyle;
		context.fillRect(0, 0, canvas.width, 25);
		context.fill();
		
		// add text
		context.fillStyle = markerTextStyle;
		context.globalAlpha = 1;
		for (var i=0; i < xmarkerCanvasPositions.length; i++)
		{
			var pos = xmarkerCanvasPositions[i];
			var val = xmarkerRealPositions[i];
			
			// add text
			context.fillText(val.toFixed(xdecimalPlaces), pos - 20, 20);
		}
		
		
		// y labels
		// add white border
		context.globalAlpha = 0.5;
		context.fillStyle = borderBackgroundStyle;
		context.fillRect(0, 0, 70, canvas.height);
		context.fill();
		
		// add text
		context.globalAlpha = 1;
		context.fillStyle = markerTextStyle;
		for (var i=0; i < ymarkerCanvasPositions.length; i++)
		{
			var pos = ymarkerCanvasPositions[i];
			var val = ymarkerRealPositions[i];
			
			// add text
			context.fillText(val.toFixed(ydecimalPlaces), 5, pos + 6);
		}
	}
	
	
	
	
	// takes a Rectangle object that defines a region in real space, and returns a Rectangle that defines it in canvas space
	this.mapRectangleToViewPort = function (pos)
	{
		scaledRect = new DataTiler.Rectangle();
		scaledRect.x = (pos.x - viewPort.x) * canvas.width / viewPort.width;
		scaledRect.y = (pos.y - viewPort.y) * canvas.height / viewPort.height;
		scaledRect.width = pos.width * canvas.width / viewPort.width;
		scaledRect.height = pos.height * canvas.height / viewPort.height;
		return scaledRect;
	}

	// takes a Point object that defines a point in real space (mV, nm) and returns a Point that defines it in canvas space
	this.mapPointToViewPort = function (point)
	{
		scaledPoint = new DataTiler.Point();
		scaledPoint.x = (point.x - viewPort.x) * canvas.width / viewPort.width;
		scaledPoint.y = (point.y - viewPort.y) * canvas.height / viewPort.height;
		return scaledPoint;
	}

	// takes a Point object that defines a point canvas space and returns a Point that defines it in in real space (mV, nm) 
	this.mapPointToRealSpace = function (point)
	{
		scaledPoint = new DataTiler.Point();
		scaledPoint.x = (point.x * viewPort.width / canvas.width) + viewPort.x
		scaledPoint.y = (point.y * viewPort.height / canvas.height) + viewPort.y;
		return scaledPoint;
	}
	
	
	var defLineWidth = 1;
	var defStrokeStyle = "#000000";
	var saveStroke = function()
	{
		defStrokeStyle = context.strokeStyle;
		defLineWidth = context.lineWidth;
	}
	
	var restoreStroke = function()
	{
		context.strokeStyle = defStrokeStyle;
		context.lineWidth = defLineWidth;
	}
	
	
	
	
	// dragging methods
	var checkBox_OnChange = function(e)
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
		draw();
	}

	/*
	 * key down on canvas
	*/
	var canvasKeyDown = function(e)
	{
		var redraw;
		var moveFrac = 0.05;
		switch(e.keyCode)
		{
			case 40:
				// down
				viewPort.y = viewPort.y + viewPort.height * moveFrac;
				redraw = true;
				break;
			case 39:
				// right
				viewPort.x = viewPort.x + viewPort.width * moveFrac;
				redraw = true;
				break;
				
			case 38:
				// up
				viewPort.y = viewPort.y - viewPort.height * moveFrac;
				redraw = true;
				break;
				
			case 37:
				// left
				viewPort.x = viewPort.x - viewPort.width * moveFrac;
				redraw = true;
				break;
		}
		
		if (redraw)
		{
			context.clearRect(0, 0, canvas.width, canvas.height);
			draw();
		}
	}

	var canvasMouseScroll = function(e)
	{
		e.stopPropagation();
		//console.log(e.wheelDelta);
		
		var lastCentreX = viewPort.x + viewPort.width / 2;
		var lastCentreY = viewPort.y + viewPort.height / 2;
		
		var scrollChange = 0.13;
		var scrollDec = 1 - scrollChange;
		var scrollInc = 1 + scrollChange;
		var newWidth = e.wheelDelta > 0 ? viewPort.width * scrollDec  : viewPort.width * scrollInc;
		var newHeight = e.wheelDelta > 0 ? viewPort.height * scrollDec  : viewPort.height * scrollInc;
		
		var newX = lastCentreX - newWidth / 2;
		var newY = lastCentreY - newHeight / 2;
		
		viewPort.x = newX;
		viewPort.y = newY;
		viewPort.width = newWidth;
		viewPort.height = newHeight;
		
		// redraw
		thisDataTiler.Redraw();
		
		// fire event
		if (thisDataTiler.mousescroll != null) thisDataTiler.mousescroll(e);
	}

	/*
	 * Canvas mouse move callback
	*/
	var canvasMouseMove = function(evt)
	{   
		var ImageArray = thisDataTiler.ImageArray;
		var rect = canvas.getBoundingClientRect();
		var mousePos = new DataTiler.Point(evt.clientX - rect.left, evt.clientY - rect.top);
		
		var realPosition = thisDataTiler.mapPointToRealSpace(mousePos);
		lastRealMousePoint = realPosition;
		var message = 'Mouse position: ' + realPosition.x + ',' + realPosition.y + '  ' + evt.which;
		
		
		// is the mouse inside one of the images?
		for (i=0; i<ImageArray.Images.length; i++)
		{
			// if the mouse is over this image, and it is enabled, set the label red
			if (ImageArray.Images[i].Visible && ImageArray.Images[i].BoundingRectangle.pointInside(realPosition))
			{	
				//checkBoxLabels[i].style.backgroundColor = "#FF0000"
			} else {
				//checkBoxLabels[i].style.backgroundColor = "#FFFFFF";
			}
		}
		
		// if mouse pressed, but NOT previously pressed, record the current position as the start of a drag
		if (evt.which != 0 && initialMousePos == null)
		{
			// initial mouse down
			initialMousePos = mousePos;
			initialViewPort = viewPort;
			
			canvas.style.cursor = "move";
			
		} else if (evt.which == 0 && initialMousePos != null)
		{
			// mouse released
			initialMousePos = null;
			
			canvas.style.cursor = canvasDefaultCursor;
			
		} else if (initialMousePos != null) {
			
			// mouse moved whilst down
			
			// calculate change from initial position and update viewport accordingly
			diff = mousePos.minus(initialMousePos);
			rdiff = new DataTiler.Point();
			//rdiff = mapPointToRealSpace(mousePos).minus(mapPointToRealSpace(initialMousePos));
			
			rdiff.x = diff.x * viewPort.width / canvas.width;
			rdiff.y = diff.y * viewPort.height / canvas.height;
			
			message = 'rdiff: ' + rdiff.x + ',' + rdiff.y;
			
			// move the view port
			viewPort = initialViewPort.displacedNew(rdiff);
			
			// redraw
			thisDataTiler.Redraw();
			
			//console.log(message);
		}
		
		// fire event
		if (thisDataTiler.mousemove != null) thisDataTiler.mousemove(evt, realPosition);
	}
	
	// CONSTRUCTOR
	
	
	// constructor code
	context = canvas.getContext("2d");
	canvas.addEventListener('mousemove', canvasMouseMove);
	canvas.style.cursor = canvasDefaultCursor;
	
	// set scaling to nearest neighbour
	// (see http://phoboslab.org/log/2012/09/drawing-pixels-is-hard)
	context.mozImageSmoothingEnabled  = false;
	context.msImageSmoothingEnabled = false;
	context.imageSmoothingEnabled = false;
	
	// scroll
	canvas.addEventListener("mousewheel", canvasMouseScroll, false);
	canvas.addEventListener("DOMMouseScroll", canvasMouseScroll, false);  // for firefox
	
	document.addEventListener('mousedown', function(event) {
        lastDownTarget = event.target;
    }, false);

    document.addEventListener('keydown', function(event) {
        if(lastDownTarget == canvas) {
            canvasKeyDown(event);
        }
    }, false);
	
	this.ImageArray = new DataTiler.ImageArray(uris, baseDir, this.Draw);
	
	
		
	return this;
}

/*
 *  object describing a rectangle
 */
DataTiler.Rectangle = function()
{
	// top left positions
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.bottomRight = function() { return {x: this.x + this.width, y: this.y + this.height }; }
	
	/*
	 * return a new rectangle that is this rectangle but displaced by a vector (given as a point)
	 */
	this.displacedNew = function (point) {
		rect = new DataTiler.Rectangle();
		rect.width = this.width;
		rect.height = this.height;
		rect.x = this.x - point.x;
		rect.y = this.y - point.y;
		return rect;
	};
	
	/*
	 * Determine whether the given point is inside this rectangle or not
	 */
	this.pointInside = function (point) {
		return point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height;
	};
}

/*
 *  object describing a point
 */
DataTiler.Point = function (x,y)
{
	this.x = x == undefined ? 0 : x;
	this.y = y == undefined ? 0 : y;
	this.plus = function(p) { return new DataTiler.Point(this.x + p.x, this.y + p.y); }
	this.minus = function(p) { return new DataTiler.Point(this.x - p.x, this.y - p.y); }
}

/*
 * object describing an image
 */
DataTiler.Image = function ()
{
	this.BoundingRectangle = new DataTiler.Rectangle();
	this.CropRetangle = null;
	this.Visible = true;
	this.OnImageLoad;
	this.Separator = "___";
	this.DrawBoundingRectangle = false;
	this.BoundingRectangleColor = "#000000";
	this.BoundingRectangleThickness = 1;
	var loaded = false;
	var src;
	var image = undefined;
	var thisImage = this;
	
	// when loaded
	var onimgload = function (dtimage)
	{
		console.log("Loaded");
		loaded = true;
		if (thisImage.OnImageLoad != undefined) thisImage.OnImageLoad();
	}
	
	// load
	this.Load = function ()
	{
		var img = new Image();
		img.onload = onimgload;
		image = img;
		
		// make image bounding box
		var coordsStart = src.indexOf(this.Separator);
		if (coordsStart == -1) throw new Error("Can't find coordinate separator \""+this.Separator+"\" in file name \"" + src + "\"");
		coordsStart += this.Separator.length;
		
		var coords = src.substring(coordsStart).replace(".png","");
		var coordsBits = coords.split(",");
		
		var imgRect = new DataTiler.Rectangle();
		imgRect.x = parseFloat(coordsBits[0]);//-400;
		imgRect.y = parseFloat(coordsBits[1]);//969.9;
		imgRect.width = parseFloat(coordsBits[2]) - imgRect.x;//((-250) - (-400));
		imgRect.height = parseFloat(coordsBits[3]) - imgRect.y;//(970.9 - 969.9);
		thisImage.BoundingRectangle = imgRect;
		
		// load image
		img.src = src;
	}
	
	// set the src
	this.SetSrc = function (uri)
	{
		src = uri;
		this.Load();
	}
	
	this.IsLoaded = function () { return loaded; }
	this.GetImage = function () { return image; }
}


DataTiler.ImageArray = function (uris, baseDir, onAllLoaded)
{
	this.Images = [];
	var numImages = 0;
	var loadedCount = 0;
	var allLoaded = false;
	var thisArray = this;
	
	// increment count on load
	var onImageLoaded = function ()
	{
		// increment count
		loadedCount += 1;
		
		// all loaded?
		if (loadedCount < thisArray.Images.length) return;
		
		allLoaded = true;
		
		if (onAllLoaded != undefined) onAllLoaded();
	}
	
	this.AllLoaded = function () { return allLoaded; }
	
	// load images to start with
	numImages = uris.length;
	for (var i=0; i<uris.length; i++)
	{
		var img = new DataTiler.Image();
		img.OnImageLoad = onImageLoaded;
		this.Images.push(img);		
		
		var fname = uris[i];
		if (baseDir != undefined) fname = baseDir + fname;
		img.SetSrc(uris[i]);
		
		
	}
	
	this.AddImage = function (uri)
	{
		var img = new DataTiler.Image();
		img.OnImageLoad = onImageLoaded;
		this.Images.push(img);		
		
		img.SetSrc(uri);
	}
	
	this.Get = function (i)
	{
		return thisArray.Images[i];
	}
	this.GetNumImages = function () { return numImages; }
}

//return DataTiler;

//});