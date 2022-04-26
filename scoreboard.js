import { ethers } from 'https://cdn.skypack.dev/ethers';
import DarkForestABI from './abi.js';

export async function lobbyScoreBoard(address) {

    //  ______     ______     ______     ______     ______     ______     ______     ______     ______     _____    
    // /\  ___\   /\  ___\   /\  __ \   /\  == \   /\  ___\   /\  == \   /\  __ \   /\  __ \   /\  == \   /\  __-.  
    // \ \___  \  \ \ \____  \ \ \/\ \  \ \  __<   \ \  __\   \ \  __<   \ \ \/\ \  \ \  __ \  \ \  __<   \ \ \/\ \ 
    //  \/\_____\  \ \_____\  \ \_____\  \ \_\ \_\  \ \_____\  \ \_____\  \ \_____\  \ \_\ \_\  \ \_\ \_\  \ \____- 
    //   \/_____/   \/_____/   \/_____/   \/_/ /_/   \/_____/   \/_____/   \/_____/   \/_/\/_/   \/_/ /_/   \/____/ 

    // Thanks to Harryhare from the darkforest discord who made this function and I copypasted from his plugin heheh <3

    // Function that returns the scoreboard from a specified lobby

    const lobbyAddress = address
    const rpcEndpoint = "https://xdai-rpc.gateway.pokt.network";
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

    const rpcEndpoint = "https://xdai-rpc.gateway.pokt.network";
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

    //  ______   __     __    __     ______     ______     ______   ______     __    __     ______  
    // /\__  _\ /\ \   /\ "-./  \   /\  ___\   /\  ___\   /\__  _\ /\  __ \   /\ "-./  \   /\  == \ 
    // \/_/\ \/ \ \ \  \ \ \-./\ \  \ \  __\   \ \___  \  \/_/\ \/ \ \  __ \  \ \ \-./\ \  \ \  _-/ 
    //    \ \_\  \ \_\  \ \_\ \ \_\  \ \_____\  \/\_____\    \ \_\  \ \_\ \_\  \ \_\ \ \_\  \ \_\   
    //     \/_/   \/_/   \/_/  \/_/   \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/  \/_/   \/_/  

    // Function that returns a string with the time that the blocknumber that you gave as a parameter was

    const rpcEndpoint = "https://xdai-rpc.gateway.pokt.network";
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);

    const timestamp = await provider.getBlock(blocknumber);
    let date = new Date(timestamp.timestamp * 1000);

    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let stringdate = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear() + " " + date.getHours() + "h " + date.getMinutes() + "m " + date.getSeconds() + "s";
    return stringdate;
}


export async function iteration(address) {

    //  __     ______   ______     ______     ______     ______   __     ______     __   __    
    // /\ \   /\__  _\ /\  ___\   /\  == \   /\  __ \   /\__  _\ /\ \   /\  __ \   /\ "-.\ \   
    // \ \ \  \/_/\ \/ \ \  __\   \ \  __<   \ \  __ \  \/_/\ \/ \ \ \  \ \ \/\ \  \ \ \-.  \  
    //  \ \_\    \ \_\  \ \_____\  \ \_\ \_\  \ \_\ \_\    \ \_\  \ \_\  \ \_____\  \ \_\\"\_\ 
    //   \/_/     \/_/   \/_____/   \/_/ /_/   \/_/\/_/     \/_/   \/_/   \/_____/   \/_/ \/_/

    // Thanks to Janikks / Berthold from the dfdao discord for helping with this function

    // Function that returns all the descendants lobbies of a specified lobby, useful for tracking all the lobbies made with the same diamond pattern.

    const rpcEndpoint = "https://xdai-rpc.gateway.pokt.network";

    const lobbies = []
    const remainingAddresses = [address]

    while (remainingAddresses.length > 0) {
        const address = remainingAddresses.pop()

        // check current address
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
        const contract = new ethers.Contract(address, DarkForestABI, provider);
        const eventsFilter = await contract.filters.LobbyCreated();
        const events = await contract.queryFilter(eventsFilter);

        // add all events (as address) of current address
        lobbies.push(...events)

        // check each event address for children
        const childrenLobbies = (await Promise.all(events.map(async e => {
            const LobbyContract = new ethers.Contract(e.args.lobbyAddress, DarkForestABI, provider);
            const lobbyEvent = await LobbyContract.filters.LobbyCreated();
            const allLobbyEventsFromThisContract = await LobbyContract.queryFilter(lobbyEvent);

            if (allLobbyEventsFromThisContract.length === 0) {
                console.log(`This contract doesn't have any children - contract number ${lobbies.indexOf(e)}`)
                return null;
            }

            console.log(`This contract has children - contract number ${lobbies.indexOf(e)}`)
            console.log(allLobbyEventsFromThisContract)
            return e.args.lobbyAddress
        }))).filter(Boolean)
        remainingAddresses.push(...childrenLobbies)
    }

    let gameCounter = 1;
    let games = []
    for (let i = 0; i < lobbies.length; i++) {
        games.push({ "og": lobbies[i].address, "id": i + 2, "name": `game ${gameCounter} `, "address": lobbies[i].args.lobbyAddress, "blocknumber": lobbies[i].blockNumber, "owner": lobbies[i].args.ownerAddress })
        gameCounter++;
    }
    return games
}