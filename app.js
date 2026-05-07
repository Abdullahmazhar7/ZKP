// app.js — Interactive ZKP Demo Logic

// ============================================================
// NAVIGATION — active link tracking
// ============================================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
});

// ============================================================
// DEMO: Ali Baba's Cave
// ============================================================
let caveState = { round: 0, success: 0, running: false, cheating: false };

function toggleCaveCheat() {
    caveState.cheating = document.getElementById('cave-cheat').checked;
    resetCave();
}

function resetCave() {
    caveState = { ...caveState, round: 0, success: 0, running: false };
    document.getElementById('cave-round').textContent = '0';
    document.getElementById('cave-success').textContent = '0';
    document.getElementById('cave-confidence').textContent = '0%';
    document.getElementById('cave-log').innerHTML = '<div class="log-entry">Click "Start Protocol" to begin...</div>';
    document.getElementById('cave-start-btn').disabled = false;
}

async function startCaveProtocol() {
    if (caveState.running) return;
    caveState.running = true;
    document.getElementById('cave-start-btn').disabled = true;

    const log = document.getElementById('cave-log');

    for (let i = 0; i < 10; i++) {
        caveState.round++;
        const peggyPath = Math.random() < 0.5 ? 'Left' : 'Right';
        const victorRequest = Math.random() < 0.5 ? 'Left' : 'Right';

        log.innerHTML += `<div class="log-entry">── Round ${caveState.round} ──</div>`;
        log.innerHTML += `<div class="log-entry">Peggy enters the ${peggyPath} path</div>`;
        await sleep(400);

        log.innerHTML += `<div class="log-entry">Victor shouts: "Come out from ${victorRequest}!"</div>`;
        await sleep(400);

        let success;
        if (caveState.cheating) {
            // Cheater: can only come out from the path she entered
            success = (peggyPath === victorRequest);
        } else {
            // Knows the secret: can always use the door
            success = true;
        }

        if (success) {
            caveState.success++;
            log.innerHTML += `<div class="log-entry success">✓ Peggy comes out from ${victorRequest} — correct!</div>`;
        } else {
            log.innerHTML += `<div class="log-entry fail">✗ Peggy comes out from ${peggyPath} — WRONG! Caught cheating!</div>`;
            updateCaveStats();
            caveState.running = false;
            document.getElementById('cave-start-btn').disabled = false;
            log.scrollTop = log.scrollHeight;
            return;
        }

        updateCaveStats();
        log.scrollTop = log.scrollHeight;
        await sleep(300);
    }

    const conf = (1 - Math.pow(0.5, caveState.round)) * 100;
    if (conf > 99) {
        log.innerHTML += `<div class="log-entry success">🎉 Victor is convinced! Confidence: ${conf.toFixed(4)}%</div>`;
    }
    log.scrollTop = log.scrollHeight;
    caveState.running = false;
    document.getElementById('cave-start-btn').disabled = false;
}

function updateCaveStats() {
    document.getElementById('cave-round').textContent = caveState.round;
    document.getElementById('cave-success').textContent = caveState.success;
    const conf = caveState.round > 0 ? (1 - Math.pow(0.5, caveState.success)) * 100 : 0;
    document.getElementById('cave-confidence').textContent = conf.toFixed(1) + '%';
}

// ============================================================
// DEMO: Color Blind Verifier
// ============================================================
let colorState = { rounds: 0, correct: 0, swapped: false, waiting: false, originalOrder: true };

function newColorRound() {
    const ballLeft = document.getElementById('ball-left');
    const ballRight = document.getElementById('ball-right');

    // Hide balls
    ballLeft.classList.add('hidden-ball');
    ballRight.classList.add('hidden-ball');
    ballLeft.querySelector('.ball-label').textContent = '?';
    ballRight.querySelector('.ball-label').textContent = '?';

    document.getElementById('color-status').innerHTML = '<p>🫣 Verifier hides the balls... did they swap?</p>';
    document.getElementById('color-answers').style.display = 'none';
    document.getElementById('color-new-round-btn').disabled = true;

    setTimeout(() => {
        // Randomly swap
        colorState.swapped = Math.random() < 0.5;
        if (colorState.swapped) {
            colorState.originalOrder = !colorState.originalOrder;
        }

        // Reveal with new arrangement
        ballLeft.classList.remove('hidden-ball');
        ballRight.classList.remove('hidden-ball');

        if (colorState.originalOrder) {
            ballLeft.style.background = 'var(--accent-pink)';
            ballRight.style.background = 'var(--accent-green)';
        } else {
            ballLeft.style.background = 'var(--accent-green)';
            ballRight.style.background = 'var(--accent-pink)';
        }
        ballLeft.querySelector('.ball-label').textContent = 'Ball A';
        ballRight.querySelector('.ball-label').textContent = 'Ball B';

        document.getElementById('color-status').innerHTML = '<p>👀 Were the balls swapped?</p>';
        document.getElementById('color-answers').style.display = 'flex';
    }, 1200);
}

