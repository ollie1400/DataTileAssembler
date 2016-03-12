/*
 * main entry.  Cretae a DataTiler object with a reference to a canvas
 */
function DataTiler(tCanvas, tViewPort, uris)
{
	var viewPort = tViewPort;
	var canvas = tCanvas;
	var canvasDefaultCursor = "default";
	
	var thisDataTiler = this;

	this.ImageArray = undefined;
	var checkBoxDiv;
	var checkBoxes = [];
	var checkBoxLabels = [];
	var voltageText;
	var wavelengthText;
	var lastDownTarget;
	
	// dragging things
	var initialMousePos = null;
	var initialViewPort = null;
	var lastRealMousePoint = null;
	
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
		var borderStyle = "#000000";
		var borderWidth = 1;
		
		// map images
		for (var i=0; i< ImageArray.Images.length; i++)
		{
			// skip if not visible
			if (!ImageArray.Images[i].Visible) continue;
			
			dRect = thisDataTiler.mapRectangleToViewPort(ImageArray.Images[i].BoundingRectangle);
			context.drawImage(ImageArray.Images[i].GetImage(), dRect.x, dRect.y, dRect.width, dRect.height);
			
			//context.strokeStyle = borderStyle;
			//context.rect(dRect.x-borderWidth, dRect.y-borderWidth, dRect.width+2*borderWidth, dRect.height+2*borderWidth);
			//context.stroke();
		}
		
		// draw x markers
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
			
			// line
			context.strokeStyle = lineStyle;
			p = thisDataTiler.mapPointToViewPort(new DataTiler.Point(x, 0));
			context.beginPath();
			context.moveTo(p.x,0);
			context.lineTo(p.x,canvas.height);
			context.stroke();
			
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
			
			// line
			context.strokeStyle = lineStyle;
			p = thisDataTiler.mapPointToViewPort(new DataTiler.Point(0,y));
			context.beginPath();
			context.moveTo(0,p.y);
			context.lineTo(canvas.width, p.y);
			context.stroke();
			
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
		console.log(e.wheelDelta);
		
		var lastCentreX = viewPort.x + viewPort.width / 2;
		var lastCentreY = viewPort.y + viewPort.height / 2;
		
		var newWidth = e.wheelDelta > 0 ? viewPort.width * 0.95 : viewPort.width * 1.05;
		var newHeight = e.wheelDelta > 0 ? viewPort.height * 0.95 : viewPort.height * 1.05;
		
		var newX = lastCentreX - newWidth / 2;
		var newY = lastCentreY - newHeight / 2;
		
		viewPort.x = newX;
		viewPort.y = newY;
		viewPort.width = newWidth;
		viewPort.height = newHeight;
		
		// redraw
		thisDataTiler.Redraw();
	}

	/*
	 * Canvas mouse move callback
	*/
	var canvasMouseMove = function(evt)
	{   
		var rect = canvas.getBoundingClientRect();
		var mousePos = new DataTiler.Point(evt.clientX - rect.left, evt.clientY - rect.top);
		
		var realPosition = thisDataTiler.mapPointToRealSpace(mousePos);
		lastRealMousePoint = realPosition;
		var message = 'Mouse position: ' + realPosition.x + ',' + realPosition.y + '  ' + evt.which;
		
		voltage.innerText = realPosition.x.toFixed(1);
		wavelength.innerText = realPosition.y.toFixed(3);
		
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
	}
	
	// CONSTRUCTOR
	
	
	// constructor code
	context = canvas.getContext("2d");
	canvas.addEventListener('mousemove', canvasMouseMove);
	canvas.style.cursor = canvasDefaultCursor;
	
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
	
	ImageArray = new DataTiler.ImageArray(uris, this.Draw);
	
	
		
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
	this.Visible = true;
	this.OnImageLoad;
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
		var coords = src.replace("image_","").replace(".png","");
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


DataTiler.ImageArray = function (uris, onAllLoaded)
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