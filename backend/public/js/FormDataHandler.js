$(() => {
    var errorsArray = [];
    const loginBtn = $("#scripteed_login_btn").get(0);
    const signupBtn = $("#scripteed_signup_btn").get(0);
    const loginLink = $("#scripteed_login_link").get(0);
    const signupLink = $("#scripteed_signup_link").get(0);
    const loginForm = $("#scripteed_login_form").get(0);
    const signupForm = $("#scripteed_signup_form").get(0);
    const formHeading = $("#form_heading").get(0);
    const logoutButton = $("#scripteed_logout_btn").get(0);
    const ticketCreateForm = $("#scripteed_create_ticket_form").get(0);

    var validateEmail = (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }

    var goTologin = () => {
        $(loginForm).removeClass('d-none');
        $(loginBtn).addClass('active');
        $(signupForm).addClass('d-none');
        $(signupBtn).removeClass('active');
        $(formHeading).text('Log In');
    }
    var goToRegister = () => {
        $(signupForm).removeClass('d-none');
        $(signupBtn).addClass('active');
        $(loginForm).addClass('d-none');
        $(loginBtn).removeClass('active');
        $(formHeading).text('Sign Up');
    }
    if ($(location).attr('hash') === '#signup') {
        goToRegister();
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
            console.log("OOPS!!! Login action not set");
        }
    }
    var signupFormSanitisation = () => {
        if (signupForm && ["first_name", "last_name", "email", "password", "confirm_password"].every((val) => Object.keys(signupForm.elements).indexOf(val) > -1)) {
            $(signupForm).attr("action", '/signup');
            $(signupForm).attr("method", "POST");
        }
        else {
            console.log("OOPS!!! Signup action not set");
        }
    }
    var ticketCreateFormSanitisation = () => {
        if (ticketCreateForm && ["ticket_subject", "ticket_file", "ticket_content"].every((val) => Object.keys(ticketCreateForm.elements).indexOf(val) > -1)) {
            $(ticketCreateForm).attr("action", '/ticket/create');
            $(ticketCreateForm).attr("method", "POST");
        }
        else {
            console.log("OOPS!!! Ticket create action not set");
        }
    }
    var loginFomValidation = () => {
        errorsArray = [];
        const emailField = $(loginForm).find('input[name="email"]').get(0);
        const passwordField = $(loginForm).find('input[name="password"]').get(0);
        // console.log(validateEmail($(emailField).val()))
        if ($(emailField).val().trim().length === 0) {
            errorsArray.push({ field: $(emailField), message: 'Please enter a email' });
        } else if (!validateEmail($(emailField).val().trim())) {
            errorsArray.push({ field: $(emailField), message: 'Please enter a valid email' });
        }
        if ($(passwordField).val().trim().length < 8) {
            errorsArray.push({ field: $(passwordField), message: 'Password should be greater than 7 characters' });
        }
    }
    var signupFormValidation = () => {
        errorsArray = [];
        const firstNameField = $(signupForm).find('input[name="first_name"]').get(0);
        const lastNameField = $(signupForm).find('input[name="last_name"]').get(0);
        const emailField = $(signupForm).find('input[name="email"]').get(0);
        const passwordField = $(signupForm).find('input[name="password"]').get(0);
        const confirmPasswordField = $(signupForm).find('input[name="confirm_password"]').get(0);
        if ($(firstNameField).val().trim().length === 0) {
            errorsArray.push({ field: $(firstNameField), message: 'Please enter first name' });
        }
        if ($(lastNameField).val().trim().length === 0) {
            errorsArray.push({ field: $(lastNameField), message: 'Please enter last name' });
        }
        if ($(emailField).val().trim().length === 0 && !validateEmail($(emailField).val().trim())) {
            errorsArray.push({ field: $(emailField), message: 'Please enter a valid email' });
        }
        if ($(passwordField).val().trim().length < 8) {
            errorsArray.push({ field: $(passwordField), message: 'Password should be greater than 7 characters' });
        }
        if ($(passwordField).val().trim() !== $(confirmPasswordField).val().trim()) {
            errorsArray.push({ field: $(confirmPasswordField), message: 'Password mismatched' });
        }
    }
    var ticketCreateFormValidation = () => {
        errorsArray = [];
        const ticketSubjectField = $(ticketCreateForm).find('input[name="ticket_subject"]').get(0);
        const ticketFileName = $(ticketCreateForm).find('input[name="ticket_file"]').val().replace(/C:\\fakepath\\/i, '');
        const ticketFileValue = $(ticketCreateForm).find('input[name="ticket_file"]').prop('files');
        const ticketContentField = $(ticketCreateForm).find('textare[name="ticket_content"]').text();
        // console.log(ticketFileName, ticketFileValue)
        // console.log(ticketSubjectField.val(), ticketContentField)
        if ($(ticketSubjectField).val().trim().length === 0) {
            errorsArray.push({ field: $(ticketSubjectField), message: 'Please enter ticket subject' });
        }
        if ($(ticketContentField).trim().length === 0) {
            errorsArray.push({ field: $(ticketContentField), message: 'Please enter ticket content' });
        }
    }
    displayErrors = () => {
        $('span.alert-msg').remove();
        errorsArray.forEach(item => {
            item.field.parent().append('<span class="alert-msg invalid-message mt-1"><i class="fa-solid fa-circle-exclamation me-1"></i>' + item.message + '</span>')
        });
    }

    if (loginForm) {
        loginFormSanitisation();
    }
    if (signupForm) {
        signupFormSanitisation();
    }
    if (ticketCreateForm) {
        ticketCreateFormSanitisation();
    }
    $(loginForm).submit((e) => {
        loginFomValidation();
        if (errorsArray.length === 0) {
            $(this).trigger(e.type);
        } else {
            e.preventDefault();
            displayErrors();
        }
    })
    $(signupForm).submit((e) => {
        signupFormValidation();
        console.log(errorsArray);
        if (errorsArray.length === 0) {
            $(this).trigger(e.type);
        } else {
            e.preventDefault();
            displayErrors();
        }
    })
    $(ticketCreateForm).submit((e) => {
        ticketCreateFormValidation();
        console.log(errorsArray);
        if (errorsArray.length === 0) {
            $(this).trigger(e.type);
        } else {
            e.preventDefault();
            displayErrors();
        }
    })

    $(logoutButton).click(e => {
        e.preventDefault();
        $('body').append('<form id="scripteed_logout_form"></form>');
        $('#scripteed_logout_form').attr("action", "/logout").attr("method", "post");
        $('#scripteed_logout_form').submit();
    })
});