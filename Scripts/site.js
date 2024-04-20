var cropper;
$('#downloadBtn').click(function () {
    if(cropper == null)
        alert("કૃપા કરીને તમારો ફોટો પસંદ કરો");
});
$("body").on("change", "#browse_image", function (e) {

    window.scrollTo({
        top: 525,
        behavior: 'smooth'
      });

    var files = e.target.files;
    var done = function (url) {
        $('#display_image_div').html('');
        $("#display_image_div").html('<img name="display_image_data" id="display_image_data" src="' + url + '" alt="Uploaded Picture">');

    };
    if (files && files.length > 0) {
        file = files[0];

        if (URL) {
            done(URL.createObjectURL(file));
        } else if (FileReader) {
            reader = new FileReader();
            reader.onload = function (e) {
                done(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    var image = document.getElementById('display_image_data');
    var button = document.getElementById('crop_button');
    var result = document.getElementById('cropped_image_result');
    var croppable = false;

    cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 0,
        dragMode: 'move',
        autoCropArea: 0.85,
        restore: false,
        guides: false,
        center: false,
        highlight: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
        ready: function () {
            croppable = true;

        },
    });
    
    $('#downloadBtn').click(function () {
        // Crop
        croppedCanvas = cropper.getCroppedCanvas();

        // Round
        roundedCanvas = getRoundedCanvas(croppedCanvas);

        // Show
        roundedImage = document.createElement('img');

        roundedImage.src = roundedCanvas.toDataURL()
        result.innerHTML = '';
        result.appendChild(roundedImage);

        // Get the canvas
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        // Draw the main image
        var mainImage = new Image();
        mainImage.src = './Images/Banner Main.jpeg';
        mainImage.onload = function () {
            ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);

            // Draw the second image (cropped image) at a specific position
            var secondImage = new Image();
            secondImage.src = $('#cropped_image_data').val(); // Getting the cropped image data
            secondImage.src = $('#cropped_image_result img').attr('src')
            secondImage.onload = function () {
                ctx.drawImage(secondImage, 636, 813, 285, 278); // Adjust position and size as needed

                // To Write Text on Image
                var ctxText = canvas.getContext('2d');
                ctxText.font = '40px Arial'; // Set font size and type
                ctxText.fillStyle = '#FF3434'; // Set text color
                // ctxText.textAlign = 'center'; // Set text alignment
                ctxText.fillText($('#p_name').val() == '' ? 'જય શ્રી રામ' : $('#p_name').val(), canvas.width - 325, canvas.height - 125); // Set position of text

                // Convert canvas content to a data URL
                var dataURL = canvas.toDataURL('image/png');

                // Create a link element for downloading
                var downloadLink = document.createElement('a');
                downloadLink.download = $('#p_name').val() == '' ? 'જય શ્રી રામ' : $('#p_name').val() + '_BBH-Template.png'; // Set filename for downloaded image
                downloadLink.href = dataURL;

                // Trigger download
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
        };

        InsertExpense();
    });
});

function getRoundedCanvas(sourceCanvas) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = sourceCanvas.width;
    var height = sourceCanvas.height;

    var width = 720;
    var height = 720;

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.drawImage(sourceCanvas, 0, 0, width, height);
    context.globalCompositeOperation = 'destination-in';
    context.beginPath();
    context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
    context.fill();
    return canvas;
}

$('#d-btn').click(function (e) {
    e.preventDefault();  //stop the browser from following

    var $url = $(this).attr('href');

    var link = document.createElement('a');
    document.body.appendChild(link);
    link.download = '';
    link.href = $url;
    link.click();

    var is_iphone = iOS();

    if (!is_iphone) {
        window.location.href = window.location.href;
    }
});

function iOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function InsertExpense() {

    var URL_Main = 'https://script.google.com/macros/s/AKfycbyPqzq1qs1zw5u07KBRyg4gFmV2vWG0hDbVLhvGD6sRFLiurB_U60W-zDUI51scrdVtaw/exec';

    var name = $('#p_name').val() == '' ? 'જય શ્રી રામ' : $('#p_name').val();
    var mobile = $("#mobile").val();

    $.ajax({
        url: URL_Main,
        type: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data:
        {
            name: name,
            mobile: mobile
        },
        success: function (data) { },
        error: function (xhr, status, error) { }
    });
}
