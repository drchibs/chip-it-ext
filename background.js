//on browser action get us the url of the page from which chip-it was clicked

const API_URL = "http://127.0.0.1:3000/api/v1/chips";

//const sendChip = async (url) => {
async function sendChip(url) {
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
}

const createChipAction = () => {
    //get the active tab url
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        let url = tabs[0].url;
        //send the URL (chip) our server
        try {
            const data = sendChip(url).then((res) => {
                //console.log(res);
                alert(res.status);
                //send a notification to the browser based on status of the response = SUCCESS or FAIL
            });
        } catch (err) {
            //send a notification to the browser based on error in request = ERROR
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
                    //console.log(res);
                    console.log(res.status);
                    //send a notification to the browser based on status of the response = SUCCESS or FAIL
                });
            } catch (err) {
                //send a notification to the browser based on error in request = ERROR
            }
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
