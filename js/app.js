/* =========================================================
   RESPECT STARTS WITH US · Aplicación
   Arquitectura modular:
   1. Configuración y navegación
   2. Audio y guía de estudio
   3. Práctica interactiva
   4. Escenarios
   5. Escape Room
   6. Reflexión y ticket de salida
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     1. CONFIGURACIÓN Y NAVEGACIÓN
     ======================================================= */

  const SECTIONS = [
    { id: 'inicio',     title: 'Inicio',            icon: '🏠', accent: 'blue'   },
    { id: 'infografia', title: 'Infografía',        icon: '🛑', accent: 'orange' },
    { id: 'mapa',       title: 'Mapa mental',       icon: '🧠', accent: 'lilac'  },
    { id: 'vio',        title: 'Video y audio',     icon: '🎧', accent: 'green'  },
    { id: 'guia',       title: 'Guía de estudio',   icon: '📚', accent: 'yellow' },
    { id: 'practica',   title: 'Práctica',          icon: '✏️', accent: 'blue'   },
    { id: 'escenarios', title: 'Escenarios',        icon: '💬', accent: 'lilac'  },
    { id: 'escape',     title: 'Escape Room',       icon: '🔐', accent: 'orange' },
    { id: 'ia',         title: 'Herramientas IA',   icon: '🤖', accent: 'green'  },
    { id: 'reflexion',  title: 'Reflexión',         icon: '🌟', accent: 'yellow' },
    { id: 'docente',    title: 'Docentes',          icon: '🍎', accent: 'blue'   }
  ];

  const ACCENTS = {
    blue:   { a: '#79aede', s: '#e6f2fb', i: '#2a5d86' },
    orange: { a: '#eda172', s: '#ffeadd', i: '#9a5222' },
    lilac:  { a: '#a48fdd', s: '#eee9fc', i: '#5b459e' },
    green:  { a: '#78c29a', s: '#e2f5ea', i: '#2f6b4a' },
    yellow: { a: '#f2c94c', s: '#fff4cf', i: '#8a6200' }
  };

  const STORAGE = {
    visited: 'rsu2.visited',
    speak: 'rsu2.speak',
    reflect: 'rsu2.reflect'
  };

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  const nav = $('#nav');
  const pager = $('#pager');
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const menuBtn = $('#menu-btn');
  const topbarTitle = $('#topbar-title');

  let visited = new Set(['inicio']);
  let current = 'inicio';

  /* Recupera el progreso guardado (si el navegador lo permite). */
  try {
    const raw = window.localStorage.getItem(STORAGE.visited);
    if (raw) {
      JSON.parse(raw).forEach(function (id) {
        if (SECTIONS.some(function (s) { return s.id === id; })) visited.add(id);
      });
    }
  } catch (err) {
    /* localStorage no disponible: la página sigue funcionando en memoria. */
  }

  /* --- Construcción del panel de navegación --- */
  SECTIONS.forEach(function (section) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-item';
    button.dataset.target = section.id;
    button.style.setProperty('--chip', ACCENTS[section.accent].s);
    button.innerHTML =
      '<span class="nav-ico" aria-hidden="true">' + section.icon + '</span>' +
      '<span class="nav-label">' + section.title + '</span>';
    button.addEventListener('click', function () { go(section.id); });
    nav.appendChild(button);
  });

  /* --- Progreso --- */
  function updateProgress() {
    const done = SECTIONS.filter(function (s) { return visited.has(s.id); }).length;
    const pct = Math.round((done / SECTIONS.length) * 100);

    const bar = $('#progress-bar');
    const track = $('#progress-track');
    const text = $('#progress-text');
    const percent = $('#progress-percent');
    const count = $('#progress-count');

    if (bar) bar.style.width = pct + '%';
    if (track) track.setAttribute('aria-valuenow', String(pct));
    if (text) text.textContent = done + ' de ' + SECTIONS.length + ' secciones';
    if (percent) percent.textContent = pct + '%';
    if (count) count.textContent = pct + '%';
  }

  /* --- Paginador anterior / siguiente --- */
  function renderPager(id) {
    const index = SECTIONS.findIndex(function (s) { return s.id === id; });
    const previous = SECTIONS[index - 1];
    const next = SECTIONS[index + 1];

    pager.innerHTML = '';

    if (previous) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.dataset.go = previous.id;
      prevBtn.innerHTML = '<span aria-hidden="true">←</span> ' + previous.title;
      pager.appendChild(prevBtn);
    }

    if (next) {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.dataset.go = next.id;
      nextBtn.className = 'next';
      nextBtn.innerHTML = next.title + ' <span aria-hidden="true">→</span>';
      pager.appendChild(nextBtn);
    }
  }

  /* --- Cambio de sección (núcleo de la arquitectura modular) --- */
  function go(id, options) {
    const opts = options || {};
    const section = SECTIONS.find(function (s) { return s.id === id; }) || SECTIONS[0];
    id = section.id;
    current = id;

    $$('.panel').forEach(function (panel) {
      const isActive = panel.id === 'panel-' + id;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });

    const accent = ACCENTS[section.accent] || ACCENTS.blue;
    document.documentElement.style.setProperty('--accent', accent.a);
    document.documentElement.style.setProperty('--accent-soft', accent.s);
    document.documentElement.style.setProperty('--accent-ink', accent.i);

    $$('.nav-item', nav).forEach(function (button) {
      const isCurrent = button.dataset.target === id;
      button.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });

    topbarTitle.textContent = section.title;
    renderPager(id);

    if (!visited.has(id)) {
      visited.add(id);
      try {
        window.localStorage.setItem(STORAGE.visited, JSON.stringify(Array.from(visited)));
      } catch (err) { /* sin almacenamiento */ }
    }
    updateProgress();

    document.title = section.title + ' · Respect Starts With Us';

    if (opts.hash !== false) {
      try {
        window.history.pushState({ id: id }, '', '#' + id);
      } catch (err) {
        /* file:// puede bloquear pushState; la navegación sigue funcionando. */
      }
    }

    if (opts.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    closeDrawer();

    const heading = $('#panel-' + id + ' h1, #panel-' + id + ' h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      try { heading.focus({ preventScroll: true }); } catch (err) { heading.focus(); }
    }
  }

  /* --- Menú lateral en móvil --- */
  function openDrawer() {
    sidebar.classList.add('is-open');
    scrim.classList.add('is-on');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    sidebar.scrollTop = 0;
  }

  function closeDrawer() {
    sidebar.classList.remove('is-open');
    scrim.classList.remove('is-on');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', function () {
    if (sidebar.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  scrim.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeDrawer();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080) closeDrawer();
  });

  /* --- Botones con data-go (hero, paginador, escape...) --- */
  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-go]');
    if (!trigger) return;
    event.preventDefault();
    go(trigger.dataset.go);
  });

  /* --- Historial del navegador --- */
  window.addEventListener('popstate', function () {
    const id = window.location.hash.replace('#', '');
    if (SECTIONS.some(function (s) { return s.id === id; })) {
      go(id, { hash: false, scroll: false });
    }
  });

  /* =======================================================
     2. AUDIO Y GUÍA DE ESTUDIO
     ======================================================= */

  function speak(text, rate) {
    if (!('speechSynthesis' in window)) {
      window.alert(text);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate || 0.85;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  $$('[data-speak]').forEach(function (button) {
    button.addEventListener('click', function () {
      speak(button.dataset.speak, parseFloat(button.dataset.rate || '0.85'));
    });
  });

  $$('[data-stop-speak]').forEach(function (button) {
    button.addEventListener('click', function () {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  });

  /* --- Tarjetas que giran --- */
  $$('.flashcard').forEach(function (card) {
    const front = $('.fc-front', card);
    const back = $('.fc-back', card);
    if (front && back) {
      const word = front.firstChild ? front.firstChild.textContent.trim() : front.textContent.trim();
      const meaning = back.firstChild ? back.firstChild.textContent.trim() : back.textContent.trim();
      card.setAttribute('aria-label', word + ': ' + meaning);
    }
    card.addEventListener('click', function () {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
  });

  /* --- Mapa mental interactivo --- */
  const MAP = {
    empathy: {
      icon: '💗',
      title: 'Empathy',
      en: 'I understand how you feel.',
      es: 'Entiendo cómo te sientes.',
      example: '“Are you okay? Do you want to talk?”'
    },
    diversity: {
      icon: '🌍',
      title: 'Diversity',
      en: 'We are all different.',
      es: 'Todos somos diferentes.',
      example: '“Our differences make us special.”'
    },
    equality: {
      icon: '⚖️',
      title: 'Equality',
      en: 'Everyone has the same value.',
      es: 'Todos tenemos el mismo valor.',
      example: '“Everyone deserves the same opportunities.”'
    },
    safe: {
      icon: '💬',
      title: 'Safe communication',
      en: 'Use kind words online and offline.',
      es: 'Usa palabras amables en internet y en persona.',
      example: '“Think before you send a message.”'
    },
    help: {
      icon: '🤝',
      title: 'Help-seeking',
      en: 'Ask a trusted adult for help.',
      es: 'Pide ayuda a un adulto de confianza.',
      example: '“Can you help me, please?”'
    }
  };

  const mapDetail = $('#map-detail');

  function showMap(key) {
    const data = MAP[key];
    if (!data || !mapDetail) return;

    mapDetail.innerHTML =
      '<span class="map-icon" aria-hidden="true">' + data.icon + '</span>' +
      '<div>' +
        '<h3>' + data.title + '</h3>' +
        '<p><b>' + data.en + '</b></p>' +
        '<p class="es">' + data.es + '</p>' +
        '<p class="example">' + data.example + '</p>' +
      '</div>';

    $$('.map-node').forEach(function (node) {
      node.classList.toggle('is-active', node.dataset.map === key);
    });
  }

  $$('.map-node').forEach(function (node) {
    node.addEventListener('click', function () { showMap(node.dataset.map); });
  });
  showMap('empathy');

  /* --- Mostrar / ocultar respuestas de lectura --- */
  $$('[data-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      const target = document.getElementById(button.dataset.toggle);
      if (!target) return;
      const opening = target.hidden;
      target.hidden = !opening;
      button.setAttribute('aria-expanded', String(opening));
      button.textContent = opening ? 'Ocultar respuestas' : 'Ver preguntas y respuestas';
    });
  });

  /* --- Frases modelo que viajan a la práctica --- */
  $$('[data-frame]').forEach(function (button) {
    button.addEventListener('click', function () {
      const textarea = $('#speak');
      if (!textarea) return;
      textarea.value = button.dataset.frame;
      go('practica');
      window.setTimeout(function () {
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { textarea.focus({ preventScroll: true }); } catch (err) { textarea.focus(); }
      }, 280);
    });
  });

  /* =======================================================
     3. PRÁCTICA INTERACTIVA
     ======================================================= */

  const QUIZ = [
    {
      id: 'q1',
      text: 'A student laughs at another student’s accent every day. What is happening?',
      options: ['Kindness', 'Bullying', 'Sharing'],
      correct: 1,
      why: 'Laughing at someone every day is repeated hurtful behaviour.'
    },
    {
      id: 'q2',
      text: 'A classmate is alone at break. What is a respectful action?',
      options: ['Invite them to join', 'Laugh at them', 'Ignore them'],
      correct: 0,
      why: 'Inviting the person to join shows inclusion and respect.'
    },
    {
      id: 'q3',
      text: 'You receive a hurtful message about someone. What should you do?',
      options: ['Share it', 'Add an insult', 'Do not share it and tell a trusted adult'],
      correct: 2,
      why: 'Do not spread hurtful messages. Tell a trusted adult.'
    }
  ];

  const quizList = $('#quiz-list');
  const quizScore = $('#quiz-score');
  const quizDone = $('#quiz-done');
  const solved = new Set();

  function updateScore() {
    if (quizScore) quizScore.textContent = solved.size + ' / ' + QUIZ.length + ' correctas';
    if (quizDone) {
      quizDone.textContent = solved.size === QUIZ.length
        ? '¡Excelente! Completaste la práctica. Ahora intenta decir tu propia frase en voz alta. 🌟'
        : '';
    }
  }

  function renderQuiz() {
    if (!quizList) return;
    solved.clear();
    quizList.innerHTML = '';

    QUIZ.forEach(function (question, index) {
      const card = document.createElement('article');
      card.className = 'card question';
      card.innerHTML =
        '<div class="q-head">' +
          '<span class="q-num" aria-hidden="true">' + (index + 1) + '</span>' +
          '<h3>' + question.text + '</h3>' +
        '</div>' +
        '<div class="options" role="group" aria-label="Opciones de la pregunta ' + (index + 1) + '"></div>' +
        '<p class="feedback" aria-live="polite"></p>';

      const optionsBox = $('.options', card);
      const feedback = $('.feedback', card);

      question.options.forEach(function (option, optionIndex) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'option';
        button.innerHTML =
          '<span class="key" aria-hidden="true">' + 'ABC'[optionIndex] + '</span>' +
          '<span>' + option + '</span>';

        button.addEventListener('click', function () {
          if (solved.has(question.id)) return;

          if (optionIndex === question.correct) {
            button.classList.add('correct');
            $$('.option', optionsBox).forEach(function (item) { item.disabled = true; });
            feedback.className = 'feedback ok';
            feedback.textContent = '✓ Correct! ' + question.why;
            solved.add(question.id);
            updateScore();
          } else {
            button.classList.add('wrong');
            feedback.className = 'feedback no';
            feedback.textContent = 'Try again. Think about respect and safety.';
          }
        });

        optionsBox.appendChild(button);
      });

      quizList.appendChild(card);
    });

    updateScore();
  }

  renderQuiz();

  const quizReset = $('#quiz-reset');
  if (quizReset) {
    quizReset.addEventListener('click', function () {
      renderQuiz();
      quizList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* --- Speaking --- */
  const speakInput = $('#speak');
  const speakFeedback = $('#speak-fb');

  try {
    const savedSpeak = window.localStorage.getItem(STORAGE.speak);
    if (savedSpeak && speakInput) speakInput.value = savedSpeak;
  } catch (err) { /* sin almacenamiento */ }

  const speakSave = $('#speak-save');
  if (speakSave) {
    speakSave.addEventListener('click', function () {
      const value = speakInput.value.trim();
      if (!value) {
        speakFeedback.className = 'feedback no';
        speakFeedback.textContent = 'Escribe tu oración primero. ✍️';
        speakInput.focus();
        return;
      }
      try { window.localStorage.setItem(STORAGE.speak, value); } catch (err) { /* sin almacenamiento */ }
      speakFeedback.className = 'feedback ok';
      speakFeedback.textContent = '¡Buen trabajo! Ahora léela en voz alta. 🌟';
    });
  }

  const speakExample = $('#speak-example');
  if (speakExample) {
    speakExample.addEventListener('click', function () {
      speakInput.value = 'We should invite everyone because we are all equal.';
      speakFeedback.className = 'feedback';
      speakFeedback.textContent = 'Este es un ejemplo. Ahora escribe tu propia idea. ✨';
      speakInput.focus();
    });
  }

  /* =======================================================
     4. ESCENARIOS
     ======================================================= */

  $$('[data-reveal]').forEach(function (button) {
    button.addEventListener('click', function () {
      const box = document.getElementById(button.dataset.reveal);
      if (!box) return;
      const opening = box.hidden;
      box.hidden = !opening;
      button.setAttribute('aria-expanded', String(opening));
      if (!button.dataset.label) button.dataset.label = button.textContent;
      button.textContent = opening ? 'Ocultar respuesta' : button.dataset.label;
    });
  });

  /* =======================================================
     5. ESCAPE ROOM
     ======================================================= */

  const MISSIONS = [
    {
      title: 'The Respect Code',
      q: 'What action shows respect?',
      options: ['Laugh at a classmate', 'Help a classmate', 'Ignore a classmate'],
      correct: 1,
      why: 'Helping others shows respect.'
    },
    {
      title: 'The Diversity Museum',
      q: 'All children deserve ____.',
      options: ['Respect', 'Fear', 'Bullying'],
      correct: 0,
      why: 'Everyone deserves respect.'
    },
    {
      title: 'Stop Bullying',
      q: 'You see a student being bullied. What can you do?',
      options: ['Laugh', 'Join in', 'Help and tell a teacher'],
      correct: 2,
      why: 'Support the student and ask a trusted adult for help.'
    },
    {
      title: 'Cyber Respect',
      q: 'You receive a mean message. What is safest?',
      options: ['Share it', 'Write an insult', 'Do not share it; tell a trusted adult'],
      correct: 2,
      why: 'Do not spread hurtful messages.'
    },
    {
      title: 'The Inclusion Mission',
      q: 'We are different, but we are all ____.',
      options: ['Enemies', 'Equal', 'Alone'],
      correct: 1,
      why: 'We all have equal value.'
    }
  ];

  const game = $('#game');
  const dots = $('#dots');
  const missionLabel = $('#mission-label');
  let missionIndex = 0;

  function renderDots() {
    if (!dots) return;
    dots.innerHTML = '';
    MISSIONS.forEach(function (mission, index) {
      const dot = document.createElement('span');
      dot.className = 'dot' +
        (index < missionIndex ? ' done' : '') +
        (index === missionIndex ? ' now' : '');
      dot.textContent = index < missionIndex ? '✓' : String(index + 1);
      dots.appendChild(dot);
    });
  }

  function renderMission() {
    if (!game) return;

    if (missionIndex >= MISSIONS.length) {
      renderFinish();
      return;
    }

    const mission = MISSIONS[missionIndex];
    if (missionLabel) {
      missionLabel.textContent = 'Misión ' + (missionIndex + 1) + ' de ' + MISSIONS.length;
    }
    renderDots();

    game.dataset.locked = '0';
    game.innerHTML =
      '<h3>' + mission.title + '</h3>' +
      '<p class="mission-q">' + mission.q + '</p>' +
      '<div class="options" id="mission-options"></div>' +
      '<p class="feedback" id="mission-fb" aria-live="polite"></p>' +
      '<div class="mission-actions">' +
        '<button type="button" class="btn" id="mission-next" hidden>' +
          (missionIndex === MISSIONS.length - 1 ? 'Ver mi insignia 🏅' : 'Next mission →') +
        '</button>' +
      '</div>';

    const optionsBox = $('#mission-options');
    const feedback = $('#mission-fb');
    const nextButton = $('#mission-next');

    mission.options.forEach(function (option, optionIndex) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.innerHTML =
        '<span class="key" aria-hidden="true">' + 'ABC'[optionIndex] + '</span>' +
        '<span>' + option + '</span>';

      button.addEventListener('click', function () {
        if (game.dataset.locked === '1') return;

        if (optionIndex === mission.correct) {
          game.dataset.locked = '1';
          button.classList.add('correct');
          $$('.option', optionsBox).forEach(function (item) { item.disabled = true; });
          feedback.className = 'feedback ok';
          feedback.textContent = '✓ ' + mission.why;
          nextButton.hidden = false;
          nextButton.focus();
        } else {
          button.classList.add('wrong');
          feedback.className = 'feedback no';
          feedback.textContent = 'Not yet. Try another answer.';
        }
      });

      optionsBox.appendChild(button);
    });

    nextButton.addEventListener('click', function () {
      missionIndex += 1;
      renderMission();
    });
  }

  function renderFinish() {
    if (!game) return;
    renderDots();
    if (missionLabel) missionLabel.textContent = '¡Completado!';

    game.dataset.locked = '1';
    game.innerHTML =
      '<div class="finish">' +
        '<div class="badge" aria-hidden="true">🏅</div>' +
        '<h3>Mission completed!</h3>' +
        '<p>You are a <b>Respect Hero</b>. Be kind, include everyone and stop bullying.</p>' +
        '<p class="small">¡Completaste las cinco misiones! Puedes volver a jugar o continuar con la reflexión.</p>' +
        '<div class="row-actions" style="justify-content:center">' +
          '<button type="button" class="btn" id="again">Play again</button>' +
          '<button type="button" class="btn ghost" data-go="reflexion">Ir a la reflexión →</button>' +
        '</div>' +
      '</div>';

    const again = $('#again');
    if (again) {
      again.addEventListener('click', function () {
        missionIndex = 0;
        renderMission();
      });
    }
  }

  renderMission();

  /* =======================================================
     6. REFLEXIÓN Y TICKET DE SALIDA
     ======================================================= */

  const reflectInput = $('#reflect-input');
  const reflectFeedback = $('#reflect-fb');
  const reflectSaved = $('#reflect-saved');

  try {
    const savedReflection = window.localStorage.getItem(STORAGE.reflect);
    if (savedReflection && reflectInput) {
      reflectInput.value = savedReflection;
      if (reflectSaved) {
        reflectSaved.textContent = '“' + savedReflection + '”';
        reflectSaved.hidden = false;
      }
    }
  } catch (err) { /* sin almacenamiento */ }

  const reflectSave = $('#reflect-save');
  if (reflectSave) {
    reflectSave.addEventListener('click', function () {
      const value = reflectInput.value.trim();
      if (!value) {
        reflectFeedback.className = 'feedback no';
        reflectFeedback.textContent = 'Escribe una idea antes de guardar. 💛';
        reflectInput.focus();
        return;
      }
      try { window.localStorage.setItem(STORAGE.reflect, value); } catch (err) { /* sin almacenamiento */ }
      reflectSaved.textContent = '“' + value + '”';
      reflectSaved.hidden = false;
      reflectFeedback.className = 'feedback ok';
      reflectFeedback.textContent = '¡Guardado! Tu compromiso es importante. 🌟';
    });
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  const ticketSubmit = $('#ticket-submit');
  if (ticketSubmit) {
    ticketSubmit.addEventListener('click', function () {
      const word = $('#ticket-word').value.trim();
      const action = $('#ticket-action').value.trim();
      const output = $('#ticket-out');

      if (!word || !action) {
        output.hidden = false;
        output.className = 'ticket-result ticket-warn';
        output.innerHTML = '<p>Completa las dos casillas, por favor. ✍️</p>';
        return;
      }

      output.hidden = false;
      output.className = 'ticket-result';
      output.innerHTML =
        '<h4>🎟️ Tu ticket de salida</h4>' +
        '<p><b>New word:</b> ' + escapeHtml(word) + '</p>' +
        '<p><b>My action:</b> ' + escapeHtml(action) + '</p>' +
        '<p class="small">Muéstraselo a tu docente. ¡Buen trabajo!</p>';
    });
  }

  /* =======================================================
     INICIO
     ======================================================= */

  const initialId = window.location.hash.replace('#', '');
  const startId = SECTIONS.some(function (s) { return s.id === initialId; })
    ? initialId
    : 'inicio';

  go(startId, { hash: false, scroll: false });
})();
