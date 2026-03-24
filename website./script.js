/**
 * SchemeFinder India - Main JavaScript
 * Handles all interactivity: form logic, scheme filtering, search,
 * dark mode toggle, Hindi language toggle, chatbot, and animations.
 */

// ========== STATE MANAGEMENT ==========
let currentLang = 'en';
let currentTheme = 'light';
let matchedSchemes = [];
let filteredSchemes = [];
let currentFilter = 'all';

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initLanguageToggle();
  initNavbar();
  initMobileMenu();
  initFAQ();
  initChatbot();
  initBackToTop();
  initScrollAnimations();
  initCounterAnimation();
  initCategoryCards();
});

// ========== THEME TOGGLE ==========
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('sf-theme');
  if (saved) {
    currentTheme = saved;
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
  }
  toggle.addEventListener('click', function () {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('sf-theme', currentTheme);
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const icon = document.querySelector('#themeToggle i');
  icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ========== LANGUAGE TOGGLE ==========
function initLanguageToggle() {
  const toggle = document.getElementById('langToggle');
  toggle.addEventListener('click', function () {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    applyLanguage();
    const label = toggle.querySelector('.lang-label');
    label.textContent = currentLang === 'en' ? '\u0939\u093F\u0902' : 'EN';
    toggle.title = currentLang === 'en' ? 'Switch to Hindi' : '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u092E\u0947\u0902 \u092C\u0926\u0932\u0947\u0902';
  });
}

function applyLanguage() {
  var attr = 'data-' + currentLang;
  var elements = document.querySelectorAll('[' + attr + ']');
  elements.forEach(function (el) {
    var text = el.getAttribute(attr);
    if (text !== null && text !== '') {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        // skip
      } else {
        el.textContent = text;
      }
    }
  });
  // Update placeholders
  var placeholderEls = document.querySelectorAll('[data-' + currentLang + '-placeholder]');
  placeholderEls.forEach(function (el) {
    var ph = el.getAttribute('data-' + currentLang + '-placeholder');
    if (ph) el.placeholder = ph;
  });
  // Re-render scheme cards if visible
  if (filteredSchemes.length > 0) {
    renderSchemeCards(filteredSchemes);
  }
}

// ========== NAVBAR ==========
function initNavbar() {
  var navbar = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.remove('active'); });
      this.classList.add('active');
      // Close mobile menu
      document.getElementById('navLinks').classList.remove('active');
    });
  });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  var btn = document.getElementById('mobileMenuBtn');
  var links = document.getElementById('navLinks');
  btn.addEventListener('click', function () {
    links.classList.toggle('active');
    var icon = btn.querySelector('i');
    if (links.classList.contains('active')) {
      icon.className = 'fas fa-times';
    } else {
      icon.className = 'fas fa-bars';
    }
  });
}

// ========== FORM NAVIGATION ==========
function nextStep(step) {
  // Validate current step
  if (step === 2) {
    var age = document.getElementById('age').value;
    var gender = document.getElementById('gender').value;
    var state = document.getElementById('state').value;
    if (!age || !gender || !state) {
      shakeElement(document.getElementById('step1'));
      return;
    }
    if (parseInt(age) < 0 || parseInt(age) > 120) {
      shakeElement(document.getElementById('age'));
      return;
    }
  }
  showStep(step);
}
window.nextStep = nextStep;

function prevStep(step) {
  showStep(step);
}
window.prevStep = prevStep;

function showStep(step) {
  var steps = document.querySelectorAll('.form-step');
  var progressSteps = document.querySelectorAll('.progress-step');
  var progressLines = document.querySelectorAll('.progress-line');

  steps.forEach(function (s) { s.classList.remove('active'); });
  var target = document.getElementById('step' + step);
  if (target) target.classList.add('active');

  progressSteps.forEach(function (ps, idx) {
    ps.classList.remove('active', 'completed');
    if (idx + 1 < step) ps.classList.add('completed');
    if (idx + 1 === step) ps.classList.add('active');
  });
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // trigger reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(function () { el.style.animation = ''; }, 400);
}

// Add shake keyframes dynamically
var shakeStyle = document.createElement('style');
shakeStyle.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }';
document.head.appendChild(shakeStyle);

