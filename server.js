// init project
var express = require('express');
var app = express();
var mongoose = require("mongoose");
var path = require('path');
var requester = require('request');



// Mongoose connection and Schema creation. Connects to mlab and uses the model "urls"
mongoose.connect("mongodb://" + process.env.USER + ":" + process.env.pwd + "@ds235877.mlab.com:35877/url_shortener");
var searchSchema = new mongoose.Schema({ //In db we only have one array which stores 10 objects containing the query word and current date. It is updated with pop and unshift.
   search: [],
});
var search = mongoose.model("search", searchSchema);
/* Used to load the original search history
        var loadsearch = new search({ 
         search: [{term:"tennis",when:"27 Jan 2018 12:54:08 GMT"},{term:"joker",when:"27 Jan 2018 12:54:08 GMT"},{term:"milan",when:"27 Jan 2018 12:54:08 GMT"},{term:"cow",when:"27 Jan 2018 12:54:08 GMT"},{term:"paris",when:"27 Jan 2018 12:54:08 GMT"},{term:"london",when:"27 Jan 2018 12:54:08 GMT"},{term:"cat",when:"27 Jan 2018 12:54:08 GMT"},{term:"animal",when:"27 Jan 2018 12:54:08 GMT"},{term:"dragon",when:"27 Jan 2018 12:54:08 GMT"},{term:"cards",when:"27 Jan 2018 12:54:08 GMT"}],
        });
        loadsearch.save(function (err, data) { 
          if(err) {console.log(err)} else {console.log(OK)}
        }
*/

app.use(express.static('public'));
app.set("view engine", "ejs");

app.get("/", function (request, response) {
  response.render("index");
});

app.get("/imagesearch/:keyword", function (request, response) { // Route to search for new query string related images
  var keyword = request.params.keyword;
  var offset = request.query.offset || 1;
  const url = "https://www.googleapis.com/customsearch/v1?key=" + process.env.API + "&cx=" + process.env.cx + "&q=" + keyword + "&searchType=image&start=" + offset;
  console.log(url);
  requester.get(url, (error, res, body) => { // Beginning of Request package to interrogate Google API
    if (error){
      response.send(error);
    } else { // Perform : 1. Display query result to user. 2. Update seach history in db  BELOW -----
      if (JSON.parse(body).searchInformation.totalResults != "0") { //If Google API shows results
        let json = JSON.parse(body).items.map(function (val) {  //1. Creates objects to display query result to user.
          return {
            url	: val.link,
            snippet : val.snippet, 
            thumbnail : val.image.thumbnailLink,
            context : val.image.contextLink
          }
        });
        search.findOne({ _id: '5a6c79c29d45f52eadd3467b' }, function (err, doc){ // 2. Retrieves and updates search history array in db.
            if (err){
              response.send(err)
            } else {
              doc.search.pop();
              doc.search.unshift(
                {
                  term : keyword,
                  when : new Date().toUTCString()
                }
              );
              console.log(doc.search);
              doc.search = doc.search;
              doc.save();
            }
        });
        response.send(json); // 1. Display query result to user.
      } else { // In case query does not return results (if (JSON.parse(body).searchInformation.totalResults != "0"))
        response.send("Sorry, your search did not return any result. Please try another query string.");
      }   
    }// End of 1. and 2. ABOVE -----
  }); //End of Request package to interrogate Google API
});// End of /imagesearch/:keyword route

app.get("/latest/imagesearch", function (request, response) { // Route to display search history
  search.findOne({ _id: '5a6c79c29d45f52eadd3467b' }, function (err, doc){ 
    if (err){
      response.send(err)
    } else {
      response.send(doc.search)
    }
  });
}); // End of /latest/imagesearch route

// listen for requests 
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

//https://developers.google.com/custom-search/json-api/v1/overview
 