function answerColor(guessedSwap) {
    colorState.rounds++;
    const isCorrect = guessedSwap === colorState.swapped;

    if (isCorrect) {
        colorState.correct++;
        document.getElementById('color-status').innerHTML = '<p style="color:var(--accent-green)">✅ Correct! You can tell the colors apart.</p>';
    } else {
        document.getElementById('color-status').innerHTML = '<p style="color:var(--accent-red)">❌ Wrong! Maybe you can\'t distinguish them?</p>';
    }

    document.getElementById('color-answers').style.display = 'none';
    document.getElementById('color-new-round-btn').disabled = false;
    document.getElementById('color-rounds').textContent = colorState.rounds;
    document.getElementById('color-correct').textContent = colorState.correct;

    const conf = colorState.rounds > 0 ? (1 - Math.pow(0.5, colorState.correct)) * 100 : 0;
    document.getElementById('color-confidence').textContent = conf.toFixed(1) + '%';
}

function resetColorDemo() {
    colorState = { rounds: 0, correct: 0, swapped: false, waiting: false, originalOrder: true };
    document.getElementById('color-rounds').textContent = '0';
    document.getElementById('color-correct').textContent = '0';
    document.getElementById('color-confidence').textContent = '0%';
    document.getElementById('color-answers').style.display = 'none';
    document.getElementById('color-new-round-btn').disabled = false;

    const ballLeft = document.getElementById('ball-left');
    const ballRight = document.getElementById('ball-right');
    ballLeft.classList.remove('hidden-ball');
    ballRight.classList.remove('hidden-ball');
    ballLeft.style.background = 'var(--accent-pink)';
    ballRight.style.background = 'var(--accent-green)';
    ballLeft.querySelector('.ball-label').textContent = 'Ball A';
    ballRight.querySelector('.ball-label').textContent = 'Ball B';
    document.getElementById('color-status').innerHTML = '<p>Press "New Round" to start.</p>';
}

// ============================================================
// DEMO: Hash Commitment
// ============================================================
let hashState = { secret: '', hash: '' };

async function computeHash() {
    const input = document.getElementById('secret-input').value.trim();
    if (!input) return alert('Please enter a secret!');

    hashState.secret = input;
    hashState.hash = await sha256(input);

    document.getElementById('hash-output').textContent = hashState.hash;
    document.getElementById('hash-mini').textContent = hashState.hash.substring(0, 12) + '...';
    document.getElementById('expected-hash').textContent = hashState.hash;

    document.getElementById('hash-step-1').classList.add('hidden');
    document.getElementById('hash-step-2').classList.remove('hidden');
}

function startVerification() {
    document.getElementById('hash-step-2').classList.add('hidden');
    document.getElementById('hash-step-3').classList.remove('hidden');
}

async function verifyHash() {
    const guess = document.getElementById('verify-input').value.trim();
    if (!guess) return;

    const guessHash = await sha256(guess);
    const resultEl = document.getElementById('verify-result');
    resultEl.classList.remove('hidden', 'success', 'fail');

    if (guessHash === hashState.hash) {
        resultEl.className = 'verify-result success';
        resultEl.innerHTML = '✅ <strong>VERIFIED!</strong> The hash matches. You proved knowledge of the secret without revealing it beforehand.';
    } else {
        resultEl.className = 'verify-result fail';
        resultEl.innerHTML = '❌ <strong>FAILED!</strong> Hash does not match. The provided value is not the committed secret.<br><small>Your hash: ' + guessHash.substring(0, 20) + '...</small>';
    }
}

