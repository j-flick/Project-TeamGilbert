var AnnotateImageRequests = {requests: []};
var cloudVisionURL;

var apiKey = "AIzaSyCF2DVvnz6sI81_a2Jkt890y8na5IdFfwc";
// key=API_KEY

cloudVisionURL = "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey + "";

function runQuery(imgRequest, cloudVisionURL) { // add parameters
  $.ajax({
    url: cloudVisionURL,
    method: "POST",
    data: imgRequest,
    contentType: 'application/json'
  }).done(function(cloudData) {
    console.log("URL:" + cloudVisionURL);
    console.log(cloudData);
  }).fail(function (jqXHR, textStatus, errorThrown) {
     console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
  });
}

function encodeImageFileAsURL(element) {
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {

    $("#img").attr("src", reader.result);
    $("#img64").text("base64: " + reader.result.replace('data:image/jpeg;base64,', ""));
    buildJson(reader.result.replace('data:image/jpeg;base64,', ""));
    console.log(AnnotateImageRequests);
    //console.log(JSON.stringify(AnnotateImageRequests));
    runQuery(JSON.stringify(AnnotateImageRequests), cloudVisionURL);

  }
  reader.readAsDataURL(file);
}

function buildJson(img64){
  var imageObj = {content: img64};
  var featuresObj1 = {type: "LABEL_DETECTION", maxResults: 10};
  var AnnotateImageRequestObj = {image: imageObj, features: [featuresObj1]};
  AnnotateImageRequests.requests.push(AnnotateImageRequestObj);
}

// $.post({
//     url: cloudVisionURL,
//     data: JSON.stringify(AnnotateImageRequests),
//     contentType: 'application/json'
//   }).fail(function (jqXHR, textStatus, errorThrown) {
//     console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
//   }).done(function(results){
//     console.log(JSON.stringify(results))
// });