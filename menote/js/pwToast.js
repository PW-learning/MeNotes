// This class isn't ready for usage yet;

/* export class Toast {
    constructor(message = "", time = 5) {
        this.message = message;
        this.time = time;
        // Enable vibration support;
        this.navigator = navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    }
    pwToast() {
        this.time = this.time * 1000;
        let toast = document.getElementById("toast");
        toast.innerHTML = message;
        toast.className = "pw-show-toast";
        setTimeout(function() {
            toast.className = toast.className.replace("pw-show-toast", "");
        }, time);
    };

    vibrate(sec) {
        if (navigator.vibrate) {
            window.navigator.vibrate(sec)
        }
    };

    vibError() {
        if (navigator.vibrate) {
            window.navigator.vibrate([100, 50, 500])
        }
    }

    vibOnce() {
        if (navigator.vibrate) {
            window.navigator.vibrate(500)
        }
    };

    vibTwice() {
        if (navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100])
        }
    };

}
*/