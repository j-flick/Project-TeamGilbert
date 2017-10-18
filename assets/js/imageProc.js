var AnnotateImageRequests = {requests: []};
var cloudVisionURL;
var ing = [];

var apiKey = "AIzaSyCF2DVvnz6sI81_a2Jkt890y8na5IdFfwc";
var food2fork = 'c103ba7d0a1fa27872bc2e2a6a224ae9';
// var food2fork = '17275fd61372781206ebd78bbf4c306c';

cloudVisionURL = "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey + "";
foodURL = 'https://community-food2fork.p.mashape.com/search?key=c103ba7d0a1fa27872bc2e2a6a224ae9&q=';
getRecipeURL = "https://community-food2fork.p.mashape.com/get?key=c103ba7d0a1fa27872bc2e2a6a224ae9&rId=";
MashapeKey = 'QM5kNr6mfnmshHGr87kiK2ME43fmp1UMzZGjsnyXlkLPSHi067';

function runQuery(imgRequest, cloudVisionURL) { // add parameters
  $.ajax({
    url: cloudVisionURL,
    method: "POST",
    data: imgRequest,
    contentType: 'application/json'
  }).done(function(cloudData) {
    console.log("URL:" + cloudVisionURL);
    console.log(cloudData);

    parseArray(cloudData);


  }).fail(function (jqXHR, textStatus, errorThrown) {
     console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
  });
}

function testFoodApi() {
  console.log(foodURL);
  $.ajax({
    url: foodURL,
    method: "GET",
    headers: {
      'X-Mashape-Key': MashapeKey,
      'Accept': 'application/json'
    }
  }).done(function(foodData) {
    getRecipe(foodData);
  });
}

function getRecipe(foodData){
  console.log(foodData);
  var recipeId = JSON.parse(foodData).recipes[0].recipe_id;
  $.ajax({
    url: getRecipeURL + recipeId,
    method: "GET",
    headers: {
      'X-Mashape-Key': MashapeKey,
      'Accept': 'application/json'
    }
  }).done(function(foodData) {
    $("#img2").attr("src", JSON.parse(foodData).recipe.image_url);
    console.log(JSON.parse(foodData).recipe.image_url);
  });

}

// function loopRecipes() {

// }

function parseArray(data) {

  console.log(data.responses);
  console.log(data.responses[0].labelAnnotations[0].description);

  for (var i = 0; i < data.responses[0].labelAnnotations.length; i++) {
    ing.push(data.responses[0].labelAnnotations[i].description);
  }

  var convertedArray = encodeURIComponent(ing);

  foodURL += convertedArray;
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