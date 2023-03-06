$(() => {
    var loginErrors = [];
    const form = $("#scripteed_login_form").get(0);
    var validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }
    var loginFormSanitisation = () => {
        if (form && ["email", "password", "remember_me"].every((val) => Object.keys(form.elements).indexOf(val) > -1)) {
            $(form).attr("action", '/login');
            $(form).attr("method", "POST");
        }
        else {
            console.log("OOPS!!! Action not set");
        }
    }
    var loginFomValidation = () => {
        loginErrors = [];
        const emailField = $(form).find('input[name="email"]').get(0);
        const passwordField = $(form).find('input[name="password"]').get(0);
        if ($(emailField).val().trim().length === 0 && !validateEmail($(emailField).val())) {
            loginErrors.push({ field: $(emailField), message: 'Please enter a valid email' });
        }
        if ($(passwordField).val().trim().length < 8) {
            loginErrors.push({ field: $(passwordField), message: 'Password should be greater than 7 characters' });
        }
    }
    displayErrors = () => {
        $('span.alert-msg').remove();
        loginErrors.forEach(item => {
            item.field.parent().append('<span class="alert-msg invalid-message mt-1"><i class="fa-solid fa-circle-exclamation me-1"></i>' + item.message + '</span>')
        });
    }

    if (form) {
        loginFormSanitisation();
    }

    $(form).submit((e) => {
        loginFomValidation();
        console.log(loginErrors);
        if (loginErrors.length === 0) {    // if (loginErrors.length > 0) {
            $(this).trigger(e.type);
        } else {
            e.preventDefault();
            displayErrors();
        }
    })
});