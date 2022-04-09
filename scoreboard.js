import { ethers } from 'https://cdn.skypack.dev/ethers';
import DarkForestABI from './abi.js';

export async function lobbyScoreBoard(address) {


    const lobbyAddress = address
    const rpcEndpoint = "https://rpc.xdaichain.com/";
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const darkforest = new ethers.Contract(lobbyAddress, DarkForestABI, provider);

    let player_numbers = await darkforest.getNPlayers().then(async count => {
        return count.toNumber()
    })

    let scoreboard = await darkforest.bulkGetPlayers(0, player_numbers).then(async count => {
        let a = []
        for (let i = 0; i < count.length; i++) {
            a.push({ "address": `${count[i].player}`, "score": count[i].score.toNumber() })
        }

        a.sort(function(a, b) {
            return b.score - a.score
        });
        return a
    })
    return scoreboard
}

export async function lobbiesCreated() {


    const rpcEndpoint = "https://rpc.xdaichain.com/";
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const arenasContract = new ethers.Contract("0x688c78df6b8b64be16a7702df10ad64100079a68", DarkForestABI, provider);
    const contract = new ethers.Contract("0x5da117b8ab8b739346f5edc166789e5afb1a7145", DarkForestABI, provider);

    let arenas = [];

    let ArenaEventsFilter = await arenasContract.filters.LobbyCreated();
    let arenaEvents = await arenasContract.queryFilter(ArenaEventsFilter);

    let defaultEventsFilter = await contract.filters.LobbyCreated();
    let defaultEvents = await contract.queryFilter(defaultEventsFilter);

    let events = arenaEvents.concat(defaultEvents);
    let arenaCounter = 1;
    let defaultCounter = 1;
    events.forEach((i) => {
        if (i.address.toLowerCase() === "0x688c78df6b8b64be16a7702df10ad64100079a68") {
            arenas.push({ "og": i.address, "id": events.indexOf(i) + 2, "name": `arena ${arenaCounter} `, "address": i.args.lobbyAddress, "blocknumber": i.blockNumber, "owner": i.args.ownerAddress })
            arenaCounter++;
        } else {
            arenas.push({ "og": i.address, "id": events.indexOf(i) + 2, "name": `game ${defaultCounter} `, "address": i.args.lobbyAddress, "blocknumber": i.blockNumber, "owner": i.args.ownerAddress })
            defaultCounter++;
        }
    })
    return arenas
}

export async function getTimestamp(blocknumber) {

    const rpcEndpoint = "https://rpc.xdaichain.com/";
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);

    const timestamp = await provider.getBlock(blocknumber);
    let date = new Date(timestamp.timestamp * 1000);

    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let stringdate = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear() + " " + date.getHours() + "h " + date.getMinutes() + "m " + date.getSeconds() + "s";
    return stringdate;
}