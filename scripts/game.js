class Game {
    constructor(canvas, c) {
        this.canvas = canvas;
        this.c = c;

        this.speed = 5;
        this.globalPlayerMonsters = [];

        this.collisionsMap = [];
        for (let i = 0; i < collisions.length; i += 70) {
            this.collisionsMap.push(collisions.slice(i, 70 + i));
        }

        this.battleZonesMap = [];
        for (let i = 0; i < battleZonesData.length; i += 70) {
            this.battleZonesMap.push(battleZonesData.slice(i, 70 + i));
        }

        this.healZonesMap = [];
        for (let i = 0; i < healZonesData.length; i += 70) {
            this.healZonesMap.push(healZonesData.slice(i, 70 + i));
        }


        this.boundaries = [];
        this.offset = {
            x: -735,
            y: -570
        }

        this.collisionsMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === 1025) {
                    this.boundaries.push(new Boundary({
                        position: {
                            x: j * Boundary.width + this.offset.x,
                            y: i * Boundary.height + this.offset.y,
                        }
                    })
                    )
                }
            })
        });

        this.battleZones = [];
        this.battleZonesMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === 1025) {
                    this.battleZones.push(new Boundary({
                        position: {
                            x: j * Boundary.width + this.offset.x,
                            y: i * Boundary.height + this.offset.y,
                        }
                    })
                    )
                }
            })
        })

        this.healZones = [];
        this.healZonesMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === 1) {
                    this.healZones.push(new Boundary({
                        position: {
                            x: j * Boundary.width + this.offset.x,
                            y: i * Boundary.height + this.offset.y,
                        }
                    })
                    )
                }
            })
        })

        this.c.fillStyle = 'white';
        this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.image = new Image();
        this.image.src = './Images/Pellet Town.png';

        this.foregroundImage = new Image();
        this.foregroundImage.src = './Images/foregroundObjects.png';

        this.playerUpImage = new Image();
        this.playerUpImage.src = './Images/playerUp.png';

        this.playerLeftImage = new Image();
        this.playerLeftImage.src = './Images/playerLeft.png';

        this.playerDownImage = new Image();
        this.playerDownImage.src = './Images/playerDown.png';

        this.playerRightImage = new Image();
        this.playerRightImage.src = './Images/playerRight.png';

        this.playerSpriteWidth = 192;
        this.playerSpriteHeight = 68;

        this.player = new Sprite({
            position: {
                x: this.canvas.width / 2 - this.playerSpriteWidth / 4 / 2,
                y: this.canvas.height / 2 - this.playerSpriteHeight / 2 + 50,
            },
            image: this.playerDownImage,
            frames: {
                max: 4,
                hold: 10
            },
            sprites: {
                up: this.playerUpImage,
                left: this.playerLeftImage,
                down: this.playerDownImage,
                right: this.playerRightImage
            },
            animate: false
        })

        this.background = new Sprite({ position: { x: this.offset.x, y: this.offset.y }, image: this.image });
        this.foreground = new Sprite({ position: { x: this.offset.x, y: this.offset.y }, image: this.foregroundImage });

        this.movables = [this.background, ...this.boundaries, this.foreground, ...this.battleZones, ...this.healZones];


        this.battleInitiated = false;
        this.createMonsters();
        createMonsterInterface(this);
    }

    rectangularCollision({ rectangle1, rectangle2 }) {
        return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x && rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.position.y + rectangle1.height >= rectangle2.position.y && rectangle1.position.y + rectangle1.height / 2 <= rectangle2.position.y + rectangle2.height)
    }

    createMonsters() {
        let monstersInMemory = JSON.parse(localStorage.getItem('RPG_saveGame'));
        if (monstersInMemory) {
            monstersInMemory.forEach(monster => {
                const monsterData = monsters[monster.name];
                const newMonster = new Monster(monsterData, { x: 280, y: 325 }, false);
                newMonster.level = monster.level;
                newMonster.health = monster.health;
                newMonster.exp = monster.exp;
                this.globalPlayerMonsters.push(newMonster);
            });
        } else {
            [monsters.Emby, monsters.Draggle, monsters.Emby2].forEach((monsterData) => {
                const newMonster = new Monster(monsterData, { x: 280, y: 325 }, false);
                this.globalPlayerMonsters.push(newMonster);
            });
        }
    }

    healMonsters() {
        this.globalPlayerMonsters.forEach((monster) => {
            monster.health = 100;
        });
    }
}