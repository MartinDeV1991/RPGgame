
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