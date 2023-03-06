$(() => {
    var loginErrors = [];
    const loginBtn = $("#scripteed_login_btn").get(0);
    const signupBtn = $("#scripteed_signup_btn").get(0);
    const loginLink = $("#scripteed_login_link").get(0);
    const signupLink = $("#scripteed_signup_link").get(0);
    const loginForm = $("#scripteed_login_form").get(0);
    const signupForm = $("#scripteed_signup_form").get(0);
    const formHeading = $("#form_heading").get(0);

    var validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }

    var goTologin = () => {
        $(loginForm).removeClass('hide');
        $(loginBtn).addClass('active');
        $(signupForm).addClass('hide');
        $(signupBtn).removeClass('active');
        $(formHeading).text('Log In');
    }
    var goToRegister = () => {
        $(signupForm).removeClass('hide');
        $(signupBtn).addClass('active');
        $(loginForm).addClass('hide');
        $(loginBtn).removeClass('active');
        $(formHeading).text('Sign Up');
    }
    $(loginBtn).click((e) => {
        e.preventDefault();
        goTologin();
    });
    $(signupBtn).click(function (e) {
        e.preventDefault();
        goToRegister();
    });
    $(loginLink).click((e) => {
        e.preventDefault();
        goTologin();
    });
    $(signupLink).click(function (e) {
        e.preventDefault();
        goToRegister();
    });
    var loginFormSanitisation = () => {
        if (loginForm && ["email", "password", "remember_me"].every((val) => Object.keys(loginForm.elements).indexOf(val) > -1)) {
            $(loginForm).attr("action", '/login');
            $(loginForm).attr("method", "POST");
        }
        else {
            console.log("OOPS!!! Action not set");
        }
    }
    var loginFomValidation = () => {
        loginErrors = [];
        const emailField = $(loginForm).find('input[name="email"]').get(0);
        const passwordField = $(loginForm).find('input[name="password"]').get(0);
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

    if (loginForm) {
        loginFormSanitisation();
    }

    $(loginForm).submit((e) => {
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