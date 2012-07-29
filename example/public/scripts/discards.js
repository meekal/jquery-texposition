
Filters = {};

Filters.tempCanvas = document.createElement("canvas");
Filters.tempCtx = Filters.tempCanvas.getContext("2d");

Filters.filterImage = function(filter, image, var_args) {
  var args = [image];

  if (!(image instanceof ImageData)) {
    args = [this.getPixels(image)];
  };

  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }

  return filter.apply(null, args);
};

Filters.createCanvas = function(w, h) {
  var c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

Filters.getPixels = function(img, canvas) {
  var ctx = canvas.getContext("2d");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

Filters.setPixels = function(imgData, canvasContext) {
  canvasContext.putImageData(imgData, 0, 0);
};

Filters.drawImageOnCanvas = function(img, canvasContext) {
  $("#canvas").attr("width", img.width);
  $("#canvas").attr("height", img.height);
  canvasContext.drawImage(img, 0, 0);
}

Filters.createImageData = function(w, h) {
  return this.tempCtx.createImageData(w, h);
};

Filters.convoluteFloat32 = function(pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
 
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
 
    var w = sw;
    var h = sh;
    var output = {
        width: w, height: h, data: new Float32Array(w * h * 4)
    };
    var dst = output.data;
 
    var alphaFac = opaque ? 1 : 0;
 
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y * w + x) * 4;
            var r = 0, g = 0, b = 0, a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                    var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                    var srcOff = (scy * sw + scx) * 4;
                    var wt = weights[cy * side + cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                    a += src[srcOff + 3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
};

Filters.convolute = function( pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  //pad output by convolution matrix
  var w = sw;
  var h = sh;
  var output = Filters.createImageData(w, h);
  var dst = output.data;

  //go through destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for(var y = 0; y < h; y++) {
    for(var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;

      var dstOff = (y * w + x ) * 4;

      var r = 0, g = 0, b = 0, a = 0;

      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  
  return output;
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
   
    // CIE luminance for the RGB
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.threshold = function(pixels, threshold) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;    
    d[i] = d[i+1] = d[i+2] = v
  }

  return pixels;
};

Filters.FILTER = {
  a: [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ]
};

function getImageSectionIndices(totalWidth, totalHeight, totalLength, params) {
  var defaults = { 
    proportion: 1/3,
    orientation: "bottom" 
  };

  $.extend( true, defaults, params);

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


    var $canvas = document.getElementById("canvas"); 
    var $title = $(".title");


    var canvasContext = $canvas.getContext("2d");
    Filters.drawImageOnCanvas(img1, canvasContext);

    var imgData = Filters.getPixels(img1, $canvas);
    var canvasHeight = $canvas.height;
    var canvasWidth = $canvas.width;

    var orientation = "bottom";

    var imgDataVals = imgData.data;
    var indices = getImageSectionIndices(img1.width, img1.height, imgData.data.length, {"orientation": orientation} );

    var pixelThreshold = 160;
    var threshold = 0.50;
    var sum = 0;
    var counter = 0;

    if(indices.areSegmented) {
      for (var j = 0; j < canvasHeight; j++) {
        for (var i = indices.start; i < indices.end; i += 4) {
          var r = imgDataVals[i + j*canvasWidth];
          var g = imgDataVals[i+1 + j*canvasWidth];
          var b = imgDataVals[i+2 + j*canvasWidth];
          var v = (0.2126*r + 0.7152*g + 0.0722*b >= pixelThreshold) ? 1 : 0;
          sum += v;
          counter += 1;
        }        
      }
    } else {
      for (var i = indices.start; i < indices.end; i += 4) {
        var r = imgDataVals[i];
        var g = imgDataVals[i+1];
        var b = imgDataVals[i+2];
        var v = (0.2126*r + 0.7152*g + 0.0722*b >= pixelThreshold) ? 1 : 0;   
        sum += v;
        counter += 1;
      }
    }

    var classString = "title ";

    if(sum/counter < threshold) {
      classString += "dark-wash-";
    } else {
      classString += "white-wash-";
    }

    $title.width($($canvas).width() - 20);

    var cssMap = {
      "margin-left": -$title.width()/2 - 11          
    };

    switch(orientation) {
      case "bottom": {
        $.extend(true, cssMap, {
          "bottom": "0"
        });
        classString += "bottom";
        break;
      }

      case "top": {
        $.extend(true, cssMap, {
          "top": "0"
        });
        classString += "top";
        break;
      }

      case "left": {
        $.extend(true, cssMap, {
          "left": "0",
          "top": "0",
          "margin-left": 0,
          "height": $($canvas).height() - 27,
          "width": $($canvas).width()/3          
        });
        classString += "left";

        break;
      }

      case "right": {
        $.extend(true, cssMap, {
          "right": "0",
          "left": "auto",
          "top": "0",
          "height": $($canvas).height() - 27,
          "margin-left": "auto",
          "width": $($canvas).width()/3
        });
        classString += "right";
        break;
      }
    }

    // $title.removeClass().addClass(classString);      
    // $title.css(cssMap);

    // var imd = ctx.createImageData(imgWidth, imgHeight/3);
    // //imd.putImageData(tempData);
    // imd.data = tempData;


    // var buf = new ArrayBuffer(imgDataLength/3);
    // var buf8 = new Uint8ClampedArray(buf);
    // var tempData = new Uint32Array(buf);

    // for(var y = 2*imgHeight/3; y < imgHeight; y++) {
    //   for(var x = 0; x < imgWidth; x++) {
    //     var val = imgDataVals[y * imgWidth + x];

    //     tempData[y * imgWidth + x] = 
    //       (255 << 24) | //alpha
    //       (val << 16) | //blue
    //       (val << 8)  | //green
    //       val;          //red          
    //   }
    // }

    // imgData.data = buf8;
    
    // var imd = ctx.createImageData(imgWidth, imgHeight/3);
    // imd.putImageData(tempData);

    // console.log(buf, buf8, tempData, imgData, imd);

    // ctx.putImageData(imgData, 0, 0);


    // var imgData = Filters.filterImage( Filters.convolute, img, [
    //      0, -1, 0,
    //     -1, 5, -1,
    //      0,  -1, 0
    // ], 1);

    //var threshold = Filters.filterImage(Filters.threshold, img1, 127);


    // var vertical = Filters.convoluteFloat32(threshold,
    //   [ -1, 0, 1,
    //     -2, 0, 2,
    //     -1, 0, 1 
    //   ]
    // );

    // var horizontal = Filters.convoluteFloat32(threshold,
    //   [ -1, -2, -1,
    //      0,  0,  0,
    //      1,  2,  1 
    //   ]
    // );

    // var final_image = Filters.createImageData(vertical.width, vertical.height);

    // for (var i=0; i<final_image.data.length; i+=4) {
    //   // make the vertical gradient red
    //   var v = Math.abs(vertical.data[i]);
    //   final_image.data[i] = v;

    //   // make the horizontal gradient green
    //   var h = Math.abs(horizontal.data[i]);
    //   final_image.data[i+1] = h;

    //   // and mix in some blue for aesthetics
    //   final_image.data[i+2] = (v+h)/4;
    //   final_image.data[i+3] = 255; // opaque alpha
    // }

    //Filters.setPixels(img1);