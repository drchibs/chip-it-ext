//on browser action get us the url of the page from which chip-it was clicked

const API_URL = "http://127.0.0.1:3000/api/v1/chips";

/**
 *
 * @param {creates a chrome notification with the message provided it!} message
 */
const createChipNotification = (message, contextMessage = null) => {
    chrome.notifications.create(
        "chip-it",
        {
            type: "basic",
            iconUrl: "chip-128.png",
            title: "CHIP IT!",
            message: message,
            contextMessage: contextMessage,
        },
        function (notificationId) {}
    );
};

const sendChip = async (url) => {
    //async function sendChip(url) {
    //This function sends a chip to the server and returns a status and data object
    try {
        //before we create a new chip we need to verify that this chip doesn't already exist for this users

        //create a new chip now
        const req = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            method: "POST",
            body: JSON.stringify({
                url: url,
                uid: Math.random() * 7, //for now
            }),
        });
        const response = await req.json();
        return response;
    } catch (err) {
        //console.log(err);
        return err.message;
    }
};

const createChipAction = () => {
    //get the active tab url
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        let url = tabs[0].url;
        //send the URL (chip) our server
        try {
            const data = sendChip(url).then((res) => {
                //send a notification to the browser based on status of the response = SUCCESS or FAIL
                let note = "";
                if (res.status == "success") {
                    note = `You chipped this Page!`;
                    subNote = `see your new chip at chrome://bookmarks`;
                } else {
                    note = `You failed to chip this Page!`;
                }
                createChipNotification(note, subNote);
            });
        } catch (err) {
            //send a notification to the browser based on error in request = ERROR
            createChipNotification(err.message);
        }
    });
};

//chrome.browserAction.onClicked.addListener(browserAction);

const contextMenuClickHandler = () => {
    //const url = e.pageUrl;
    createChipAction();
};

chrome.runtime.onInstalled.addListener(function () {
    //create the context menu on install
    chrome.contextMenus.create({
        id: Math.random().toString(),
        title: "Chip This Page!",
        contexts: ["page", "link"],
    });
    //throw a welcome notification
    const note = `Hi, You're now using Chip It!`;
    const subNote = `Chip It! was built by D.R Chibs: https://github.com/drchibs , Twitter: https://twitter.com/el_chibs`;
    createChipNotification(note, subNote);
});

//listen for a click event on the browser page
chrome.contextMenus.onClicked.addListener(contextMenuClickHandler);

/**
 *
 * HERE WE POTENTIALLY TRY TO IMPORT THE USER'S ALREADY SAVED BOOKMARKS FROM BROWSER TO CHIP-IT!
 *
 * This is an attempt to extract the url of all user saved bookmarks
 */

const printBookmarks = (bookmarks) => {
    bookmarks.forEach((bookmark) => {
        const uid = Math.random(); //uid for now

        if (bookmark.children) {
            printBookmarks(bookmark.children);
        } else {
            //at this point we make an api call to save them for this user
            try {
                const data = sendChip(bookmark.url).then((res) => {
                    console.log(res.status);
                    //send a notification to the browser based on status of the response = SUCCESS or FAIL
                });
            } catch (err) {
                //send a notification to the browser based on error in request = ERROR
                createChipNotification(err.message);
                return;
            }
            //we don't want to send a notification for every bookmark saved, imagine a user has 80, so we're sending just one notification for everything and we're not even sure that saving was successful.
            note = `All your bookmarks were saved successfully!`;
            createChipNotification(note);
            //console.log(bookmark.url);
        }
    });
};

const importBookmarks = () => {
    chrome.bookmarks.getTree((bookmarks) => {
        printBookmarks(bookmarks);
    });
};

//importBookmarks();
