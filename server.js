// init project
var express = require('express');
var app = express();
var mongoose = require("mongoose");
var path = require('path');
var requester = require('request');



// Mongoose connection and Schema creation. Connects to mlab and uses the model "urls"
mongoose.connect("mongodb://" + process.env.USER + ":" + process.env.pwd + "@ds235877.mlab.com:35877/url_shortener");
var searchSchema = new mongoose.Schema({
   term: String,
   when: Date
});
var search = mongoose.model("search", searchSchema);

app.use(express.static('public'));
app.set("view engine", "ejs");

app.get("/", function (request, response) {
  response.render("index");
});

app.get("/imagesearch/:keyword", function (request, response) {
  var keyword = request.params.keyword;
  var offset = request.query.offset || 1;
  const url = "https://www.googleapis.com/customsearch/v1?key=" + process.env.API + "&cx=" + process.env.cx + "&q=" + keyword + "&searchType=image&start=" + offset;
  console.log(url);
  requester.get(url, (error, res, body) => {
    if (error){
      response.send(error);
    } else {
      let json = JSON.parse(body);
      response.send(json);
    }
  });
});

//https://developers.google.com/custom-search/json-api/v1/overview

/*
app.get("/new/*", function (request, response) { // Route to add a new address
  var address = request.originalUrl.slice(5); // Removes "/new/*" from the url in order to only keep the address to shorten

  // ADDRESS CHECKER HERE
  //Regex from https://gist.github.com/dperini/729294
  var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  
  if (regex.test(address)) { // Checks if address contains http or https
    
    var check = url.findOne({'original_url': "max"}); // Used to fetch and temporarily store the highest shotened address from db in order to continue incrementing when adding a new address
    check.then(function (data) {
    
        var newAddress = new url({ // Creates address and shortened url in db
         original_url: address,
         short_url: data.short_url + 1
        });
        newAddress.save(function (err, data) { // Saves the creation
          if (err) {
            response.send(err);  
          } else {
            url.update({'original_url': "max"}, {'short_url': data.short_url},  function (err, data) { // Updates the highest shortened url number for the next incrementation
              if (err) {
                response.send(err)
              } else {
                response.send( // Publishes to the user the shortened url
                  {
                  original_url: newAddress.original_url,
                  short_url: newAddress.short_url,  
                  }
                );   
              }
            });
          }
        });
      
      }).catch(function (err) {
        response.send(err);
      });       
  } else { // If input address is not valid or does not contain http or https 
    response.send("Error: The url must be valid. To use a shortened url, please use '/[your shortened address]'. Also ensure that your address starts with 'http://' or 'https://'."); 
  };
  
}); // End of /new/:address route

app.get("/:short", function (request, response) { // Route zhe user inputs shortened address and is redirected to his website
  var short = request.params.short;
  if (!isNaN(short)) {  // Shortened url is a number so we check if the input is one
    url.findOne({ 'short_url': short, 'original_url': {$ne : "max"}},  function (err, person) { // Queries db for a match. 'original_url': {$ne : "max"} is added in order not to retrieve the max object dedicated to sotring the highest shortened address number
      if (err) {
        response.send(err);  
      } else {
        if (!person) { // mlab will return an empty result if the shortened url does not exists, so we check whether the response is truthy
          response.send("Error: The shortened url could not be found");  
        } else {
          response.redirect(person.original_url);
        }
      }
    });
  } else {
    response.send("Error: The shortened url must be a number");
  };     
});  // End of /:short route
*/
// listen for requests 
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
 