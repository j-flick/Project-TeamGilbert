'use strict';

var apiKey = {
	googleCloudVision: "AIzaSyCF2DVvnz6sI81_a2Jkt890y8na5IdFfwc",
	food2Fork: "c103ba7d0a1fa27872bc2e2a6a224ae9",
	mashApe: "QM5kNr6mfnmshHGr87kiK2ME43fmp1UMzZGjsnyXlkLPSHi067"
}

var apiURL = {
	googleCloudVision: "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey.googleCloudVision,
	searchByIngredients: "https://community-food2fork.p.mashape.com/search?key=" + apiKey.food2Fork + "&q=",
	searchByRecipeID: "https://community-food2fork.p.mashape.com/get?key=" + apiKey.food2Fork + "&rId="
}

var ingredientList = [];
var recipeList = [];
var loadImageIndex = 1;
var cardTemplate = Handlebars.compile($("#card-template").html());
var picTemplate = Handlebars.compile($("#pic-template").html());


$("#index-banner").on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
  })
  .on('drop', function(e) {

    callGoogleVisionAPI(e.originalEvent.dataTransfer.files);
  }
);

$(document).keyup(function(e) {
     if (e.keyCode == 27) { // escape key maps to keycode `27`
        $("#ingredient-pics").empty();
        ingredientList = [];
        $("#text-bar").html("Add Your Ingredients to Search");
    }
});

function buildRecipeCards(cardsPerRow) {
	
	$("#recipe-cards").append($("<div>").addClass("row").attr("id", "currentRow"));

	for(var i = 0; i < recipeList.length; i++){

		$("#currentRow").append(cardTemplate(recipeList[i]));

		if(i % cardsPerRow == (cardsPerRow-1)){
			$("#currentRow").removeAttr("id");
			$("#recipe-cards").append($("<div>").addClass("row").attr("id", "currentRow"));
		}
	}	
}

function addLoadedPic(imgSrc, imgIndex){
	$("#ingredient-pics").append(picTemplate({img_index: imgIndex, loaded_img: imgSrc}))
}

function callGoogleVisionAPI(droppedfiles){	

	var reader = new FileReader(); // File reader object to process selected file

	reader.onloadend = function(){ // Callback function definition; Runs after FileReader loads file


		addLoadedPic([reader.result], ingredientList.length);
		$("#text-bar").html("Searching ...");

		var request = {  // create google defined json object to pass into the google API call data parameter, as required
	    requests: [{
	      image: {content: reader.result.replace('data:image/jpeg;base64,', "")},
	      features: [{type: "LABEL_DETECTION", maxResults: 10}]
	    }]
	  }; // End request object

	  $.ajax({  // async call to google cloud vision api

	    url: apiURL.googleCloudVision,
	    method: "POST",
	    data: JSON.stringify(request),
	    contentType: 'application/json'
	  
	  }).done(  // call back function

	  	function(googleImageAnalysisResults) {  // Updates ingredientList Array with valid searchable ingredients from image analysis

	  		var returnedImageLabels = googleImageAnalysisResults.responses[0].labelAnnotations; // array of json 'label' objects from google
	  		var validLabels = [];
	  		
	  		returnedImageLabels.forEach(function(labelObj){ // loop through returned label objects from google
	  			
	  			var label = labelObj.description; // grab description string from label object

	  			if(validIngredientList.includes(label) && !(validLabels.includes(label))) { // if label is valid and not a duplicate
	  				validLabels.push(label);  // add it to the valid labels array
	  			}	  				

	  		});

	  		ingredientList.push(validLabels); // push the valid labels array as an element of global ingredients array	  		

		    $("#text-bar").html("Top Recipes Containing: " + ingredientListToText());
				callFood2ForkAPI();

	  }); // End Ajax Call

	} // End file reader onLoadEnd callback function

	reader.readAsDataURL(droppedfiles[0]); // initiate reading of file from user selection
  
} // End callGoogleVisionAPI function

function callFood2ForkAPI(){

	$.ajax({  // async call to food2fork api to search by ingredients
	  url: apiURL.searchByIngredients + encodeIngredientListForURL(),
	  method: "GET",
	  headers: {
	    'X-Mashape-Key': apiKey.mashApe,
	    'Accept': 'application/json'
	  }
	}).done( // callback function

		function(searchByIngredientResults) {

			var returnedRecipes = JSON.parse(searchByIngredientResults).recipes // array of json recipe objects

			recipeList = [];
			if(returnedRecipes.length > 0){
				returnedRecipes.forEach(function(recipeObj){ // loop through returned recipe objects from food2fork
	
					recipeList.push(recipeObj);

				}); // end for each
			}// end if

	  	$("#recipe-cards").empty();
			buildRecipeCards(3);

	}); // end call back function

} // end callFood2ForkAPI function


function encodeIngredientListForURL() { // parse ingredientList array into URL string for search

	var encodeString = "";
	for(var i = 0; i < ingredientList.length; i++)
		for(var j = 0; j < ingredientList[i].length; j++)
			encodeString += encodeURIComponent(ingredientList[i][j]) + ",";

	return encodeString.slice(0, -1);	
} // end encodeIngredientListForURL function

