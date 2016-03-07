# DataTileAssembler

This is a JavaScript app (right now just a single page) that will take a set of images and draw them on a canvas according to the coordinates given for the top left, and bottom right corners of each image.

Useful if you have a load of partial images and want to see them all together in their proper positions relative to eachother.

# Use case

Suppose you have a set of image tiles that represent data taken in a parameter space.  For example, we have collected data in a 2D region of x and y, and at each coordinate we have a value z.
This can be represented as an image.

Now say you have N of these which are taken at different x and y regions and you want to assemble them all to get a view of the full 2D space.

The script has an array of filenames, which are in the format
`(image_)<xmin>,<ymin>,<xmax>,<ymax>.png`
where the preceeding `image_` part is optional.

each of these is loaded and drawn on the canvas so that it covers the area specified by the coordinates.

Limits are currently set up to display `-400` to `0` along x, and `970` to `976` along y.  It will work outside of these ranges, but was optimised for these sorts of values so might not look very good elsewhere.

To add a new imgage, just add the filename to the list.

# UI

For each image, a checkbox is generated.  The corresponding image is only drawn if its checkbox is checked.  The checkbox lights up when the image is moused over in the canvas.

Click and drag to move the view port through the space.

Scroll up/down to zoom out/in.

Up/down/left/right keys move the view port accordingly.

# Example

The images in the root folder are parts of a data set that look like

![alt tag](https://raw.githubusercontent.com/ollie1400/DataTileAssembler/master/image_-260.00,973.70,-100.00,973.84.png)

which has top left coordinates (-260,973.7) and bottom right coordinates (-100,973.84), and

![alt tag](https://raw.githubusercontent.com/ollie1400/DataTileAssembler/master/-400,969.9,-250,970.9.png)

which has top left coordinates (-400,969.9) and bottom right coordinates (-250,970.9).
These would be assembled on the canvas to look like:

![alt tag](https://raw.githubusercontent.com/ollie1400/DataTileAssembler/master/assembledexample.png)
