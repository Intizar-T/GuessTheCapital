fetch("https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv")
.then(response => response.text())
.then(data => {
  var pairs = []
  var country = "", capital = "", h = 0, k = 0
  data += data[15]
  for(var i=16; i<data.length; i++)
  {
    if(data[i] != ','  &&  h == 0)
    {
      country += data[i]
    }
    else if(data[i].charCodeAt() != 13)
    {
      h = 1
      capital += data[i + 1]
    }
    else
    {
      var obj = {}
      h = 0
      obj.country = country
      obj.capital = capital
      pairs.push(obj)
      capital = ""
      country = ""
    }
  }
  window.pairs = pairs
  //localStorage.clear()
  var count = 0, timer
  if (localStorage.getItem("count") == null) 
    localStorage.setItem("count", count)

  if (localStorage.getItem('prev') == null)
    localStorage.setItem('prev', 0)

  if (performance.type == performance.TYPE_RELOAD)
    document.getElementById("prevscore").innerHTML = localStorage.getItem("prev")


  mapboxgl.accessToken = 'pk.eyJ1IjoiaW50aXphcjIyIiwiYSI6ImNrbGpmcjNkdzA1bGkyeHAzaTJrcmpibWsifQ.Hbg8gvWXiY92n01KnvTD9g';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
  })
  map.addControl(new mapboxgl.NavigationControl({position: 'top-left'}));
  //map.addControl(new mapboxgl.Language({  defaultLanguage: 'en'}))

    $("#All").click()
    var pair = pairs[Math.round(Math.random() * pairs.length)]
    var country = pair.country
    var capital = pair.capital
    $("#pr2__question").html(country)
    

    $("#pr2__submit").click(function(){
      $("#unor_list").css("display", "none")
      var answer = document.getElementById("pr2__answer").value
      document.getElementById("pr2__answer").value = ''
      $("#noEntry").hide()
      $("#intro").hide()
      var table = document.getElementsByTagName("tbody")
      var tbody = table[0]
      tbody.insertRow(4)
      var element = tbody.children[4]//document.createElement('tr');//
      capital = capital.substring(0, capital.length-1)
      if (answer != '') 
        answer = answer[0].toUpperCase() + answer.substring(1, answer.length);
      
      if (answer == capital){
        document.getElementById("correctN").innerHTML = parseInt(document.getElementById("correctN").innerHTML) + 1
        element.setAttribute("class", "correct")
        element.innerHTML = "<td onmouseenter = 'mouseEnter(this)' onmouseleave = 'mouseLeave()'>"+country+"</td>"+"<td onmouseenter = 'mouseEnter(this) onmouseleave = 'mouseLeave()'>"+ answer + "</td>" + "<td onmouseenter = 'mouseEnter(this)' onmouseleave = 'mouseLeave()'>" + capital + 
        "<button onclick = 'checkEmpty(this.parentElement.parentElement);'>Delete</button>" + "</td>"
        
        if ($("#Incorrect").is(":checked")){
          element.style.display = "none"
        }
      }
      else{
        document.getElementById("incorrectN").innerHTML = parseInt(document.getElementById("incorrectN").innerHTML) + 1
        //console.log(val)
        //$("#incorrectN").val(parseInt($("#incorrectN").val()) + 1)
        //console.log($("#incorrectN").val())

        if ($("#Correct").is(":checked")){
          element.style.display = "none"
        }
        element.setAttribute("class", "incorrect")
        element.innerHTML = "<td onmouseenter = 'mouseEnter(this)' onmouseleave = 'mouseLeave()'>"+country+"</td>"+"<td><del>"+ answer + "</del></td>" + "<td onmouseenter = 'mouseEnter(this)' onmouseleave = 'mouseLeave()'>" + capital +
        "<button onclick = 'checkEmpty(this.parentElement.parentElement);'>Delete</button></td>"
      }
      var net = document.getElementById("correctN").innerHTML - document.getElementById("incorrectN").innerHTML
      if (net >= 0)
        document.getElementById("netscore").innerHTML = net
      else  net = 0
      
      localStorage.setItem("prev", net)

      var data = {
        pr2__answer: element.innerHTML,
        class: element.getAttribute("class")
      }
      count = parseInt(localStorage.getItem("count"))
      if(answer != '')
        firebase.database().ref("Answers/" + answer + count).set(data)
      else  firebase.database().ref("Answers/" + capital + count).set(data)
      count++
      localStorage.setItem("count", count)

      cap2loc(capital)

      pair = pairs[Math.round(Math.random() * pairs.length)]
      country = pair.country
      capital = pair.capital
      $("#pr2__question").html(country)
    })
    var database = firebase.database()
    var ref = database.ref("Answers")
    
        ref.once("value", function(snapshot)
        {
            snapshot.forEach(element => {
            var tbody = document.getElementsByTagName("tbody")[0]
            tbody.insertRow(4)
            tbody.children[4].innerHTML = element.val().pr2__answer
            //console.log(tbody.children[4].innerHTML)
            tbody.children[4].setAttribute('class', element.val().class)
            })
            if ($(".incorrect").length != 0 || $(".correct").length != 0){
              $("#noEntry").hide()
              $("#intro").hide()
            }
                
  })

    $("#pr2__answer").on('keyup', function(e){
      $("#intro").hide()
      var index, answer = $("#pr2__answer").val(), ul = document.getElementById("unor_list")
      var childCount = ul.childElementCount, capLow
      for (var i = 0; i < childCount; i++){
        ul.children[0].remove()
      }
      if (e.key === 'Enter'){
        $("#pr2__submit").click()
      }
      else if (answer.length > 1){
        $("#unor_list").width($("#pr2__answer").width())
        $("#unor_list").css("display", "block")
        for(var i = 0; i < pairs.length; i++){
          capLow = pairs[i].capital.toLowerCase()
          index = capLow.search(answer.toLowerCase())
          if (index == 0){
            var li = document.createElement("li")
            li.innerHTML = pairs[i].capital
            li.setAttribute("onmouseenter", "$('#pr2__answer').val(this.innerHTML);")
            li.setAttribute("onclick", "$('#unor_list').css('display', 'none'); $('#pr2__submit').click()")
            ul.appendChild(li)
          }
        }
        if (ul.innerHTML == '')
          $("#unor_list").css("display", "none")
      }
      else  $("#unor_list").css("display", "none")
    })

  $("#pr3__clear").click(function(){
    firebase.database().ref("Answers").remove()
    var tbody = document.getElementsByTagName("tbody")[0]
    var length = tbody.children.length
    var tr
    //console.log(tbody.children[4]);
    for (var i = 4; i < length; i++){
      tr = tbody.children[4]
      //console.log(tr);
      if(tr.id != 'noEntry'){
       // console.log(tr);
        tr.remove()

      }
    }
    $("#noEntry").show()
    $("#intro").show()
    removeItem("count")
    localStorage.setItem("count", "0")
    document.getElementById("prevscore").innerHTML = 0
  })

  $("#Correct").click(function(){
    $(".incorrect").hide()
    $(".correct").show()
    if ($(".correct").length == 0){
      $("#noEntry").show()
      $("#intro").show()
    }
    
    else if ($(".correct").length != 0){
      $("#noEntry").hide()
      $("#intro").hide()
    }
      
  })
  
  $("#Incorrect").click(function(){
    $(".correct").hide()
    $(".incorrect").show()
    if ($(".incorrect").length == 0){
      $("#noEntry").show()
      $("#intro").show()
    }
    
    else if ($(".incorrect").length != 0){
      $("#noEntry").hide()
      $("#intro").hide()
    }
      
  })
  
  $("#All").click(function(){
    $(".correct").show()
    $(".incorrect").show()
    if ($(".incorrect").length != 0 || $(".correct").length != 0){
      $("#noEntry").hide()
      $("#intro").hide()
    }
      
  }) 

  $("#prevclear").click(function(){
    //alert()
    localStorage.setItem("prev", 0)
    document.getElementById('prevscore').innerHTML = localStorage.getItem("prev")
  })
})