function ingredientListToText() {

	var ingredientString = "";
	for(var i = 0; i < ingredientList.length; i++)
		for(var j = 0; j < ingredientList[i].length; j++)
			ingredientString += capitalizeFirstLetter(ingredientList[i][j]) + ", ";

	return ingredientString.slice(0, -2);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



















// Preset array of common ingredients to compare with description results returned from Google Cloud Vision API.
//==============================================================================================================
var validIngredientList = 
								["cooked","shredded","chicken","warm","hot","sauce","mayo","carrot","grated","celery","sliced",
                "onion","diced","cheese","crumbled","cheddar","slices","bread","butter","coffee","water",
                "half-and-half","sweetened","condensed","milk","skim","sugar","sweeteners","syrups","macaroni",
                "cloves","garlic","minced","peeled","pitted","fresh","lime","juice","chopped","cilantro","salt",
                "pepper","flour","avocado","garnish","potatoes","olive oil","rosemary","herbs",
                "yeast","baking powder","soda","cinnamon","frosting","powdered","brewed","jalapeno","peppers",
                "sourdough","cream","tortilla chips","extra-virgin","leaves","thyme","oregano","paprika",
                "well-crumbled","bay leaf","lemon","chilled","ice","semolina","cornmeal","pork","chipotle",
                "adobo","jalapenos","bacon","frozen","spinach","thawed","drained","artichoke","mayonnaise",
                "clove","chili","parmigiano","reggiano","parmesan","mozzarella","cubed","cocoa","eggs",
                "buttermilk","chickpeas","garbanzo beans","beans","ripe","wheat","bread","sandwich","toppings",
                "lettuce","tomato","sprouts","tomatoes","rotel","diced","chilies","cumin","beef","breakfast",
                "sausage","dried","parsley","basil","lowfat","cottage","shredded","lasagna","noodles","pasta",
                "water","graham cracker","crumbs","dark chocolate","vanilla","extract","guinness","bananas",
                "egg","peanut","guacamole","jalapeño","stems","seeds","rigatoni","crushed","roasted",
                "potato","carrots","corn","peas","broth","worcestershire","seasonings","honey",
                "confectioners","bite sized","pieces","stalks","rice","gluten free","sauce","mashed",
                "enchilada","chile","tortillas","coconut","oats","almond","meal","skinless","boneless",
                "breast","bottle","barbeque","italian","salad dressing","salad","dressing","nutmeg","pumpkin",
                "stevia","swiss","rye","butter","orange","zest","marshmallow","creme","peaches","kiwi",
                "blueberries","pears","raspberries","thighs","beer","burrito","queso","quesadilla",
                "salsa","peeps","rice krispies","rice krispies treats","cajun","spice","fettuccine","low sodium",
                "wine","cayenne","shrimp","lemons","tabasco","cake","pecans","tapioca","mexican","muffin",
                "pickled","panko","onions","steak","tenderized","seasoned","tabasco","rolls","pint",
                "strawberries","starchy","russets","nutella","chocolate","hazelnut","spread","granulated",
                "unsalted","scoop","cookie","cupcakes","nuts","mezzaluna","linguine","smoked","chinese","pie",
                "masala","seasoning","apples","refrigerated","cookies","velvet cake","canola","cheesecake",
                "filling","quinoa","broccoli","broccoli florets","almonds","feta","biscuits","wedges","thai",
                "pure","sifted","creamy","reese's","baileys","icing","lentils","ginger","curry","scallions",
                "raisins","puree","monterey","picante","mushrooms","breadcrumbs","caramel","rolos","sausages",
                "oreo","brownie","cider","vinegar","syrup","bourbon","chilis","tartar","yolk","greek yogurt",
                "yogurt","cookies","espresso","loaf","sushi","sesame","tofu","walnuts","uncooked","ribs",
                "kernels","guacamole","juiced","stalk","cauliflower","low-sodium","pitas","bean","yolks",
                "mustard","corned","vinaigrette","saffron","confit","pea","pesto","arugula","caramelized",
                "sauteed","cheeses","pizza","pepperoni","olives","pico de gallo","tilapia","fillets",
                "soybean","blend","distilled","turmeric","apple","dumplings","spices","zucchini","squash","slice",
                "lard","salted","salmon","soy","crackers","chuck","fat","ketchup","pickle","relish","hamburger",
                "buns","dill","pickles","iceberg","core","bun-sized","deli-cut","american","granules","muscovado",
                "caster","curls","pimentos","pickles","chocolate","canned","ricotta","apricots","plums","berries",
                "grapes","spices","spaghetti","shallot","parmigiano-reggiano","ale","gluten","dijon","bouillon",
                "land o' lakes","cornstarch","cucumber","meat","kidney","beef","bison","turkey","whiskey",
                "barbecue","stew","whisked","cremini","truffle","fontina","gruyere","poppyseed","frosting","crisco",
                "buttercream","chips","gin","vodka","sprigs","rump roast","soup","loaves","ciabatta","fat-free",
                "chobani","pita","serrano","pulp","kale","crackers","cabbage","mung sprouts","scallions","cucumbers",
                "cashews","skillet","flank","jasmine","mint","peppermint","whole-milk","turkey","sage",
                "marshmallows","pineapple","spears","skewered","chops","sriracha","pimentos","pumpkin-pie",
                "nut"];