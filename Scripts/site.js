// Configuration for positions to avoid magic numbers
const POSTER_CONFIG = {
    templateUrl: './Images/Banner Main-2026.jpeg',
    imageX: 589,
    imageY: 832,
    imageW: 272,
    imageH: 290,
    textY: 1186, // Text vertical position
    textCenterX: 725, // Center point for the text
    font: '600 40px "Noto Sans Gujarati", Arial, sans-serif',
    textColor: '#FF3434'
};

var cropper = null;
var finalPosterDataUrl = null;

$(document).ready(function() {

    $('#generateBtn').click(function () {
        // Form Validation manually triggered
        var form = $('#myform')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (cropper == null) {
            alert("કૃપા કરીને તમારો ફોટો પસંદ કરો");
            return;
        }

        // Show loading state
        $('#generateBtnText').text('Loading...');
        $('#generateSpinner').removeClass('d-none');
        $('#generateBtn').prop('disabled', true);

        // Process image inside a timeout to allow UI to update the loading spinner
        setTimeout(function() {
            generatePosterCanvas();
        }, 50);
    });

    $('#downloadFinalBtn').click(function() {
        if (finalPosterDataUrl) {
            var downloadLink = document.createElement('a');
            downloadLink.download = 'hanuman_janmostav_invitation_2026.png';
            downloadLink.href = finalPosterDataUrl;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            InsertExpense(); // Only insert when they actually download
        }
    });

    $("body").on("change", "#browse_image", function (e) {
        window.scrollTo({
            top: 600,
            behavior: 'smooth'
        });

        var files = e.target.files;
        var done = function (url) {
            $('#display_image_div').html('');
            $("#display_image_div").html('<img name="display_image_data" id="display_image_data" src="' + url + '" alt="Uploaded Picture">');

            // Initialize Cropper after image is applied
            var image = document.getElementById('display_image_data');
            
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }

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
                toggleDragModeOnDblclick: false
            });
        };

        if (files && files.length > 0) {
            var file = files[0];
            if (URL) {
                done(URL.createObjectURL(file));
            } else if (FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    done(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    });

});

function generatePosterCanvas() {
    var result = document.getElementById('cropped_image_result');
    
    // Crop
    var croppedCanvas = cropper.getCroppedCanvas();

    // Round
    var roundedCanvas = getRoundedCanvas(croppedCanvas);

    // Show temporary in DOM if needed (can be hidden)
    var roundedImage = document.createElement('img');
    roundedImage.src = roundedCanvas.toDataURL();
    result.innerHTML = '';
    result.appendChild(roundedImage);

    // Get the canvas
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Draw the main image
    var mainImage = new Image();
    mainImage.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);

        // Draw the second image (cropped image)
        var secondImage = new Image();
        secondImage.onload = function () {
            
            // Draw drop shadow for circular image
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
            // Draw a temporary circle path for the shadow background
            ctx.beginPath();
            ctx.arc(
                POSTER_CONFIG.imageX + (POSTER_CONFIG.imageW / 2),
                POSTER_CONFIG.imageY + (POSTER_CONFIG.imageH / 2),
                (POSTER_CONFIG.imageW / 2) - 2, 0, 2 * Math.PI
            );
            ctx.fillStyle = 'white'; 
            ctx.fill();
            ctx.restore();

            // Draw circular image over shadow
            ctx.drawImage(secondImage, POSTER_CONFIG.imageX, POSTER_CONFIG.imageY, POSTER_CONFIG.imageW, POSTER_CONFIG.imageH);
            
            // Draw a subtle border stroke around the image for premium edge
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                POSTER_CONFIG.imageX + (POSTER_CONFIG.imageW / 2),
                POSTER_CONFIG.imageY + (POSTER_CONFIG.imageH / 2),
                (POSTER_CONFIG.imageW / 2) - 1, 0, 2 * Math.PI
            );
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
            ctx.restore();

            // To Write Text on Image
            var nameText = $('#p_name').val().trim();
            if (nameText === '') {
                nameText = 'જય શ્રી રામ';
            }
            
            var ctxText = canvas.getContext('2d');
            ctxText.font = POSTER_CONFIG.font;
            ctxText.fillStyle = POSTER_CONFIG.textColor;
            ctxText.textAlign = 'center'; 
            
            // Draw text directly over the dynamic pill location
            ctxText.fillText(nameText, POSTER_CONFIG.textCenterX, POSTER_CONFIG.textY);

            // Convert canvas content to a data URL
            finalPosterDataUrl = canvas.toDataURL('image/png');

            // Apply to preview image and reveal section
            $('#poster_preview').attr('src', finalPosterDataUrl);
            $('#previewSection').removeClass('d-none');
            
            // Restore generate button state
            $('#generateBtnText').text('પોસ્ટર બનાવો');
            $('#generateSpinner').addClass('d-none');
            $('#generateBtn').prop('disabled', false);

            // Add slight delay before scrolling for smooth rendering update
            setTimeout(function() {
                var previewOffset = $('#previewSection').offset();
                if (previewOffset) {
                    window.scrollTo({
                        top: previewOffset.top - 20,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        };
        secondImage.onerror = resetGenerateButton;
        secondImage.src = roundedImage.src;
    };
    mainImage.onerror = resetGenerateButton;
    mainImage.src = POSTER_CONFIG.templateUrl;
}

function resetGenerateButton() {
    alert("Error loading template images. Please try again.");
    $('#generateBtnText').text('પોસ્ટર બનાવો');
    $('#generateSpinner').addClass('d-none');
    $('#generateBtn').prop('disabled', false);
}

function getRoundedCanvas(sourceCanvas) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
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

// Keep the old mobile redirect function mapping just in case
$('#d-btn').click(function (e) {
    e.preventDefault();
    var $url = $(this).attr('href');
    var link = document.createElement('a');
    document.body.appendChild(link);
    link.download = '';
    link.href = $url;
    link.click();
    if (!iOS()) {
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
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

function InsertExpense() {
    var URL_Main = 'https://script.google.com/macros/s/AKfycbyjW1jQYIqwJMJ6jNTybuaEhEoeT9a734n0y36yHlq6aiQJAMjYUVQgBay5tdUTORFpwA/exec';
    var name = $('#p_name').val().trim() || 'જય શ્રી રામ';
    var mobile = $("#mobile").val();

    $.ajax({
        url: URL_Main,
        type: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            name: name,
            mobile: mobile
        },
        success: function (data) { },
        error: function (xhr, status, error) { }
    });
}
