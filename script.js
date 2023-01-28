const apiResponse = await fetch('https://b3tzzxzusi.execute-api.eu-central-1.amazonaws.com/default/ethtlv2023-poap');
const leaderboard = await apiResponse.json();
const table = document.getElementById('leaderboard');

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
            return `<span><img src="./poaps/${poap}.gif" /></span>`;
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
