const state = {
  step: 0,
  holding: null,
  holdStarted: 0,
  raf: null,
  revealedOnce: new Set(),
  globalStrain: 0,
  breathPhase: 0,
  lastFrame: performance.now(),
};

const $ = (selector) => document.querySelector(selector);
const stage = $('#stage');
const kicker = $('#kicker');
const text = $('#text');
const hint = $('#hint');
const choices = $('#choices');

const lines = [
  // ─── 再会 ───────────────────────────────────────────
  {
    kicker: '再会',
    text: '横断歩道の向こうに、見覚えのある横顔を見つけた。\n不意に、胸の奥がぎゅっと詰まる。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '再会',
    text: '半年前に別れた、元カノ。\n……いや、「俺がふられた相手」と言うのが正しい。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '再会',
    text: 'もう何年も経ったような気もするし、\nまだ昨日のことのような気もする。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '再会',
    text: '彼女はまだ、こちらに気づいていない。\n冷たい人の波だけが、ふたりの間を通り過ぎていく。',
    choices: [
      { id: 'call-name', label: '名前を呼んで声をかける', duration: 3.8, load: .86, next: 'branch-1a' },
      { id: 'call',      label: '声をかける',             duration: 1.25, load: .22, next: 'branch-1b' },
      { id: 'nothing',   label: '何もしない',              duration: .65,  load: .10, next: 'branch-1c' },
    ],
  },
  {
    id: 'branch-1a',
    kicker: '再会',
    text: '名前を呼んだ声が、変なトーンで出てしまった。',
    continueText: 'クリックで進む',
    nextScene: 'scene2-open',
  },
  {
    id: 'branch-1b',
    kicker: '再会',
    text: '声をかけた。自分で思っていたよりも気軽に声をかけられた。',
    continueText: 'クリックで進む',
    nextScene: 'scene2-open',
  },
  {
    id: 'branch-1c',
    kicker: '再会',
    text: '声はかけられなかった。\nそれでも、彼女は振り向いた。',
    continueText: 'クリックで進む',
    nextScene: 'scene2-open',
  },

  // ─── 軽い会話 ────────────────────────────────────────
  {
    id: 'scene2-open',
    kicker: '軽い会話',
    speaker: '彼女',
    text: '「……あれ？久しぶりだね」',
    continueText: 'クリックで進む',
  },
  {
    kicker: '軽い会話',
    text: '彼女は普通の調子で声をかけてきた。\n何故だか何とも言えない気持ちになる。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '軽い会話',
    speaker: '彼女',
    text: '「元気してた？」',
    choices: [
      { id: 'so-so',    label: 'ぼちぼち。そっちは？',    duration: .85,  load: .10, next: 'branch-2a' },
      { id: 'you',      label: '良くはないね。そっちは？', duration: .95,  load: .12, next: 'branch-2b' },
      { id: 'name-how', label: '（相手の名前）は？',       duration: 1.85, load: .30, next: 'branch-2c' },
    ],
  },
  {
    id: 'branch-2a',
    kicker: '軽い会話',
    text: 'あくまで、なんて事のないように振る舞った。',
    continueText: 'クリックで進む',
    nextScene: 'chat-reply',
  },
  {
    id: 'branch-2b',
    kicker: '軽い会話',
    text: '正直に答えたあと、少しだけ後悔した。',
    continueText: 'クリックで進む',
    nextScene: 'chat-reply',
  },
  {
    id: 'branch-2c',
    kicker: '軽い会話',
    text: '名前を呼んだ。日常会話のふりをして、もう二度と呼べないと思った名前を呼んだ。',
    continueText: 'クリックで進む',
    nextScene: 'chat-reply',
  },
  {
    id: 'chat-reply',
    kicker: '軽い会話',
    speaker: '彼女',
    text: '「うん。まあ、そこそこかな…」',
    continueText: 'クリックで進む',
  },
  {
    kicker: '軽い会話',
    text: '…',
    continueText: 'クリックで進む',
  },
  {
    kicker: '軽い会話',
    text: '……',
    continueText: 'クリックで進む',
  },
  {
    kicker: '軽い会話',
    text: '………',
    continueText: 'クリックで進む',
  },
  {
    kicker: '軽い会話',
    text: '会話は途切れなかった。\nただ、途切れないだけで、あの頃に戻れたわけではない。',
    continueText: 'クリックで進む',
  },

  // ─── 感情の揺らぎ ────────────────────────────────────
  {
    kicker: '感情の揺らぎ',
    speaker: '主人公',
    text: '「あのさ…」',
    continueText: 'クリックで進む',
  },
  {
    kicker: '感情の揺らぎ',
    text: 'あのさ…に続ける言葉に迷っている。',
    choices: [
      { id: 'never-mind', label: 'いや、なんでもない', duration: 1.05, load: .18, next: 'branch-3a' },
      {
        id: 'boyfriend', label: '……彼氏できた？', duration: 4.0, load: .93, next: 'branch-3b',
        reveals: [
          { at: .48, choices: [
            { id: 'dont-ask', label: 'やっぱり聞かない', duration: 1.35, load: .34, next: 'branch-3c', added: true },
            { id: 'smile',    label: '笑ってごまかす',   duration: 1.15, load: .22, next: 'branch-3d', added: true },
          ]},
        ],
      },
    ],
  },
  {
    id: 'branch-3a',
    kicker: '感情の揺らぎ',
    text: '言葉を飲み込んだ。正しい判断だったかどうか、わからなかった。',
    continueText: 'クリックで進む',
    nextScene: 'after-question',
  },
  {
    id: 'branch-3b',
    kicker: '感情の揺らぎ',
    text: '聞いてしまった。\n口から出た瞬間、もう取り消せないと思った。',
    continueText: 'クリックで進む',
    nextScene: 'branch-3b2',
  },
  {
    id: 'branch-3b2',
    kicker: '感情の揺らぎ',
    speaker: '彼女',
    text: 'うん、いるよ。',
    continueText: 'クリックで進む',
    nextScene: 'branch-3b3',
  },
  {
    id: 'branch-3b3',
    kicker: '感情の揺らぎ',
    speaker: '主人公',
    text: '「そうか……良かったな。」\nなんとか言葉を絞り出した。',
    continueText: 'クリックで進む',
    nextScene: 'after-question',
  },
  {
    id: 'branch-3c',
    kicker: '感情の揺らぎ',
    text: 'やっぱり聞けなかった。\n飲み込んだ言葉の重さだけが、残った。',
    continueText: 'クリックで進む',
    nextScene: 'after-question',
  },
  {
    id: 'branch-3d',
    kicker: '感情の揺らぎ',
    text: 'ぎこちない笑顔でごまかした。',
    continueText: 'クリックで進む',
    nextScene: 'after-question',
  },
  {
    id: 'after-question',
    kicker: '感情の揺らぎ',
    speaker: '彼女',
    text: '彼女は少し困ったような顔で笑っていた。',
    continueText: 'クリックで進む',
  },

  // ─── 別れ ────────────────────────────────────────────
  {
    kicker: '別れ',
    text: '信号が青に変わる。\n彼女は一歩踏み出し…。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '別れ',
    speaker: '彼女',
    text: '「じゃあ、またね」\nと言い残し歩き始めて行った。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '別れ',
    speaker: '彼女',
    text: '「じゃあ、またね」\nその、あっという間の別れに…。',
    choices: [
      {
        id: 'silence', label: '・・・', duration: 3.2, load: .62, next: 'ed-silence',
        reveals: [
          { at: .36, choices: [
            { id: 'goodbye', label: 'さよなら',    duration: 2.7, load: .72, next: 'ed-goodbye', added: true },
            { id: 'again',   label: 'ああ、またな', duration: 1.4, load: .28, next: 'ed-again',   added: true },
            { id: 'impulse',   label: '衝動的に呼び止める', duration: 0.2, load: .95, next: 'ed-impulse',   added: true },
          ]},
        ],
      },
    ],
  },

  // ─── ED：沈黙 ────────────────────────────────────────
  {
    id: 'ed-silence',
    kicker: 'そのあと',
    text: '言葉は出てこなかった。\n沈黙のまま、彼女の背中が遠ざかっていった。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'そのあと',
    text: 'また、なんてないのに。\n何も言わなかったことだけが、しばらく残った。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'おわり',
    text: ' ',
    choices: [
      { id: 'restart', label: '最初に戻る', duration: .9, load: .05, restart: true },
    ],
  },

  // ─── ED：さよなら ────────────────────────────────────
  {
    id: 'ed-goodbye',
    kicker: 'そのあと',
    text: '「さよなら」という言葉は、静かに出た。\n「またね」より、ずっと正直な言葉だったと思う。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'そのあと',
    text: '彼女は一瞬立ち止まり、\nそのまま振り返る事なく去っていった。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'おわり',
    text: ' ',
    choices: [
      { id: 'restart', label: '最初に戻る', duration: .9, load: .05, restart: true },
    ],
  },

  // ─── ED：またな ──────────────────────────────────────
  {
    id: 'ed-again',
    kicker: 'そのあと',
    text: '「ああ、またな」と返した。\nなるべく軽く聞こえるように。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'そのあと',
    text: 'また会ったところでどうにかなるわけじゃない。\nでもまた会いたいと思ってしまった。\n',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'おわり',
    text: ' ',
    choices: [
      { id: 'restart', label: '最初に戻る', duration: .9, load: .05, restart: true },
    ],
  },

  // ─── ED：衝動的に呼び止める ──────────────────────────────────────
  {
    id: 'ed-impulse',
    kicker: 'そのあと',
    text: '「◯◯！！」\n自分でも驚く程の声量で彼女の名前を呼んだ。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'そのあと',
    speaker: '彼女',
    text: '「え、びっくりした。どうしたの？」\n目を丸くしてこちらを向く。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'そのあと',
    speaker: '主人公',
    text: '「なんか、もう二度と会えないような気がして…」\n情けないが、これが俺の本心だった。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    speaker: '主人公',
    text: '二度と会えないかもしれないのなら…。',
    choices: [
      { id: 'impulse-a',    label: 'やっぱりまだ好きなんだ！',  duration: .2,  load: .95, next: 'ed-impulse-a' },
      { id: 'impulse-b',      label: 'また会えないかな？',      duration: 1.0,  load: .12, next: 'ed-impulse-b' },
      { id: 'impulse-c', label: '…いや、なんでもない。',       duration: 3.0, load: .30, next: 'ed-impulse-c' },
    ],
  },
  // ─── ED2：やっぱりまだ好きなんだ！ ──────────────────────────────────────
  {
    id: 'ed-impulse-a',
    kicker: '最後の言葉',
    speaker: '主人公',
    text: '「やっぱりまだ好きなんだ！」\n心の底から溢れ出る衝動は止められなかった。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    text: '彼女の返事は…',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    text: '………',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'おわり',
    text: ' ',
    choices: [
      { id: 'restart', label: '最初に戻る', duration: .9, load: .05, restart: true },
    ],
  },
  // ─── ED2：また会えないかな？ ──────────────────────────────────────
  {
    id: 'ed-impulse-b',
    kicker: '最後の言葉',
    speaker: '主人公',
    text: '「また会えないかな？」\n思いを伝えるでもない情けない言葉だった…。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    text: '彼女の返事は…',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    text: '………',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'おわり',
    text: ' ',
    choices: [
      { id: 'restart', label: '最初に戻る', duration: .9, load: .05, restart: true },
    ],
  },
  // ─── ED2：…いや、なんでもない。 ──────────────────────────────────────
  {
    id: 'ed-impulse-c',
    kicker: '最後の言葉',
    speaker: '主人公',
    text: '「…いや、なんでもない。」\n悩んだ末に結局何も伝えられなかった…。',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    speaker: '彼女',
    text: '「それじゃあ、いくね」',
    continueText: 'クリックで進む',
  },
  {
    kicker: '最後の言葉',
    text: '「またね」ですらない別れの言葉だった…。',
    continueText: 'クリックで進む',
  },
  {
    kicker: 'おわり',
    text: ' ',
    choices: [
      { id: 'restart', label: '最初に戻る', duration: .9, load: .05, restart: true },
    ],
  },
];

