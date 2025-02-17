import { lobbyScoreBoard, lobbiesCreated, getTimestamp, iteration } from "./scoreboard.js"

let users = [];
let users_details = [];
async function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}


const searchInput = document.querySelector("[data-search]");
const userCardTemplate = document.querySelector("[data-user-template]")

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


readTextFile("./lobbies.json", async function (json) {
    var data = JSON.parse(json);
    // let lobbies = await lobbiesCreated()

    let lobbies = await lobbiesCreated()

    for (var i = 0; i < lobbies.length; i++) {
        data.push(lobbies[i])
    }

    data.sort(function (a, b) {
        return a.blocknumber - b.blocknumber;
    });

    users = data.map(user => {
        const card = userCardTemplate.content.cloneNode(true).children[0];
        card.querySelector(".card-name").textContent = user.name;
        card.querySelector(".card-address").textContent = `Lobby: ${user.address}`;
        card.querySelector(".card-owner").textContent = `Owner: ${user.owner}`;
        card.querySelector(".card-details").id = user.id;
        card.querySelector(".card-name").classList.add("arena")
        card.querySelector(".card-join").href = `https://arena.dfdao.xyz/play/${user.address}`;
        card.querySelector(".card-spectate").href = `https://arena.dfdao.xyz/play/${user.address}`;
        document.querySelector(".cards").append(card);
        return {
            id: user.id,
            name: user.name,
            address: user.address,
            element: card
        }
    })

    users_details = data.map(user_detail => {
        const detailing = document.querySelector("[details-template]").content.cloneNode(true).children[0];
        detailing.querySelector(".lobby-name").textContent = user_detail.name;
        detailing.querySelector(".lobby-address").textContent = `Lobby: ${user_detail.address}`;
        detailing.querySelector(".lobby-owner").textContent = `Owner: ${user_detail.owner}`;
        detailing.querySelector(".details").id = user_detail.id;
        detailing.querySelector(".lobby-tbody").id = user_detail.id;
        document.querySelector(".detail-boxes").append(detailing);
        return {
            id: user_detail.id,
            name: user_detail.name,
            address: user_detail.address,
            blocknumber: user_detail.blocknumber,
            element: detailing
        }

    })

    searchInput.addEventListener("input", async e => {
        const value = e.target.value.toLowerCase();
        users.forEach(user => {
            const isVisible = user.name.toLowerCase().includes(value) || user.address.toLowerCase().includes(value);
            user.element.classList.toggle("hide", !isVisible);

        })

    })
    async function buildTable(data, tableClass) {

        tableClass.innerHTML = ""
        for (var i = 0; i < data.length; i++) {
            var row = `<tr>
                <td>${i + 1}</td>
                <td data-label="Member" style="font-size: 11px">${data[i].address}</td>
                <td data-label="Score">${numberWithCommas(data[i].score)}</td>
          </tr>`
            tableClass.innerHTML += row
        }
    };

    let cardDetails = document.querySelectorAll('.card-details');
    let details = document.querySelectorAll('.details-box');

    details.forEach(y => {
        y.classList.toggle("hide")
    })
    cardDetails.forEach(x => {
        x.addEventListener('click', () => {
            const value = x.id
            users_details.forEach(async a => {
                const isVisible = a.id == value;
                a.element.classList.toggle('hide', !isVisible);
            })
        });

    })
    cardDetails.forEach(x => {
        x.addEventListener('click', () => {
            const value = x.id
            users_details.forEach(async a => {
                if (a.id == value) {
                    a.element.querySelector(".lobby-tbody").innerHTML = `<tr><td>Loading...</td><td>Loading...</td><td>Loading...<td><tr>`
                    buildTable(await lobbyScoreBoard(a.address), a.element.querySelector('.lobby-tbody'));
                    a.element.querySelector(".lobby-time").textContent = await getTimestamp(a.blocknumber)
                }
            })
        }, { once: true });

    })
})