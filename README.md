jquery-texposition
===========

Texposition is a jQuery plugin that uses a canvas element to analyze the pixel data of an image. It uses the pixels under the caption to recommend whether to use a light or dark wash for the caption background.

###Dependencies
jQuery, browsers that support canvas

###Usage

Add the plugin to your page

    <link type="text/css" href="texposition.css">
    <script type="text/javascript" src="jquery.texposition.js"></script>

Apply it to a canvas object, and pass in the image, the caption and the optional parameters

    
    $("#canvas").texposition( image, $(".title"), { 
      proportion: 1/3,
      orientation: "bottom",
      pixelIntensityThreshold: 160,
      threshold: 0.5,
      labelClass: "title",
      lightClass: "light-wash",
      darkClass: "dark-wash"
    });
    
    
where
* proportion - fraction of image covered by caption
* orientation - position of caption on the image and can be one of top, bottom, right, left
* pixelIntensityThreshold - grayscale value of the pixel at which it is thresholded to either black or white
* threshold - percentage of region being considered which needs to be above the pixelIntensityThreshold for a light-wash
* labelClass - css class name for the div holding the caption
* lightClass - css class name for the light background
* darkClass - css class name for the dark background
    