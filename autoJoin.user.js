// ==UserScript==
// @name         My Fancy New Userscript
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        http://steamcommunity.com/minigame/
// @match        http://www.twitch.tv/ulletical/chat
// @match        http://www.twitch.tv/waterfoul/chat
// @grant        GM_addValueChangeListener
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

if(window.location.href == "http://steamcommunity.com/minigame/") {
    var validGame = false;
    var steamId = false;
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
    function joinLoop() {
        if(steamId !== false && !validGame)
        {
            wait = false;
            JoinGame(steamId);
            checkGame();
        }
        // Reset the valid count from reset to 2 hrs later
        var now = new Date();
        if(now.getUTCHours() >= 14 && now.getUTCHours() <= 16) {
            wait = false;
            validGame = false;
        }
        setTimeout(joinLoop, 1000);
    }
    joinLoop();
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
                    var chatText = mutation.target.innerText.split('\n');
                    chatText = chatText[chatText.length - 2];
                    var joinIdx = chatText.toLowerCase().indexOf("joingame");
                    if(joinIdx != -1)
                    {
                        lParen = chatText.indexOf("(", joinIdx);
                        rParen = chatText.indexOf(")", lParen);
                        GM_setValue("Steam Auto Join", { id: chatText.substring(lParen + 1, rParen) });
                    }
                }
            });
        });
        observer.observe(document.getElementsByClassName("chat-room")[0], {subtree: true, childList: true});
    }
    window.addEventListener('load', loadObserver);
}