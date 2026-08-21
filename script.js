const $ = (id) => document.getElementById(id);
const tabs = document.querySelectorAll('.game-tab');
const panels = document.querySelectorAll('.game-panel');
const messageBox = $('messageBox');

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.remove('hidden');
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => messageBox.classList.add('hidden'), 2200);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    $('game-' + tab.dataset.game).classList.add('active');
  });
});
const puzzle = $('puzzle');
let puzzleTiles = [1,2,3,4,5,6,7,8,null];
let puzzleSeconds = 0, puzzleMoves = 0, puzzleTimer = null;

function startPuzzleTimer() {
  clearInterval(puzzleTimer);
  puzzleSeconds = 0;
  $('puzzleTimer').textContent = `⏱ Time: 0s`;
  puzzleTimer = setInterval(() => {
    puzzleSeconds++;
    $('puzzleTimer').textContent = `⏱ Time: ${puzzleSeconds}s`;
  }, 1000);
}

function createPuzzle() {
  puzzle.innerHTML = '';
  puzzleTiles.forEach((tile, index) => {
    const div = document.createElement('div');
    div.className = 'tile' + (tile === null ? ' empty' : '');
    if (tile !== null) {
      div.textContent = tile;
      div.addEventListener('click', () => movePuzzleTile(index));
    }
    puzzle.appendChild(div);
  });
  $('puzzleMoves').textContent = `Moves: ${puzzleMoves}`;
}

function movePuzzleTile(index) {
  const empty = puzzleTiles.indexOf(null);
  const valid = [
    empty - 1 === index && empty % 3 !== 0,
    empty + 1 === index && index % 3 !== 0,
    empty - 3 === index,
    empty + 3 === index
  ].includes(true);
  if (!valid) return;
  [puzzleTiles[index], puzzleTiles[empty]] = [puzzleTiles[empty], puzzleTiles[index]];
  puzzleMoves++;
  createPuzzle();
  if (puzzleTiles.slice(0, 8).every((t, i) => t === i + 1)) {
    clearInterval(puzzleTimer);
    showMessage(`🎉 Solved in ${puzzleSeconds}s and ${puzzleMoves} moves!`);
  }
}

function shufflePuzzle() {
  puzzleTiles = [1,2,3,4,5,6,7,8,null];
  let empty = 8, previous = -1;
  for (let n = 0; n < 120; n++) {
    const neighbors = [empty - 1, empty + 1, empty - 3, empty + 3]
      .filter(i => i >= 0 && i < 9)
      .filter(i => !(empty % 3 === 0 && i === empty - 1))
      .filter(i => !(empty % 3 === 2 && i === empty + 1))
      .filter(i => i !== previous);
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    [puzzleTiles[next], puzzleTiles[empty]] = [puzzleTiles[empty], puzzleTiles[next]];
    previous = empty;
    empty = next;
  }
  if (puzzleTiles.slice(0, 8).every((t, i) => t === i + 1)) return shufflePuzzle();
  puzzleMoves = 0;
  createPuzzle();
  startPuzzleTimer();
}
$('shuffleBtn').addEventListener('click', shufflePuzzle);
createPuzzle();
const memorySymbols = ['🧠','🚀','⭐','🎯','🐱','🍀','⚡','🎵'];
let memoryDeck = [], memoryFirst = null, memoryLock = false, memoryMoves = 0, memoryPairs = 0;

function newMemoryGame() {
  memoryDeck = [...memorySymbols, ...memorySymbols]
    .sort(() => Math.random() - 0.5)
    .map((symbol, index) => ({ symbol, index, flipped: false, matched: false }));
  memoryFirst = null; memoryLock = false; memoryMoves = 0; memoryPairs = 0;
  renderMemory();
}
function renderMemory() {
  const board = $('memoryBoard');
  board.innerHTML = '';
  memoryDeck.forEach(card => {
    const btn = document.createElement('button');
    btn.className = 'memory-card' + (card.flipped || card.matched ? ' flipped' : '') + (card.matched ? ' matched' : '');
    btn.textContent = card.flipped || card.matched ? card.symbol : '❓';
    btn.disabled = card.matched;
    btn.addEventListener('click', () => flipMemory(card.index));
    board.appendChild(btn);
  });
  $('memoryMoves').textContent = `Moves: ${memoryMoves}`;
  $('memoryPairs').textContent = `Pairs: ${memoryPairs}/8`;
}
function flipMemory(index) {
  if (memoryLock) return;
  const card = memoryDeck[index];
  if (card.flipped || card.matched) return;
  card.flipped = true;
  if (!memoryFirst) {
    memoryFirst = card;
    renderMemory();
    return;
  }
  memoryMoves++;
  renderMemory();
  const second = card;
  memoryLock = true;
  setTimeout(() => {
    if (memoryFirst.symbol === second.symbol) {
      memoryFirst.matched = true;
      second.matched = true;
      memoryPairs++;
    } else {
      memoryFirst.flipped = false;
      second.flipped = false;
    }
    memoryFirst = null;
    memoryLock = false;
    renderMemory();
    if (memoryPairs === 8) showMessage(`🏆 All pairs found in ${memoryMoves} moves!`);
  }, 650);
}
$('memoryNew').addEventListener('click', newMemoryGame);
newMemoryGame();
let reactionStartTime = 0, reactionTimeout = null, reactionBest = null, reactionActive = false;
const reactionArea = $('reactionArea');