function findStepIndex(id) {
  return lines.findIndex((line) => line.id === id);
}

function renderStep(index) {
  cancelHold();
  state.step = index;
  const step = lines[index];
  kicker.textContent = step.kicker || '';
  text.className = 'text fade-in';
  text.innerHTML = formatText(step);
  choices.innerHTML = '';
  hint.textContent = '';
  setStageStrain(0, 0);

  if (step.delayNext) {
    window.setTimeout(() => renderStep(index + 1), step.delayNext);
    return;
  }

  if (step.choices) {
    hint.textContent = '選択肢は長押し、離せばキャンセル可能';
    renderChoices(step.choices);
    return;
  }

  hint.textContent = step.continueText || '';
  const advance = document.createElement('button');
  advance.className = 'choice';
  advance.innerHTML = '<span>　</span>';
  advance.setAttribute('aria-label', '読み進める');
  advance.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const next = step.nextScene != null ? findStepIndex(step.nextScene) : index + 1;
    renderStep(next >= 0 ? next : index + 1);
  }, { once: true });
  choices.appendChild(advance);
}

function formatText(step) {
  const speaker = step.speaker ? `<span class="speaker">${escapeHTML(step.speaker)}</span>` : '';
  return speaker + escapeHTML(step.text || '').replace(/\n/g, '<br>');
}