// ========== FIND SCHEMES ==========
function findSchemes() {
  var age = parseInt(document.getElementById('age').value);
  var gender = document.getElementById('gender').value;
  var state = document.getElementById('state').value;
  var income = parseInt(document.getElementById('income').value);
  var category = document.getElementById('category').value;
  var occupation = document.getElementById('occupation').value;

  if (!age || !gender || !state || !income || !category || !occupation) {
    shakeElement(document.getElementById('step2'));
    return;
  }

  // Filter schemes based on user input
  matchedSchemes = schemesDatabase.filter(function (scheme) {
    var ageMatch = age >= scheme.minAge && age <= scheme.maxAge;
    var genderMatch = scheme.gender.includes(gender);
    var incomeMatch = income <= scheme.maxIncome;
    var categoryMatch = scheme.category.includes(category);
    var occupationMatch = scheme.occupation.includes(occupation);
    var stateMatch = scheme.states === 'all' || scheme.states.includes(state);
    return ageMatch && genderMatch && incomeMatch && categoryMatch && occupationMatch && stateMatch;
  });

  filteredSchemes = matchedSchemes.slice();
  currentFilter = 'all';

  // Show results
  showResults();
}
window.findSchemes = findSchemes;

function showResults() {
  document.getElementById('form-section').style.display = 'none';
  var resultsSection = document.getElementById('results-section');
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  // Update progress to step 3
  var progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach(function (ps) { ps.classList.add('completed'); });

  renderSchemeCards(filteredSchemes);
  initSearchAndFilter();
}

