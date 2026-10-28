/**
 * SchemaSense – Dual Mode Exam Engine
 * Quiz Mode    : Self-paced practice with instant explanations, no penalty.
 * Competitive  : Timed, negative marking (+4 correct / -1 wrong / 0 unattempted),
 *                countdown lock, rank/percentile calculation, certificate.
 */

/* ============================================================
   SHARED HELPERS
   ============================================================ */

function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fmtTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function getEl(id) { return document.getElementById(id); }
function setText(id, val) { var el = getEl(id); if (el) el.textContent = val; }
function showEl(id) { var el = getEl(id); if (el) el.style.display = ''; }
function hideEl(id) { var el = getEl(id); if (el) el.style.display = 'none'; }

/* ============================================================
   QUIZ MODE ENGINE
   ============================================================ */

class QuizModeEngine {
    constructor() {
        this.questions = [];
        this.current = 0;
        this.answers = [];   // { selected: index|null, revealed: bool }
        this.startTime = 0;
        this._bind();
    }

    _bind() {
        var startBtn = getEl('quiz-btn-start');
        if (startBtn) startBtn.onclick = () => this.startQuiz();

        var nextBtn = getEl('quiz-btn-next');
        if (nextBtn) nextBtn.onclick = () => this.navigate(1);

        var prevBtn = getEl('quiz-btn-prev');
        if (prevBtn) prevBtn.onclick = () => this.navigate(-1);

        var revealBtn = getEl('quiz-btn-reveal');
        if (revealBtn) revealBtn.onclick = () => this.revealAnswer();

        var submitBtn = getEl('quiz-btn-submit');
        if (submitBtn) submitBtn.onclick = () => this.submitQuiz();

        var restartBtn = getEl('quiz-btn-restart');
        if (restartBtn) restartBtn.onclick = () => this.resetQuiz();
    }

    startQuiz() {
        var catSel = getEl('quiz-select-category');
        var cntSel = getEl('quiz-select-count');
        var cat = catSel ? catSel.value : 'all';
        var count = cntSel ? parseInt(cntSel.value) : 10;

        var bank = (typeof EXAM_QUESTION_BANK !== 'undefined') ? EXAM_QUESTION_BANK : [];
        var pool = (cat !== 'all') ? bank.filter(q => q.category === cat) : bank;
        if (pool.length === 0) pool = bank;

        this.questions = shuffleArray(pool).slice(0, Math.min(count, pool.length));
        this.answers = this.questions.map(() => ({ selected: null, revealed: false }));
        this.current = 0;
        this.startTime = Date.now();

        showEl('quiz-active-panel');
        hideEl('quiz-setup-panel');
        hideEl('quiz-result-panel');
        this.renderQuestion();
    }

    navigate(dir) {
        var next = this.current + dir;
        if (next < 0 || next >= this.questions.length) return;
        this.current = next;
        this.renderQuestion();
    }

    renderQuestion() {
        var q = this.questions[this.current];
        var ans = this.answers[this.current];
        var total = this.questions.length;

        setText('quiz-q-num', 'Question ' + (this.current + 1) + ' / ' + total);
        setText('quiz-q-category', q.categoryTitle || q.category || '');
        setText('quiz-q-smell-code', q.smellCode || '');
        setText('quiz-q-difficulty', q.difficulty || 'Medium');

        var diffEl = getEl('quiz-q-difficulty');
        if (diffEl) diffEl.className = 'badge badge-diff-' + (q.difficulty || 'medium').toLowerCase();

        setText('quiz-q-text', q.question || '');

        var codeWrap = getEl('quiz-q-code-wrap');
        var codeEl = getEl('quiz-q-code');
        if (q.code && codeWrap && codeEl) {
            codeWrap.style.display = '';
            codeEl.textContent = q.code;
        } else if (codeWrap) {
            codeWrap.style.display = 'none';
        }

        var optCont = getEl('quiz-options-list');
        if (optCont) {
            optCont.innerHTML = '';
            (q.options || []).forEach((opt, idx) => {
                var div = document.createElement('div');
                div.className = 'exam-option-item';
                if (ans.selected === idx) div.classList.add('selected');
                if (ans.revealed) {
                    if (idx === q.correctIndex) div.classList.add('correct');
                    else if (ans.selected === idx) div.classList.add('incorrect');
                    div.style.pointerEvents = 'none';
                }
                div.innerHTML = '<span class="option-letter">' + String.fromCharCode(65 + idx) + '.</span>' +
                    '<span class="option-text">' + escHtml(opt) + '</span>';
                if (!ans.revealed) { div.onclick = () => this._selectOption(idx); }
                optCont.appendChild(div);
            });
        }

        var expEl = getEl('quiz-explanation-box');
        if (expEl) {
            if (ans.revealed) {
                expEl.style.display = '';
                expEl.innerHTML = '<div class="explanation-inner"><strong>💡 Explanation:</strong> ' + escHtml(q.explanation || '') + '</div>';
            } else {
                expEl.style.display = 'none';
                expEl.innerHTML = '';
            }
        }

        var revealBtn = getEl('quiz-btn-reveal');
        if (revealBtn) revealBtn.style.display = ans.revealed ? 'none' : '';

        var prevBtn = getEl('quiz-btn-prev');
        var nextBtn = getEl('quiz-btn-next');
        if (prevBtn) prevBtn.disabled = this.current === 0;
        if (nextBtn) nextBtn.disabled = this.current === total - 1;

        var fill = getEl('quiz-progress-fill');
        if (fill) fill.style.width = ((this.current + 1) / total * 100) + '%';

        this.renderPalette();
    }

