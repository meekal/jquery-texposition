/*
 * Default text - jQuery plugin for positioning text labels on images
 *
 * Author: Meekal Bajaj
 *
 * Email: [Firstname]@twitter.com
 *
 * Copyright (c) 2012 Meekal Bajaj
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.github.com/meekal/jquery-texposition
 *
 * Version:  0.0.1
 *
 * Features:
 *      
 * Usage:
 *
 */

(function($) {
  var defaults = {
    proportion: 1/3,
    orientation: "bottom",
    pixelIntensityThreshold: 160,
    threshold: 0.5,
    labelClass: "title",
    lightClass: "light-wash",
    darkClass: "dark-wash"
  }

  function drawImageOnCanvas($canvas, canvasContext, img, imgWidth, imgHeight) {
    $canvas.attr("width", imgWidth);
    $canvas.attr("height", imgHeight);
    canvasContext.drawImage(img, 0, 0);
  }

  function getPixels(canvasContext) {
    return canvasContext.getImageData(0, 0, canvas.width, canvas.height);
  }

  function getIndicesForImageSection(totalWidth, totalHeight, totalLength) {
    var indices = {
      start: 0,
      end: 0,
      areSegmented: false
    }

    switch(defaults.orientation) {
      case "left": {
        indices.start = 0;
        indices.end = totalWidth * defaults.proportion;
        indices.areSegmented = true;
        break;
      }
      case "right": {
        indices.start = totalWidth * (1 - defaults.proportion);
        indices.end = totalWidth;
        indices.areSegmented = true;
        break;
      }
      case "top": {
        indices.start = 0;
        indices.end = totalWidth * totalHeight * defaults.proportion;
        break;
      }
      case "bottom": {
        indices.start = totalWidth * totalHeight * (1 - defaults.proportion);
        indices.end = totalLength
        break;
      }
      default: {
        break;
      }
    }
    indices.start = Math.floor(indices.start);
    indices.end = Math.floor(indices.end);

    return indices;
  }

  function isImageSectionDark(imgDataVals, imgWidth, imgHeight, indices) {
    var sum = 0;
    var counter = 0;

    if(indices.areSegmented) {
      for (var j = 0; j < imgHeight; j++) {
        for (var i = indices.start; i < indices.end; i += 4) {
          var offset = j*imgWidth;
          var r = imgDataVals[i + offset];
          var g = imgDataVals[i+1 + offset];
          var b = imgDataVals[i+2 + offset];
          var v = (0.2126*r + 0.7152*g + 0.0722*b >= defaults.pixelIntensityThreshold) ? 1 : 0;
          sum += v;
          counter += 1;
        } 
      }
    } else {
      for (var i = indices.start; i < indices.end; i += 4) {
        var r = imgDataVals[i];
        var g = imgDataVals[i+1];
        var b = imgDataVals[i+2];
        var v = (0.2126*r + 0.7152*g + 0.0722*b >= defaults.pixelIntensityThreshold) ? 1 : 0;   
        sum += v;
        counter += 1;
      }
    }

    if(sum/counter < defaults.threshold) {
      return true;
    } else {
      return false;
    }
  }

  function setCSSMap($label, canvasWidth, canvasHeight) {
    var labelHeight = $label.height();
    var labelPadding = parseInt($label.css("padding-left"));

    var cssMap = {
      "top": "auto",
      "right": "auto",
      "bottom": "auto",
      "left": "auto",
      "margin": "auto",
      "width": "auto",
      "height": "auto"
    };

    switch(defaults.orientation) {
      case "bottom": {
        $.extend( true, cssMap, {
          "bottom": 0,
          "left": "50%",
          "width": canvasWidth,
          "margin-left": -canvasWidth/2        
        });
        break;
      }

      case "top": {
        $.extend(true, cssMap, {
          "top": 0,
          "left": "50%",
          "width": canvasWidth,          
          "margin-left": -canvasWidth/2       
        });
        break;
      }

      case "left": {
        $.extend(true, cssMap, {
          "top": 0,
          "left": 0,
          "margin-left": 0,
          "height": canvasHeight + 2,
          "width": canvasWidth * defaults.proportion          
        });
        break;
      }

      case "right": {
        $.extend(true, cssMap, {
          "right": 0,
          "top": 0,
          "height": canvasHeight + 2,
          "width": canvasWidth * defaults.proportion
        });
        break;
      }
    }

    return cssMap;
  }

  $.fn.texposition = function(img, $label, options) {
    $.extend(true, defaults, options);

    var canvasContext = this[0].getContext("2d"); //get underlying object from jQuery
    var imgWidth = img.width;
    var imgHeight = img.height;
    drawImageOnCanvas(this, canvasContext, img, imgWidth, imgHeight);

    var imgData = getPixels(canvasContext);
    var imgDataVals = imgData.data;

    var canvasWidth = $(this).width();
    var canvasHeight = $(this).height();
    var cssMap = setCSSMap($label, canvasWidth, canvasHeight);
    $label.css(cssMap);

    var classString = defaults.labelClass;
    var indices = getIndicesForImageSection(imgWidth, imgHeight, imgDataVals.length);
    var useDarkBackground = isImageSectionDark(imgDataVals, imgWidth, imgHeight, indices);

    if(useDarkBackground) {
      classString += " " + defaults.darkClass + " " + defaults.darkClass + "-";
    } else {
      classString += " " + defaults.lightClass + " " + defaults.lightClass + "-";
    }
    classString += defaults.orientation;
    $label.removeClass().addClass(classString);      
  };
})(jQuery);
