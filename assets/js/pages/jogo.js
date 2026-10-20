/**
 * Página do jogo: monta GameEngine + views, liga eventos, salva a partida ao fim e oferece nova partida.
 */
import { matchRepository } from '../data/index.js';
import { END_REASON } from '../game/constants.js';
import { ENGINE_STATE, GameEngine } from '../game/GameEngine.js';
import { BoardView } from '../ui/BoardView.js';
import { HistoryView } from '../ui/HistoryView.js';
import { HudView } from '../ui/HudView.js';
import { formatPercent, formatScore } from '../utils/formatters.js';

const setupForm = document.getElementById('setup-form');
const quitButton = document.getElementById('quit-button');
const statusMessage = document.getElementById('game-status');
const dialog = document.getElementById('game-over-dialog');

let engine = null;

const boardView = new BoardView(document.getElementById('board'), {
    onHit: (index) => engine?.hit(index),
});
const hudView = new HudView(document.getElementById('game-panel'));
const historyView = new HistoryView(document.getElementById('history-body'));

function readSetup() {
    const data = new FormData(setupForm);
    return {
        rows: Number(data.get('rows')),
        cols: Number(data.get('cols')),
        mode: data.get('mode'),
    };
}

function isPlaying() {
    return engine !== null && engine.state !== ENGINE_STATE.FINISHED;
}

/** @param {'info' | 'success' | 'danger'} tone */
function showStatus(text, tone = 'info') {
    statusMessage.textContent = text;
    statusMessage.className = `game-status game-status--${tone}`;
}

function setPlaying(playing) {
    setupForm.querySelectorAll('fieldset, button').forEach((control) => {
        control.disabled = playing;
    });
    quitButton.disabled = !playing;
    boardView.setEnabled(playing);
}

/** Tabuleiro vazio e placar zerado com a configuração escolhida, antes de iniciar. */
function showPreview() {
    const setup = readSetup();
    boardView.render(setup.rows, setup.cols);
    hudView.render(new GameEngine(setup).getSnapshot());
}

async function refreshHistory() {
    try {
        historyView.render(await matchRepository.listByCurrentUser());
    } catch {
        historyView.showMessage('Não foi possível carregar o histórico de partidas.');
    }
}

function startGame() {
    const setup = readSetup();
    engine = new GameEngine(setup);
    boardView.render(setup.rows, setup.cols);

    const render = ({ snapshot }) => hudView.render(snapshot);
    engine.on('tick', render);
    engine.on('levelStart', (event) => {
        render(event);
        const required = formatPercent(event.snapshot.requiredRatio);
        showStatus(event.level === 1
            ? `Nível 1: acerte pelo menos ${required} das toupeiras!`
            : `Nível ${event.level}! As toupeiras agora ficam ${(event.visibleMs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s à mostra.`);
    });
    engine.on('spawn', (event) => {
        boardView.showCreature(event.index, event.creature);
        render(event);
    });
    engine.on('hide', ({ index }) => boardView.hideCreature(index));
    engine.on('hit', (event) => {
        boardView.showHitFeedback(event.index, event.creature);
        render(event);
    });
    engine.on('levelComplete', (event) => {
        render(event);
        const ratio = formatPercent(event.snapshot.levelHitRatio);
        showStatus(`Nível ${event.level} concluído com ${ratio} de acerto! Prepare-se para o nível ${event.nextLevel}…`, 'success');
    });
    engine.on('gameOver', finishGame);

    setPlaying(true);
    engine.start();
}

async function finishGame({ result, reason, snapshot }) {
    hudView.render(snapshot);
    setPlaying(false);

    const isDefeat = reason === END_REASON.DEFEAT;
    const summary = isDefeat
        ? `Fim de partida: você acertou ${formatPercent(snapshot.levelHitRatio)} no nível ${result.levelReached}, abaixo dos ${formatPercent(snapshot.requiredRatio)} necessários.`
        : 'Você desistiu da partida.';
    showStatus(summary, 'danger');

    try {
        await matchRepository.save(result);
        await refreshHistory();
    } catch {
        showStatus(`${summary} Não foi possível salvar a partida no histórico.`, 'danger');
    }

    dialog.querySelector('[data-result="title"]').textContent = isDefeat ? 'Fim de partida' : 'Partida encerrada';
    dialog.querySelector('[data-result="reason"]').textContent = isDefeat
        ? 'Você não atingiu o acerto mínimo do nível.'
        : 'Você desistiu, mas a partida ficou registrada no histórico.';
    dialog.querySelector('[data-result="level"]').textContent = String(result.levelReached);
    dialog.querySelector('[data-result="score"]').textContent = formatScore(result.score);
    dialog.showModal();
}

setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isPlaying()) {
        startGame();
    }
});

setupForm.addEventListener('change', () => {
    if (!isPlaying()) {
        showPreview();
    }
});

quitButton.addEventListener('click', () => engine?.quit());

dialog.querySelector('[data-action="play-again"]').addEventListener('click', () => {
    dialog.close();
    startGame();
});

dialog.querySelector('[data-action="change-setup"]').addEventListener('click', () => {
    dialog.close();
    setupForm.elements.namedItem('rows').focus();
});

showPreview();
showStatus('Escolha o tabuleiro e a modalidade e clique em "Iniciar partida".');
refreshHistory();
