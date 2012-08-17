  Filters = {};
  Filters.tempCanvas = document.createElement("canvas");
  Filters.tempCtx = Filters.tempCanvas.getContext("2d");

  Filters.setPixels = function(imgData, canvasContext) {
    canvasContext.putImageData(imgData, 0, 0);
  };
  
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
