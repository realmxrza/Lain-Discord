/**
 * Lain Pet by realmxrza
 */
const initLainPet = () => {
    const assets = {
        default: { idle: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/1.png', right: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk1.gif', left: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk2.gif' },
        school: { idle: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/115.png', right: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk3.gif', left: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk4.gif', event: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainburn.gif' },
        pink: { idle: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/116.png', right: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk5.gif', left: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk6.gif', event: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/laindance.gif' },
        bear: { idle: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/117.png', right: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk7.gif', left: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk8.gif', event: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainroll.gif' },
        home: { idle: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/118.png', right: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk9.gif', left: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/lainwalk10.gif' },
        misc: { 
            crow: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/crow.gif', 
            girl: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/flyinggirl.gif', 
            navi: ['https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/navi1.gif', 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/navi2.gif', 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/navi3.gif'],
            exp1: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/expression1.gif?raw=true',
            exp2: 'https://raw.githubusercontent.com/realmxrza/Lain-pet-Discord/main/assets/expression2.gif?raw=true'
        }
    };

    const dialogues = ["Present day. Present time. Hahahaha!", "Why don't you come to the Wired?", "No matter where you are, everyone is always connected.", "No matter where you are, everyone is always connected.", "You're wrong.", "Don't worry. I'm still me.", "check out mxrza.xyz", "Let's All Love Lain.", "Why are you crying Lain", "The real world isn't real at all."];
    let state = { x: 100, y: 100, vx: 0, vy: 0, targetX: 100, targetY: 100, outfit: 'default', mode: 'idle', isDragging: false, eventActive: false, sugarRush: false };
    let naviItem = null;
    let naviLanded = false;

    const container = document.createElement('div');
    container.style = "position:fixed; z-index:9999; pointer-events:none; top:0; left:0; width:100vw; height:100vh;";
    
    const lain = document.createElement('img');
    lain.style = "position:absolute; width:100px; pointer-events:auto; cursor:grab; transition: filter 0.2s; object-fit: contain;";
    const bubble = document.createElement('div');
    bubble.style = "position:absolute; background:white; border:2px solid black; padding:8px; border-radius:10px; font-family:monospace; font-size:12px; opacity:0; transition: opacity 0.5s; width:150px; text-align:center; z-index:10000; pointer-events:none;";
    const expression = document.createElement('img');
    expression.style = "position:absolute; width:50px; opacity:0; transition: opacity 0.3s; z-index:10001; pointer-events:none;";

    document.body.appendChild(container);
    container.appendChild(lain);
    container.appendChild(bubble);
    container.appendChild(expression);

    function updatePhysics() {
        if (state.isDragging) return;
        const normalSize = 100;
        const eventSize = 200; 
        const currentSize = state.eventActive ? eventSize : normalSize;
        const rightEdge = window.innerWidth - currentSize;
        const bottomEdge = window.innerHeight - currentSize;

        if (naviItem && naviLanded) {
            state.targetX = parseFloat(naviItem.style.left);
            state.targetY = parseFloat(naviItem.style.top);
            state.mode = 'walk';
            const dx = (state.x + normalSize/2) - (state.targetX + 60);
            const dy = (state.y + normalSize/2) - (state.targetY + 60);
            if (Math.sqrt(dx*dx + dy*dy) < 30) {
                naviItem.remove(); naviItem = null; naviLanded = false;
                triggerSugarRush();
                showDialogue("NAVI COLLECTED.");
            }
        }

        if (state.eventActive) {
            state.x += ( (window.innerWidth/2 - eventSize/2) - state.x) * 0.1;
            state.y += ( (window.innerHeight/2 - eventSize/2) - state.y) * 0.1;
        } else if (state.sugarRush) {
            state.x += state.vx * 4; state.y += state.vy * 4;
            if (state.x <= 0 || state.x >= rightEdge) state.vx *= -1;
            if (state.y <= 0 || state.y >= bottomEdge) state.vy *= -1;
            state.x = Math.max(0, Math.min(state.x, rightEdge));
            state.y = Math.max(0, Math.min(state.y, bottomEdge));
        } else if (state.mode === 'walk') {
            const dx = state.targetX - state.x;
            const dy = state.targetY - state.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                state.vx = (dx / dist) * 4;
                state.vy = (dy / dist) * 4;
                state.x += state.vx; state.y += state.vy;
            } else { state.mode = 'idle'; }
        } else {
            if (Math.random() < 0.01) {
                state.targetX = Math.random() * (window.innerWidth - normalSize);
                state.targetY = Math.random() * (window.innerHeight - normalSize);
                state.mode = 'walk';
            }
        }
        draw();
    }

    function draw() {
        const size = state.eventActive ? 200 : 100;
        lain.style.width = `${size}px`;
        lain.style.left = `${state.x}px`;
        lain.style.top = `${state.y}px`;
        bubble.style.left = `${state.x + (size/2) - 75}px`;
        bubble.style.top = `${state.y - 50}px`;
        expression.style.left = `${state.x + (size/2) - 25}px`;
        expression.style.top = `${state.y - 40}px`;

        if (!state.eventActive) {
            let newSrc = state.mode === 'walk' ? (state.vx >= 0 ? assets[state.outfit].right : assets[state.outfit].left) : assets[state.outfit].idle;
            if (lain.src !== newSrc) lain.src = newSrc;
        }
        lain.style.filter = state.sugarRush ? `hue-rotate(${Date.now() % 360}deg) brightness(1.2)` : '';
    }

    function triggerExpression() {
        if (state.eventActive) return;
        expression.src = state.outfit === 'bear' ? assets.misc.exp2 : assets.misc.exp1;
        expression.style.opacity = 1;
        setTimeout(() => { expression.style.opacity = 0; }, 3000);
    }

    function triggerSpecialEvent(type) {
        if (state.eventActive) return;
        state.eventActive = true;
        const eventType = type || state.outfit;
        if (assets[eventType]?.event) {
            lain.src = assets[eventType].event;
            const duration = eventType === 'bear' ? 8000 : (eventType === 'school' ? 3000 : 10000);
            setTimeout(() => { state.eventActive = false; state.mode = 'idle'; }, duration);
        } else { state.eventActive = false; }
    }

    function spawnMisc(type) {
        const item = document.createElement('img');
        item.src = assets.misc[type];
        const size = type === 'crow' ? 120 : 100;
        item.style = `position:fixed; width:${size}px; z-index:9998; pointer-events:none; transition: left 8s linear; top: ${Math.random() * (window.innerHeight - size)}px;`;
        const startX = Math.random() < 0.5 ? -size : window.innerWidth + size;
        item.style.left = `${startX}px`;
        const movingRight = startX < 0;
        item.style.transform = (type === 'crow') ? (movingRight ? 'scaleX(1)' : 'scaleX(-1)') : (movingRight ? 'scaleX(-1)' : 'scaleX(1)');
        document.body.appendChild(item);
        setTimeout(() => { item.style.left = `${movingRight ? window.innerWidth + size : -size}px`; }, 100);
        setTimeout(() => item.remove(), 9000);
    }

    function dropNavi() {
        if (naviItem) return;
        const navi = document.createElement('img');
        navi.src = assets.misc.navi[Math.floor(Math.random()*3)];
        navi.style = `position:fixed; width:120px; z-index:9997; pointer-events:none; transition: top 6s linear; top:-150px;`;
        navi.style.left = `${Math.random() * (window.innerWidth - 120)}px`;
        document.body.appendChild(navi);
        naviItem = navi; naviLanded = false;
        setTimeout(() => { navi.style.top = `${window.innerHeight - 150}px`; }, 100);
        setTimeout(() => { naviLanded = true; }, 6000);
        setTimeout(() => { if (naviItem === navi) { navi.remove(); naviItem = null; naviLanded = false; } }, 15000);
    }

    function triggerSugarRush() {
        state.sugarRush = true;
        state.vx = 10 * (Math.random() > 0.5 ? 1 : -1);
        state.vy = 10 * (Math.random() > 0.5 ? 1 : -1);
        setTimeout(() => state.sugarRush = false, 5000);
    }

    function showDialogue(t) {
        bubble.innerText = t || dialogues[Math.floor(Math.random()*dialogues.length)];
        bubble.style.opacity = 1;
        setTimeout(() => bubble.style.opacity = 0, 4000);
    }

    setInterval(updatePhysics, 30);
    setInterval(() => {
        if (Math.random() < 0.2) showDialogue();
        if (Math.random() < 0.2) triggerExpression();
        if (Math.random() < 0.1) spawnMisc(Math.random() < 0.5 ? 'crow' : 'girl');
        if (Math.random() < 0.05) dropNavi();
    }, 15000);
    
    lain.onmousedown = (e) => {
        state.isDragging = true;
        window.onmousemove = (ev) => {
            state.x = ev.clientX - 50; state.y = ev.clientY - 50;
            draw();
        };
        window.onmouseup = () => { state.isDragging = false; window.onmousemove = null; };
    };

    window.Lain = {
        forceRoll: () => triggerSpecialEvent('bear'),
        forceBurn: () => triggerSpecialEvent('school'),
        forceDance: () => triggerSpecialEvent('pink'),
        dropNavi: () => dropNavi(),
        sugarRush: () => triggerSugarRush(),
        setOutfit: (o) => { if(assets[o]) state.outfit = o; },
        spawnCrow: () => spawnMisc('crow'),
        spawnGirl: () => spawnMisc('girl'),
        speak: (t) => showDialogue(t),
        express: () => triggerExpression()
    };

    setInterval(() => {
        const outfits = ['default', 'school', 'pink', 'bear', 'home'];
        const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
        window.Lain.setOutfit(randomOutfit);
        
        if (Math.random() < 0.40) {
            triggerSpecialEvent();
        }
    }, 60000);

    console.log("%c Lain Pet by realmxrza ", "background: #000; color: #f0f; font-weight: bold; font-size: 14px;");
};

if (document.readyState === "complete") {
    initLainPet();
} else {
    window.addEventListener("load", initLainPet);
}