function resetHashDemo() {
    hashState = { secret: '', hash: '' };
    document.getElementById('hash-step-1').classList.remove('hidden');
    document.getElementById('hash-step-2').classList.add('hidden');
    document.getElementById('hash-step-3').classList.add('hidden');
    document.getElementById('verify-result').classList.add('hidden');
    document.getElementById('secret-input').value = '';
    document.getElementById('verify-input').value = '';
}

// ============================================================
// DEMO: Schnorr Protocol
// ============================================================
const SCHNORR_P = 23;
const SCHNORR_G = 5;
let schnorrState = { x: 0, y: 0, setup: false };

function schnorrSetup() {
    const x = parseInt(document.getElementById('schnorr-secret').value);
    if (isNaN(x) || x < 1 || x > 21) return alert('Enter a number between 1 and 21');

    schnorrState.x = x;
    schnorrState.y = modPow(SCHNORR_G, x, SCHNORR_P);
    schnorrState.setup = true;

    document.getElementById('schnorr-y').textContent = schnorrState.y;
    document.getElementById('schnorr-protocol').classList.remove('hidden');

    // Reset timeline
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));
}

async function runSchnorrRound() {
    if (!schnorrState.setup) return;

    const p = SCHNORR_P;
    const g = SCHNORR_G;
    const x = schnorrState.x;
    const y = schnorrState.y;

    // Reset timeline
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));

    // Step 1: Commitment
    const r = randomInt(1, p - 2);
    const t = modPow(g, r, p);

    document.getElementById('schnorr-step-1').classList.add('active');
    document.getElementById('schnorr-r').textContent = r;
    document.getElementById('schnorr-t').textContent = t;
    await sleep(600);

    // Step 2: Challenge
    const c = randomInt(1, p - 2);
    document.getElementById('schnorr-step-2').classList.add('active');
    document.getElementById('schnorr-c').textContent = c;
    await sleep(600);

    // Step 3: Response
    const s = mod(r + c * x, p - 1);
    document.getElementById('schnorr-step-3').classList.add('active');
    document.getElementById('schnorr-s').textContent = s;
    await sleep(600);

    // Step 4: Verification
    const lhs = modPow(g, s, p);
    const rhs = (t * modPow(y, c, p)) % p;

    document.getElementById('schnorr-step-4').classList.add('active');
    document.getElementById('schnorr-lhs').textContent = lhs;
    document.getElementById('schnorr-rhs').textContent = rhs;

    const badge = document.getElementById('schnorr-verify-badge');
    if (lhs === rhs) {
        badge.textContent = '✅ VERIFIED — g^s ≡ t·y^c (mod p)';
        badge.className = 'verify-badge pass';
    } else {
        badge.textContent = '❌ FAILED';
        badge.className = 'verify-badge fail';
    }

    // Log
    const log = document.getElementById('schnorr-log');
    log.innerHTML = `r=${r}, t=g^${r}mod${p}=${t} | c=${c} | s=(${r}+${c}×${x})mod${p - 1}=${s} | g^${s}mod${p}=${lhs} vs ${t}×${y}^${c}mod${p}=${rhs} → ${lhs === rhs ? 'PASS' : 'FAIL'}`;
}

function resetSchnorr() {
    schnorrState = { x: 0, y: 0, setup: false };
    document.getElementById('schnorr-y').textContent = '?';
    document.getElementById('schnorr-protocol').classList.add('hidden');
    document.getElementById('schnorr-secret').value = '';
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));
    document.getElementById('schnorr-log').innerHTML = '';
}

// ============================================================
// PLAYGROUND: Mod Calculator
// ============================================================
function calcMod() {
    const a = parseInt(document.getElementById('mod-a').value);
    const n = parseInt(document.getElementById('mod-n').value);
    if (isNaN(a) || isNaN(n) || n <= 0) return;

    const result = mod(a, n);
    document.getElementById('mod-result').textContent = result;

    // Visual
    const visual = document.getElementById('mod-visual');
    visual.innerHTML = '';
    const showCount = Math.min(Math.abs(a) + 1, 60);
    for (let i = 0; i < showCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'mod-dot';
        dot.textContent = i;
        if (i % n === 0 && i > 0) dot.classList.add('highlight');
        if (i === Math.abs(a)) dot.classList.add('result');
        dot.style.animationDelay = (i * 20) + 'ms';
        visual.appendChild(dot);
    }
}

