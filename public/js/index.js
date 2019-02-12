var config = {
    apiKey: "AIzaSyDCRh-slIK4OrfOygnEgOW7uv8BQyirbtA",
    authDomain: "jay-book.firebaseapp.com",
    databaseURL: "https://jay-book.firebaseio.com",
    projectId: "jay-book",
    storageBucket: "jay-book.appspot.com",
    messagingSenderId: "740434210124"
  };
  firebase.initializeApp(config);

/** local variables **/
  var log = console.log;
  var auth = firebase.auth();
  var db = firebase.database();
  var googleAuth = new firebase.auth.GoogleAuthProvider();
  var ref = null;
  var user = null;
  var key = null;

  $("#login_bt").on("click", function(){
    auth.signInWithPopup(googleAuth);
  });

  $("#logout_bt").on("click", function(){
    auth.signOut();
  });

  auth.onAuthStateChanged(function(result){
    if(result) {
      user = result;
      var email = '<img src="'+result.photoURL+'" style="width:24px;border-radius:50%;"> '+result.email;
      $("#login_bt").hide();
      $("#logout_bt").show();
      $("#user_email").html(email);
    } else {
      user = null;
      $("#login_bt").show();
      $("#logout_bt").hide();
      $("#user_email").html('');
    }
    init();
  });
  
/** Database **/ 
function init() {
  $(".jbooks").empty();
  ref = db.ref("root/jbook");
  ref.off();
  ref.on("child_added", onAdd);
  ref.on("child_removed", onRev);
  ref.on("child_changed", onChg);
}
function onAdd(data){
  var k = data.key;
  var v = data.val();
  var d = showDate(v.wdate);
  var icon = "";
  if(user){ 
    if(user.uid==v.uid) {
      icon += '<i onclick="onUpdate(this);" class="fas fa-edit"></i>';
      icon += '<i onclick="onDelete(this);" class="fas fa-trash"></i>';
    }
  }
  
  var html = '<ul id="'+k+'" data-uid="'+v.uid+'" class="jbook">';
  html += '<li>'+v.uname+' ('+v.email+') | <span>'+d+'</span></li>';
  html += '<li>'+v.content+'</li>';
  html += '<li>'+icon+'</li>';
  html += '</ul>';
  $(".jbooks").prepend(html);
}

function onRev(data) {
  var k = data.key;
  $("#"+k).remove();
}

function onChg(data) {
  var k = data.key;
  var v = data.val();
  $("#"+k).children("li").eq(0).children("span").html(showDate(v.wdate));
  $("#"+k).children("li").eq(1).html(v.content);
}

function zeroAdd(n) {
  if(n<10) return "0"+n;
  else return n;
}

function showDate(timestamp) {
  var d = new Date(timestamp);
  var month = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  var date = String(d.getFullYear())+"년 "+month[d.getMonth()]+" "+String(d.getDate())+"일 "+zeroAdd(d.getHours())+":"+zeroAdd(d.getMinutes())+":"+zeroAdd(d.getSeconds());
  return date;
}

$("#save_bt").on("click",function(){
  var $content = $("#content");
  if($content.val() == "") {
    alert("내용을 입력하세요");
    $content.focus();
  } else {
    ref = db.ref("root/jbook/");
    ref.push({
      email: user.email,
      uid: user.uid,
      uname: user.displayName,
      content: $content.val(),
      wdate: Date.now()
    }).key;
    $content.val('');
  }
})

function onUpdate(obj) {
  key = $(obj).parent().parent().attr("id");
  var $target = $(obj).parent().prev();
  var v = $(obj).parent().prev().html();
  var html = '<input type="text" class="w3-input w3-show-inline-block w3-border w3-border-red" style="width:calc(100% - 150px);" value="'+v+'">&nbsp;';
  html += '<button type="button" class="w3-button w3-orange" style="margin-top:-4px;" onclick="doUpdate(this);">Edit</button>';
  html += '<button type="button" class="w3-button w3-black" style="margin-top:-4px;" onclick="doCancel(this, \''+v+'\');">Cancel</button>';
  $target.html(html);
}
function doUpdate(obj) {
  var $input = $(obj).prev();
  var content = $input.val();
  key = $(obj).parent().parent().attr("id");
  ref = db.ref("root/jbook/"+key).update({
    content: content,
    wdate: Date.now()
  });
}
function doCancel(obj, val) {
  var $target = $(obj).parent().html(val);
}

function onDelete(obj) {
  key = $(obj).parent().parent().attr("id");
  if(confirm("Do you really want to delete the data?")){
    db.ref("root/jbook/"+key).remove();
  }
}