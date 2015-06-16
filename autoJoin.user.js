// ==UserScript==
// @name         Steam AutoJoin
// @namespace    https://github.com/waterfoul/SteamMonsterGameAutoJoin
// @version      0.1
// @description  Autojoins into a game based on ulletical's steam chat
// @author       waterfoul
// @match        http://steamcommunity.com/minigame/
// @match        http://www.twitch.tv/ulletical/chat
// @grant        GM_addValueChangeListener
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

if(window.location.href == "http://steamcommunity.com/minigame/") {
    var validGame = false;
    var steamIds = [];
    var wait = true;
    function checkGame(){
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://steamcommunity.com/minigame/",
            onload: function(response) {
                validGame = response.responseText.indexOf('Resume Your Game') != -1;
                if(validGame && !wait)
                    document.location.href = 'http://steamcommunity.com/minigame/towerattack/';
            }
        });
    }
    setInterval(function() {
        var checkGameLoop = false;
        if(!validGame)
            steamIds.forEach(function(runCount, steamId){
                if(runCount < 100) {
                    JoinGame(steamId);
                    checkGameLoop = true;
                }
                steamIds[steamId]++;
            });
        if(checkGameLoop) {
            checkGame();
        }
        // Reset the valid count from reset to 2 hrs later
        var now = new Date();
        if(now.getUTCHours() >= 14 && now.getUTCHours() <= 16) {
            validGame = false;
        }
    }, 5000);
    GM_addValueChangeListener("Steam Auto Join", function(name, old_value, new_value, from_remote) {
        console.log('Recieved ' + new_value.id);
        steamId = new_value.id;
    });
} else {
    GM_setValue("Steam Auto Join", { what_ever_needs: 'to_be_synced_to_all_script_instances' });
    
    function loadObserver() {
        var validGame = false;
        var observer = new MutationObserver(function(mutations)
        {
            mutations.forEach(function(mutation) {
                if(mutation.target.className == 'chat-lines') {
                    var lis = mutation.target.getElementsByTagName("li");
                    var lastLi = lis[lis.length - 1];
                    //Make sure we only listen to moderators
                    if(lastLi.getElementsByClassName('moderator').length > 0)
                    {
                        var chatText = lastLi.innerText;
                        console.log(chatText);
                        var joinIdx = chatText.toLowerCase().indexOf("joingame");
                        if(joinIdx != -1)
                        {
                            lParen = chatText.indexOf("(", joinIdx);
                            rParen = chatText.indexOf(")", lParen);
                            GM_setValue("Steam Auto Join", { id: chatText.substring(lParen + 1, rParen) });
                        }
                    }
                }
            });
        });
        observer.observe(document.getElementsByClassName("chat-room")[0], {subtree: true, childList: true});
    }
    window.addEventListener('load', loadObserver);
}
