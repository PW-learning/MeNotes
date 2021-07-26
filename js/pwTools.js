// Samir's short selector function
let $id = id => document.getElementById(id)
// Generate random ID
let rId = () => Date.now().toString(36)
// Toast support
function pwToast(txt = "", time = 5) {
    time = time * 1000;
    let x = document.getElementById("toast");
    x.innerHTML = txt;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, time);
}
// Enable vibration support
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
function vibError(){
    if (navigator.vibrate) {
            window.navigator.vibrate([100,50,500])
    }
}
function vibOnce(){
    if (navigator.vibrate) {
            window.navigator.vibrate(500)
    }
}
function vibTwice(){
    if (navigator.vibrate) {
            window.navigator.vibrate([100,50,100])
    }
}
function vibrate(sec){
    if (navigator.vibrate) {
            window.navigator.vibrate(sec)
    }
}
// Connection status
if(navigator.onLine){
    pwToast("You are good to go")
} else {
    pwToast("You are offline... check your internet connection")
}
window.addEventListener("online", () => {
    pwToast("You are back Online")
})
window.addEventListener("offline", () => {
    pwToast("You are working Offline")
})