$('reactionStart').addEventListener('click', () => {
  clearTimeout(reactionTimeout);
  reactionActive = false;
  reactionArea.className = 'reaction-area waiting';
  $('reactionMessage').textContent = 'Wait for green...';
  const delay = 1500 + Math.random() * 3500;
  reactionTimeout = setTimeout(() => {
    reactionActive = true;
    reactionStartTime = performance.now();
    reactionArea.className = 'reaction-area ready';
    $('reactionMessage').textContent = 'CLICK NOW!';
  }, delay);
});

reactionArea.addEventListener('click', () => {
  if (reactionActive) {
    const ms = Math.round(performance.now() - reactionStartTime);
    reactionActive = false;
    reactionArea.className = 'reaction-area waiting';
    $('reactionMessage').textContent = `${ms} ms — nice!`;
    $('reactionLast').textContent = `Last: ${ms} ms`;
    if (reactionBest === null || ms < reactionBest) {
      reactionBest = ms;
      $('reactionBest').textContent = `🏆 Best: ${ms} ms`;
    }
  } else if (reactionArea.classList.contains('waiting') && $('reactionMessage').textContent === 'Wait for green...') {
    clearTimeout(reactionTimeout);
    reactionArea.className = 'reaction-area too-soon';
    $('reactionMessage').textContent = 'Too soon! Press Start again.';
    $('reactionLast').textContent = 'Last: False start';
  }
});
let sequence = '', sequenceLevel = 1, sequenceScore = 0, sequenceRunning = false;
function makeSequence() {
  return Array.from({length: sequenceLevel + 2}, () => Math.floor(Math.random() * 10)).join('');
}
function startSequenceLevel() {
  sequence = makeSequence();
  sequenceRunning = true;
  $('sequenceInput').value = '';
  $('sequenceInput').disabled = true;
  $('sequenceDisplay').textContent = sequence;
  $('sequenceStart').disabled = true;

  setTimeout(() => {
    if (!sequenceRunning) return;
    $('sequenceDisplay').textContent = '???';
    $('sequenceInput').disabled = false;
    $('sequenceStart').disabled = false;
    $('sequenceInput').focus();
  }, Math.max(1000, 1800 - sequenceLevel * 100));
}

$('sequenceStart').addEventListener('click', startSequenceLevel);

$('sequenceInput').addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !sequenceRunning) return;

  const answer = $('sequenceInput').value.trim();

  if (answer === sequence) {
    sequenceRunning = false;
    sequenceScore += sequence.length * 10;
    sequenceLevel++;

    $('sequenceDisplay').textContent = '✅ Correct!';
    $('sequenceLevel').textContent = `Level: ${sequenceLevel}`;
    $('sequenceScore').textContent = `Score: ${sequenceScore}`;
    $('sequenceInput').value = '';
    $('sequenceInput').disabled = true;
    $('sequenceStart').disabled = true;
    setTimeout(startSequenceLevel, 500);
  } else {
    sequenceRunning = false;
    sequenceLevel = 1;
    $('sequenceDisplay').textContent = `❌ It was ${sequence}`;
    $('sequenceLevel').textContent = `Level: ${sequenceLevel}`;
    $('sequenceScore').textContent = `Score: ${sequenceScore}`;
    $('sequenceInput').value = '';
    $('sequenceInput').disabled = true;
    $('sequenceStart').disabled = false;
    showMessage('Good try! Your level reset to 1. Press Start to play again.');
  }
});
const colors = [
  {name:'RED', css:'#ef4444'},
  {name:'BLUE', css:'#3b82f6'},
  {name:'GREEN', css:'#22c55e'},
  {name:'YELLOW', css:'#facc15'}
];
let stroopTarget = null, stroopScore = 0, stroopTime = 30, stroopTimer = null, stroopRunning = false;

function renderStroopRound() {
  const word = colors[Math.floor(Math.random() * colors.length)];
  stroopTarget = colors[Math.floor(Math.random() * colors.length)];
  $('stroopWord').textContent = word.name;
  $('stroopWord').style.color = stroopTarget.css;
  const choices = [...colors].sort(() => Math.random() - .5);
  $('stroopChoices').innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c.name;
    btn.style.background = c.css;
    btn.style.color = c.name === 'YELLOW' ? '#222' : '#fff';
    btn.addEventListener('click', () => {
      if (!stroopRunning) return;
      if (c.name === stroopTarget.name) {
        stroopScore++;
        $('stroopScore').textContent = `Score: ${stroopScore}`;
      } else {
        stroopScore = Math.max(0, stroopScore - 1);
        $('stroopScore').textContent = `Score: ${stroopScore}`;
      }
      renderStroopRound();
    });
    $('stroopChoices').appendChild(btn);
  });
}
$('stroopStart').addEventListener('click', () => {
  clearInterval(stroopTimer);
  stroopScore = 0; stroopTime = 30; stroopRunning = true;
  $('stroopScore').textContent = 'Score: 0';
  $('stroopTime').textContent = 'Time: 30s';
  renderStroopRound();
  stroopTimer = setInterval(() => {
    stroopTime--;
    $('stroopTime').textContent = `Time: ${stroopTime}s`;
    if (stroopTime <= 0) {
      clearInterval(stroopTimer);
      stroopRunning = false;
      $('stroopWord').textContent = `🏆 ${stroopScore}`;
      $('stroopWord').style.color = '#fff';
      $('stroopChoices').innerHTML = '';
      showMessage(`Color Focus finished! Score: ${stroopScore}`);
    }
  }, 1000);
});
