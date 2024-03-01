
function showOptionsBox() {
    document.querySelector('#optionsBox').style.display = 'grid';
    document.querySelector('#attacksBox').style.display = 'none';
    document.querySelector('#attackType').style.display = 'none';
    document.querySelector('#switchBox').style.display = 'none';
    document.querySelector('#dialogueBox').style.display = 'none';
}

function showIdlePokemon() {
    document.querySelector('#optionsBox').style.display = 'none';
    document.querySelector('#attacksBox').style.display = 'none';
    document.querySelector('#attackType').style.display = 'none';
    document.querySelector('#switchBox').style.display = 'grid';
    document.querySelector('#dialogueBox').style.display = 'none';
}

function showDialogue() {
    document.querySelector('#optionsBox').style.display = 'none';
    document.querySelector('#attacksBox').style.display = 'none';
    document.querySelector('#attackType').style.display = 'none';
    document.querySelector('#switchBox').style.display = 'none';
    document.querySelector('#dialogueBox').style.display = 'block';
}

function showAttacks() {
    document.querySelector('#optionsBox').style.display = 'none';
    document.querySelector('#attacksBox').style.display = 'grid';
    document.querySelector('#attackType').style.display = 'flex';
    document.querySelector('#switchBox').style.display = 'none';
    document.querySelector('#dialogueBox').style.display = 'none';
}

options = [
    { name: "Attack" },
    { name: "Run" },
    { name: "Switch pokemon" },
    { name: "Nothing" },
]

function createOptionButtons(battle) {
    document.querySelector('#optionsBox').replaceChildren();
    document.querySelector('#attacksBox').replaceChildren();
    // choose a move
    const attackButton = document.createElement('button');
    attackButton.innerHTML = options[0].name;
    attackButton.addEventListener('click', () => {
        showAttacks();
    })
    document.querySelector('#optionsBox').append(attackButton);

    battle.playerMonster.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        button.classList.add('attacks');
        document.querySelector('#attacksBox').append(button);
    });

    // choose which pokemon to switch
    const switchButton = document.createElement('button');
    switchButton.innerHTML = options[2].name;
    switchButton.addEventListener('click', () => {
        const index = battle.idleMonsters.findIndex(monster => monster.health > 0);
        if (index !== -1) {
            showIdlePokemon();
        } else {
            document.querySelector('#dialogueBox').innerHTML = 'No pokemon left';
            showDialogue();
        }
    })
    document.querySelector('#optionsBox').append(switchButton);

    // choose to leave the battle
    const runButton = document.createElement('button');
    runButton.innerHTML = options[1].name;
    runButton.addEventListener('click', (e) => {
        game.globalPlayerMonsters = [battle.playerMonster, ...battle.idleMonsters];
        cancelAnimationFrame(battleAnimationId);
        animate();
        document.querySelector('#userInterface').style.display = 'none';
        gsap.to('#overlappingDiv', {
            opacity: 0
        });
        game.battleInitiated = false;
        audio.battle.stop();
        audio.map.play();
    })
    document.querySelector('#optionsBox').append(runButton);
}

function endBattle() {
    gsap.to('#overlappingDiv', {
        opacity: 1,
        onCopmlete: () => {
            cancelAnimationFrame(battleAnimationId);
            animate();
            document.querySelector('#userInterface').style.display = 'none';
            gsap.to('#overlappingDiv', {
                opacity: 0
            });
            game.battleInitiated = false;
            audio.map.play();
            createMonsterInterface(game);
            const saveGame = game.globalPlayerMonsters.map(monster => {
                return {
                    name: monster.name,
                    level: monster.level,
                    health: monster.health,
                    exp: monster.exp
                };
            });
            localStorage.setItem('RPG_saveGame', JSON.stringify(saveGame));
        }
    });
}

function createAttackButtons(battle) {
    // eventlisteners for buttons (attack)
    document.querySelectorAll('button.attacks').forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            battle.playerMonster.attack({
                attack: selectedAttack,
                recipient: battle.enemyMonster,
                renderedSprites: battle.renderedSprites,
                game: game
            });

            if (battle.enemyMonster.health <= 0) {
                battle.queue.push(() => {
                    battle.enemyMonster.faint();
                });
                battle.queue.push(() => {
                    battle.queue = [];
                    battle.playerMonster.exp += battle.enemyMonster.level;
                    if (battle.playerMonster.exp >= battle.playerMonster.level) {
                        battle.playerMonster.exp = battle.playerMonster.exp % battle.playerMonster.level;
                        battle.playerMonster.level++;
                    }
                    game.globalPlayerMonsters = [battle.playerMonster, ...battle.idleMonsters];
                    endBattle();
                });
                return;
            }
            const randomAttack = battle.enemyMonster.attacks[Math.floor(Math.random() * battle.enemyMonster.attacks.length)];

            battle.queue.push(() => {
                battle.enemyMonster.attack({
                    attack: randomAttack,
                    recipient: battle.playerMonster,
                    renderedSprites: battle.renderedSprites,
                    game: game
                });

                if (battle.playerMonster.health <= 0) {
                    battle.queue.push(() => {
                        battle.playerMonster.faint();
                    });
                    const index = battle.idleMonsters.findIndex(monster => monster.health > 0);
                    if (index !== -1) {
                        battle.queue.push(() => {
                            battle.createIdleList();
                            showIdlePokemon();
                        });
                    } else {
                        battle.queue.push(() => {
                            battle.queue = [];
                            game.healMonsters();
                            endBattle();
                        });
                    }
                }
            })

        });
        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#attackType').innerHTML = selectedAttack.type;
            document.querySelector('#attackType').style.color = selectedAttack.color;
        })
    });
}

function createMonsterInterface(game) {
    const monsterListDiv = document.getElementById('monsterList');
    monsterListDiv.replaceChildren();

    const nameDiv = document.createElement('div')
    nameDiv.textContent = 'NAME';
    monsterListDiv.appendChild(nameDiv);

    const hpDiv = document.createElement('div')
    hpDiv.textContent = 'HP';
    monsterListDiv.appendChild(hpDiv);

    const levelDiv = document.createElement('div')
    levelDiv.textContent = 'LVL';
    monsterListDiv.appendChild(levelDiv);

    const expDiv = document.createElement('div')
    expDiv.textContent = 'EXP';
    monsterListDiv.appendChild(expDiv);

    game.globalPlayerMonsters.forEach(monster => {
        const monsterNameDiv = document.createElement('div');
        const monsterHealthDiv = document.createElement('div');
        const monsterLevelDiv = document.createElement('div');
        const monsterExpDiv = document.createElement('div');

        monsterNameDiv.textContent = monster.name;
        monsterHealthDiv.textContent = monster.health + "/100";
        monsterLevelDiv.textContent = monster.level;
        monsterExpDiv.textContent = monster.exp + "/" + monster.level;

        monsterListDiv.appendChild(monsterNameDiv);
        monsterListDiv.appendChild(monsterHealthDiv);
        monsterListDiv.appendChild(monsterLevelDiv);
        monsterListDiv.appendChild(monsterExpDiv);
    });
}

document.querySelector('#worldDialogueBox').addEventListener('click', (e) => {
        e.currentTarget.style.display = 'none';
});