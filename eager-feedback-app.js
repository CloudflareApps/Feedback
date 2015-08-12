(function(){
  if (!window.addEventListener || !document.documentElement.setAttribute || !document.querySelector || !document.documentElement.classList || !document.documentElement.classList.add) {
    return
  }

  var options, isPreview, locationsCSSMap, style, button, el, getRadiosValue, form, show, hide, checkScroll;

  options = INSTALL_OPTIONS;

  isPreview = window.Eager && window.Eager.installs && window.Eager.installs.preview && window.Eager.installs.preview.appId === 'IgyOK_i5Ib3E';

  style = document.createElement('style');
  style.innerHTML = '' +
  ' input#eager-feedback-app-negative:checked ~ .eager-feedback-app-field-smileys > label[for="eager-feedback-app-negative"],' +
  ' input#eager-feedback-app-neutral:checked ~ .eager-feedback-app-field-smileys > label[for="eager-feedback-app-neutral"],' +
  ' input#eager-feedback-app-positive:checked ~ .eager-feedback-app-field-smileys > label[for="eager-feedback-app-positive"] {' +
  '   background: transparent !impo rtant;' +
  '   transition: box-shadow .15s ease !important;' +
  '   box-shadow: inset 0 0 0 .06em ' + options.color + ' !important' +
  ' }' +
  ' .eager-feedback-app .eager-feedback-app-button, button.eager-feedback-app-feedback-button {' +
  '   background: ' + options.color + ' !important' +
  ' }' +
  ' .eager-feedback-app .eager-feedback-app-input:focus {' +
  '   border-color: ' + options.color + ' !important;' +
  '   box-shadow: 0 0 1px ' + options.color + ' !important' +
  ' }' +
  '';

  button = document.createElement('button');
  button.addEventListener('touchstart', function(){}, false); // iOS :hover CSS hack
  button.className = 'eager-feedback-app-feedback-button';
  button.setAttribute('data-location', options.location);
  button.innerHTML = options.feedbackButtonText;

  el = document.createElement('eager-feedback-app');
  el.addEventListener('touchstart', function(){}, false); // iOS :hover CSS hack
  el.className = 'eager-feedback-app';
  el.innerHTML = '' +
   '<div class="eager-feedback-app-content">' +
     '<div class="eager-feedback-app-header"></div>' +
     '<div class="eager-feedback-app-body"></div>' +
     '<form class="eager-feedback-app-form">' +
       '<input required type="radio" name="eager-feedback-app-smileys-radio" value="negative" id="eager-feedback-app-negative">' +
       '<input required type="radio" name="eager-feedback-app-smileys-radio" value="neutral" id="eager-feedback-app-neutral">' +
       '<input required type="radio" name="eager-feedback-app-smileys-radio" value="positive" id="eager-feedback-app-positive">' +
       '<div class="eager-feedback-app-field-smileys">' +
         '<label class="eager-feedback-app-icon eager-feedback-app-icon-negative" for="eager-feedback-app-negative"></label>' +
         '<label class="eager-feedback-app-icon eager-feedback-app-icon-neutral" for="eager-feedback-app-neutral"></label>' +
         '<label class="eager-feedback-app-icon eager-feedback-app-icon-positive" for="eager-feedback-app-positive"></label>' +
       '</div>' +
       '<div class="eager-feedback-app-field-feedback">' +
         '<textarea class="eager-feedback-app-input" minlength="10" name="message" rows="3" spellcheck="false" placeholder="Tell us more..." required></textarea>' +
         '<div class="eager-feedback-app-field-email">' +
          '<div class="eager-feedback-app-field-email-input-wrapper">' +
             '<input name="email" class="eager-feedback-app-input" type="email" placeholder="Email address" spellcheck="false" required>' +
             '<button type="submit" class="eager-feedback-app-button">➔</button>' +
          '</div>' +
         '</div>' +
       '</div>' +
     '</form>' +
   '</div>' +
   '<div class="eager-feedback-app-branding">' +
     '<a class="eager-feedback-app-branding-link" href="https://eager.io?utm_source=eager_lead_box_powered_by_link" target="_blank">Powered by Eager</a>' +
   '</div>' +
  '';

  getRadiosValue = function() {
    var i, radios;

    radios = el.querySelectorAll('[name="eager-feedback-app-smileys-radio"]');

    for (i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        return radios[i].value;
      }
    }
  };

  (function() {
    var smileysEl, textarea, radios, firstTime, onRadiosChange;

    smileysEl = el.querySelector('.eager-feedback-app-field-smileys');
    textarea = el.querySelector('textarea');
    radios = el.querySelectorAll('[name="eager-feedback-app-smileys-radio"]');
    firstTime = true;

    onRadiosChange = function() {
      var i, radiosValue;

      radiosValue = getRadiosValue();
      if (radiosValue && options.feedbackPlaceholders[radiosValue]) {
        textarea.setAttribute('placeholder', options.feedbackPlaceholders[radiosValue]);
      }

      setTimeout(function(){
        textarea.focus();
      }, firstTime ? 500 : 0);

      if (firstTime) {
        firstTime = false;
      }
    };

    Array.prototype.forEach.call(radios, function(radio){
      radio.addEventListener('input', onRadiosChange);
      radio.addEventListener('change', onRadiosChange);
    });
  })();

  el.querySelector('.eager-feedback-app-header').appendChild(document.createTextNode(options.headerText));
  el.querySelector('.eager-feedback-app-body').appendChild(document.createTextNode(options.bodyText));
  if (options.email) {
    form = el.querySelector('.eager-feedback-app-form');
    form.action = '//formspree.io/' + options.email;
    form.addEventListener('submit', function(event){
      event.preventDefault();

      var body, button, url, xhr, callback, params;

      body = el.querySelector('.eager-feedback-app-body');
      button = el.querySelector('button[type="submit"]');
      url = form.action;
      xhr = new XMLHttpRequest();

      if (isPreview) {
        form.parentNode.removeChild(form);
        body.innerHTML = options.successText + '<br><br>(Form submissions are simulated during the Eager preview.)';
        return;
      }

      callback = function(xhr) {
        var jsonResponse = {};

        button.removeAttribute('disabled');

        if (xhr && xhr.target && xhr.target.status === 200) {
          form.parentNode.removeChild(form);
          if (xhr.target.response) {
            try {
              jsonResponse = JSON.parse(xhr.target.response);
            } catch (err) {}
          }
          if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
            body.innerHTML = 'Formspree has sent an email to ' + options.email + ' for verification.';
          } else {
            body.innerHTML = options.successText;
          }
          setTimeout(hide, 3000);
        } else {
          body.innerHTML = 'Whoops, something didn’t work. Please try again.';
        }
      };

      params = 'email=' + encodeURIComponent(el.querySelector('input[type="email"]').value);

      params = [];
      params.push('feedback=' + encodeURIComponent(getRadiosValue()));
      params.push('message=' + encodeURIComponent(form.querySelector('textarea').value));
      params.push('email=' + encodeURIComponent(form.querySelector('input[type="email"]').value));

      if (!url) {
        return;
      }

      button.setAttribute('disabled', 'disabled');
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = callback.bind(xhr);
      xhr.send(params.join('&'));
    });
  }

  show = function() {
    el.classList.add('eager-feedback-app-show');
    el.classList.remove('eager-feedback-app-hide');
  };
  button.addEventListener('click', show);

  hide = function() {
    el.classList.add('eager-feedback-app-hide');
    el.classList.remove('eager-feedback-app-show');
  };

  checkScroll = function() {
    if (!document.body) {
      return;
    }

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      show();

      if (!isPreview) {
        window.removeEventListener('scroll', checkScroll);
      }
    }
  };
  window.addEventListener('scroll', checkScroll);

  if (isPreview) {
    show();
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(style);
    document.body.appendChild(el);
    document.body.appendChild(button);

    document.body.addEventListener('click', function(event){
      if (!event || !event.target) {
        return;
      }

      if (event.target === el || el.contains(event.target) || event.target === button || button.contains(event.target)) {
        return;
      }

      hide();
    });
  });
})();
