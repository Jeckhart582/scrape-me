//Grabs the "articles" JSON that was scrape and appends text with p tags to our HTML id
$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>" + "<br />" + "<p id=titleinput>" + "<br />" + "<p id=bodyinput>" + "</p>");
    }
  });
  

$(document).on("click", "p", function() {
    $("#notes").empty();

    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    .then(function(data){
        console.log(data);
        $("#notes").append("<h2>" + data.title + "</h2>");
        $("#notes").append("<input id='titleinput' name='title' >")
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        if (data.note) {

            $("#titleinput").text(data.note.title);
            $("#bodyinput").text(data.note.body);
        }
    });
});

$(document).on("click", "#savenote", function() {

    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function(data) {
        console.log(data);
        $("#notes").empty();
      });
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });



