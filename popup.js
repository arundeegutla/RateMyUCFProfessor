var professors;
var container;


document.addEventListener("DOMContentLoaded", async () => {

    professors = [];
    container = document.getElementById("container");
    document.getElementById("getNames").onclick = function() {myFunction()};
    async function myFunction() {    
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {todo: "getNames"}, viewProfessors);
        })
        document.getElementById("getNames").style = "display: none;";
        document.getElementById("loader").style = "display: flex;";
    }
});

const getProfessor = async (name, id) => {
    var link = "https://www.ratemyprofessors.com/professor/" + id;
    let professor = {};
    await fetch(link).then(function (response) {
        return response.text();
    }).then(function (data) {        
        var start = data.indexOf("\"legacyId\":" + id);
        var end = data.indexOf(",", data.indexOf("\"wouldTakeAgainPercent\":", start));
        professor = JSON.parse('{' + data.substring(start, end) + '}');
        console.log(name + ":::: DONE");
    }).catch(function (err) {
        console.log("error:: getProfessor cant fetch " + name + "\n" + link);
    });
    return professor;
};

const getBest = (new_professor, professor) => {
    if (new_professor === undefined || new_professor.firstName === undefined)
        return professor;
    if (new_professor.numRatings == professor.numRatings)
        return new_professor.avgRating < professor.avgRating ? professor : new_professor;
    return new_professor.numRatings < professor.numRatings ? professor : new_professor;
};


const getRating = async (name) => {
    
    const link = ("https://www.ratemyprofessors.com/search.jsp?query=" + name).replaceAll(" ", "+").replaceAll("\n", "+");
    let professor = {
        legacyId: -1,
        firstName: name,
        lastName: "",
        department: "dep",
        numRatings: -1,
        avgRating: -1,
        avgDifficulty: -1,
        wouldTakeAgainPercent: -1,
        plink: link
    };
    await fetch(link + "&sid=1082").then(function (response) {
        return response.text();
    }).then(async function (data) {        
        var ind = 0;
        while ((ind = data.indexOf("legacyId\":", ind)) != -1) {
            var this_id = parseFloat(data.substring(ind + 10, data.indexOf(",", ind)));
            var this_professor = await getProfessor(name, this_id);
            professor = getBest(this_professor, professor);
            ind += 10;
        }
    }).catch(function (err) {
        console.log("error:: getProfessor cant fetch " + name + "\n" + link);
    });
    return professor;
};

const viewProfessors = async (currentProfessors=[]) => {
    var info = document.getElementById("info");
    professors = [];
    if (currentProfessors.length == 0) {
        setNoProfessors();
        return;
    }
    info.innerHTML = '<h2>Getting Professors...</h2>';

    for (let i = 0; i < currentProfessors.length; i++) {
        const name = currentProfessors[i];
        console.log("processing " + name);
        let professor = await getRating(name);
        professors.push(professor);
        refreshProfessors();
    }
    info.innerHTML = '<h2>All Professors</h2>';
    document.getElementById("getNames").style = "display: flex;";
    document.getElementById("loader").style = "display: none;";
};


const isSame = (p1, p2) => {
    if (Math.ceil(p1.avgRating)-1 == Math.ceil(p2.avgRating)-1)
        return true;
    return false;
};

const refreshProfessors = () => {
    container.innerHTML = "";
    if (professors.length == 0) {
        setNoProfessors();
        return;
    }
    professors.sort((p1, p2) => {
        if (isSame(p1, p2))
            return p2.numRatings - p1.numRatings
        return p2.avgRating - p1.avgRating;
    });
    professors.forEach(professor=>{
        addProfessor(professor);
    })
};

const addProfessor = (professor) => {
    const aElme = document.createElement("a");
    aElme.href = professor.numRatings == -1 ? professor.plink : "https://www.ratemyprofessors.com/professor/" + professor.legacyId;
    aElme.target = "_blank";

    const profElme = document.createElement("div");
    profElme.className = "professor";

    const left_box = document.createElement("div");
    left_box.className = "container-rating";
    left_box.style = "margin-right: 20px;";

    const ratingBox = document.createElement("div");
    ratingBox.className = "rating-box";


    // background: linear-gradient(90deg, lightcoral var(--c1, 30%), black);
    
    if (professor.avgRating == 5)
        profElme.style = "background: #22dbfd;";
    else if (professor.avgRating >= 4)
        profElme.style = "background: #56fbb5";
    else if (professor.avgRating >= 3)
        profElme.style = "background: yellow";
    else if (professor.avgRating >= 2)
        profElme.style = "background: lightcoral;";
    else
        profElme.style = "background: white;";

    const ratingElem = document.createElement("p");
    ratingElem.innerHTML = professor.avgRating == -1 ? "N/A" : parseFloat(professor.avgRating).toFixed(1);

    const numRatingelement = document.createElement("p");
    numRatingelement.innerHTML = "ratings: " + (professor.numRatings == -1 ? "N/A" : professor.numRatings);



    const right_box = document.createElement("div");

    const nameElme = document.createElement("h2");
    nameElme.className = "pName";
    nameElme.innerHTML = professor.firstName + " " + professor.lastName;

    const departmentElement = document.createElement("p");
    departmentElement.innerHTML = professor.department == "dep" ? "N/A" : professor.department;

    const description = document.createElement("p");
    description.innerHTML = "<strong>" + (professor.wouldTakeAgainPercent == -1 ? "N/A" : Math.round(professor.wouldTakeAgainPercent) + "%") + "</strong> | <strong>" + (professor.avgDifficulty) + "</strong> Difficulty";

    right_box.appendChild(nameElme);
    right_box.appendChild(departmentElement);
    right_box.appendChild(description);

    ratingBox.appendChild(ratingElem);
    left_box.appendChild(ratingBox);
    left_box.appendChild(numRatingelement);


    profElme.appendChild(left_box);
    profElme.appendChild(right_box);

    aElme.appendChild(profElme);  
    container.appendChild(aElme);
};

function setNoProfessors() {
    var info = document.getElementById("info");
    info.innerHTML = "<h2>No Professor Found</h2>";
    document.getElementById("getNames").style = "display: flex;";
    document.getElementById("loader").style = "display: none;";
}

