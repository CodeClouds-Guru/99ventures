$(() => {
    var validation = () => {
        $("input[name=email]").val().trim().length === 0 ? console.log('Email required') : '';
        $("input[name=password]").val().trim().length === 0 ? console.log('Password required') : '';
        if ($("input[name=email]").val().trim().length > 0 && $("input[name=password]").val().trim().length > 0) {
            return true;
        }
        else {
            console.log('Please fill all required fields');
            return false;
        }
    }
    var login = () => {
        validation() ? console.log('Logged in') : console.log('Validation failed');
    }

    const form = $("#scripteed_login_form");
    if (form.length === 1 && ["email", "password", "remember_me", "login_button"].every((val) => Object.keys(form[0].elements).indexOf(val) > -1)) {
        form.attr("action", '/login');
        form.attr("method", "post");
        console.log("Action set");
    }
    else {
        console.log("OOPS!!! Action not set");
    }
});