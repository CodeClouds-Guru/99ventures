const cookieName = "99-site-lock";
const password = "newbattle999";
const maxattempt = 3;

function setCookie(name, value, minutes) {
    var expires = "";
    if (minutes) {
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function passWord() {
    var count = 1;
    var pass1 = prompt('Please Enter Your Password', '');
    while (count < maxattempt) {
        if (!pass1)
            history.go(-1);
        if (pass1.toLowerCase() === password) {
            setCookie(cookieName, 'authenticated', 10);
            window.open(window.location.href);
            break;
        }
        count += 1;
        pass1 = prompt('Please Enter Your Password', '');
    }

    if (count === maxattempt) {
        document.write("Invalid access. Please refresh the page to try again");
        document.write('<style type="text/undefined">');
    }
}
if (!getCookie(cookieName)) {
    document.write('');
    passWord();
}
