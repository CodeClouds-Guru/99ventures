$(() => {
  var errorsArray = [];
  var password_regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/;
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
    $('.snackbar').removeClass('bg-success').removeClass('bg-danger').addClass(success ? 'bg-success' : 'bg-danger').addClass('show').css('display', 'block');
    setTimeout(function () {
      $('.snackbar').removeClass('show').css('display', 'none');;
    }, 3000);
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
    $('body').append(snackbar)
    showSnackbar(
      errorMsg,
      $('#scripteed_error_message_div').hasClass('success-snack')
    );
  }
  $(document).on('click', '.scripteed-close-ticket', (e) => {
    e.stopImmediatePropagation();
    $('#closeTicketModal').modal('show').attr('data-tid', $(e.target).data('tid'));
  })

  $('#confirmCloseTicketBtn').click((e) => {
    e.preventDefault();
    let tid = $('#closeTicketModal').data('tid');
    $.ajax({
      type: "POST",
      url: '/ticket/update',
      data: {
        ticket_id: tid,
        type: 'ticket_status',
        field_name: 'status',
        value: 'closed'
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
  })

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
    if ($('input[name="newsletter"]').is(":checked")) {
      $('input[name="newsletter"]').attr('value', true)
    } else {
      $('input[name="newsletter"]').attr('value', false)
    }
  })
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
      ['email', 'password', 'remember_me'].every(
        (val) => Object.keys(loginForm.elements).indexOf(val)
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
      ['email'].every(
        (val) => Object.keys(forgotPasswordForm.elements).indexOf(val)
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
      ['password', 'c_password'].every(
        (val) => Object.keys(resetPasswordForm.elements).indexOf(val)
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
      ['ticket_subject', 'ticket_file', 'ticket_content'].every(
        (val) => Object.keys(ticketCreateForm.elements).indexOf(val)
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
      errorsArray.push({ field: $(email), message: 'Please enter a valid email' });
    } else if (!validateEmail($(email).val().trim())) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    }
    if ($(password).val().trim().length < 8) {
      errorsArray.push({
        field: $(password),
        message: 'Minimum 8 characters are required',
      });
    } else if (!password_regex.test($(password).val().trim())) {
      errorsArray.push({
        field: $(password),
        message:
          'Password should be contain at least one lowercase, one uppercase, one numeric digit and one special character',
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
      errorsArray.push({ field: $(email), message: 'Please enter a valid email' });
    } else if (!validateEmail($(email).val().trim())) {
      errorsArray.push({
        field: $(email),
        message: 'Please enter a valid email',
      });
    }
    if ($(password).val().trim().length < 8) {
      errorsArray.push({
        field: $(password),
        message: 'Minimum 8 characters are required',
      });
    } else if (!password_regex.test($(password).val().trim())) {
      errorsArray.push({
        field: $(password),
        message:
          'Password should be contain at least one lowercase, one uppercase, one numeric digit and one special character',
      });
    }
    if ($(password).val().trim() !== $(confirm_password).val().trim()) {
      errorsArray.push({
        field: $(confirm_password),
        message: 'Password mismatched',
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
      errorsArray.push({ field: $(email), message: 'Please enter a valid email' });
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
        message: 'Minimum 8 characters are required',
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
            '<p class="m-0">Congrats <strong>' +
            resp.data.member_firstname +
            '</strong>! You have been loggin in <strong>' +
            resp.data.streak +
            '</strong> days in a row! Excellent, keep up the good work!!</p>';
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
  if (pathname === 'contest') {
    str +=
      '<div class="row"><div class="col-md-12 mb-3 mb-lg-4"><div class="cash-contest-sec bg-primary text-white rounded-4 px-3 px-md-4 px-lg-5 py-3 mb-2"><div class="row align-items-center"><div class="col-md-8"><h1 class="mb-2 heading">CASH CONTEST</h1><p class="m-0">The Top 20 members who earn the most by 31st June 2023 will win a prize.</p></div><div class="col-md-4"><div class="d-flex justify-content-end mt-3 mt-md-0"><figure class="m-0 text-center"><img src="images/cash-contest-img.svg" alt="Cash Contest Image" class="img-fluid"></figure></div></div></div></div><div class="cash-contest-info text-white d-flex align-items-center mt-2"><i class="fa-solid fa-circle-info"></i><p class="m-0 ms-2 lh-base">Moresurveys.com<strong>$1000</strong>Cash Contest Description. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p></div></div></div>';
    str += '</div></div>';
    $('#header_streak_or_refresh').append(str);
  }

  $(".copy-text").click((e) => {
    e.preventDefault();
    var reference = e.currentTarget.dataset?.reference;
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = $(`#${reference}`).val();
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    $(".copy-text").find("i").removeClass('fa-regular fa-copy').addClass('fa-solid fa-check');
    setTimeout(() => {
      $(".copy-text").find("i").removeClass('fa-solid fa-check').addClass('fa-regular fa-copy');
    }, 3000);
  })

});
