(() => {
  'use strict';
  const DURATION_SECONDS = 90 * 60;
  const $ = (id) => document.getElementById(id);
  const screens = { welcome: $('welcomeScreen'), assessment: $('assessmentScreen'), result: $('resultScreen') };
  const form = $('identityForm');
  const state = { student: null, questions: [], index: 0, answers: [], startedAt: 0, deadline: 0, timerId: null, finished: false };
  $('year').textContent = new Date().getFullYear();

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => el.classList.toggle('d-none', key !== name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function validIdentity() {
    const name = $('studentName').value.trim();
    const nis = $('studentNis').value.trim();
    const studentClass = $('studentClass').value.trim();
    let valid = true;
    const nameOk = name.length >= 3 && /[\p{L}]/u.test(name);
    const nisOk = nis.length >= 1 && /^[\p{L}\p{N}./-]+$/u.test(nis);
    const classOk = studentClass.length >= 1;
    setValidity('studentName', nameOk); setValidity('studentNis', nisOk); setValidity('studentClass', classOk);
    valid = nameOk && nisOk && classOk;
    $('identityError').classList.toggle('d-none', valid);
    if (!valid) $('identityError').textContent = 'Periksa kembali identitas. Semua kolom wajib diisi dan nama minimal 3 karakter.';
    return valid ? { name, nis, studentClass } : null;
  }
  function setValidity(id, valid) { const el = $(id); el.classList.toggle('is-invalid', !valid); el.classList.toggle('is-valid', valid); }
  ['studentName','studentNis','studentClass'].forEach(id => $(id).addEventListener('input', () => { $(id).classList.remove('is-invalid','is-valid'); $('identityError').classList.add('d-none'); }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const student = validIdentity();
    if (!student) return;
    if (!Array.isArray(window.GENIUS_QUESTIONS) || window.GENIUS_QUESTIONS.length !== 40) {
      $('identityError').textContent = 'Bank soal tidak dapat dimuat dengan benar. Muat ulang halaman atau hubungi pengelola.';
      $('identityError').classList.remove('d-none'); return;
    }
    state.student = student;
    state.questions = shuffle(window.GENIUS_QUESTIONS).map(q => ({ ...q, options: shuffle(q.options.map(o => ({ ...o }))) }));
    state.index = 0; state.answers = Array(40).fill(null); state.finished = false;
    state.startedAt = Date.now(); state.deadline = state.startedAt + DURATION_SECONDS * 1000;
    showScreen('assessment'); renderQuestion(); updateTimer();
    clearInterval(state.timerId); state.timerId = setInterval(updateTimer, 250);
  });

  function renderQuestion() {
    if (state.finished) return;
    const q = state.questions[state.index];
    $('questionCounter').textContent = `Soal ${state.index + 1} dari ${state.questions.length}`;
    $('progressPercent').textContent = `${Math.round((state.index / state.questions.length) * 100)}% selesai`;
    $('progressBar').style.width = `${(state.index / state.questions.length) * 100}%`;
    $('progressTrack').setAttribute('aria-valuenow', String(Math.round((state.index / state.questions.length) * 100)));
    $('questionNumberBadge').textContent = `PERTANYAAN ${String(state.index + 1).padStart(2,'0')}`;
    $('difficultyBadge').textContent = q.difficulty || 'Latihan';
    $('questionText').textContent = q.question;
    $('feedbackPanel').className = 'feedback-panel d-none'; $('feedbackPanel').innerHTML = '';
    $('optionsList').replaceChildren();
    $('nextButton').disabled = true;
    $('nextButton').innerHTML = state.index === state.questions.length - 1 ? 'Lihat Hasil <i class="bi bi-flag ms-1"></i>' : 'Soal Berikutnya <i class="bi bi-arrow-right ms-1"></i>';
    q.options.forEach((option, index) => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'option-button';
      btn.setAttribute('aria-label', `Pilihan ${String.fromCharCode(65 + index)}: ${option.text}`);
      const letter = document.createElement('span'); letter.className = 'option-letter'; letter.textContent = String.fromCharCode(65 + index);
      const copy = document.createElement('span'); copy.className = 'option-copy'; copy.textContent = option.text;
      btn.append(letter, copy); btn.addEventListener('click', () => chooseAnswer(index)); $('optionsList').append(btn);
    });
    if (state.answers[state.index] !== null) showAnswerFeedback(state.answers[state.index]);
  }
  function chooseAnswer(optionIndex) {
    if (state.finished || state.answers[state.index] !== null) return;
    if (Date.now() >= state.deadline) { finishAssessment(true); return; }
    const q = state.questions[state.index];
    state.answers[state.index] = { selectedIndex: optionIndex, correct: Boolean(q.options[optionIndex].correct) };
    showAnswerFeedback(state.answers[state.index]);
    $('nextButton').disabled = false;
    $('progressPercent').textContent = `${state.answers.filter(Boolean).length} dari ${state.questions.length} dijawab`;
    $('progressBar').style.width = `${(state.answers.filter(Boolean).length / state.questions.length) * 100}%`;
    $('progressTrack').setAttribute('aria-valuenow', String(Math.round((state.answers.filter(Boolean).length / state.questions.length) * 100)));
  }
  function showAnswerFeedback(answer) {
    const q = state.questions[state.index]; const buttons = [...$('optionsList').querySelectorAll('button')];
    buttons.forEach((btn, i) => { btn.disabled = true; if (q.options[i].correct) btn.classList.add('correct-option'); else if (i === answer.selectedIndex) btn.classList.add('wrong-option'); else btn.classList.add('muted-option'); });
    const panel = $('feedbackPanel'); panel.className = `feedback-panel ${answer.correct ? 'good' : 'bad'}`;
    const title = document.createElement('div'); title.className = 'feedback-title';
    const emoji = document.createElement('span'); emoji.className = 'feedback-emoji'; emoji.textContent = answer.correct ? '😄' : '😢';
    title.append(emoji, document.createTextNode(answer.correct ? 'GOOD JOB! Jawaban kamu benar.' : 'Belum tepat. Yuk, pelajari kembali!'));
    panel.replaceChildren(title);
    if (!answer.correct) {
      const correct = q.options.find(o => o.correct);
      const answerLine = document.createElement('p'); answerLine.className = 'mb-1';
      const strong = document.createElement('strong'); strong.textContent = 'Jawaban benar: ';
      answerLine.append(strong, document.createTextNode(correct ? correct.text : 'Tidak tersedia.')); panel.append(answerLine);
    }
    const explanation = document.createElement('p'); explanation.className = 'feedback-explanation';
    const label = document.createElement('strong'); label.textContent = 'Pembahasan: ';
    explanation.append(label, document.createTextNode(q.explanation || 'Perhatikan kembali konsep yang ditanyakan.')); panel.append(explanation);
    $('nextButton').disabled = false;
  }
  $('nextButton').addEventListener('click', () => {
    if (state.finished || state.answers[state.index] === null) return;
    if (Date.now() >= state.deadline) { finishAssessment(true); return; }
    if (state.index >= state.questions.length - 1) finishAssessment(false);
    else { state.index++; renderQuestion(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  function updateTimer() {
    if (state.finished) return;
    const remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    const mm = String(Math.floor(remaining / 60)).padStart(2,'0'); const ss = String(remaining % 60).padStart(2,'0');
    $('timer').textContent = `${mm}:${ss}`;
    $('timerCard').classList.toggle('urgent', remaining <= 300);
    if (remaining <= 0) finishAssessment(true);
  }
  function formatDuration(seconds) { const mm = String(Math.floor(seconds / 60)).padStart(2,'0'); const ss = String(seconds % 60).padStart(2,'0'); return `${mm}:${ss}`; }
  function finishAssessment(timeExpired) {
    if (state.finished) return;
    state.finished = true; clearInterval(state.timerId);
    const elapsedSeconds = Math.min(DURATION_SECONDS, Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)));
    const correct = state.answers.filter(a => a && a.correct).length;
    const wrong = state.questions.length - correct; // unanswered responses are counted as incorrect
    const score = Math.round((correct / 40) * 100);
    $('finalScore').textContent = String(score); $('correctCount').textContent = String(correct); $('wrongCount').textContent = String(wrong); $('elapsedTime').textContent = formatDuration(elapsedSeconds);
    $('resultName').textContent = state.student.name; $('resultNis').textContent = state.student.nis; $('resultClass').textContent = state.student.studentClass;
    $('resultIcon').innerHTML = score >= 80 ? '<i class="bi bi-trophy-fill"></i>' : score >= 60 ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-book-half"></i>';
    let message;
    if (score >= 90) message = 'Luar biasa! Pemahamanmu sangat baik. Pertahankan prestasi ini!';
    else if (score >= 80) message = 'Hebat! Kamu sudah memahami sebagian besar materi. Terus pertahankan!';
    else if (score >= 70) message = 'Bagus! Terus berlatih agar pemahamanmu semakin kuat.';
    else if (score >= 60) message = 'Kamu sudah memulai dengan baik. Pelajari kembali pembahasan dan coba lagi.';
    else message = 'Jangan menyerah. Tinjau kembali materi teks prosedur dan terus berlatih.';
    $('resultMessage').textContent = timeExpired ? 'Waktu telah habis. Berikut hasil berdasarkan jawaban yang sudah diberikan.' : 'Terima kasih telah menyelesaikan seluruh soal.';
    $('resultFeedback').replaceChildren(); const icon = document.createElement('i'); icon.className = 'bi bi-chat-heart-fill'; const span = document.createElement('span'); span.textContent = message; $('resultFeedback').append(icon,span);
    showScreen('result');
  }
  $('restartButton').addEventListener('click', () => {
    clearInterval(state.timerId); state.student = null; state.questions = []; state.answers = []; state.index = 0; state.finished = false;
    form.reset(); ['studentName','studentNis','studentClass'].forEach(id => $(id).classList.remove('is-invalid','is-valid')); $('identityError').classList.add('d-none'); showScreen('welcome');
  });
  $('printButton').addEventListener('click', () => window.print());
  window.addEventListener('beforeunload', (event) => {
    if (!state.finished && state.startedAt && screens.assessment && !screens.assessment.classList.contains('d-none')) { event.preventDefault(); event.returnValue = ''; }
  });
})();
