var dropbox = $('#dropbox');
var message = $('.message', dropbox);
var image = new Image();
var default_orientation = "bottom";

var filenames = [
  "public/assets/sample_images/sandals.png",
  "public/assets/sample_images/bench.jpeg",
  "public/assets/sample_images/statue.jpeg",
  "public/assets/sample_images/bay.png",
];

var $sample_images = $("#sample_images");

dropbox.filedrop({
  paramname:'pic',
  maxfiles: 1,
  maxfilesize: 5,
  url: '',
  
  error: function(err, file) {
    switch(err) {
      case 'BrowserNotSupported':
        showMessage('Your browser does not support HTML5 file uploads!');
        break;
      case 'TooManyFiles':
        alert('Too many files! Please select 5 at most! (configurable)');
        break;
      case 'FileTooLarge':
        alert(file.name+' is too large! Please choose files smaller than 2MB .');
        break;
      default:
        break;
    }
  },
  
  // Called before each upload is started
  beforeEach: function(file){
    if(!file.type.match(/^image\//)){
      alert('Only images are allowed!');   

      // Returning false will cause the file to be rejected
      return false;
    }
  },
  
  uploadStarted:function(i, file, len){
    createImage(file);
  }      
});

function positionText() {
  $(".title").css("display", "block");
  $(".orientation-selector").show();
  var orientation = $(".orientation-selector .selected").data("orientation");
  orientation = orientation || default_orientation;

  $(".empty-dropzone").removeClass("empty-dropzone");
  $("#canvas").texposition( image, $(".title"), {orientation: orientation, threshold: 0.7});
}; 

function createImage(file){ 
  var reader = new FileReader();    
  reader.onload = function(e){  
    // e.target.result holds the DataURL which
    // can be used as a source of the image:
    image.src = e.target.result;

    //the event fires before data url is properly read, adding delay till I figure it out
    window.setTimeout(function(){
      positionText();
    }, 300);
  };
  
  // Reading the file as a DataURL. When finished,
  // this will trigger the onload function above:
  reader.readAsDataURL(file);
}

function showMessage(msg){
  message.html(msg);
}

function preloadimages(images){
    var newimages = [], 
        loadedimages = 0;

    var postaction = function() {} //generic post action

    var images = (typeof images != "object") ? [images] : images;

    function imageloadpost() {
        loadedimages++;

        if (loadedimages == images.length){
            postaction(newimages) //call postaction and pass in newimages array as parameter
        }
    }

    for (var i = 0; i < images.length; i++) {
        newimages[i] = new Image();
        newimages[i].src = images[i];

        newimages[i].onload = function() {
            imageloadpost();
        }

        newimages[i].onerror=function() {
            imageloadpost();
        }
    }

    return { //return blank object with done() method
        done: function(f) {
            postaction = f || postaction; //remember user defined callback functions to be called when images load
        }
    }
}


$(".orientation").click(function() {
  $(this).siblings().removeClass("selected");
  $(this).addClass("selected");  
  positionText();
});


$(document).ready(function() {
  preloadimages(filenames).done(function(images) {

    for (var i = 0; i < images.length; i++) {
      var img_holder = $("<li class='sample-image'></li>");
      img_holder.append(images[i]);
      $sample_images.append(img_holder);
    }

    $(".sample-image").children("img").on("mouseup", function(e) {
      image.src = this.src;
      window.setTimeout(function(){
        positionText();
      }, 300);
    });
  });
});