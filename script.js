import { eventDates, eventLinks } from './eventDates.js';

const apiResponse = await fetch('https://b3tzzxzusi.execute-api.eu-central-1.amazonaws.com/default/ethtlv2023-poap');
const leaderboard = await apiResponse.json();
const main = document.querySelector('main');
const header = document.querySelector('header');
const table = document.getElementById('leaderboard');
const gallery = document.getElementById('gallery');

function renderPoapIcons (poaps, label = '') {
    return `
        <span data-poaps class="poaps-list">
            ${poaps.map(poap => {
                return `<span class="poap-icon"><img src="./poaps/${poap}.png" data-label="${label}" data-eid="${poap}" alt="logo for poap id ${poap}" /></span>`;
            }).join('')}
        </span>
    `;
}

function createRow (entry) {
    const { address, poaps } = entry;
    let label;
    if (window.innerWidth > 800 || address.length < 20) label = address;
    else {
        label = `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
    }
    const html = `
        <span data-address>${label}</span>
        ${renderPoapIcons(poaps, label)}
    `;

    const el = document.createElement('div');
    el.innerHTML = html;
    el.classList.add('row', 'handwriting', 'dbl-border');

    return el;
}

if (leaderboard.length === 0) {
    table.innerHTML = 'No results';
}
else {
    table.innerHTML = '';

    for (let entry of leaderboard) {
        table.appendChild(createRow(entry))
    }
}

function onPoapsClick (e, href = () => '', title = false) {
    const poapsContainer = e.target.closest('[data-poaps]');

    if (poapsContainer) {
        const images = Array.from(poapsContainer.querySelectorAll('img'));
        const topbar = document.createElement('div');
        topbar.dataset.topbar = '';
        topbar.classList.add('handwriting');
        if (title === false) {
            title = poapsContainer.parentNode.querySelector('[data-address]').textContent;
        }
        topbar.innerHTML = `
            <span>${title}</span>
            <button data-close class="handwriting">X</button>
        `;

        const imagesContainer = document.createElement('div');
        imagesContainer.dataset.images = '';

        for (let img of images) {
            img = img.cloneNode();
            const { eid: poapId, label } = img.dataset;
            const a = document.createElement('a');
            a.target = '_blank';
            a.href = href(label, poapId);
            a.appendChild(img);
            imagesContainer.appendChild(a);
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
}

table.addEventListener('click', e => {
    onPoapsClick(e, (user, poapId) => {
        return `https://welook.io/${user}/poap/${poapId}`;
    });
});

const now = new Date();
now.setHours(0, 0, 0, 0);
const today = now.getTime();

const groupedEvents = Object.entries(Object.entries(eventDates).reduce((result, curr) => {
    const [ eventId, timestamp ] = curr;
    result[timestamp] = result[timestamp] ?? [];
    result[timestamp].push(eventId);
    return result;
}, {})).sort((a, b) => a[0] - b[0]).map(entry => [parseInt(entry[0], 10), entry[1]]);

const DAY = 86400;
const timeline = document.querySelector('[data-timeline]');

document.getElementById('timeline').addEventListener('click', e => {
    onPoapsClick(e, (user, poapId) => {
        return eventLinks[poapId];
    }, e.target.closest('[data-timepoint]').querySelector('[data-date]').textContent);
});

const earliestPoint = Math.min(today, groupedEvents[0][0]);
const latestPoint = groupedEvents[groupedEvents.length - 1][0];
const timespan = latestPoint - earliestPoint;
const timespanInDays = (timespan / 1000) / DAY;
const DAY_WIDTH = 200;
timeline.style.width = `calc(50% + ${DAY_WIDTH * timespanInDays}px)`;
timeline.parentNode.scrollLeft = Math.max((today - earliestPoint) / 1000 / DAY, 0) * DAY_WIDTH;

for (let timepoint of groupedEvents) {
    const [ timestamp, events ] = timepoint;
    let date;
    const el = document.createElement('div');
    if (timestamp !== today) {
        el.dataset.nottoday = '';
        date = new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    else {
        date = 'Today';
    }

    el.dataset.timepoint = '';
    el.innerHTML = `
    <div>${renderPoapIcons(events)}</div>
    <div data-date>${date}</div>
    `;
    el.style.left = (((timestamp - earliestPoint) / 1000) / DAY) * DAY_WIDTH + 'px';
    timeline.appendChild(el);
}

for (let day = 0; day <= timespanInDays; day++) {
    const tick = document.createElement('span');
    tick.dataset.tick = '';
    tick.style.left = day * DAY_WIDTH + 'px';
    timeline.appendChild(tick);
}