function renderSchemeCards(schemes) {
  var grid = document.getElementById('resultsGrid');
  var noResults = document.getElementById('noResults');
  var countEl = document.getElementById('resultsCount');

  countEl.textContent = schemes.length;

  if (schemes.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  var html = '';

  schemes.forEach(function (scheme, index) {
    var name = currentLang === 'hi' ? scheme.nameHi : scheme.name;
    var desc = currentLang === 'hi' ? scheme.descriptionHi : scheme.description;
    var eligibility = currentLang === 'hi' ? scheme.eligibilityHi : scheme.eligibility;
    var benefits = currentLang === 'hi' ? scheme.benefitsHi : scheme.benefits;
    var benefitsLabel = currentLang === 'hi' ? '\u0932\u093E\u092D' : 'Benefits';
    var eligibilityLabel = currentLang === 'hi' ? '\u092A\u093E\u0924\u094D\u0930\u0924\u093E' : 'Eligibility';
    var applyLabel = currentLang === 'hi' ? '\u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902' : 'Apply Now';
    var detailsLabel = currentLang === 'hi' ? '\u0935\u093F\u0935\u0930\u0923' : 'Details';

    var benefitItems = '';
    benefits.forEach(function (b) {
      benefitItems += '<li>' + b + '</li>';
    });

    html += '<div class="scheme-card" style="animation-delay: ' + (index * 0.08) + 's">' +
      '<div class="scheme-card-accent"></div>' +
      '<div class="scheme-card-body">' +
        '<div class="scheme-card-header">' +
          '<div class="scheme-icon">' + scheme.icon + '</div>' +
          '<div class="scheme-info">' +
            '<h3>' + name + '</h3>' +
            '<span class="scheme-tag">' + scheme.tag + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="scheme-description">' + desc + '</p>' +
        '<div class="scheme-benefits">' +
          '<h4><i class="fas fa-check-circle"></i> ' + benefitsLabel + '</h4>' +
          '<ul class="benefit-list">' + benefitItems + '</ul>' +
        '</div>' +
        '<div class="scheme-eligibility">' +
          '<h4>' + eligibilityLabel + '</h4>' +
          '<p>' + eligibility + '</p>' +
        '</div>' +
        '<div class="scheme-card-footer">' +
          '<a href="https://www.myscheme.gov.in" target="_blank" class="btn btn-primary btn-sm">' +
            '<i class="fas fa-external-link-alt"></i> ' + applyLabel +
          '</a>' +
          '<button class="btn btn-outline btn-sm" onclick="showSchemeDetail(' + scheme.id + ')">' +
            '<i class="fas fa-info-circle"></i> ' + detailsLabel +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  grid.innerHTML = html;
}

function showSchemeDetail(id) {
  var scheme = schemesDatabase.find(function (s) { return s.id === id; });
  if (!scheme) return;
  var name = currentLang === 'hi' ? scheme.nameHi : scheme.name;
  var desc = currentLang === 'hi' ? scheme.descriptionHi : scheme.description;
  alert(scheme.icon + ' ' + name + '\n\n' + desc);
}
window.showSchemeDetail = showSchemeDetail;

// ========== SEARCH AND FILTER ==========
function initSearchAndFilter() {
  var searchInput = document.getElementById('searchInput');
  var filterTags = document.querySelectorAll('.filter-tag');

  // Remove old listeners by cloning
  var newSearch = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearch, searchInput);

  newSearch.addEventListener('input', function () {
    applySearchAndFilter(this.value, currentFilter);
  });

  filterTags.forEach(function (tag) {
    var newTag = tag.cloneNode(true);
    tag.parentNode.replaceChild(newTag, tag);

    newTag.addEventListener('click', function () {
      document.querySelectorAll('.filter-tag').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      var searchVal = document.getElementById('searchInput').value;
      applySearchAndFilter(searchVal, currentFilter);
    });
  });
}

function applySearchAndFilter(searchTerm, filter) {
  var results = matchedSchemes.slice();

  // Apply category filter
  if (filter !== 'all') {
    results = results.filter(function (s) {
      return s.tag === filter;
    });
  }

  // Apply search
  if (searchTerm && searchTerm.trim() !== '') {
    var term = searchTerm.toLowerCase();
    results = results.filter(function (s) {
      return s.name.toLowerCase().includes(term) ||
        s.nameHi.includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.descriptionHi.includes(term) ||
        s.tag.toLowerCase().includes(term);
    });
  }

  filteredSchemes = results;
  renderSchemeCards(filteredSchemes);
}

// ========== RESET FORM ==========
function resetForm() {
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('form-section').style.display = 'block';
  document.getElementById('schemeForm').reset();
  showStep(1);
  matchedSchemes = [];
  filteredSchemes = [];
  currentFilter = 'all';
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}
window.resetForm = resetForm;

// ========== FAQ ==========
function initFAQ() {
  var questions = document.querySelectorAll('.faq-question');
  questions.forEach(function (q) {
    q.addEventListener('click', function () {
      var item = this.parentElement;
      var isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (fi) {
        fi.classList.remove('active');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ========== CHATBOT ==========
function initChatbot() {
  var toggleBtn = document.getElementById('chatbotToggle');
  var closeBtn = document.getElementById('chatbotClose');
  var chatWindow = document.getElementById('chatbotWindow');
  var chatInput = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSend');
  var quickReplies = document.querySelectorAll('.quick-reply');

  toggleBtn.addEventListener('click', function () {
    chatWindow.classList.toggle('active');
  });

  closeBtn.addEventListener('click', function () {
    chatWindow.classList.remove('active');
  });

  sendBtn.addEventListener('click', function () {
    sendChatMessage();
  });

  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendChatMessage();
  });

  quickReplies.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var query = this.getAttribute('data-query');
      var text = this.textContent;
      addUserMessage(text);
      handleChatQuery(query);
    });
  });
}

function sendChatMessage() {
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = '';

  // Simple keyword matching
  var lower = text.toLowerCase();
  if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('\u0915\u093F\u0938\u093E\u0928')) {
    handleChatQuery('farmer');
  } else if (lower.includes('student') || lower.includes('scholarship') || lower.includes('\u091B\u093E\u0924\u094D\u0930')) {
    handleChatQuery('student');
  } else if (lower.includes('women') || lower.includes('woman') || lower.includes('girl') || lower.includes('\u092E\u0939\u093F\u0932\u093E')) {
    handleChatQuery('women');
  } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F')) {
    handleChatQuery('health');
  } else if (lower.includes('house') || lower.includes('housing') || lower.includes('home') || lower.includes('\u0906\u0935\u093E\u0938')) {
    handleChatQuery('housing');
  } else if (lower.includes('business') || lower.includes('loan') || lower.includes('\u0935\u094D\u092F\u093E\u092A\u093E\u0930')) {
    handleChatQuery('business');
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('\u0928\u092E\u0938\u094D\u0924\u0947')) {
    addBotMessage(currentLang === 'hi'
      ? '\u0928\u092E\u0938\u094D\u0924\u0947! \ud83d\ude4f \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0915\u094D\u092F\u093E \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0901? \u0915\u093F\u0938\u093E\u0928, \u091B\u093E\u0924\u094D\u0930, \u092E\u0939\u093F\u0932\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0906\u0935\u093E\u0938, \u092F\u093E \u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u092F\u094B\u091C\u0928\u093E\u0913\u0902 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092A\u0942\u091B\u0947\u0902!'
      : 'Namaste! \ud83d\ude4f How can I help you? Ask me about farmer, student, women, health, housing, or business schemes!');
  } else {
    addBotMessage(currentLang === 'hi'
      ? '\u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u092C\u093E\u0924 \u0938\u092E\u091D \u0928\u0939\u0940\u0902 \u092A\u093E\u092F\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u093F\u0938\u093E\u0928, \u091B\u093E\u0924\u094D\u0930, \u092E\u0939\u093F\u0932\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0906\u0935\u093E\u0938, \u092F\u093E \u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u091C\u0948\u0938\u0947 \u0915\u0940\u0935\u0930\u094D\u0921 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964 \u092F\u093E \u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u092A\u0930\u093F\u0923\u093E\u092E\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F "\u092F\u094B\u091C\u0928\u093E\u090F\u0902 \u0916\u094B\u091C\u0947\u0902" \u092B\u0949\u0930\u094D\u092E \u092D\u0930\u0947\u0902!'
      : 'I didn\'t quite understand that. Try keywords like farmer, student, women, health, housing, or business. Or fill the "Find Schemes" form for best results!');
  }
}

