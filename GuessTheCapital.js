fetch("https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv")
.then(response => response.text())
.then(data => {
  var pairs = [];
  var country = "", capital = "", h = 0, k = 0;
  data += data[15];
  for(var i=16; i<data.length; i++)
  {
    if(data[i] != ','  &&  h == 0)
    {
      country += data[i];
    }
    else if(data[i].charCodeAt() != 13)
    {
      h = 1;
      capital += data[i + 1];
    }
    else
    {
      var obj = {};
      h = 0;
      obj.country = country;
      obj.capital = capital;
      pairs.push(obj);
      capital = "";
      country = "";
    }
  }
  window.pairs = pairs;
  
  //var global_answer;
  $("#All").click();
    var pair = pairs[Math.round(Math.random() * pairs.length)];
    var country = pair.country;
    var capital = pair.capital;
    $("#pr2__question").html(country);
    $("#pr2__submit").click(function(){
      $("#unor_list").css("display", "none");
      var answer = document.getElementById("pr2__answer").value;
      document.getElementById("pr2__answer").value = '';
      $("#noEntry").hide();
      var table = document.getElementsByTagName("tbody");
      var tbody = table[0];
      tbody.insertRow(4);
      var element = tbody.children[4];//document.createElement('tr');//
      capital = capital.substring(0, capital.length-1);
      answer = answer[0].toUpperCase() + answer.substring(1, answer.length);
      //global_answer = answer;
      if (answer == capital){
        element.setAttribute("class", "correct");
        element.innerHTML = "<td>"+country+"</td>"+"<td>"+ answer + "</td>" + "<td>" + capital + "<button onclick = 'checkEmpty(this.parentElement.parentElement);'>Delete</button>" + "</td>";
        
        if ($("#Incorrect").is(":checked")){
          element.style.display = "none";
        }
      }
      else{
        if ($("#Correct").is(":checked")){
          element.style.display = "none";
        }
        element.setAttribute("class", "incorrect");
        element.innerHTML = "<td>"+country+"</td>"+"<td><del>"+ answer + "</del></td>" + "<td>" + capital + "<button onclick = 'checkEmpty(this.parentElement.parentElement);'>Delete</button></td>";
      }

      var data = {
        pr2__answer: element.innerHTML,
        class: element.getAttribute("class")
      };
      firebase.database().ref("Answers/" + answer).set(data);

      pair = pairs[Math.round(Math.random() * pairs.length)];
      country = pair.country;
      capital = pair.capital;
      $("#pr2__question").html(country);
    });

    //console.log(global_answer);

    var database = firebase.database();
    var ref = database.ref("Answers");
    
        ref.once("value", function(snapshot)
        {
            snapshot.forEach(element => {
            var tbody = document.getElementsByTagName("tbody")[0];
            tbody.insertRow(4);
            tbody.children[4].innerHTML = element.val().pr2__answer;
            tbody.children[4].setAttribute('class', element.val().class);
            })
            if ($(".incorrect").length != 0 || $(".correct").length != 0)
                $("#noEntry").hide();
  });

  
    $("#pr2__answer").on('keyup', function(e){
      var index, answer = $("#pr2__answer").val(), ul = document.getElementById("unor_list");
      var childCount = ul.childElementCount, capLow;
      for (var i = 0; i < childCount; i++){
        ul.children[0].remove();
      }
      if (e.key === 'Enter'){
        $("#pr2__submit").click();
      }
      else if (answer.length > 1){
        $("#unor_list").width($("#pr2__answer").width());
        $("#unor_list").css("display", "block");
        for(var i = 0; i < pairs.length; i++){
          capLow = pairs[i].capital.toLowerCase();
          index = capLow.search(answer.toLowerCase());
          if (index == 0){
            var li = document.createElement("li");
            li.innerHTML = pairs[i].capital;
            li.setAttribute("onmouseenter", "$('#pr2__answer').val(this.innerHTML);");
            li.setAttribute("onclick", "$('#unor_list').css('display', 'none'); $('#pr2__submit').click()");
            ul.appendChild(li);
          }
        }
        if (ul.innerHTML == '')
          $("#unor_list").css("display", "none");
      }
      else  $("#unor_list").css("display", "none");
    });
  
  $("#pr3__clear").click(function(){
    firebase.database().ref("Answers").remove();
    var tbody = document.getElementsByTagName("tbody")[0];
    var length = tbody.children.length;
    var tr;
    //console.log(tbody.children[4]);
    for (var i = 4; i < length; i++){
      tr = tbody.children[4];
      //console.log(tr);
      if(tr.id != 'noEntry'){
       // console.log(tr);
        tr.remove();

      }
        
        //console.log("not noEntry");

    };
    $("#noEntry").show();
    //console.log(tbody.children);
  });

  $("#Correct").click(function(){
    $(".incorrect").hide();
    $(".correct").show();
    if ($(".correct").length == 0)
    $("#noEntry").show();
    else if ($(".correct").length != 0)
      $("#noEntry").hide();
  });
  
  $("#Incorrect").click(function(){
    $(".correct").hide();
    $(".incorrect").show();
    if ($(".incorrect").length == 0)
    $("#noEntry").show();
    else if ($(".incorrect").length != 0)
      $("#noEntry").hide();
  });
  
  $("#All").click(function(){
    $(".correct").show();
    $(".incorrect").show();
    if ($(".incorrect").length != 0 || $(".correct").length != 0)
      $("#noEntry").hide();
  })
});

function checkEmpty(tr){
  if (tr.parentElement.children[5] == undefined)
    $("#noEntry").show(); 
  if (tr.className == 'incorrect')
    firebase.database().ref("Answers/" + tr.children[1].children[0].innerHTML).remove();
  else
    firebase.database().ref("Answers/" + tr.children[1].innerHTML).remove(); //.remove()
  tr.remove();
  if ($("#Incorrect").is(":checked") && $(".incorrect").length == 0)
    $("#noEntry").show();
  if ($("#Correct").is(":checked") && $(".correct").length == 0)
    $("#noEntry").show();
}