(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value} = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            console.log("contteee");
            ucfLoaded();
        }
    });



    const ucfLoaded = () => {
        document.getElementById('CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH').addEventListener('click',function(){
            alert("cliced");
         });
    }

    ucfLoaded();
    
})();