function handleChatQuery(query) {
  var responses = {
    farmer: {
      en: '\ud83c\udf3e **Farmer Schemes:**\n\n1. **PM Kisan** - Get \u20b96,000/year directly in your bank\n2. **PM Fasal Bima** - Crop insurance at low premiums\n3. **MGNREGA** - 100 days guaranteed employment\n\nFill the form above with your details for personalized results!',
      hi: '\ud83c\udf3e **\u0915\u093F\u0938\u093E\u0928 \u092F\u094B\u091C\u0928\u093E\u090F\u0902:**\n\n1. **\u092A\u0940\u090F\u092E \u0915\u093F\u0938\u093E\u0928** - \u0938\u0940\u0927\u0947 \u092C\u0948\u0902\u0915 \u092E\u0947\u0902 \u20b96,000/\u0935\u0930\u094D\u0937\n2. **\u092A\u0940\u090F\u092E \u092B\u0938\u0932 \u092C\u0940\u092E\u093E** - \u0915\u092E \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u092A\u0930 \u092B\u0938\u0932 \u092C\u0940\u092E\u093E\n3. **\u092E\u0928\u0930\u0947\u0917\u093E** - 100 \u0926\u093F\u0928 \u0917\u093E\u0930\u0902\u091F\u0940\u0915\u0943\u0924 \u0930\u094B\u091C\u0917\u093E\u0930\n\n\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u092A\u0930\u093F\u0923\u093E\u092E\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u090A\u092A\u0930 \u092B\u0949\u0930\u094D\u092E \u092D\u0930\u0947\u0902!'
    },
    student: {
      en: '\ud83c\udf93 **Student Schemes:**\n\n1. **National Scholarship Portal** - Multiple scholarships for all levels\n2. **Samagra Shiksha** - Free textbooks, uniforms, meals\n3. **Sukanya Samriddhi** - Savings for girl child education\n\nFill the form to find schemes matching your profile!',
      hi: '\ud83c\udf93 **\u091b\u093e\u0924\u094d\u0930 \u092f\u094b\u091c\u0928\u093e\u090f\u0902:**\n\n1. **\u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u091b\u093e\u0924\u094d\u0930\u0935\u0943\u0924\u094d\u0924\u093f \u092a\u094b\u0930\u094d\u091f\u0932** - \u0938\u092d\u0940 \u0938\u094d\u0924\u0930\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u091b\u093e\u0924\u094d\u0930\u0935\u0943\u0924\u094d\u0924\u093f\u092f\u093e\u0902\n2. **\u0938\u092e\u0917\u094d\u0930 \u0936\u093f\u0915\u094d\u0937\u093e** - \u092e\u0941\u092b\u094d\u0924 \u092a\u093e\u0920\u094d\u092f\u092a\u0941\u0938\u094d\u0924\u0915\u0947\u0902, \u092f\u0942\u0928\u093f\u092b\u0949\u0930\u094d\u092e\n3. **\u0938\u0941\u0915\u0928\u094d\u092f\u093e \u0938\u092e\u0943\u0926\u094d\u0927\u093f** - \u092c\u093e\u0932\u093f\u0915\u093e \u0936\u093f\u0915\u094d\u0937\u093e \u0915\u0947 \u0932\u093f\u090f \u092c\u091a\u0924\n\n\u0905\u092a\u0928\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0915\u0947 \u0932\u093f\u090f \u092b\u0949\u0930\u094d\u092e \u092d\u0930\u0947\u0902!'
    },
    women: {
      en: '\ud83d\udc69 **Women Schemes:**\n\n1. **Beti Bachao Beti Padhao** - Girl child education support\n2. **PM Matru Vandana** - \u20b95,000 for pregnant women\n3. **PM Ujjwala** - Free LPG connections\n4. **Stand Up India** - Business loans for women\n\nFill the form for personalized results!',
      hi: '\ud83d\udc69 **\u092e\u0939\u093f\u0932\u093e \u092f\u094b\u091c\u0928\u093e\u090f\u0902:**\n\n1. **\u092c\u0947\u091f\u0940 \u092c\u091a\u093e\u0913 \u092c\u0947\u091f\u0940 \u092a\u0922\u093c\u093e\u0913** - \u092c\u093e\u0932\u093f\u0915\u093e \u0936\u093f\u0915\u094d\u0937\u093e \u0938\u0939\u093e\u092f\u0924\u093e\n2. **\u092a\u0940\u090f\u092e \u092e\u093e\u0924\u0943 \u0935\u0902\u0926\u0928\u093e** - \u0917\u0930\u094d\u092d\u0935\u0924\u0940 \u092e\u0939\u093f\u0932\u093e\u0913\u0902 \u0915\u094b \u20b95,000\n3. **\u092a\u0940\u090f\u092e \u0909\u091c\u094d\u091c\u094d\u0935\u0932\u093e** - \u092e\u0941\u092b\u094d\u0924 LPG \u0915\u0928\u0947\u0915\u094d\u0936\u0928\n4. **\u0938\u094d\u091f\u0948\u0902\u0921 \u0905\u092a \u0907\u0902\u0921\u093f\u092f\u093e** - \u092e\u0939\u093f\u0932\u093e\u0913\u0902 \u0915\u0947 \u0932\u093f\u090f \u0935\u094d\u092f\u093e\u092a\u093e\u0930 \u0932\u094b\u0928\n\n\u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0917\u0924 \u092a\u0930\u093f\u0923\u093e\u092e\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u092b\u0949\u0930\u094d\u092e \u092d\u0930\u0947\u0902!'
    },
    health: {
      en: '\ud83c\udfe5 **Health Schemes:**\n\n1. **Ayushman Bharat (PMJAY)** - \u20b95 lakh health insurance per family\n   - Cashless treatment at empanelled hospitals\n   - 1,500+ procedures covered\n\nFill the form to check your eligibility!',
      hi: '\ud83c\udfe5 **\u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u092f\u094b\u091c\u0928\u093e\u090f\u0902:**\n\n1. **\u0906\u092f\u0941\u0937\u094d\u092e\u093e\u0928 \u092d\u093e\u0930\u0924** - \u092a\u094d\u0930\u0924\u093f \u092a\u0930\u093f\u0935\u093e\u0930 \u20b95 \u0932\u093e\u0916 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u092c\u0940\u092e\u093e\n   - \u0915\u0948\u0936\u0932\u0947\u0938 \u0909\u092a\u091a\u093e\u0930\n   - 1,500+ \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0902 \u0915\u0935\u0930\n\n\u0905\u092a\u0928\u0940 \u092a\u093e\u0924\u094d\u0930\u0924\u093e \u091c\u093e\u0902\u091a\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u092b\u0949\u0930\u094d\u092e \u092d\u0930\u0947\u0902!'
    },
    housing: {
      en: '\ud83c\udfe0 **Housing Schemes:**\n\n1. **PM Awas Yojana** - Subsidy up to \u20b92.67 lakh for house construction\n   - Interest subsidy on home loans\n   - For EWS/LIG/MIG families\n\nCheck your eligibility by filling the form!',
      hi: '\ud83c\udfe0 **\u0906\u0935\u093e\u0938 \u092f\u094b\u091c\u0928\u093e\u090f\u0902:**\n\n1. **\u092a\u0940\u090f\u092e \u0906\u0935\u093e\u0938 \u092f\u094b\u091c\u0928\u093e** - \u0918\u0930 \u0928\u093f\u0930\u094d\u092e\u093e\u0923 \u0915\u0947 \u0932\u093f\u090f \u20b92.67 \u0932\u093e\u0916 \u0924\u0915 \u0938\u092c\u094d\u0938\u093f\u0921\u0940\n   - \u0917\u0943\u0939 \u0930\u0923 \u092a\u0930 \u092c\u094d\u092f\u093e\u091c \u0938\u092c\u094d\u0938\u093f\u0921\u0940\n   - EWS/LIG/MIG \u092a\u0930\u093f\u0935\u093e\u0930\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f\n\n\u092b\u0949\u0930\u094d\u092e \u092d\u0930\u0915\u0930 \u0905\u092a\u0928\u0940 \u092a\u093e\u0924\u094d\u0930\u0924\u093e \u091c\u093e\u0902\u091a\u0947\u0902!'
    },
    business: {
      en: '\ud83d\udcbc **Business Schemes:**\n\n1. **Mudra Loan** - Up to \u20b910 lakh, no collateral\n2. **Stand Up India** - \u20b910 lakh to \u20b91 crore for SC/ST/Women\n3. **PM SVANidhi** - \u20b950,000 for street vendors\n\nFill the form for personalized recommendations!',
      hi: '\ud83d\udcbc **\u0935\u094d\u092f\u093e\u092a\u093e\u0930 \u092f\u094b\u091c\u0928\u093e\u090f\u0902:**\n\n1. **\u092e\u0941\u0926\u094d\u0930\u093e \u0932\u094b\u0928** - \u20b910 \u0932\u093e\u0916 \u0924\u0915, \u0915\u094b\u0908 \u0938\u0902\u092a\u093e\u0930\u094d\u0936\u094d\u0935\u093f\u0915 \u0928\u0939\u0940\u0902\n2. **\u0938\u094d\u091f\u0948\u0902\u0921 \u0905\u092a \u0907\u0902\u0921\u093f\u092f\u093e** - SC/ST/\u092e\u0939\u093f\u0932\u093e\u0913\u0902 \u0915\u0947 \u0932\u093f\u090f \u20b910 \u0932\u093e\u0916 \u0938\u0947 \u20b91 \u0915\u0930\u094b\u0921\n3. **\u092a\u0940\u090f\u092e \u0938\u094d\u0935\u0928\u093f\u0927\u093f** - \u0938\u094d\u091f\u094d\u0930\u0940\u091f \u0935\u0947\u0902\u0921\u0930\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u20b950,000\n\n\u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0917\u0924 \u0938\u093f\u092b\u093e\u0930\u093f\u0936\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u092b\u0949\u0930\u094d\u092e \u092d\u0930\u0947\u0902!'
    }
  };

  var resp = responses[query];
  if (resp) {
    addBotMessage(resp[currentLang]);
  }
}