    _selectOption(idx) {
        var ans = this.answers[this.current];
        if (ans.revealed) return;
        ans.selected = (ans.selected === idx) ? null : idx;
        this.renderQuestion();
    }

    revealAnswer() {
        this.answers[this.current].revealed = true;
        this.renderQuestion();
    }

    renderPalette() {
        var grid = getEl('quiz-palette-grid');
        if (!grid) return;
        grid.innerHTML = '';
        var answered = 0, correct = 0;
        this.questions.forEach((q, i) => {
            var a = this.answers[i];
            var btn = document.createElement('button');
            btn.className = 'palette-btn';
            btn.textContent = i + 1;
            if (a.revealed && a.selected === q.correctIndex) { btn.classList.add('correct'); correct++; }
            else if (a.revealed && a.selected !== null) btn.classList.add('incorrect');
            else if (a.selected !== null) { btn.classList.add('answered'); answered++; }
            if (i === this.current) btn.classList.add('active');
            btn.onclick = () => { this.current = i; this.renderQuestion(); };
            grid.appendChild(btn);
        });
        setText('quiz-count-answered', this.answers.filter(a => a.selected !== null).length);
        setText('quiz-count-correct', correct);
    }

    submitQuiz() {
        if (!confirm('Submit your quiz? All unrevealed answers will be marked.')) return;
        this.answers.forEach(a => { a.revealed = true; });

        var elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        var correct = 0, attempted = 0;
        this.answers.forEach((a, i) => {
            if (a.selected !== null) { attempted++; if (a.selected === this.questions[i].correctIndex) correct++; }
        });

        var total = this.questions.length;
        var pct = total > 0 ? Math.round(correct / total * 100) : 0;
        var grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';

        setText('quiz-res-pct', pct + '%');
        setText('quiz-res-fraction', correct + ' / ' + total + ' Correct');
        setText('quiz-res-grade', grade);
        setText('quiz-res-time', fmtTime(elapsed));
        setText('quiz-res-attempted', attempted);
        setText('quiz-res-unattempted', total - attempted);

        var rev = getEl('quiz-res-review');
        if (rev) {
            rev.innerHTML = '';
            this.questions.forEach((q, i) => {
                var a = this.answers[i];
                var isCorrect = a.selected === q.correctIndex;
                var div = document.createElement('div');
                div.className = 'review-item ' + (isCorrect ? 'review-correct' : (a.selected === null ? 'review-unattempted' : 'review-incorrect'));
                var yourAns = a.selected !== null ? q.options[a.selected] : 'Not Attempted';
                div.innerHTML =
                    '<div class="review-q-header">' +
                    '<span class="badge ' + (isCorrect ? 'badge-pass' : (a.selected === null ? '' : 'badge-fail')) + '">' +
                    (isCorrect ? '✓ Correct' : (a.selected === null ? '— Skipped' : '✗ Wrong')) + '</span>' +
                    '<span class="review-smell-code">' + escHtml(q.smellCode || '') + '</span>' +
                    '</div>' +
                    '<div class="review-q-text"><strong>Q' + (i + 1) + ':</strong> ' + escHtml(q.question) + '</div>' +
                    (q.code ? '<pre class="review-code-block">' + escHtml(q.code) + '</pre>' : '') +
                    '<div class="review-answers">' +
                    '<div class="your-ans ' + (isCorrect ? 'ans-correct' : 'ans-wrong') + '">Your Answer: ' + escHtml(yourAns) + '</div>' +
                    (isCorrect ? '' : '<div class="correct-ans">Correct: ' + escHtml(q.options[q.correctIndex]) + '</div>') +
                    '</div>' +
                    '<div class="review-explanation">💡 ' + escHtml(q.explanation || '') + '</div>';
                rev.appendChild(div);
            });
        }

        showEl('quiz-result-panel');
        hideEl('quiz-active-panel');
        hideEl('quiz-setup-panel');
    }

