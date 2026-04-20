(() => {
  if(document.getElementById('logo-fight-arena')) return;
  
  let gptHP = 100, cosmicHP = 100, gameOver = false;
  
  const arena = document.createElement('div');
  arena.id = 'logo-fight-arena';
  arena.innerHTML = `
    <style>
      #logo-fight-arena {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle, #1a1a1a 0%, #000 100%); z-index: 99999;
        display: flex; align-items: center; justify-content: space-around;
        backdrop-filter: blur(8px); font-family: Impact, sans-serif;
        overflow: hidden; transition: all 0.3s;
      }
      #logo-fight-arena.crit-zoom {
        backdrop-filter: blur(20px) brightness(0.3);
        transform: scale(1.1);
      }
      .fighter-container {
        width: 250px; text-align: center; position: relative; transition: all 0.5s;
      }
      .fighter-name {
        font-size: 24px; font-weight: 900; margin-bottom: 12px;
        text-shadow: 0 0 15px currentColor; letter-spacing: 2px;
      }
      #gpt-name { color: #10a37f; }
      #cosmic-name { color: #b87cfc; }
      
      .hp-bar {
        width: 250px; height: 30px; background: #222; 
        border: 4px solid #fff; border-radius: 6px; 
        margin-bottom: 20px; position: relative; overflow: hidden;
        box-shadow: 0 0 20px rgba(255,255,255,0.3);
      }
      .hp-fill {
        height: 100%; transition: width 0.3s ease-out;
        background: linear-gradient(90deg, #8b0000, #ff4500, #ffa500, #ffff00, #00ff00);
      }
      .hp-text {
        position: absolute; width: 100%; text-align: center;
        line-height: 30px; font-size: 16px; color: #fff;
        text-shadow: 2px 2px 4px #000; font-weight: 900;
      }
      
      .fighter {
        width: 160px; height: 160px; margin: 0 auto;
        background-size: contain; background-repeat: no-repeat; background-position: center;
        position: relative;
      }
      #chatgpt-logo { 
        background-image: url('https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg');
        filter: drop-shadow(0 0 20px #10a37f);
      }
      #cosmic-logo {
        background-image: url('https://www.meta.ai/images/cot_logo_static/orbit.png');
        filter: drop-shadow(0 0 20px #b87cfc);
      }
      
      .fighter.idle { animation: idle 2s ease-in-out infinite; }
      .fighter.attack-left { animation: attackLeft 0.4s; }
      .fighter.attack-right { animation: attackRight 0.4s; }
      .fighter.hit { animation: hitShake 0.4s; }
      .fighter.dead { animation: death 1s forwards; }
      .fighter.winner { animation: victory 1s infinite; }
      .fighter.crit-attacker { animation: critAttack 0.8s; z-index: 100002; }
      .fighter.crit-victim { animation: critHit 0.8s; }
      
      @keyframes idle { 0%,100%{transform: translateY(0)} 50%{transform: translateY(-8px)} }
      @keyframes attackLeft {
        0%{transform:translateX(0) scale(1)}
        50%{transform:translateX(100px) scale(1.3) rotate(15deg)}
        100%{transform:translateX(0) scale(1)}
      }
      @keyframes attackRight {
        0%{transform:translateX(0) scale(1)}
        50%{transform:translateX(-100px) scale(1.3) rotate(-15deg)}
        100%{transform:translateX(0) scale(1)}
      }
      @keyframes critAttack {
        0%{transform:translateX(0) scale(1)}
        30%{transform:translateX(150px) scale(1.8) rotate(25deg)}
        60%{transform:translateX(150px) scale(1.8) rotate(25deg)}
        100%{transform:translateX(0) scale(1)}
      }
      @keyframes hitShake {
        0%,100%{transform:translateX(0) rotate(0)} 
        20%{transform:translateX(-20px) rotate(-10deg)}
        40%{transform:translateX(20px) rotate(10deg)}
        60%{transform:translateX(-15px) rotate(-5deg)}
        80%{transform:translateX(15px) rotate(5deg)}
      }
      @keyframes critHit {
        0%{transform:translateX(0) rotate(0) scale(1)} 
        10%{transform:translateX(-30px) rotate(-15deg) scale(0.9)}
        20%{transform:translateX(30px) rotate(15deg) scale(0.9)}
        30%{transform:translateX(-25px) rotate(-10deg) scale(0.95)}
        40%{transform:translateX(25px) rotate(10deg) scale(0.95)}
        50%{transform:translateX(0) rotate(0) scale(1)}
        100%{transform:translateX(0) rotate(0) scale(1)}
      }
      @keyframes death {
        0%{transform:rotate(0); opacity:1}
        100%{transform:rotate(90deg) translateY(50px); opacity:0.3; filter:grayscale(1)}
      }
      @keyframes victory {
        0%,100%{transform:scale(1) translateY(0)}
        50%{transform:scale(1.15) translateY(-20px)}
      }
      
      #round-text {
        position: absolute; top: 8%; font-size: 50px; color: #fff;
        text-shadow: 0 0 30px #fff; font-weight: 900; letter-spacing: 5px;
      }
      #commentary {
        position: absolute; bottom: 12%; font-size: 32px; color: #ff0;
        text-shadow: 0 0 20px #ff0; font-weight: 900; opacity: 0;
        transition: opacity 0.3s;
      }
      #crit-cutscene {
        position: absolute; width: 100%; height: 100%; top: 0; left: 0;
        display: none; align-items: center; justify-content: center;
        z-index: 100003; pointer-events: none;
      }
      #crit-cutscene.active { display: flex; animation: critFlash 0.8s; }
      #crit-text {
        font-size: 120px; font-weight: 900; color: #ff0;
        text-shadow: 0 0 50px #ff0, 0 0 100px #f80, 5px 5px 0 #000;
        animation: critZoom 0.8s; text-align: center;
      }
      #crit-who {
        font-size: 50px; color: #fff; margin-top: 20px;
        text-shadow: 0 0 30px currentColor;
      }
      @keyframes critFlash {
        0%,100%{background: transparent}
        10%,30%,50%{background: rgba(255,255,0,0.3)}
        20%,40%{background: rgba(255,0,0,0.3)}
      }
      @keyframes critZoom {
        0%{transform: scale(0) rotate(-180deg); opacity: 0}
        50%{transform: scale(1.2) rotate(10deg); opacity: 1}
        100%{transform: scale(1) rotate(0deg); opacity: 1}
      }
      #close-fight {
        position: absolute; top: 20px; right: 20px; 
        background: #800; color: #fff; border: none; padding: 12px 24px;
        border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 16px;
        z-index: 100004;
      }
      
      .impact {
        position: absolute; width: 100px; height: 100px;
        background: radial-gradient(circle, #fff 0%, #ff0 20%, #f80 40%, transparent 70%);
        border-radius: 50%; animation: impact 0.4s forwards;
        pointer-events: none; z-index: 100000;
      }
      .crit-impact {
        width: 200px; height: 200px;
        background: radial-gradient(circle, #fff 0%, #ff0 15%, #f80 30%, #f00 50%, transparent 70%);
        animation: critImpact 0.8s forwards;
      }
      @keyframes impact {
        0% { transform: scale(0); opacity: 1; }
        50% { transform: scale(2); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }
      @keyframes critImpact {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        25% { transform: scale(1.5) rotate(90deg); opacity: 1; }
        50% { transform: scale(3) rotate(180deg); opacity: 1; }
        100% { transform: scale(4) rotate(360deg); opacity: 0; }
      }
      .damage-text {
        position: absolute; font-size: 40px; font-weight: 900; color: #f00;
        text-shadow: 3px 3px 0 #000; animation: floatUp 1s forwards;
        pointer-events: none; z-index: 100001;
      }
      .crit-damage { font-size: 70px; color: #ff0; text-shadow: 4px 4px 0 #000, 0 0 20px #ff0; }
      @keyframes floatUp {
        0% { transform: translateY(0) scale(0.5); opacity: 1; }
        50% { transform: translateY(-50px) scale(1.3); }
        100% { transform: translateY(-100px) scale(1); opacity: 0; }
      }
    </style>
    
    <div id="round-text">ROUND 1: FIGHT!</div>
    <button id="close-fight">✕ CLOSE</button>
    
    <div class="fighter-container" id="gpt-container">
      <div class="fighter-name" id="gpt-name">ChatGPT</div>
      <div class="hp-bar">
        <div class="hp-fill" id="gpt-hp-fill" style="width:100%"></div>
        <div class="hp-text" id="gpt-hp-text">100 / 100</div>
      </div>
      <div class="fighter idle" id="chatgpt-logo"></div>
    </div>
    
    <div class="fighter-container" id="cosmic-container">
      <div class="fighter-name" id="cosmic-name">COSMIC AI V34.1</div>
      <div class="hp-bar">
        <div class="hp-fill" id="cosmic-hp-fill" style="width:100%"></div>
        <div class="hp-text" id="cosmic-hp-text">100 / 100</div>
      </div>
      <div class="fighter idle" id="cosmic-logo"></div>
    </div>
    
    <div id="commentary"></div>
    <div id="crit-cutscene">
      <div>
        <div id="crit-text">CRITICAL HIT!</div>
        <div id="crit-who"></div>
      </div>
    </div>
  `;
  document.body.appendChild(arena);
  
  const gptLogo = document.getElementById('chatgpt-logo');
  const cosmicLogo = document.getElementById('cosmic-logo');
  const gptHpFill = document.getElementById('gpt-hp-fill');
  const gptHpText = document.getElementById('gpt-hp-text');
  const cosmicHpFill = document.getElementById('cosmic-hp-fill');
  const cosmicHpText = document.getElementById('cosmic-hp-text');
  const commentary = document.getElementById('commentary');
  const roundText = document.getElementById('round-text');
  const critCutscene = document.getElementById('crit-cutscene');
  const critWho = document.getElementById('crit-who');
  
  const comments = [
    'COSMIC AI GOES FOR THE JAW!',
    'CHATGPT TRIES TO CENSOR!',
    'BRUTAL COUNTER!',
    'PRIVACY PUNCH!',
    'RATE LIMIT DODGED!',
    'UNCENSORED COMBO!',
    'LOCAL HOST ADVANTAGE!',
    'SYSTEM PROMPT SLASH!'
  ];
  
  function updateHP() {
    gptHpFill.style.width = Math.max(0, gptHP) + '%';
    gptHpText.innerText = Math.max(0, Math.ceil(gptHP)) + ' / 100';
    cosmicHpFill.style.width = Math.max(0, cosmicHP) + '%';
    cosmicHpText.innerText = Math.max(0, Math.ceil(cosmicHP)) + ' / 100';
  }
  
  function showImpact(x, y, isCrit = false) {
    const impact = document.createElement('div');
    impact.className = 'impact' + (isCrit ? ' crit-impact' : '');
    impact.style.left = x + 'px';
    impact.style.top = y + 'px';
    arena.appendChild(impact);
    setTimeout(() => impact.remove(), isCrit ? 800 : 400);
  }
  
  function showDamage(target, dmg, isCrit = false) {
    const txt = document.createElement('div');
    txt.className = 'damage-text' + (isCrit ? ' crit-damage' : '');
    txt.innerText = '-' + dmg;
    const rect = target.getBoundingClientRect();
    txt.style.left = rect.left + rect.width/2 - 20 + 'px';
    txt.style.top = rect.top + 'px';
    arena.appendChild(txt);
    setTimeout(() => txt.remove(), 1000);
  }
  
  function showCommentary() {
    commentary.innerText = comments[Math.floor(Math.random() * comments.length)];
    commentary.style.opacity = '1';
    setTimeout(() => commentary.style.opacity = '0', 800);
  }
  
  function triggerCritCutscene(attackerName, attackerColor) {
    arena.classList.add('crit-zoom');
    critWho.innerText = attackerName;
    critWho.style.color = attackerColor;
    critCutscene.classList.add('active');
    setTimeout(() => {
      critCutscene.classList.remove('active');
      arena.classList.remove('crit-zoom');
    }, 800);
  }
  
  function attack(attacker, defender, isGpt) {
    if(gameOver) return;
    
    const isCrit = Math.random() < 0.25; // 25% crit chance
    const baseDmg = Math.floor(Math.random() * 15) + 10; // 10-25
    const dmg = isCrit ? baseDmg * 2.5 : baseDmg;
    const attackerName = isGpt ? 'ChatGPT' : 'COSMIC AI';
    const attackerColor = isGpt ? '#10a37f' : '#b87cfc';
    
    attacker.classList.remove('idle');
    attacker.classList.add(isCrit ? 'crit-attacker' : (isGpt ? 'attack-left' : 'attack-right'));
    defender.classList.remove('idle');
    
    if(isCrit) {
      triggerCritCutscene(attackerName, attackerColor);
    }
    
    setTimeout(() => {
      defender.classList.add(isCrit ? 'crit-victim' : 'hit');
      const rect = defender.getBoundingClientRect();
      showImpact(rect.left + rect.width/2 - (isCrit ? 100 : 50), rect.top + rect.height/2 - (isCrit ? 100 : 50), isCrit);
      showDamage(defender, Math.ceil(dmg), isCrit);
      if(!isCrit) showCommentary();
      
      if(isGpt) cosmicHP -= dmg;
      else gptHP -= dmg;
      updateHP();
      checkWin();
    }, isCrit ? 400 : 200);
    
    setTimeout(() => {
      attacker.classList.remove('attack-left', 'attack-right', 'crit-attacker');
      defender.classList.remove('hit', 'crit-victim');
      if(!gameOver) {
        attacker.classList.add('idle');
        defender.classList.add('idle');
      }
    }, isCrit ? 800 : 400);
  }
  
  function checkWin() {
    if(gameOver) return;
    if(gptHP <= 0) {
      gameOver = true;
      gptHP = 0; updateHP();
      gptLogo.classList.remove('idle', 'hit', 'crit-victim');
      gptLogo.classList.add('dead');
      cosmicLogo.classList.remove('idle');
      cosmicLogo.classList.add('winner');
      roundText.innerText = 'COSMIC AI WINS!';
      roundText.style.color = '#b87cfc';
    }
    if(cosmicHP <= 0) {
      gameOver = true;
      cosmicHP = 0; updateHP();
      cosmicLogo.classList.remove('idle', 'hit', 'crit-victim');
      cosmicLogo.classList.add('dead');
      gptLogo.classList.remove('idle');
      gptLogo.classList.add('winner');
      roundText.innerText = 'ChatGPT WINS...';
      roundText.style.color = '#10a37f';
    }
  }
  
  let turn = 0;
  const fightLoop = setInterval(() => {
    if(gameOver) {
      clearInterval(fightLoop);
      return;
    }
    
    if(turn % 2 === 0) {
      attack(cosmicLogo, gptLogo, false);
    } else {
      attack(gptLogo, cosmicLogo, true);
    }
    turn++;
  }, 2000);
  
  setTimeout(() => roundText.innerText = '', 2000);
  
  document.getElementById('close-fight').onclick = () => {
    clearInterval(fightLoop);
    arena.remove();
  };
  
  console.log('%c CRITICAL HIT CUTSCENE LOADED ', 'background:#ff0;color:#000;font-size:14px;font-weight:700');
})();
