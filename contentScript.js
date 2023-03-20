(() => {

    let currentProfessors = [];
    chrome.runtime.onMessage.addListener(async (request, sender, response) => {
        const {todo, content} = request;
    
        if (todo === "getNames") {
            getProfessors();
            response(currentProfessors);
        }
        if (todo === "consolelog") {
            console.log(content);
        }
        if (todo === "alert") {
            alert(content);
        }
    });    

    const getProfessors = async () => {

        if (document.getElementById("ptifrmtgtframe") != null && document.getElementById("ptifrmtgtframe").value != '') {
            var iframe = document.getElementById("ptifrmtgtframe").contentWindow.document;
            var num = 0;
            var set = new Set();
            while(iframe.getElementById("MTG_INSTR$" + num) != null && iframe.getElementById("MTG_INSTR$" + num).value != '') {
                const names = iframe.getElementById("MTG_INSTR$" + num).innerHTML;
                const professors = []
                var count = 0;
                var start = 0;
                while (names.indexOf(",<br>", start) != -1) {
                    var index = names.indexOf(",<br>", start);
                    var professor = names.substring(start, index);
                    professors[count] = professor;
                    start = index + 6;
                    count++;
                }
                professors[count] = names.substring(start, names.length);

                professors.forEach(professor => {
                    set.add(professor);
                });
                num++;
            }
            currentProfessors = [...set];   
        }  
    };


})();