    resetQuiz() {
        showEl('quiz-setup-panel');
        hideEl('quiz-active-panel');
        hideEl('quiz-result-panel');
    }
}

/* ============================================================
   COMPETITIVE EXAM ENGINE
   ============================================================ */

class CompetitiveExamEngine {
    constructor() {
        this.questions = [];
        this.answers = [];
        this.flags = [];
        this.current = 0;
        this.timerSec = 0;
        this.timerInterval = null;
        this.startTime = 0;
        this.submitted = false;
        this.CORRECT_MARKS = 4;
        this.WRONG_PENALTY = -1;
        this._bind();
    }

    _bind() {
        var startBtn = getEl('comp-btn-start');
        if (startBtn) startBtn.onclick = () => this.startExam();

        var nextBtn = getEl('comp-btn-next');
        if (nextBtn) nextBtn.onclick = () => this.navigate(1);

        var prevBtn = getEl('comp-btn-prev');
        if (prevBtn) prevBtn.onclick = () => this.navigate(-1);

        var flagBtn = getEl('comp-btn-flag');
        if (flagBtn) flagBtn.onclick = () => this.toggleFlag();

        var clearBtn = getEl('comp-btn-clear');
        if (clearBtn) clearBtn.onclick = () => this.clearAnswer();

        var submitBtn = getEl('comp-btn-submit');
        if (submitBtn) submitBtn.onclick = () => this.confirmSubmit();

        var retakeBtn = getEl('comp-btn-retake');
        if (retakeBtn) retakeBtn.onclick = () => this.resetExam();

        var printBtn = getEl('comp-btn-certificate');
        if (printBtn) printBtn.onclick = () => this.printCertificate();
    }

