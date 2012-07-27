var dropbox = $('#dropbox');
var message = $('.message', dropbox);
var image = new Image();
var defaultOrientation = "bottom";

  dropbox.filedrop({
    paramname:'pic',
    maxfiles: 1,
    maxfilesize: 2,
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
    
  function createImage(file){ 
    var reader = new FileReader();    
    reader.onload = function(e){  
      // e.target.result holds the DataURL which
      // can be used as a source of the image:
      image.src = e.target.result;

      //the event fires before data url is properly read, adding delay till I figure it out
      window.setTimeout(function(){
        $(".title").css("display", "block");
        $(".orientation-selector").show();

        var orientation = $(".orientation-selector .selected").data("orientation");
        orientation = orientation || defaultOrientation;
        $(".empty-dropzone").removeClass("empty-dropzone");
        $("#canvas").texposition( image, $(".title"), {orientation: orientation});
      }, 300);
    };
    
    // Reading the file as a DataURL. When finished,
    // this will trigger the onload function above:
    reader.readAsDataURL(file);
  }

  function showMessage(msg){
    message.html(msg);
  }

  $(".orientation").click(function() {
    $(this).siblings().removeClass("selected");
    $(this).addClass("selected");  

    var orientation = $(this).data("orientation");
    console.log(orientation);

    $("#canvas").texposition( image, $(".title"), {orientation: orientation});


  });
