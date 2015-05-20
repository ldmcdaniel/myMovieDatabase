var API_URL = "http://www.omdbapi.com/?t=";
var FIREBASE_URL = "https://nssmovies.firebaseio.com/movies.json"
$(".addMovie").hide();
//$(".movie-collection").hide();

/*------ Get JSON requests -------*/
$(".submit").click(function() {
  $(".movie-info").html("");
  $(".movie-poster").html("");
  var $input = $(".movie")
    .val()
    .split(" ")
    .join("+");
  var url = API_URL + $input + "&y=&plot=short&r=json";
  $.get(url, function(data) {
    $(".movie-info")
      .append("<h2>\"" + data.Title + "\"</h2>")
      .append("<p>Plot: " + data.Plot + "</p>")
      .append("<h3>Released in " + data.Year + "</h3>")
      .append("<h3> Rated: " + data.Rated + "</h3>");
    $(".movie-poster")
      .append("<img src='" + data.Poster + "'</img>");
    $(".addMovie").show();
  })//End of .get request
})//End of submit.click function

/*------ Add to Firebase & Table -------*/
$(".addMovie").click(function() {
  //$(".movie-collection").show();
  var $input = $(".movie")
    .val()
    .split(" ")
    .join("+");
  var url = API_URL + $input + "&y=&plot=short&r=json";
  $.get(url, function(data) {
    $.post(FIREBASE_URL, JSON.stringify(data), function (res) {
      addMovieData(data, res.name);
    });//End of .post
  }, 'jsonp'); //End of .get
}) //End of $addMovie.click

function addMovieData(data, id) {
  $(".movie-collection")
    .append("<tr></tr>");
  var $target = $("tr:last")
    .attr("data-id", id)
    .append("<td><img src='" + data.Poster + "' class='poster'></td>")
    .append("<td>" + data.Title + "</td>")
    .append("<td>" + data.Year + "</td>")
    .append("<td>" + data.Rated + "</td>")
    .append("</td><td><button type='text' class='delete'>X</button></td></tr>");
}
/*------ Delete data from Firebase & Table -------*/

$(".movie-collection").on('click', ".delete", function() {
  var $mov = $(this).closest('tr');
  var id = $mov.attr('data-id');
  $mov.remove();
  var deleteUrl = FIREBASE_URL.slice(0, -5) + '/' + id + '.json';

  $.ajax({
    url: deleteUrl,
    type: 'DELETE'
  })
})

/*------ Syncing previous movie table -------*/

$.get(FIREBASE_URL, function(data) {
  Object
    .keys(data)
    .forEach(function(id) {
    addMovieData(data[id], id);
  });
});