    startExam() {
        var catSel = getEl('comp-select-category');
        var cntSel = getEl('comp-select-count');
        var timeSel = getEl('comp-select-time');

        var cat = catSel ? catSel.value : 'all';
        var count = cntSel ? parseInt(cntSel.value) : 20;
        var mins = timeSel ? parseInt(timeSel.value) : 30;

        var bank = (typeof EXAM_QUESTION_BANK !== 'undefined') ? EXAM_QUESTION_BANK : [];
        var pool = (cat !== 'all') ? bank.filter(q => q.category === cat) : bank;
        if (pool.length === 0) pool = bank;

        this.questions = shuffleArray(pool).slice(0, Math.min(count, pool.length));
        this.answers = this.questions.map(() => null);
        this.flags = this.questions.map(() => false);
        this.current = 0;
        this.submitted = false;
        this.timerSec = mins * 60;
        this.startTime = Date.now();

        showEl('comp-active-panel');
        hideEl('comp-setup-panel');
        hideEl('comp-result-panel');

        this.renderQuestion();
        this.startTimer();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timerSec--;
            var el = getEl('comp-timer-display');
            if (el) {
                el.textContent = '\u23F1 ' + fmtTime(this.timerSec);
                el.className = this.timerSec <= 60 ? 'exam-timer-badge timer-warning' : 'exam-timer-badge';
            }
            if (this.timerSec <= 0) {
                clearInterval(this.timerInterval);
                alert('Time is up! Auto-submitting your exam.');
                this.submitExam();
            }
        }, 1000);
    }

    navigate(dir) {
        var next = this.current + dir;
        if (next < 0 || next >= this.questions.length) return;
        this.current = next;
        this.renderQuestion();
    }

    renderQuestion() {
        var q = this.questions[this.current];
        var sel = this.answers[this.current];
        var total = this.questions.length;

        setText('comp-q-current-num', this.current + 1);
        setText('comp-q-total-num', total);
        setText('comp-q-category', q.categoryTitle || q.category || '');
        setText('comp-q-smell', q.smellCode || '');
        setText('comp-q-difficulty', q.difficulty || 'Medium');

        var diffEl = getEl('comp-q-difficulty');
        if (diffEl) diffEl.className = 'badge badge-diff-' + (q.difficulty || 'medium').toLowerCase();

        setText('comp-q-text', q.question || '');

        var codeWrap = getEl('comp-q-code-wrap');
        var codeEl = getEl('comp-q-code');
        if (q.code && codeWrap && codeEl) {
            codeWrap.style.display = '';
            codeEl.textContent = q.code;
        } else if (codeWrap) {
            codeWrap.style.display = 'none';
        }

        var optCont = getEl('comp-options-list');
        if (optCont) {
            optCont.innerHTML = '';
            (q.options || []).forEach((opt, idx) => {
                var div = document.createElement('div');
                div.className = 'exam-option-item' + (sel === idx ? ' selected' : '');
                div.innerHTML = '<span class="option-letter">' + String.fromCharCode(65 + idx) + '.</span>' +
                    '<span class="option-text">' + escHtml(opt) + '</span>';
                div.onclick = () => this._selectOption(idx);
                optCont.appendChild(div);
            });
        }

        var flagBtn = getEl('comp-btn-flag');
        if (flagBtn) {
            flagBtn.textContent = this.flags[this.current] ? '\uD83D\uDEA9 Unmark' : '\uD83C\uDFF3\uFE0F Mark Review';
            flagBtn.className = this.flags[this.current] ? 'btn btn-warning btn-sm' : 'btn btn-outline btn-sm';
        }

        var prevBtn = getEl('comp-btn-prev');
        var nextBtn = getEl('comp-btn-next');
        if (prevBtn) prevBtn.disabled = this.current === 0;
        if (nextBtn) nextBtn.disabled = this.current === total - 1;

        var fill = getEl('comp-progress-fill');
        if (fill) fill.style.width = ((this.current + 1) / total * 100) + '%';

        this.updateLiveScore();
        this.renderPalette();
    }

    _selectOption(idx) {
        this.answers[this.current] = (this.answers[this.current] === idx) ? null : idx;
        this.renderQuestion();
    }

    toggleFlag() {
        this.flags[this.current] = !this.flags[this.current];
        this.renderQuestion();
    }

    clearAnswer() {
        this.answers[this.current] = null;
        this.renderQuestion();
    }

    updateLiveScore() {
        var score = 0, attempted = 0;
        this.answers.forEach((a, i) => {
            if (a !== null) {
                attempted++;
                score += (a === this.questions[i].correctIndex) ? this.CORRECT_MARKS : this.WRONG_PENALTY;
            }
        });
        setText('comp-live-score', score);
        setText('comp-live-attempted', attempted);
    }

    renderPalette() {
        var grid = getEl('comp-palette-grid');
        if (!grid) return;
        grid.innerHTML = '';
        var answered = 0, flagged = 0, unanswered = 0;

        this.questions.forEach((q, i) => {
            var btn = document.createElement('button');
            btn.className = 'palette-btn';
            btn.textContent = i + 1;
            if (this.flags[i] && this.answers[i] !== null) { btn.classList.add('flagged-answered'); flagged++; answered++; }
            else if (this.flags[i]) { btn.classList.add('flagged'); flagged++; unanswered++; }
            else if (this.answers[i] !== null) { btn.classList.add('answered'); answered++; }
            else { unanswered++; }
            if (i === this.current) btn.classList.add('active');
            btn.onclick = () => { this.current = i; this.renderQuestion(); };
            grid.appendChild(btn);
        });

        setText('comp-palette-answered', answered);
        setText('comp-palette-flagged', flagged);
        setText('comp-palette-unanswered', unanswered);
    }

    confirmSubmit() {
        var answered = this.answers.filter(a => a !== null).length;
        var total = this.questions.length;
        var unattempted = total - answered;
        var msg = 'Submit Competitive Exam?\n\nAnswered: ' + answered + '\nUnattempted: ' + unattempted + '\n\nMarking Scheme: +4 Correct, -1 Wrong, 0 Unattempted\n\nThis action cannot be undone.';
        if (confirm(msg)) this.submitExam();
    }

    submitExam() {
        if (this.submitted) return;
        this.submitted = true;
        clearInterval(this.timerInterval);

        var elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        var total = this.questions.length;
        var maxScore = total * this.CORRECT_MARKS;
        var correct = 0, wrong = 0, unattempted = 0, score = 0;

        this.answers.forEach((a, i) => {
            if (a === null) { unattempted++; }
            else if (a === this.questions[i].correctIndex) { correct++; score += this.CORRECT_MARKS; }
            else { wrong++; score += this.WRONG_PENALTY; }
        });

        var pct = maxScore > 0 ? Math.round(score / maxScore * 100) : 0;
        var accuracy = (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : 0;

        var grade, gradeDesc, rankPct;
        if (pct >= 90)      { grade = 'A+'; gradeDesc = 'Outstanding'; rankPct = 99; }
        else if (pct >= 80) { grade = 'A';  gradeDesc = 'Excellent';   rankPct = 90; }
        else if (pct >= 70) { grade = 'B';  gradeDesc = 'Good';        rankPct = 75; }
        else if (pct >= 60) { grade = 'C';  gradeDesc = 'Average';     rankPct = 55; }
        else if (pct >= 40) { grade = 'D';  gradeDesc = 'Below Average'; rankPct = 30; }
        else                { grade = 'F';  gradeDesc = 'Needs Improvement'; rankPct = 10; }

        setText('comp-res-pct', pct + '%');
        setText('comp-res-score', score + ' / ' + maxScore);
        setText('comp-res-grade', grade);
        setText('comp-res-grade-desc', gradeDesc);
        setText('comp-res-time', fmtTime(elapsed));
        setText('comp-res-correct', correct);
        setText('comp-res-wrong', wrong);
        setText('comp-res-unattempted', unattempted);
        setText('comp-res-accuracy', accuracy + '%');
        setText('comp-res-rank-pct', 'Top ' + (100 - rankPct) + '% of test takers');

        var breakdown = getEl('comp-res-breakdown');
        if (breakdown) {
            var cats = {};
            this.questions.forEach((q, i) => {
                var cat = q.category || 'general';
                if (!cats[cat]) cats[cat] = { title: q.categoryTitle || cat, correct: 0, total: 0 };
                cats[cat].total++;
                if (this.answers[i] === q.correctIndex) cats[cat].correct++;
            });
            breakdown.innerHTML = '';
            Object.values(cats).forEach(c => {
                var catPct = c.total > 0 ? Math.round(c.correct / c.total * 100) : 0;
                var color = catPct >= 70 ? '#22c55e' : catPct >= 50 ? '#f59e0b' : '#ef4444';
                breakdown.innerHTML += '<div class="cat-bar-row">' +
                    '<div class="cat-bar-label">' + escHtml(c.title) + '</div>' +
                    '<div class="cat-bar-track"><div class="cat-bar-fill" style="width:' + catPct + '%;background:' + color + '"></div></div>' +
                    '<div class="cat-bar-pct">' + catPct + '%</div></div>';
            });
        }

        var rev = getEl('comp-res-review');
        if (rev) {
            rev.innerHTML = '';
            this.questions.forEach((q, i) => {
                var a = this.answers[i];
                var isCorrect = a === q.correctIndex;
                var isWrong = a !== null && !isCorrect;
                var div = document.createElement('div');
                div.className = 'review-item ' + (isCorrect ? 'review-correct' : isWrong ? 'review-incorrect' : 'review-unattempted');
                var marks = isCorrect ? '+4' : isWrong ? '-1' : '0';
                var yourAns = a !== null ? q.options[a] : 'Not Attempted';
                div.innerHTML =
                    '<div class="review-q-header">' +
                    '<span class="badge ' + (isCorrect ? 'badge-pass' : isWrong ? 'badge-fail' : '') + '">' +
                    (isCorrect ? '\u2713 Correct' : isWrong ? '\u2717 Wrong' : '\u2014 Skipped') + '</span>' +
                    '<span class="review-marks ' + (isCorrect ? 'marks-positive' : isWrong ? 'marks-negative' : 'marks-zero') + '">' + marks + ' marks</span>' +
                    '<span class="review-smell-code">' + escHtml(q.smellCode || '') + '</span>' +
                    '</div>' +
                    '<div class="review-q-text"><strong>Q' + (i + 1) + ':</strong> ' + escHtml(q.question) + '</div>' +
                    (q.code ? '<pre class="review-code-block">' + escHtml(q.code) + '</pre>' : '') +
                    '<div class="review-answers">' +
                    '<div class="your-ans ' + (isCorrect ? 'ans-correct' : isWrong ? 'ans-wrong' : '') + '">Your Answer: ' + escHtml(yourAns) + '</div>' +
                    (!isCorrect ? '<div class="correct-ans">Correct: ' + escHtml(q.options[q.correctIndex]) + '</div>' : '') +
                    '</div>' +
                    '<div class="review-explanation">\uD83D\uDCA1 ' + escHtml(q.explanation || '') + '</div>';
                rev.appendChild(div);
            });
        }

        showEl('comp-result-panel');
        hideEl('comp-active-panel');
        hideEl('comp-setup-panel');
    }

    printCertificate() {
        var grade = (getEl('comp-res-grade') || {}).textContent || '';
        var pct   = (getEl('comp-res-pct') || {}).textContent || '';
        var score = (getEl('comp-res-score') || {}).textContent || '';
        var time  = (getEl('comp-res-time') || {}).textContent || '';
        var date  = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        var win = window.open('', '_blank', 'width=860,height=640');
        if (!win) { alert('Please allow popups to print the certificate.'); return; }
        win.document.write(
            '<!DOCTYPE html><html><head><title>SchemaSense Certificate</title><style>' +
            'body{font-family:Georgia,serif;background:#f0f4f8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}' +
            '.cert{background:#fff;border:12px double #1e40af;border-radius:16px;padding:50px 60px;max-width:700px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,0.15)}' +
            '.seal{font-size:64px;margin-bottom:12px}' +
            '.h1{font-size:30px;font-weight:bold;color:#1e40af;letter-spacing:3px;text-transform:uppercase}' +
            '.sub{font-size:14px;color:#64748b;letter-spacing:1px;margin-bottom:24px}' +
            '.label{font-size:15px;color:#475569;margin:8px 0 4px}' +
            '.name{font-size:42px;font-weight:bold;color:#0f172a;border-bottom:3px solid #1e40af;padding-bottom:10px;margin:8px 0 20px}' +
            '.score{font-size:52px;font-weight:bold;color:#1e40af;margin:12px 0}' +
            '.grade{display:inline-block;font-size:24px;font-weight:bold;background:#1e40af;color:#fff;padding:8px 28px;border-radius:24px;margin:10px 0}' +
            '.meta{font-size:12px;color:#94a3b8;margin-top:20px}' +
            '@media print{body{background:#fff}.cert{box-shadow:none}}' +
            '</style></head><body><div class="cert">' +
            '<div class="seal">🏆</div>' +
            '<div class="h1">Certificate of Achievement</div>' +
            '<div class="sub">SchemaSense – Competitive Examination</div>' +
            '<div class="label">This certifies successful completion of the</div>' +
            '<div class="name">Database Schema Smell Detector</div>' +
            '<div class="label">Competitive Examination</div>' +
            '<div class="score">' + pct + '</div>' +
            '<div>Score: <strong>' + score + '</strong></div>' +
            '<div class="grade">Grade: ' + grade + '</div>' +
            '<div class="meta">Time Taken: ' + time + ' &nbsp;|&nbsp; Date: ' + date + '</div>' +
            '<div class="meta" style="margin-top:10px;font-size:10px">SchemaSense Academic Database Schema Smell Detector – B.Tech Database Systems</div>' +
            '</div></body></html>'
        );
        win.document.close();
        setTimeout(() => win.print(), 500);
    }

    resetExam() {
        clearInterval(this.timerInterval);
        this.submitted = false;
        showEl('comp-setup-panel');
        hideEl('comp-active-panel');
        hideEl('comp-result-panel');
    }
}

/* ============================================================
   LEGACY SHIM – keeps backward compat if anything still
   references SchemaSenseExamEngine
   ============================================================ */
if (typeof window !== 'undefined') {
    window.SchemaSenseExamEngine = QuizModeEngine;

    window.addEventListener('DOMContentLoaded', function() {
        window.quizEngine = new QuizModeEngine();
        window.compEngine = new CompetitiveExamEngine();
    });
}