function checkEmpty(tr){
  if (tr.parentElement.children[5] == undefined){
    $("#noEntry").show()
    $("#intro").show()
    localStorage.removeItem("count")
    localStorage.setItem("count", "0")
  }
    
  if (tr.className == 'incorrect')
    firebase.database().ref("Answers/" + tr.children[1].children[0].innerHTML).remove()
  else
    firebase.database().ref("Answers/" + tr.children[1].innerHTML).remove() //.remove()
  tr.remove()
  if ($("#Incorrect").is(":checked") && $(".incorrect").length == 0){
    $("#noEntry").show()
    $("#intro").show()
  }
    
  if ($("#Correct").is(":checked") && $(".correct").length == 0){
    $("#noEntry").show()
    $("#intro").show()
  }
    
}

function cap2loc(capOrcoun, indicator){
  axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address: capOrcoun,
      key: 'AIzaSyAFJlQ8OEmeSGcDGriDkxGc7SLjCSdfbXI'
    }
  })
  .then(function(response){
    //console.log(response)
    if (!indicator){
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [response.data.results[0].geometry.location['lng'], response.data.results[0].geometry.location['lat']],
      zoom: 10
  })
}
  else{
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [response.data.results[0].geometry.location['lng'], response.data.results[0].geometry.location['lat']],
      zoom: 5
  })
  }
  var southwest = response.data.results[0].geometry.bounds.southwest
  var northeast = response.data.results[0].geometry.bounds.northeast
})

  
    
  .catch(function(error){
    console.log(error)
  })
} 

function mouseEnter(value){
  //console.log("mouseEnter")
  var count = '', i = 0
  var td = value
  timer = setInterval(function(){
      //console.log(td.innerHTML)
      while(td.innerHTML[i] != '<' && i < td.innerHTML.length){
        count += td.innerHTML[i]
        i++
      }
      //console.log(count)
      if (count.length == td.innerHTML.length)
        cap2loc(count, 1)
      else  cap2loc(count, 0)
      clearInterval(timer)
    }, 500)
}

function mouseLeave(){
    //console.log("entered mouseLeave") 
    clearInterval(timer)
    var tbody = document.getElementsByTagName('tbody')[0]
    var country = tbody.children[tbody.children.length - 2].children[0].innerHTML
    //console.log(country)
    cap2loc(country, 1)
}