// ============================================================
// PLAYGROUND: Power Mod
// ============================================================
function calcPowerMod() {
    const g = parseInt(document.getElementById('pow-g').value);
    const x = parseInt(document.getElementById('pow-x').value);
    const p = parseInt(document.getElementById('pow-p').value);
    if (isNaN(g) || isNaN(x) || isNaN(p) || p <= 0) return;

    document.getElementById('pow-result').textContent = modPow(g, x, p);
}

// ============================================================
// PLAYGROUND: Generator Explorer
// ============================================================
function exploreGenerator() {
    const g = parseInt(document.getElementById('gen-g').value);
    const p = parseInt(document.getElementById('gen-p').value);
    if (isNaN(g) || isNaN(p) || p < 2) return;

    const output = document.getElementById('generator-output');
    output.innerHTML = '';
    const seen = new Set();

    for (let i = 1; i < p; i++) {
        const val = modPow(g, i, p);
        if (seen.has(val)) break;
        seen.add(val);

        const item = document.createElement('div');
        item.className = 'gen-item';
        item.innerHTML = `<strong>${g}^${i}</strong> = ${val}`;
        item.style.animationDelay = (i * 50) + 'ms';
        output.appendChild(item);
    }

    const note = document.createElement('div');
    note.className = 'gen-item';
    note.style.background = seen.size === p - 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
    note.innerHTML = seen.size === p - 1
        ? `✅ <strong>${g}</strong> is a generator! It produces all ${p - 1} elements.`
        : `⚠️ <strong>${g}</strong> only produces ${seen.size} of ${p - 1} elements — not a generator.`;
    output.appendChild(note);
}

// ============================================================
// PLAYGROUND: Discrete Log Challenge
// ============================================================
let dlogState = { g: 0, p: 0, x: 0, y: 0 };

function newDlogChallenge() {
    const primes = [23, 29, 31, 37, 41, 43, 47];
    const p = primes[randomInt(0, primes.length - 1)];
    const g = randomInt(2, 5);
    const x = randomInt(2, p - 2);
    const y = modPow(g, x, p);

    dlogState = { g, p, x, y };

    document.getElementById('dlog-g').textContent = g;
    document.getElementById('dlog-p').textContent = p;
    document.getElementById('dlog-y').textContent = y;
    document.getElementById('dlog-params').classList.remove('hidden');
    document.getElementById('dlog-result').classList.add('hidden');
    document.getElementById('dlog-hint').classList.add('hidden');
    document.getElementById('dlog-guess').value = '';
}

function checkDlog() {
    const guess = parseInt(document.getElementById('dlog-guess').value);
    if (isNaN(guess)) return;

    const computed = modPow(dlogState.g, guess, dlogState.p);
    const resultEl = document.getElementById('dlog-result');
    resultEl.classList.remove('hidden');

    if (computed === dlogState.y) {
        resultEl.className = 'dlog-result correct';
        resultEl.innerHTML = `✅ Correct! ${dlogState.g}^${guess} mod ${dlogState.p} = ${dlogState.y}`;
    } else {
        resultEl.className = 'dlog-result wrong';
        resultEl.innerHTML = `❌ Wrong — ${dlogState.g}^${guess} mod ${dlogState.p} = ${computed}, not ${dlogState.y}. Try again!`;
    }
}

function showDlogHint() {
    const hint = document.getElementById('dlog-hint');
    hint.classList.remove('hidden');

    let table = `Try computing ${dlogState.g}^i mod ${dlogState.p} for i = 1, 2, 3...:<br>`;
    for (let i = 1; i <= Math.min(dlogState.p - 1, 10); i++) {
        const val = modPow(dlogState.g, i, dlogState.p);
        table += `${dlogState.g}^${i} = ${val}${val === dlogState.y ? ' ← HERE!' : ''} | `;
    }
    if (dlogState.p - 1 > 10) table += '...';
    hint.innerHTML = table;
}

// ============================================================
// UTILITY
// ============================================================
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
