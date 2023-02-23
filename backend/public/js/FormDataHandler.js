$(() => {
    var loginErrors = [];
    var loginErrorMsgs = [];
    var dynamicErrorMsg = () => {
        // loginErrors.includes('email') ? loginErrorMsgs.push('Valid')
    }
    var validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }
    var loginFormSanitisation = () => {
        const form = $("#scripteed_login_form");
        if (form.length === 1 && ["email", "password", "remember_me", "login_button"].every((val) => Object.keys(form[0].elements).indexOf(val) > -1)) {
            // form.attr("action", '/login');
            form.attr("method", "POST");
            console.log("Action set");
            form.submit((event) => {
                event.preventDefault();
                login();
            })
        }
        else {
            console.log("OOPS!!! Action not set");
        }
    }
    var loginFomValidation = () => {
        $("input[name=email]").val().trim().length === 0 && !validateEmail($("input[name=email]").val().trim()) ? loginErrors.push('email') : '';
        $("input[name=password]").val().trim().length === 0 ? loginErrors.push('password') : '';
        console.log(loginErrors);

        if ($("input[name=email]").val().trim().length > 0 && validateEmail($("input[name=email]").val().trim()) && $("input[name=password]").val().trim().length > 0) {
            return true;
        }
        else {
            console.log('Please fill all required fields');
            return false;
        }
    }
    var login = () => {
        loginFomValidation() ? console.log('Logged in') : console.log('Validation failed');
    }
    loginFormSanitisation();
});