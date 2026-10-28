# Script to patch index.html with Quiz Mode + Competitive Exam views
import re

with open('templates/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Replace navigation ──────────────────────────────────────────────────────
old_nav = '''<nav class="main-nav">
                <a href="#" class="nav-link active" data-view="home">Home</a>
                <a href="#" class="nav-link" data-view="analyze">Analyze</a>
                <a href="#" class="nav-link" data-view="exam">\U0001f393 Exam Mode</a>
                <a href="#" class="nav-link" data-view="learn">Learn</a>
                <a href="#" class="nav-link" data-view="tests">Test Suite</a>
                <a href="#" class="nav-link" data-view="help">Help</a>
                <a href="#" class="nav-link" data-view="developed-by">Developed By</a>
            </nav>'''

new_nav = '''<nav class="main-nav">
                <a href="#" class="nav-link active" data-view="home">Home</a>
                <a href="#" class="nav-link" data-view="analyze">Analyze</a>
                <a href="#" class="nav-link nav-quiz" data-view="quiz">\U0001f4dd Quiz Mode</a>
                <a href="#" class="nav-link nav-competitive" data-view="competitive">\U0001f3c6 Competitive Exam</a>
                <a href="#" class="nav-link" data-view="learn">Learn</a>
                <a href="#" class="nav-link" data-view="tests">Test Suite</a>
                <a href="#" class="nav-link" data-view="help">Help</a>
                <a href="#" class="nav-link" data-view="developed-by">Developed By</a>
            </nav>'''

# Try without exact emoji matching - use regex
content = re.sub(
    r'<nav class="main-nav">.*?</nav>',
    new_nav,
    content,
    flags=re.DOTALL
)

# ── 2. Replace old EXAM MODE view with QUIZ MODE view ─────────────────────────
# Find and replace view-exam block
exam_start = content.find('<main id="view-exam"')
if exam_start == -1:
    print("ERROR: view-exam not found")
    exit(1)

# Find the closing </main> for view-exam
# Count depth
depth = 0
pos = exam_start
in_tag = False
tag_buf = ''
found_end = -1
i = exam_start
while i < len(content):
    if content[i] == '<':
        in_tag = True
        tag_buf = ''
    elif content[i] == '>':
        in_tag = False
        tag_buf = tag_buf.strip()
        if tag_buf.startswith('main'):
            depth += 1
        elif tag_buf.startswith('/main'):
            depth -= 1
            if depth == 0:
                found_end = i + 1
                break
    elif in_tag:
        tag_buf += content[i]
    i += 1

if found_end == -1:
    print("ERROR: closing </main> for view-exam not found")
    exit(1)

CATEGORY_OPTIONS = '''
                        <option value="all">All Categories (65 Questions)</option>
                        <option value="relational">Relational Integrity Smells (REL-001 to REL-013)</option>
                        <option value="normalization">Normalization Smells (NORM-014 to NORM-019)</option>
                        <option value="anomalies">Database Anomalies (ANOM-020 to ANOM-022)</option>
                        <option value="indexing">Physical Indexing Smells (IDX-023 to IDX-027)</option>
                        <option value="distributed">Distributed &amp; NoSQL Smells (DIST-028 to DIST-033)</option>
                        <option value="diagnosis">Schema Smell Diagnosis from DDL</option>'''

QUIZ_VIEW = '''    <!-- ==========================================================================
         QUIZ MODE VIEW
         ========================================================================== -->
    <main id="view-quiz" class="page-view">
        <div style="max-width: 1040px; margin: 0 auto;">

            <!-- QUIZ SETUP PANEL -->
            <div id="quiz-setup-panel" class="chart-card" style="padding: 32px; margin-bottom: 24px;">
                <div style="text-align: center; max-width: 680px; margin: 0 auto 28px;">
                    <div class="hero-badge">Self-Paced Practice Mode</div>
                    <h2 style="font-size: 28px; font-weight: 800; margin: 8px 0;">\U0001f4dd Quiz Mode</h2>
                    <p class="text-muted" style="font-size: 14px;">
                        Practice all 33 schema smells at your own pace. Click <strong>Reveal Answer</strong> anytime for instant explanations.
                        No time limit. No negative marking. Learn by doing.
                    </p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 28px;">
                    <div>
                        <label style="font-size: 13px; font-weight: bold; margin-bottom: 6px; display: block;">Topic / Category:</label>
                        <select id="quiz-select-category" class="form-select" style="width: 100%;">''' + CATEGORY_OPTIONS + '''
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: bold; margin-bottom: 6px; display: block;">Number of Questions:</label>
                        <select id="quiz-select-count" class="form-select" style="width: 100%;">
                            <option value="5">5 Questions (Quick Practice)</option>
                            <option value="10" selected>10 Questions (Standard)</option>
                            <option value="20">20 Questions (Deep Dive)</option>
                            <option value="65">All 65 Questions (Master Level)</option>
                        </select>
                    </div>
                </div>
                <div style="text-align: center;">
                    <button class="btn btn-primary" id="quiz-btn-start" style="font-size: 16px; padding: 12px 40px;">
                        \U0001f680 Start Quiz
                    </button>
                </div>
                <!-- Info cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 28px;">
                    <div class="quiz-info-card"><div class="quiz-info-icon">\u2705</div><div>Instant Feedback</div></div>
                    <div class="quiz-info-card"><div class="quiz-info-icon">\U0001f4a1</div><div>Full Explanations</div></div>
                    <div class="quiz-info-card"><div class="quiz-info-icon">\u23e9</div><div>No Time Limit</div></div>
                    <div class="quiz-info-card"><div class="quiz-info-icon">\U0001f9e0</div><div>65 Smell-Based Qs</div></div>
                </div>
            </div>

            <!-- QUIZ ACTIVE PANEL -->
            <div id="quiz-active-panel" style="display: none;">
                <div class="exam-status-bar">
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span class="badge badge-syllabus" id="quiz-q-category" style="font-size: 13px; padding: 6px 12px;">Category</span>
                        <span style="font-size: 13.5px; font-weight: 600; color: var(--text-secondary);" id="quiz-q-num">Question 1 / 10</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span id="quiz-q-smell-code" class="badge" style="background: var(--bg-subtle); color: var(--color-primary); font-size: 12px;"></span>
                        <span id="quiz-q-difficulty" class="badge badge-diff-medium">Medium</span>
                        <button class="btn btn-primary btn-sm" id="quiz-btn-submit">Submit Quiz</button>
                    </div>
                </div>

                <div class="exam-progress-bar"><div id="quiz-progress-fill" class="exam-progress-fill" style="width: 0%;"></div></div>

                <div class="exam-split-layout">
                    <!-- Question Pane -->
                    <div class="exam-question-pane">
                        <div id="quiz-q-text" class="exam-q-title"></div>

                        <div id="quiz-q-code-wrap" style="display: none; margin-bottom: 16px;">
                            <pre class="exam-code-box"><code id="quiz-q-code"></code></pre>
                        </div>

                        <div id="quiz-options-list" class="exam-options-container"></div>

                        <div id="quiz-explanation-box" style="display: none;"></div>

                        <div class="exam-actions-row" style="margin-top: 16px;">
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-outline btn-sm" id="quiz-btn-reveal">\U0001f4a1 Reveal Answer</button>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-secondary btn-sm" id="quiz-btn-prev">\u2190 Previous</button>
                                <button class="btn btn-primary btn-sm" id="quiz-btn-next">Next \u2192</button>
                            </div>
                        </div>
                    </div>

                    <!-- Palette Pane -->
                    <div class="exam-palette-pane">
                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Question Palette</div>
                        <div class="palette-legend">
                            <span class="legend-item"><span class="legend-dot answered"></span> Answered (<span id="quiz-count-answered">0</span>)</span>
                            <span class="legend-item"><span class="legend-dot correct"></span> Correct (<span id="quiz-count-correct">0</span>)</span>
                        </div>
                        <div id="quiz-palette-grid" class="palette-grid"></div>
                    </div>
                </div>
            </div>

            <!-- QUIZ RESULT PANEL -->
            <div id="quiz-result-panel" style="display: none;">
                <div class="scorecard-header-card">
                    <div class="score-circle-wrapper">
                        <div id="quiz-res-pct" class="score-circle-pct">0%</div>
                        <div id="quiz-res-fraction" class="score-circle-sub">0 / 0 Correct</div>
                    </div>
                    <div class="scorecard-summary-info">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Quiz Grade:</span>
                            <span id="quiz-res-grade" class="badge" style="font-size: 18px; font-weight: 800; padding: 4px 14px; background: var(--color-primary); color: #fff;">A</span>
                        </div>
                        <div style="display: flex; gap: 20px; flex-wrap: wrap; font-size: 13.5px; color: var(--text-secondary);">
                            <span>Time: <strong id="quiz-res-time">0:00</strong></span>
                            <span>Attempted: <strong id="quiz-res-attempted">0</strong></span>
                            <span>Skipped: <strong id="quiz-res-unattempted">0</strong></span>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" id="quiz-btn-restart">\U0001f504 New Quiz</button>
                    </div>
                </div>
                <div class="chart-card" style="margin-top: 20px;">
                    <h4 style="font-size: 17px; margin-bottom: 16px;">Question Review &amp; Explanations</h4>
                    <div id="quiz-res-review"></div>
                </div>
            </div>

        </div>
    </main>

    <!-- ==========================================================================
         COMPETITIVE EXAM VIEW
         ========================================================================== -->
    <main id="view-competitive" class="page-view">
        <div style="max-width: 1040px; margin: 0 auto;">

            <!-- COMPETITIVE SETUP PANEL -->
            <div id="comp-setup-panel" class="chart-card" style="padding: 32px; margin-bottom: 24px;">
                <div style="text-align: center; max-width: 680px; margin: 0 auto 28px;">
                    <div class="hero-badge hero-badge-competitive">Official Competitive Examination</div>
                    <h2 style="font-size: 28px; font-weight: 800; margin: 8px 0;">\U0001f3c6 Competitive Exam</h2>
                    <p class="text-muted" style="font-size: 14px;">
                        Timed, scored examination simulating a real competitive test.
                        <strong>Marking scheme: +4 correct, &minus;1 wrong, 0 unattempted.</strong>
                        Certificate awarded on completion.
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 24px;">
                    <div>
                        <label style="font-size: 13px; font-weight: bold; margin-bottom: 6px; display: block;">Topic / Category:</label>
                        <select id="comp-select-category" class="form-select" style="width: 100%;">''' + CATEGORY_OPTIONS + '''
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: bold; margin-bottom: 6px; display: block;">Number of Questions:</label>
                        <select id="comp-select-count" class="form-select" style="width: 100%;">
                            <option value="10">10 Questions (Short Exam)</option>
                            <option value="20" selected>20 Questions (Standard)</option>
                            <option value="35">35 Questions (Advanced)</option>
                            <option value="65">65 Questions (Full Exam)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: bold; margin-bottom: 6px; display: block;">Time Limit:</label>
                        <select id="comp-select-time" class="form-select" style="width: 100%;">
                            <option value="15">15 Minutes</option>
                            <option value="30" selected>30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">60 Minutes</option>
                            <option value="90">90 Minutes</option>
                        </select>
                    </div>
                </div>

                <!-- Marking scheme info box -->
                <div class="comp-marking-box">
                    <div class="comp-marking-item positive"><span class="marking-sign">+4</span><span>Correct Answer</span></div>
                    <div class="comp-marking-item negative"><span class="marking-sign">&minus;1</span><span>Wrong Answer</span></div>
                    <div class="comp-marking-item neutral"><span class="marking-sign">0</span><span>Unattempted</span></div>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <button class="btn btn-competitive" id="comp-btn-start" style="font-size: 16px; padding: 12px 40px;">
                        \U0001f3c6 Start Competitive Exam
                    </button>
                </div>
            </div>

            <!-- COMPETITIVE ACTIVE PANEL -->
            <div id="comp-active-panel" style="display: none;">
                <div class="exam-status-bar comp-status-bar">
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span class="badge badge-competitive" id="comp-q-category" style="font-size: 13px; padding: 6px 12px;">Category</span>
                        <span style="font-size: 13.5px; font-weight: 600; color: var(--text-secondary);">
                            Question <span id="comp-q-current-num">1</span> of <span id="comp-q-total-num">20</span>
                        </span>
                        <span id="comp-q-smell" class="badge" style="background: var(--bg-subtle); color: var(--color-primary); font-size: 12px;"></span>
                        <span id="comp-q-difficulty" class="badge badge-diff-medium">Medium</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="comp-live-score-box">
                            Score: <span id="comp-live-score" style="font-weight: 800;">0</span>
                            &nbsp;|&nbsp; Attempted: <span id="comp-live-attempted">0</span>
                        </div>
                        <div id="comp-timer-display" class="exam-timer-badge">\u23f1 30:00</div>
                        <button class="btn btn-competitive btn-sm" id="comp-btn-submit">Submit Exam</button>
                    </div>
                </div>

                <div class="exam-progress-bar"><div id="comp-progress-fill" class="exam-progress-fill comp-progress-fill" style="width: 0%;"></div></div>

                <div class="exam-split-layout">
                    <!-- Question Pane -->
                    <div class="exam-question-pane">
                        <div id="comp-q-text" class="exam-q-title"></div>

                        <div id="comp-q-code-wrap" style="display: none; margin-bottom: 16px;">
                            <pre class="exam-code-box"><code id="comp-q-code"></code></pre>
                        </div>

                        <div id="comp-options-list" class="exam-options-container"></div>

                        <div class="exam-actions-row" style="margin-top: 16px;">
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-outline btn-sm" id="comp-btn-flag">\U0001f3f3\ufe0f Mark Review</button>
                                <button class="btn btn-outline btn-sm" id="comp-btn-clear">Clear Choice</button>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-secondary btn-sm" id="comp-btn-prev">\u2190 Previous</button>
                                <button class="btn btn-primary btn-sm" id="comp-btn-next">Next \u2192</button>
                            </div>
                        </div>
                    </div>

                    <!-- Palette Pane -->
                    <div class="exam-palette-pane">
                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Question Palette</div>
                        <div class="palette-legend">
                            <span class="legend-item"><span class="legend-dot answered"></span> Answered (<span id="comp-palette-answered">0</span>)</span>
                            <span class="legend-item"><span class="legend-dot flagged"></span> Review (<span id="comp-palette-flagged">0</span>)</span>
                            <span class="legend-item"><span class="legend-dot unanswered"></span> Pending (<span id="comp-palette-unanswered">0</span>)</span>
                        </div>
                        <div id="comp-palette-grid" class="palette-grid"></div>
                        <div class="comp-marking-legend">
                            <div class="marking-rule positive">+4 Correct</div>
                            <div class="marking-rule negative">&minus;1 Wrong</div>
                            <div class="marking-rule neutral">0 Skipped</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- COMPETITIVE RESULT PANEL -->
            <div id="comp-result-panel" style="display: none;">
                <div class="scorecard-header-card comp-scorecard">
                    <div class="score-circle-wrapper">
                        <div id="comp-res-pct" class="score-circle-pct">0%</div>
                        <div id="comp-res-score" class="score-circle-sub">0 / 80</div>
                    </div>
                    <div class="scorecard-summary-info">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                            <span style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Performance Grade:</span>
                            <span id="comp-res-grade" class="badge" style="font-size: 18px; font-weight: 800; padding: 4px 14px; background: #1e40af; color: #fff;">A</span>
                        </div>
                        <h3 id="comp-res-grade-desc" style="font-size: 20px; font-weight: 800; margin-bottom: 6px;">Excellent</h3>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 13.5px; color: var(--text-secondary);">
                            <span>\u2705 <strong id="comp-res-correct">0</strong> Correct</span>
                            <span>\u274c <strong id="comp-res-wrong">0</strong> Wrong</span>
                            <span>\u2014 <strong id="comp-res-unattempted">0</strong> Skipped</span>
                            <span>Accuracy: <strong id="comp-res-accuracy">0%</strong></span>
                        </div>
                        <div style="font-size: 13px; margin-top: 8px; color: var(--text-muted);">
                            Time: <strong id="comp-res-time">0:00</strong> &nbsp;|&nbsp;
                            <span id="comp-res-rank-pct">Top 50%</span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn btn-competitive btn-sm" id="comp-btn-certificate">\U0001f3c6 Print Certificate</button>
                        <button class="btn btn-primary btn-sm" id="comp-btn-retake">\U0001f504 New Exam</button>
                    </div>
                </div>

                <!-- Category Breakdown -->
                <div class="chart-card" style="margin-top: 20px;">
                    <h4 style="font-size: 16px; margin-bottom: 14px;">Category-wise Performance</h4>
                    <div id="comp-res-breakdown"></div>
                </div>

                <!-- Solution Review -->
                <div class="chart-card" style="margin-top: 16px;">
                    <h4 style="font-size: 17px; margin-bottom: 16px;">Detailed Solution Review</h4>
                    <div id="comp-res-review"></div>
                </div>
            </div>

        </div>
    </main>
'''

# Replace the old exam view block
content = content[:exam_start] + QUIZ_VIEW + content[found_end:]

print(f"view-exam replaced with view-quiz + view-competitive. New length: {len(content)}")

# ── 3. Update script tags  ────────────────────────────────────────────────────
# Replace old SchemaSenseExamEngine script reference if using old examEngine
# (already uses examEngine.js – no change needed)

with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("templates/index.html written successfully.")