function addUserMessage(text) {
  var container = document.getElementById('chatbotMessages');
  var div = document.createElement('div');
  div.className = 'chat-message user';
  div.innerHTML = '<div class="chat-avatar"><i class="fas fa-user"></i></div>' +
    '<div class="chat-bubble"><p>' + escapeHtml(text) + '</p></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addBotMessage(text) {
  var container = document.getElementById('chatbotMessages');
  // Small delay for natural feel
  setTimeout(function () {
    var div = document.createElement('div');
    div.className = 'chat-message bot';
    var formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    div.innerHTML = '<div class="chat-avatar"><i class="fas fa-robot"></i></div>' +
      '<div class="chat-bubble"><p>' + formatted + '</p></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }, 500);
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ========== BACK TO TOP ==========
function initBackToTop() {
  var btn = document.getElementById('backToTop');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  var elements = document.querySelectorAll('.step-card, .category-card, .faq-item');
  elements.forEach(function (el) {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ========== COUNTER ANIMATION ==========
function initCounterAnimation() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  var statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

function animateCounters() {
  var counters = document.querySelectorAll('.stat-number');
  counters.forEach(function (counter) {
    var target = parseInt(counter.getAttribute('data-count'));
    var current = 0;
    var increment = Math.ceil(target / 60);
    var timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current;
    }, 30);
  });
}

// ========== CATEGORY CARDS ==========
function initCategoryCards() {
  var cards = document.querySelectorAll('.category-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var cat = this.getAttribute('data-category');
      // Scroll to form
      document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
}
