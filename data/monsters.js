
const monsters = {
    Emby2: {
        image: {
            src: './Images/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 30
        },
        animate: true,
        name: "Emby2",
        attacks: [attacks.Tackle, attacks.Fireball, attacks.Fireball2, attacks.Fireball3]
    },
    Emby: {
        image: {
            src: './Images/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 30
        },
        animate: true,
        name: "Emby",
        attacks: [attacks.Tackle, attacks.Fireball]
    },
    Draggle: {
        image: {
            src: './Images/draggleSprite.png'
        },
        frames: {
            max: 4,
            hold: 30
        },
        animate: true,
        name: "Draggle",
        attacks: [attacks.Tackle, attacks.Fireball]
    }
}