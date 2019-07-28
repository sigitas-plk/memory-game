import './../css/style.css';

const cards = [{
        'name': 'camera',
        'img': 'img/asset_camera.png',
    },
    {
        'name': 'gamepad',
        'img': 'img/asset_gamepad.png',
    },
    {
        'name': 'glasses',
        'img': 'img/asset_glasses.png',
    },
    {
        'name': 'headphones',
        'img': 'img/asset_headphones.png',
    },
    {
        'name': 'joystick',
        'img': 'img/asset_joystick.png',
    },
    {
        'name': 'keyboard',
        'img': 'img/asset_keyboard.png',
    },
    {
        'name': 'monitor',
        'img': 'img/asset_monitor.png',
    },
    {
        'name': 'mouse',
        'img': 'img/asset_mouse.png',
    },
    {
        'name': 'notebook',
        'img': 'img/asset_notebook.png',
    },
    {
        'name': 'phone',
        'img': 'img/asset_phone.png',
    },
    {
        'name': 'speaker',
        'img': 'img/asset_speaker.png',
    },
    {
        'name': 'usb',
        'img': 'img/asset_usb.png',
    },
];

let count = 0;
let firstGuess = '';
let secondGuess = '';
let previousTarget = null;
const delay = 1200;

const game = document.getElementById('game');
const grid = document.createElement('section');
grid.setAttribute('class', 'grid');
game.appendChild(grid);


[...cards, ...cards] //duplicate array
.sort(() => 0.5 - Math.random()) //randomise it
    .forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.dataset.name = card.name;

        const front = document.createElement('div');
        front.classList.add('front');

        const back = document.createElement('div');
        back.classList.add('back');
        back.style.backgroundImage = `url(${card.img})`;

        cardEl.appendChild(front);
        cardEl.appendChild(back);
        grid.appendChild(cardEl);
    });

grid.addEventListener('click', event => {

    const clicked = event.target;
    if (clicked.nodeName === 'SECTION' || clicked.parentNode === previousTarget || clicked.parentNode.classList.contains('selected') || clicked.parentNode.classList.contains('match')) {
        return;
    }


    if (count < 2) {
        count++;
        if (count === 1) {
            firstGuess = clicked.parentNode.dataset.name;
            clicked.parentNode.classList.add('selected');
        } else {
            secondGuess = clicked.parentNode.dataset.name;
            clicked.parentNode.classList.add('selected');
        }
        if (firstGuess !== '' && secondGuess !== '') {
            if (firstGuess == secondGuess) {
                setTimeout(match, delay);
                setTimeout(resetGuesses, delay);
            } else {
                setTimeout(resetGuesses, delay);
            }
        }
        previousTarget = clicked.parentNode;
    }
});

function match() {
    const selected = document.querySelectorAll('.selected');
    selected.forEach(card => {
        card.classList.add('match');
    })
}

function resetGuesses() {
    firstGuess = '';
    secondGuess = '';
    count = 0;
    previousTarget = null;
    let selected = document.querySelectorAll('.selected');
    selected.forEach(card => {
        card.classList.remove('selected');
    });
}


function test(num = 0) {
    const x = document.getElementsByClassName('card');
    x[num].classList.add('selected');
    x[num + 1].classList.add('selected');
    setTimeout(() => {
        x[num].classList.add('match');
        x[num + 1].classList.add('match');
    }, 500);

}