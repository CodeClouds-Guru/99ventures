$(() => {
    var errorsArray = [];
    const loginForm = $("#scripteed_login_form").get(0);
    const loginBtn = $("#scripteed_login_btn").get(0);
    const signupForm = $("#scripteed_signup_form").get(0);
    const signupBtn = $("#scripteed_signup_btn").get(0);
    const loginLink = $("#scripteed_login_link").get(0);
    const signupLink = $("#scripteed_signup_link").get(0);
    const formHeading = $("#form_heading").get(0);
    const logoutButton = $("#scripteed_logout_btn").get(0);
    const ticketCreateForm = $("#scripteed_create_ticket_form").get(0);
    const displayed_filename = $("#file_show");
    const profileDetailsForm = $("#scripteed_profile_details_form").get(0);

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
        if (signupForm && ["first_name", "last_name", "email", "password", "confirm_password", "newsletter"].every((val) => Object.keys(signupForm.elements).indexOf(val) > -1)) {
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
    var profileDetailsFormSanitisation = () => {
        if (profileDetailsForm && ["first_name", "last_name", "username", "email", "phone_no", "address_1", "address_2", "city", "state", "country", "zipcode", "email_alerts[]"].every((val) => Object.keys(profileDetailsForm.elements).indexOf(val) > -1)) {
            $(profileDetailsForm).attr("action", '/profile/update');
            $(profileDetailsForm).attr("method", "POST");
        }
        else {
            console.log("OOPS!!! Profile details update action not set");
        }
    }
    var loginFomValidation = () => {
        errorsArray = [];
        const emailField = $(loginForm).find('input[name="email"]').get(0);
        const passwordField = $(loginForm).find('input[name="password"]').get(0);
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
        if ($(emailField).val().trim().length === 0) {
            errorsArray.push({ field: $(emailField), message: 'Please enter a email' });
        } else if (!validateEmail($(emailField).val().trim())) {
            errorsArray.push({ field: $(emailField), message: 'Please enter a valid email' });
        }
        if ($(passwordField).val().trim().length < 8) {
            errorsArray.push({ field: $(passwordField), message: 'Password should be greater than 7 characters' });
        }
        if ($(passwordField).val().trim() !== $(confirmPasswordField).val().trim()) {
            errorsArray.push({ field: $(confirmPasswordField), message: 'Password mismatched' });
        }
    }
    $("#choose-file").on('change', function () {
        let fileName = $(ticketCreateForm).find('input[name="ticket_file"]').val().replace(/C:\\fakepath\\/i, '')
        fileName ? displayed_filename.text(fileName) : displayed_filename.text('')
    })
    var ticketCreateFormValidation = () => {
        errorsArray = [];
        const ticketSubjectField = $(ticketCreateForm).find('input[name="ticket_subject"]').get(0);
        const ticketFileName = $(ticketCreateForm).find('input[name="ticket_file"]').val().replace(/C:\\fakepath\\/i, '');
        const ticketFileValue = $(ticketCreateForm).find('input[name="ticket_file"]').prop('files');
        const ticketContentField = $(ticketCreateForm).find('textarea[name="ticket_content"]').val();
        // const ticketContentField = $('#ticket_content').get(0);
        if ($(ticketSubjectField).val().trim().length === 0) {
            errorsArray.push({ field: $(ticketSubjectField), message: 'Please enter ticket subject' });
        }
        console.log(ticketContentField)
        if ($.trim(ticketContentField) === '') {
            errorsArray.push({ field: $(ticketContentField), message: 'Please enter ticket content' });
        }
    }
    var profileDetailsFormValidation = () => {
        errorsArray = [];
        const first_name = $(profileDetailsForm).find('input[name="first_name"]').get(0);
        const last_name = $(profileDetailsForm).find('input[name="last_name"]').get(0);
        const username = $(profileDetailsForm).find('input[name="username"]').get(0);
        // const email = $(profileDetailsForm).find('input[name="email"]').get(0);
        const phone_no = $(profileDetailsForm).find('input[name="phone_no"]').get(0);
        const address_1 = $(profileDetailsForm).find('input[name="address_1"]').get(0);
        // const address_2 = $(profileDetailsForm).find('input[name="address_2"]').get(0);
        const city = $(profileDetailsForm).find('input[name="city"]').get(0);
        const state = $(profileDetailsForm).find('input[name="state"]').get(0);
        const country = $(profileDetailsForm).find('input[name="country"]').get(0);
        const zipcode = $(profileDetailsForm).find('input[name="zipcode"]').get(0);

        if ($(first_name).val().trim().length === 0) {
            errorsArray.push({ field: $(first_name), message: 'Please enter First Name' });
        }
        if ($(last_name).val().trim().length === 0) {
            errorsArray.push({ field: $(last_name), message: 'Please enter Last Name' });
        }
        if ($(username).val().trim().length === 0) {
            errorsArray.push({ field: $(username), message: 'Please enter Username' });
        }
        // if ($(email).val().val().trim().length === 0) {
        //     errorsArray.push({ field: $(email), message: 'Please enter a email' });
        // } else if (!validateEmail($(email).val().val().trim())) {
        //     errorsArray.push({ field: $(email), message: 'Please enter a valid email' });
        // }
        if ($(phone_no).val().trim().length === 0) {
            errorsArray.push({ field: $(phone_no), message: 'Please enter Phone' });
        }
        if ($(address_1).val().trim().length === 0) {
            errorsArray.push({ field: $(address_1), message: 'Please enter Address 1' });
        }
        if ($(city).val().trim().length === 0) {
            errorsArray.push({ field: $(city), message: 'Please enter City' });
        }
        if ($(state).val()) {
            errorsArray.push({ field: $(state), message: 'Please enter State' });
        }
        if ($(country).val()) {
            errorsArray.push({ field: $(country), message: 'Please enter Country' });
        }
        if ($(zipcode).val().trim().length === 0) {
            errorsArray.push({ field: $(zipcode), message: 'Please enter Zipcode' });
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
    if (profileDetailsForm) {
        profileDetailsFormSanitisation();
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
        if (errorsArray.length === 0) {
            $(this).trigger(e.type);
        } else {
            e.preventDefault();
            displayErrors();
        }
    })
    $(ticketCreateForm).submit((e) => {
        ticketCreateFormValidation();
        if (errorsArray.length === 0) {
            $(this).trigger(e.type);
        } else {
            e.preventDefault();
            displayErrors();
        }
    })
    $(profileDetailsForm).submit((e) => {
        profileDetailsFormValidation();
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