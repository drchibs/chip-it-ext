//on browser action get us the url of the page from which chip-it was clicked

const API_URL = "https://chip-it-api.fly.dev/v1/chips";


const createChipNotification = (message, contextMessage=null) => {
    chrome.notifications.create(Math.random().toString(),{
            type: "basic",
            iconUrl: "chip-128.png",
            title: "Chip It!",
            message: message,
            contextMessage: contextMessage,
            priority: 2
    });
};

const sendChip = async (url) => {
    try {
        const uid = "4d735476-ca32-415e-b3f0-b81e1bc06090"; //await chrome.storage.sync.get('chip-it-useruuid');
        const  token = "MQ.G64SuaNoX2dEg_8aUIywVSDi9eeIp4FrlnjwpRzRzkRjk4fecM9zzMLJLnXs"; //await chrome.storage.sync.get('chip-it-token');
        const req = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            method: "POST",
            body: JSON.stringify({
                url: url,
                user_id: uid,
                //folder_id :
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
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        let url = tabs[0].url;
        try {
            const data = sendChip(url).then((res) => {
                let note;
                let subNote;
                if (res.status === "success") {
                    note = `You chipped this Page!`;
                    subNote = `see your new chip at chrome://bookmarks`;
                } else {
                    note = `You failed to chip this Page!`;
                }
                createChipNotification(note, subNote);
            });
        } catch (err) {
            createChipNotification(err.message);
        }
    });
};

//chrome.browserAction.onClicked.addListener(browserAction);

const contextMenuClickHandler = () => {
    //const url = e.pageUrl; //url from context menu
    createChipAction();
};

chrome.runtime.onInstalled.addListener(async() => {
    chrome.contextMenus.create({
        id: Math.random().toString(),
        title: "Chip This Page!",
        contexts: ["page", "link"],
    });
    const note = `Hi, You're now using Chip It!`;
    createChipNotification(note);
    //importBookmarks();
    //await chrome.storage.sync.set({ isChip: true })

});

chrome.contextMenus.onClicked.addListener(contextMenuClickHandler);

/**
 *
 * HERE WE POTENTIALLY TRY TO IMPORT THE USER'S ALREADY SAVED BOOKMARKS FROM BROWSER TO CHIP-IT!
 *
 * This is an attempt to extract the url of all user saved bookmarks
 */

const printBookmarks = (bookmarks) => {
    bookmarks.forEach((bookmark) => {

        if (bookmark.children) {
            printBookmarks(bookmark.children);
        } else {
            try {
                const data = sendChip(bookmark.url).then((res) => {
                    console.log(res.status);
                });
            } catch (err) {
                createChipNotification(err.message);
                return;
            }

        }

    });
};

const importBookmarks = () => {
    chrome.bookmarks.getTree((bookmarks) => {
        printBookmarks(bookmarks);
    });
    let note = `All your bookmarks were saved successfully!`;
    createChipNotification(note);
};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the chipit extension");
        if (request.action === "import")
            importBookmarks()

        if (request.action === "chip")
            createChipAction()
    }
);



chrome.storage.sync.get("chip-it-token").then((data) => {
    console.log(data.token)
    if (data.token === undefined) {
        chrome.action.setPopup({popup: 'popup_signin.html'});
    } else {
        chrome.action.setPopup({popup: 'popup.html'});
    }
});
