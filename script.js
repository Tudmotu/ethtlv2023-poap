const apiResponse = await fetch('https://b3tzzxzusi.execute-api.eu-central-1.amazonaws.com/default/ethtlv2023-poap');
const leaderboard = await apiResponse.json();
const main = document.querySelector('main');
const header = document.querySelector('header');
const table = document.getElementById('leaderboard');
const gallery = document.getElementById('gallery');

function createRow (entry) {
    const { address, poaps } = entry;
    let label;
    if (window.innerWidth > 800 || address.length < 20) label = address;
    else {
        label = `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
    }
    const html = `
        <span data-address>${label}</span>
        <span data-poaps>${poaps.map(poap => {
            return `<span><img src="./poaps/${poap}.png" /></span>`;
        }).join('')}</span>
    `;

    const el = document.createElement('div');
    el.innerHTML = html;
    el.classList.add('row', 'handwriting', 'dbl-border');

    return el;
}

for (let entry of leaderboard) {
    table.appendChild(createRow(entry))
}

table.addEventListener('click', e => {
    const poapsContainer = e.target.closest('[data-poaps]');

    if (poapsContainer) {
        const topbar = document.createElement('div');
        topbar.dataset.topbar = '';
        topbar.classList.add('handwriting');
        const address = poapsContainer.parentNode.querySelector('[data-address]').textContent;
        topbar.innerHTML = `
            <span>${address}</span>
            <button data-close class="handwriting">X</button>
        `;

        const imagesContainer = document.createElement('div');
        imagesContainer.dataset.images = '';

        const images = Array.from(poapsContainer.querySelectorAll('img'));
        for (let img of images) {
            imagesContainer.appendChild(img.cloneNode());
        }
        gallery.replaceChildren(topbar, imagesContainer);
        gallery.classList.remove('hidden');
        main.classList.add('hidden');
        header.classList.add('hidden');

        topbar.querySelector('[data-close]').addEventListener('click', () => {
            gallery.classList.add('hidden');
            main.classList.remove('hidden');
            header.classList.remove('hidden');
        });
    }
});
