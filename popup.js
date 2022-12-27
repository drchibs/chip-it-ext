const importBookmarks = async () => {
    await chrome.runtime.sendMessage({action: "import"});
        //console.log(response);
}

const chipPage = async () => {
    await chrome.runtime.sendMessage({action: "chip"});
    //console.log(response);
}

document.getElementById("import").addEventListener("click", async ()=> {
    await importBookmarks()
}, false);

document.getElementById("chip").addEventListener("click", async ()=> {
    await chipPage()
}, false);
