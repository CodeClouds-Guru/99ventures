$(() => {
    var current_url = window.location.href;
    var loginErrors = [];
    // var loginErrorMsgs = [];
    var dynamicError = (field, type) => {
        type === 'add' ? loginErrors.push(field) : loginErrors.splice(loginErrors.indexOf(field))
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
        var error_list = '';
        var error_div = $('#error_div');
        error_div.empty();
        $("input[name=email]").val().trim().length === 0 && !validateEmail($("input[name=email]").val().trim()) && !loginErrors.includes('email') ? dynamicError('email', 'add') : dynamicError('email', 'remove');
        $("input[name=password]").val().trim().length === 0 && !loginErrors.includes('password') ? dynamicError('password', 'add') : dynamicError('password', 'remove');

        console.log(loginErrors);

        if ($("input[name=email]").val().trim().length > 0 && validateEmail($("input[name=email]").val().trim()) && $("input[name=password]").val().trim().length > 0) {
            return true;
        }
        else {
            error_list += '<ul>';
            loginErrors.map(val => {
                error_list += `<li>${val} is required</li>`
            })
            error_list += `</ul>`
            error_div.html(error_list);
            console.log('Please fill all required fields');
            return false;
        }
    }
    var login = () => {
        loginFomValidation() ? console.log('Logged in') : console.log('Validation failed');
    }
    current_url.includes('login') ? loginFormSanitisation() : console.log('gg');
});