function escapeHTML(value) {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function renderChoices(choiceList) {
  const currentIds = new Set([...choices.querySelectorAll('.choice')].map((el) => el.dataset.id));
  choiceList.forEach((choice) => {
    if (currentIds.has(choice.id)) return;
    const button = document.createElement('button');
    button.className = `choice ${choice.added ? 'is-new' : ''}`;
    button.dataset.id = choice.id;
    button.innerHTML = `<span>${escapeHTML(choice.label)}</span>`;
    button.addEventListener('pointerdown', (event) => beginHold(event, choice, button));
    button.addEventListener('pointerup', cancelHold);
    button.addEventListener('pointerleave', cancelHold);
    button.addEventListener('pointercancel', cancelHold);
    choices.appendChild(button);
  });
}

function beginHold(event, choice, element) {
  event.preventDefault();
  cancelHold();
  element.setPointerCapture?.(event.pointerId);
  state.holding = { choice, element, start: performance.now(), revealed: false };
  element.classList.add('is-holding');
  choices.querySelectorAll('.choice').forEach((el) => {
    if (el !== element) el.classList.add('is-fading');
  });
  tick();
}

function tick(now = performance.now()) {
  if (!state.holding) return;
  const { choice, element, start } = state.holding;
  const raw = (now - start) / (choice.duration * 1000);
  const progress = Math.min(1, raw);
  const eased = easeInOut(progress);
  const strain = eased * choice.load;
  const breath = Math.sin(now / 310) * strain;

  element.style.setProperty('--choice-progress', progress.toFixed(4));
  element.style.setProperty('--local-strain', strain.toFixed(4));
  setStageStrain(strain, breath);
  maybeReveal(choice, progress);

  if (progress >= 1) {
    commitChoice(choice);
    return;
  }
  state.raf = requestAnimationFrame(tick);
}

function maybeReveal(choice, progress) {
  if (!choice.reveals) return;
  choice.reveals.forEach((rule) => {
    const key = `${state.step}:${choice.id}:${rule.at}`;
    if (progress >= rule.at && !state.revealedOnce.has(key)) {
      state.revealedOnce.add(key);
      renderChoices(rule.choices);
      hint.textContent = '言葉の途中で、別の言葉が浮かぶ。';
    }
  });
}

function cancelHold() {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
  if (state.holding) {
    state.holding.element.style.setProperty('--choice-progress', 0);
    state.holding.element.style.setProperty('--local-strain', 0);
  }
  state.holding = null;
  choices.querySelectorAll('.choice').forEach((el) => el.classList.remove('is-holding', 'is-fading'));
  setStageStrain(0, 0);
}

function commitChoice(choice) {
  cancelHold();
  if (choice.restart) {
    state.revealedOnce.clear();
    renderStep(0);
    return;
  }
  const nextIndex = choice.next ? findStepIndex(choice.next) : state.step + 1;
  renderStep(nextIndex >= 0 ? nextIndex : state.step + 1);
}

function setStageStrain(strain, breath) {
  state.globalStrain = strain;
  stage.style.setProperty('--strain', strain.toFixed(4));
  stage.style.setProperty('--breath', breath.toFixed(4));
}

function easeInOut(t) {
  return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

window.addEventListener('contextmenu', (event) => event.preventDefault());
renderStep(0);
