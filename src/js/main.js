/*------ Global Variables -------*/

var API_URL = "http://www.omdbapi.com/?t=";
var FIREBASE_URL = "https://nssmovies.firebaseio.com/";
var fb = new Firebase(FIREBASE_URL);
var movies;
$(".addMovie").hide();

/*------ Lookup a Movie -------*/

$(".submit").click(function() {
  var $movieSeachField = $(".movie");
  var $submitButton =  $(".submit");
  $movieSeachField.prop("disabled", true);
  $submitButton.attr("disabled", true).html("Searching...");
  $(".movie-info").html("");
  $(".movie-poster").html("");
  var $input = $movieSeachField
    .val()
    .split(" ")
    .join("+");
  var url = API_URL + $input + "&y=&plot=short&r=json";
  $.get(url, function(data) {
    $(".movie-info")
      .append("<h2 class='title'>\"" + data.Title + "\"</h2><h3 class='rating'>" + data.Rated + "</h3")
      .append("<hr>")
      .append("<h4>Plot: " + data.Plot + "</h4>")
      .append("<h5>Actors: " + data.Actors + "</h5>")
      .append("<h5>Genre: " + data.Genre + "</h5>")
      .append("<h5>Released on " + data.Released + "</h5>")
      .append("<h5>IMDB Rating: " + data.imdbRating + "</h5>")
    $(".movie-poster")
      .append("<img src='" + data.Poster + "'</img>");
    $(".addMovie").show();
    $movieSeachField.prop("disabled", false);
    $submitButton.attr("disabled", false).html("Enter Movie Title");
  })//End of .get request
})//End of submit.click function

/*------ Add to Firebase & Table -------*/

$(".addMovie").click(function() {
  var $input = $(".movie").val().split(" ").join("+");
  var url = API_URL + $input + "&y=&plot=short&r=json";
  var postUrl = fb.child(`users/${fb.getAuth().uid}/movies`);
  $.get(url, function(data) {
    postUrl.push(data);
    $('input[type="text"]').val('');
  });
})

/*------ Syncing previous movie table -------*/

fb.onAuth(function(authData) {
  if (authData && authData.password.isTemporaryPassword) {
    window.location = '/reset_password.html'
  } else if (authData) {
  var postUrl = fb.child(`users/${fb.getAuth().uid}/movies`);
    postUrl.on("child_added", function(snapshot) {
      addMovieData(snapshot.val(), snapshot.key());
    })
  }
})

function addMovieData(data, id) {
  $(".movie-collection")
    .prepend("<tr></tr>");
  var $target = $(".movie-collection tr:first")
    .attr("data-id", id)
    .append("<td><img src='" + data.Poster + "' class='poster'></td>")
    .append("<td>" + data.Title + "</td>")
    .append("<td>" + data.Year + "</td>")
    .append("<td>" + data.Rated + "</td>")
    .append("</td><td><button type='text' class='btn btn-warning delete'>Remove</button></td></tr>");
}

/*------ Delete data from Firebase & Table -------*/

$(".movie-collection").on('click', ".delete", function() {
  var $mov = $(this).closest('tr');
  var id = $mov.attr('data-id');
  $mov.remove();
  var deleteUrl = fb.child(`users/${fb.getAuth().uid}/movies/${id}`);
  deleteUrl.remove();
})

/*------ Register new user -------*/

$('.register').click(function () {
  var email = $('.login-welcome input[type="email"]').val();
  var password = $('.login-welcome input[type="password"]').val();
  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      doLogin(email, password);
    }
  });
  event.preventDefault();
});

/*------ Login to Database -------*/

$('.login-welcome form').submit(function () {
  var email = $('.login-welcome input[type="email"]').val();
  var password = $('.login-welcome input[type="password"]').val();

  doLogin(email, password);
  event.preventDefault();
});

/*------ Logout of Database -------*/

$('.logout').click(function () {
  window.location = '/';
  fb.unauth();
})

/*------ Reset password -------*/

$('.reset-password').click(function () {
  var email = $('.login-welcome input[type="email"]').val();
  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
      window.location = '/reset_password.html'
    }
  });
});

/*------ Reset password -------*/

$('.to-reset-password form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.to-reset-password input:nth-child(1)').val();
  var newPw = $('.to-reset-password input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
      window.location = '/';
    }
  });

  event.preventDefault();
})

$(".cancel").click(function() {
  window.location = '/login.html'
})

/*------ Functions -------*/

function doLogin (email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      window.location = 'myMovieDatabase/home.html';
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
    }
  });
}

function saveAuthData(authData) {
  var ref = fb.child(`users/${authData.uid}/profile`);
  ref.set(authData);
}

function clearLoginForm () {
  $('input[type="email"]').val('');
  $('input[type="password"]').val('');
}
