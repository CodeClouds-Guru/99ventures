$(() => {
  var errorsArray = [];
  var password_regex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/;
  var displayErrors = () => {
    $('span.alert-msg').remove();
    errorsArray.forEach((item) => {
      let field_name = item.field.attr('name');
      let element =
        '<span class="alert-msg invalid-message mt-1 lh-sm"><i class="fa-solid fa-circle-exclamation me-1"></i>' +
        item.message +
        '</span>';
      ['password', 'confirm_password', 'old_password', 'new_password'].includes(
        field_name
      )
        ? item.field.parent().parent().append(element)
        : item.field.parent().append(element);
    });
  };
  var showSnackbar = (msg, success) => {
    $('.snackbar .snack_msg').text(msg);
    $('.snackbar')
      .removeClass('bg-success')
      .removeClass('bg-danger')
      .addClass(success ? 'bg-success' : 'bg-danger')
      .addClass('show')
      .css('display', 'block');
    // setTimeout(function () {
    //   $('.snackbar').removeClass('show').css('display', 'none');
    // }, 3000);
  };
  var hideSnackbar = () => {
    $('.snackbar .btn-close').click(function (e) {
      e.preventDefault();
      $('.snackbar .snack_msg').text('');
      $('.snackbar').removeClass('show');
    });
  };

  let snackbar = `<div
    class="snackbar alert d-flex align-items-center text-white p-2 p-sm-3 lh-1 small rounded-2 position-fixed translate-middle-x start-50 m-0 shadow-sm">
    <p class="m-0 me-auto snack_msg"></p>
    <button class="btn-close btn-close-white"></button>
    </div>`;
  let closeTicketModal = `<div id="closeTicketModal" style="display: none;" tabindex="-1" aria-hidden="true" aria-labelledby="exampleModalLabel"
    class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content bg-white">
        <div class="modal-header">
          <h4 class="modal-title">Please Confirm</h4>
        </div>
        <div class="modal-body d-flex align-items-center text-default">
          <div class="row">
            <div class="col-12 mb-2">
              <div class="row gx-2 gx-lg-3">
                <div class="col-12 justify-center">
                  Are you sure to close this ticket?
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" aria-label="Close" data-bs-dismiss="modal"
            class="btn btn-outline-primary btn-sm">Cancel</button>
          <button id="confirmCloseTicketBtn" type="button" class="btn btn-danger btn-sm mt-1">YES</button>
        </div>
      </div>
    </div>
  </div>`;
  // $('body').append(snackbar).append(closeTicketModal);
  $('body').append(closeTicketModal);
  let errorMsg = $('#scripteed_error_message_div').text();
  if (errorMsg.trim().length > 0) {
    $('body').append(snackbar);
    showSnackbar(
      errorMsg,
      $('#scripteed_error_message_div').hasClass('success-snack')
    );
  }
  $(document).on('click', '.scripteed-close-ticket', (e) => {
    e.stopImmediatePropagation();
    $('#closeTicketModal')
      .modal('show')
      .attr('data-tid', $(e.target).data('tid'));
  });

  $('#confirmCloseTicketBtn').click((e) => {
    e.preventDefault();
    let tid = $('#closeTicketModal').data('tid');
    $.ajax({
      type: 'POST',
      url: '/ticket/update',
      data: {
        ticket_id: tid,
        type: 'ticket_status',
        field_name: 'status',
        value: 'closed',
      },
      success: (response) => {
        if (response.status) {
          $(e.target).modal('hide').data('tid', '');
          tid = '';
          window.location.href = '/support-tickets';
        } else {
          showSnackbar(response.message);
        }
      },
    });
  });

  const loginForm = $('#scripteed_login_form').get(0);
  const loginBtn = $('#scripteed_login_btn').get(0);
  const signupForm = $('#scripteed_signup_form').get(0);
  const signupBtn = $('#scripteed_signup_btn').get(0);
  const loginLink = $('#scripteed_login_link').get(0);
  const signupLink = $('#scripteed_signup_link').get(0);
  const formHeading = $('#form_heading').get(0);
  const logoutButton = $('#scripteed_logout_btn').get(0);
  const ticketCreateForm = $('#scripteed_create_ticket_form').get(0);
  const forgotPasswordForm = $('#scripteed_forgotpass_form').get(0);
  const forgotPasswordBtn = $('#forgotpassword_button').get(0);
  const resetPasswordForm = $('#scripteed_resetpass_form').get(0);

  // const profileDetailsForm = $("#scripteed_profile_details_form").get(0);
  // const changePasswordForm = $("#scripteed_change_password_form").get(0);

  $('i.bi').click((event) => {
    let field = $(event.target).parent().siblings('input');
    $(field).attr(
      'type',
      $(field).attr('type') === 'password' ? 'text' : 'password'
    );
    $(event.target).toggleClass('bi-eye-slash-fill');
  });
  var validateEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };
  var goTologin = () => {
    $(loginForm).removeClass('d-none');
    $(loginBtn).addClass('active');
    $(signupForm).addClass('d-none');
    $(signupBtn).removeClass('active');
    $(formHeading).text('Log In');
    $(forgotPasswordForm).addClass('d-none');
  };
  var goToRegister = () => {
    $(signupForm).removeClass('d-none');
    $(signupBtn).addClass('active');
    $(loginForm).addClass('d-none');
    $(loginBtn).removeClass('active');
    $(formHeading).text('Sign Up');
    $(forgotPasswordForm).addClass('d-none');
  };
  var goToForgotpassword = () => {
    $(signupForm).addClass('d-none');
    $(signupBtn).removeClass('active');
    $(loginForm).addClass('d-none');
    $(loginBtn).removeClass('active');
    $(formHeading).text('Forgot Password');
    $(forgotPasswordForm).removeClass('d-none');
  };
  var getUrlHash = () => {
    return $(location).attr('href').includes('#') &&
      $(location).attr('href').includes('?')
      ? $(location).attr('href').split('#')[1].split('?')[0]
      : $(location).attr('href').includes('#')
      ? $(location).attr('href').split('#')[1]
      : '';
  };
  if (getUrlHash() === 'signup') {
    goToRegister();
  }
  $('input[name="newsletter"]').on('change', () => {
    if ($('input[name="newsletter"]').is(':checked')) {
      $('input[name="newsletter"]').attr('value', true);
    } else {
      $('input[name="newsletter"]').attr('value', false);
    }
  });
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
  $(forgotPasswordBtn).click((e) => {
    e.preventDefault();
    goToForgotpassword();
  });
  var loginFormSanitisation = () => {
    if (
      loginForm &&
      ['email', 'password', 'remember_me'].every((val) =>
        Object.keys(loginForm.elements).indexOf(val)
      )
    ) {
      $(loginForm).attr('action', '/login');
      $(loginForm).attr('method', 'POST');
    } else {
      console.log('OOPS!!! Login action not set');
    }
  };
  var signupFormSanitisation = () => {
    if (
      signupForm &&
      [
        'first_name',
        'last_name',
        'email',
        'password',
        'confirm_password',
        'newsletter',
      ].every((val) => Object.keys(signupForm.elements).indexOf(val))
    ) {
      $(signupForm).attr('action', '/signup');
      $(signupForm).attr('method', 'POST');
    } else {
      console.log('OOPS!!! Signup action not set');
    }
  };
  var forgotPasswordFormSanitisation = () => {
    if (
      forgotPasswordForm &&
      ['email'].every((val) =>
        Object.keys(forgotPasswordForm.elements).indexOf(val)
      )
    ) {
      $(forgotPasswordForm).attr('action', '/member-forgot-password');
      $(forgotPasswordForm).attr('method', 'POST');
    } else {
      console.log('OOPS!!! Forgot password action not set');
    }
  };
  var resetPasswordFormSanitisation = () => {
    if (
      resetPasswordForm &&
      ['password', 'c_password'].every((val) =>
        Object.keys(resetPasswordForm.elements).indexOf(val)
      )
    ) {
      $(resetPasswordForm).attr('action', '/save-password');
      $(resetPasswordForm).attr('method', 'POST');
    } else {
      console.log('OOPS!!! Reset password action not set');
    }
  };
  var ticketCreateFormSanitisation = () => {
    if (
      ticketCreateForm &&
      ['ticket_subject', 'ticket_file', 'ticket_content'].every((val) =>
        Object.keys(ticketCreateForm.elements).indexOf(val)
      )
    ) {
      $(ticketCreateForm).attr('action', '/ticket/create');
      $(ticketCreateForm).attr('method', 'POST');
    } else {
      console.log('OOPS!!! Ticket create action not set');
    }
  };
  var loginFomValidation = () => {
    errorsArray = [];
    $('span.alert-msg').remove();
    const email = $(loginForm).find('input[name="email"]').get(0);
    const password = $(loginForm).find('input[name="password"]').get(0);
    if ($(email).val().trim().length === 0) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    } else if (!validateEmail($(email).val().trim())) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    }
    if ($(password).val().trim().length < 8) {
      errorsArray.push({
        field: $(password),
        message: 'Password should have at least 8 characters.',
      });
    } else if (!password_regex.test($(password).val().trim())) {
      errorsArray.push({
        field: $(password),
        message:
          'Password must contain a lowercase, a uppercase, a numeric digit and a special character',
      });
    }
  };
  var signupFormValidation = () => {
    errorsArray = [];
    $('span.alert-msg').remove();
    const first_name = $(signupForm).find('input[name="first_name"]').get(0);
    const last_name = $(signupForm).find('input[name="last_name"]').get(0);
    const email = $(signupForm).find('input[name="email"]').get(0);
    const password = $(signupForm).find('input[name="password"]').get(0);
    const confirm_password = $(signupForm)
      .find('input[name="confirm_password"]')
      .get(0);
    const terms_checkbox = $(signupForm).find('.more_survey_terms_field');
    if ($(first_name).val().trim().length === 0) {
      errorsArray.push({
        field: $(first_name),
        message: 'Please enter first name',
      });
    }
    if ($(last_name).val().trim().length === 0) {
      errorsArray.push({
        field: $(last_name),
        message: 'Please enter last name',
      });
    }
    if ($(email).val().trim().length === 0) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    } else if (!validateEmail($(email).val().trim())) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    }
    if ($(password).val().trim().length < 8) {
      errorsArray.push({
        field: $(password),
        message: 'Password should have at least 8 characters.',
      });
    } else if (!password_regex.test($(password).val().trim())) {
      errorsArray.push({
        field: $(password),
        message:
          'Password must contain a lowercase, a uppercase, a numeric digit and a special character',
      });
    }
    if ($(password).val().trim() !== $(confirm_password).val().trim()) {
      errorsArray.push({
        field: $(confirm_password),
        message: 'Password mismatched',
      });
    }
    if (
      $(signupForm).find('input[name=more_survey_terms]').is(':checked') ===
      false
    ) {
      errorsArray.push({
        field: $(terms_checkbox),
        message: 'Please check the terms & conditions',
      });
    }
  };
  var ticketCreateFormValidation = () => {
    errorsArray = [];
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    $('span.alert-msg').remove();
    let ticket_subject = $(ticketCreateForm)
      .find('input[name="ticket_subject"]')
      .get(0);
    let ticket_file = $(ticketCreateForm)
      .find('input[name="ticket_file"]')
      .get(0);
    let ticket_file_name = $(ticketCreateForm)
      .find('input[name="ticket_file"]')
      .val()
      .replace(/C:\\fakepath\\/i, '');
    let ticket_file_value = $(ticketCreateForm)
      .find('input[name="ticket_file"]')
      .prop('files');
    let ticketContentFieldValue = $(ticketCreateForm)
      .find('textarea[name="ticket_content"]')
      .val();
    // const ticketContentFieldValue = $('#ticket_content').get(0);
    if ($(ticket_subject).val().trim().length === 0) {
      errorsArray.push({
        field: $(ticket_subject),
        message: 'Please enter ticket subject',
      });
    }
    if (ticket_file_value.length > 0) {
      if (!allowedExtensions.exec(ticket_file_name)) {
        errorsArray.push({
          field: $(ticket_file),
          message: 'Please select image type only',
        });
      }
      if (ticket_file_value[0].size > 2048000) {
        errorsArray.push({
          field: $(ticket_file),
          message: 'Please select file within 2MB',
        });
      }
    }
    if ($.trim(ticketContentFieldValue).length === 0) {
      errorsArray.push({
        field: $(ticketCreateForm).find('textarea[name="ticket_content"]'),
        message: 'Please enter ticket content',
      });
    }
  };

  var forgotPasswordFomValidation = () => {
    errorsArray = [];
    $('span.alert-msg').remove();
    const email = $(forgotPasswordForm).find('input[name="email"]').get(0);
    if ($(email).val().trim().length === 0) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    } else if (!validateEmail($(email).val().trim())) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    }
  };
  var resetPasswordFomValidation = () => {
    errorsArray = [];
    $('span.alert-msg').remove();
    const password = $(resetPasswordForm).find('input[name="password"]').get(0);
    const confirm_password = $(resetPasswordForm)
      .find('input[name="c_password"]')
      .get(0);

    if ($(password).val().trim().length < 8) {
      errorsArray.push({
        field: $(password),
        message: 'Password should have at least 8 characters.',
      });
    } else if (!password_regex.test($(password).val().trim())) {
      errorsArray.push({
        field: $(password),
        message:
          'Password should contain at least one lowercase, one uppercase, one numeric digit and one special character',
      });
    }
    if ($(password).val().trim() !== $(confirm_password).val().trim()) {
      errorsArray.push({
        field: $(confirm_password),
        message: 'Password mismatched',
      });
    }
  };

  if (loginForm) {
    loginFormSanitisation();
  }
  if (signupForm) {
    signupFormSanitisation();
  }
  if (ticketCreateForm) {
    ticketCreateFormSanitisation();
  }
  if (forgotPasswordForm) {
    forgotPasswordFormSanitisation();
  }
  if (resetPasswordForm) {
    resetPasswordFormSanitisation();
  }
  $(loginForm).submit((e) => {
    loginFomValidation();
    if (errorsArray.length === 0) {
      $(this).trigger(e.type);
    } else {
      e.preventDefault();
      displayErrors();
    }
  });
  $(signupForm).submit((e) => {
    signupFormValidation();
    if (errorsArray.length === 0) {
      $(this).trigger(e.type);
    } else {
      e.preventDefault();
      displayErrors();
    }
  });
  $(ticketCreateForm).submit((e) => {
    ticketCreateFormValidation();
    if (errorsArray.length === 0) {
      $(this).trigger(e.type);
    } else {
      e.preventDefault();
      displayErrors();
    }
  });
  $(forgotPasswordForm).submit((e) => {
    forgotPasswordFomValidation();
    if (errorsArray.length === 0) {
      $(this).trigger(e.type);
    } else {
      e.preventDefault();
      displayErrors();
    }
  });
  $(resetPasswordForm).submit((e) => {
    resetPasswordFomValidation();
    if (errorsArray.length === 0) {
      $(this).trigger(e.type);
    } else {
      e.preventDefault();
      displayErrors();
    }
  });
  $(logoutButton).click((e) => {
    e.preventDefault();
    $('body').append('<form id="scripteed_logout_form"></form>');
    $('#scripteed_logout_form')
      .attr('action', '/logout')
      .attr('method', 'post');
    $('#scripteed_logout_form').submit();
  });

  $('.more_survey_terms').on('change', function () {
    if ($(this).is(':checked') === true) {
      $('.btn-submit').removeAttr('disabled');
    } else {
      $('.btn-submit').attr('disabled', true);
    }
  });

  var pathname = window.location.pathname;
  pathname = pathname.replace('/', '');

  let str =
    '<div class="alert text-center text-white m-0 py-2 px-0 fw-light lh-base rounded-0"  id="header_streak_or_refresh"><div class="container">';
  if (pathname === 'dashboard') {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/get-login-streak',
      success: function (resp, status, xhr) {
        // console.log('resp ', resp);
        if (resp.data.streak > 1) {
          str +=
            '<p class="m-0">Congratulations <strong>' +
            resp.data.member_firstname +
            '</strong>! You have logged in <strong>' +
            resp.data.streak +
            '</strong> days in a row! Keep up the good work!</p>';
          str += '</div></div>';
          $('#header_streak_or_refresh').append(str);
        }
      },
    });
  }
  if (pathname === 'paid-surveys') {
    str +=
      '<p class="m-0">Please <a href="javascript:location.reload();" class="text-reset fw-medium">refresh your page</a> for the latest surveys matched for you</p>';
    str += '</div></div>';
    $('#header_streak_or_refresh').append(str);
  }

  // if (pathname === 'contest') {
  //   str +=
  //     '<div class="row"><div class="col-md-12 mb-3 mb-lg-4"><div class="cash-contest-sec bg-primary text-white rounded-4 px-3 px-md-4 px-lg-5 py-3 mb-2"><div class="row align-items-center"><div class="col-md-8"><h1 class="mb-2 heading">CASH CONTEST</h1><p class="m-0">The Top 20 members who earn the most by 31st June 2023 will win a prize.</p></div><div class="col-md-4"><div class="d-flex justify-content-end mt-3 mt-md-0"><figure class="m-0 text-center"><img src="images/cash-contest-img.svg" alt="Cash Contest Image" class="img-fluid"></figure></div></div></div></div><div class="cash-contest-info text-white d-flex align-items-center mt-2"><i class="fa-solid fa-circle-info"></i><p class="m-0 ms-2 lh-base">Moresurveys.com<strong>$1000</strong>Cash Contest Description. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p></div></div></div>';
  //   str += '</div></div>';
  //   $('#header_streak_or_refresh').append(str);
  // }

  $('.copy-text').click((e) => {
    e.preventDefault();
    var reference = e.currentTarget.dataset?.reference;
    var tempInput = document.createElement('input');
    tempInput.style = 'position: absolute; left: -1000px; top: -1000px';
    tempInput.value = $(`#${reference}`).val();
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    $('.copy-text')
      .find('i')
      .removeClass('fa-regular fa-copy')
      .addClass('fa-solid fa-check');
    setTimeout(() => {
      $('.copy-text')
        .find('i')
        .removeClass('fa-solid fa-check')
        .addClass('fa-regular fa-copy');
    }, 3000);
  });

  $('input[type="password"]').on({
    keydown: function (e) {
      if (e.which === 32) return false;
    },
    change: function () {
      this.value = this.value.replace(/\s/g, '');
    },
  });

  function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  jQuery(document).ready(function ($) {
    var persistedQueryParam = getParameterByName('referral_code');

    if (persistedQueryParam && persistedQueryParam.length > 0) {
      $('a[href]').each(function () {
        var elem = $(this);
        var href = elem.attr('href');
        elem.attr(
          'href',
          href +
            (href.indexOf('?') != -1 ? '&' : '?') +
            'referral_code=' +
            persistedQueryParam
        );
      });
    }

    let signup_element = document.getElementById('scripteed_signup_form');

    if (signup_element !== null) {
      const signup_search_params = new URLSearchParams(window.location.search);
      if (!signup_search_params.has('referral_code')) {
        let signup_hash_params = window.location.hash;
        signup_hash_params = signup_hash_params.split('referral_code=');
        if (signup_hash_params.length > 1) {
          $('#referral_code').val(signup_hash_params[1]);
        }
      }
    }
  });

  // To remove space from all input type of email field
  if ($('input[name=email]').length) {
    $('input[name=email]').on('keyup', function () {
      $(this).val($(this).val().replace(/\s+/g, ''));
    });
  }

  //Get Cookie to show popup in profile update and email verify login
  function readCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  var profile_update_flag = readCookie('member_profile_update') || null;
  var profile_update_bonus = readCookie('profile_completed_bonus') || null;
  profile_update_bonus = profile_update_bonus
    ? parseFloat(profile_update_bonus).toFixed(2)
    : null;
  // console.log('profile_update_bonus', profile_update_bonus);
  if (profile_update_flag === 'true') {
    var profile_update_popup_html = `<div id="profile_update_popup" tabindex="-1" aria-hidden="true" aria-labelledby="paypalModalLabel" class="modal fade payment-popup survey-popup"> <div class="modal-dialog"><div class="modal-content bg-white"><button id="paypal-popup-close" type="button" aria-label="Close" data-bs-dismiss="modal" class="btn-close position-absolute top-0 small start-100 translate-middle rounded-circle shadow bg-white p-2"></button> <div class="modal-body"><figure class="m-0 pb-2 mb-2 border-bottom border-primary mx-md-5"><img id="withdrawal_type_img" src="https://99-ventures-bucket.s3.us-east-2.amazonaws.com/99ventures/1/file-manager/images/logo.png" class="img-fluid d-block" /></figure><div class="survey-popup-cntnt text-center pb-3 mx-md-4 px-md-2"><h2 class="heading">Start Sharing Your Opinion</h2><p class="lh-base">You are now ready to begin exploring MoreSurveys! We have also credited your account with an extra $${profile_update_bonus} for completing your profile.</p><h4>Happy Surveying!</h4></div><div class="d-grid"><a href="/paid-surveys" class="btn btn-info rounded-1 py-2">Start Taking Surveys</a></div></div></div></div></div>`;
    $('body').append(profile_update_popup_html);
    $('#profile_update_popup').modal('show');

    document.cookie =
      'member_profile_update=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  var email_verified_flag = readCookie('email_verified') || null;
  var registration_bonus = readCookie('registration_bonus') || null;
  registration_bonus = registration_bonus
    ? parseFloat(registration_bonus).toFixed(2)
    : null;
  // console.log('registration_bonus', registration_bonus);
  if (email_verified_flag === 'true') {
    var email_verified_popup_html = `<div id="email_verified_popup" tabindex="-1" aria-hidden="true" aria-labelledby="paypalModalLabel" class="modal fade payment-popup survey-popup"> <div class="modal-dialog"><div class="modal-content bg-white"><button id="paypal-popup-close" type="button" aria-label="Close" data-bs-dismiss="modal" class="btn-close position-absolute top-0 small start-100 translate-middle rounded-circle shadow bg-white p-2"></button><div class="modal-body"><figure class="m-0 pb-2 mb-2 border-bottom border-primary mx-md-5"><img id="withdrawal_type_img" src="https://99-ventures-bucket.s3.us-east-2.amazonaws.com/99ventures/1/file-manager/images/logo.png" class="img-fluid d-block" /></figure><div class="survey-popup-cntnt text-center pb-3 mx-md-4 px-md-2"><h2 class="heading">Congratulations</h2><p class="lh-base">You have been rewarded $${registration_bonus} for successfully registering your MoreSurveys account. It's now time to complete your profile to receive your next bonus!</p><h4>Happy Surveying!</h4></div><div class="d-grid"><a href="/profile" class="btn btn-info rounded-1 py-2">Complete Your Profile</a></div></div></div></div></div>`;
    $('body').append(email_verified_popup_html);
    $('#email_verified_popup').modal('show');

    document.cookie =
      'email_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  // Redeem Promocode
  if ($('#promocode-redeem-popup').length) {
    $('#promocode-redeem-popup').on('submit', function (e) {
      e.preventDefault();
      const resMsg = $(this).find('.response-msg'),
        submitBtn = $(this).find('button[type=submit]'),
        sbmtBtnTxt = submitBtn.text(),
        promoInput = $(this).find('input[name=promocode]').val().trim(),
        closeBtn = $(this).find('#paypal-popup-close');
      if (promoInput) {
        $.ajax({
          type: 'POST',
          url: '/redeem-promo-code',
          data: { promocode: promoInput },
          beforeSend: function () {
            submitBtn.attr('disabled', true).text('Please wait...');
          },
          success: function (res) {
            if (res.status === true) {
              $('#promocode-redeem-popup')[0].reset();
              closeBtn.hide();
              resMsg.html(
                `<p class="m-0 p-0 text-success small lh-sm">${res.message}</p>`
              );
              setTimeout(() => {
                // $('#promocode-popup').modal('hide');
                location.reload();
              }, 5000);
            } else {
              resMsg.html(
                `<p class="m-0 p-0 text-danger small lh-sm">${res.message}</p>`
              );
              responseMsgToggle(resMsg);
            }
          },
          error: function (xhr) {
            console.log(xhr);
          },
          complete: function (xhr) {
            submitBtn.removeAttr('disabled').text(sbmtBtnTxt);
          },
        });
      } else {
        resMsg.html(
          `<p class="m-0 p-0 text-danger small lh-sm">Please enter your promo code!</p>`
        );
        responseMsgToggle(resMsg);
      }
    });
  }

  // Popup close event captured
  if ($('#promocode-popup').length) {
    $('#promocode-popup').on('hidden.bs.modal', function () {
      $('#promocode-redeem-popup')[0].reset();
      $('#promocode-popup').modal('hide');
    });
  }
});

function responseMsgToggle(el) {
  setTimeout(() => {
    el.html('').fadeOut();
    el.fadeIn();
  }, 5000);
}
