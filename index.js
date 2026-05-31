/*****************************************************************************
 * Challenge 2: Review the provided code. The provided code includes:
 * -> Statements that import data from games.js
 * -> A function that deletes all child elements from a parent element in the DOM
*/

// import the JSON data about the crowd funded games from the games.js file
import GAMES_DATA from './games.js';

// create a list of objects to store the data about the games using JSON.parse
const GAMES_JSON = JSON.parse(GAMES_DATA)

// remove all child elements from a parent element in the DOM
function deleteChildElements(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/*****************************************************************************
 * Challenge 3: Add data about each game as a card to the games-container
 * Skills used: DOM manipulation, for loops, template literals, functions
*/

// grab the element with the id games-container
const gamesContainer = document.getElementById("games-container");

// create a function that adds all data from the games array to the page
function addGamesToPage(games) {

    // loop over each item in the data
    for (let i = 0; i < games.length; i++) {

        // create a new div element, which will become the game card
        const gameCard = document.createElement("div");

        // add the class game-card to the list
        gameCard.classList.add("game-card");

        // set the inner HTML using a template literal to display some info 
        // about each game
        // TIP: if your images are not displaying, make sure there is space
        // between the end of the src attribute and the end of the tag ("/>")
        const fundingPercentage = Math.round((games[i].pledged / games[i].goal) * 100);
        const progressBarWidth = Math.min(fundingPercentage, 100);
        const fundedBadge = games[i].pledged >= games[i].goal
            ? `<span class="funded-badge">Funded</span>`
            : "";

        gameCard.innerHTML = `
            <img src="${games[i].img}" alt="${games[i].name}" class="game-img">
            <div class="game-card-content">
                <div class="game-card-heading">
                    <h3>${games[i].name}</h3>
                    ${fundedBadge}
                </div>
                <p class="game-description">${games[i].description}</p>
                <div class="funding-details">
                    <span>$${games[i].pledged.toLocaleString()} raised</span>
                    <span>$${games[i].goal.toLocaleString()} goal</span>
                </div>
                <div class="progress-track" role="progressbar" aria-label="${games[i].name} funding progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressBarWidth}">
                    <div class="progress-bar" style="width: ${progressBarWidth}%"></div>
                </div>
                <p class="progress-label">${fundingPercentage}% funded</p>
            </div>
        `;

        // append the game to the games-container
        gamesContainer.appendChild(gameCard);
    }
}

/*************************************************************************************
 * Challenge 4: Create the summary statistics at the top of the page displaying the
 * total number of contributions, amount donated, and number of games on the site.
 * Skills used: arrow functions, reduce, template literals
*/

// grab the contributions card element
const contributionsCard = document.getElementById("num-contributions");

// use reduce() to count the number of total contributions by summing the backers
const totalContributions = GAMES_JSON.reduce((acc, game) => acc + game.backers, 0);

// set the inner HTML using a template literal and toLocaleString to get a number with commas
contributionsCard.innerHTML = `
    <h3>${totalContributions.toLocaleString()}</h3>
`;

// grab the amount raised card, then use reduce() to find the total amount raised
const raisedCard = document.getElementById("total-raised");

// set inner HTML using template literal
raisedCard.innerHTML = `
    <h3>$${GAMES_JSON.reduce((acc, game) => acc + game.pledged, 0).toLocaleString()}</h3>
`;


// grab number of games card and set its inner HTML
const gamesCard = document.getElementById("num-games");
gamesCard.innerHTML = `
    <h3>${GAMES_JSON.length}</h3>
`;

/*************************************************************************************
 * Challenge 5: Add functions to filter the funded and unfunded games
 * total number of contributions, amount donated, and number of games on the site.
 * Skills used: functions, filter
*/

// select each button in the "Our Games" section
const unfundedBtn = document.getElementById("unfunded-btn");
const fundedBtn = document.getElementById("funded-btn");
const allBtn = document.getElementById("all-btn");
const sortBtn = document.getElementById("sort-btn");
const searchInput = document.getElementById("search-input");

let selectedFilter = "all";
let isSortedByPledged = false;
let searchQuery = "";

function updateActiveControls() {
    allBtn.classList.toggle("active", selectedFilter === "all");
    unfundedBtn.classList.toggle("active", selectedFilter === "unfunded");
    fundedBtn.classList.toggle("active", selectedFilter === "funded");
    sortBtn.classList.toggle("active", isSortedByPledged);
    sortBtn.setAttribute("aria-pressed", isSortedByPledged);
}

function getVisibleGames() {
    const filteredGames = GAMES_JSON.filter(game => {
        const matchesFundingFilter = selectedFilter === "all"
            || (selectedFilter === "funded" && game.pledged >= game.goal)
            || (selectedFilter === "unfunded" && game.pledged < game.goal);
        const matchesSearch = game.name.toLowerCase().includes(searchQuery);

        return matchesFundingFilter && matchesSearch;
    });

    if (isSortedByPledged) {
        return [...filteredGames].sort((item1, item2) => item2.pledged - item1.pledged);
    }

    return filteredGames;
}

function renderGames() {
    deleteChildElements(gamesContainer);
    addGamesToPage(getVisibleGames());
    updateActiveControls();
}

// add event listeners with the correct functions to each button
unfundedBtn.addEventListener("click", () => {
    selectedFilter = "unfunded";
    renderGames();
});

fundedBtn.addEventListener("click", () => {
    selectedFilter = "funded";
    renderGames();
});

allBtn.addEventListener("click", () => {
    selectedFilter = "all";
    renderGames();
});

sortBtn.addEventListener("click", () => {
    isSortedByPledged = !isSortedByPledged;
    renderGames();
});

searchInput.addEventListener("input", event => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderGames();
});

// display every game when the page first loads
renderGames();

/*************************************************************************************
 * Challenge 6: Add more information at the top of the page about the company.
 * Skills used: template literals, ternary operator
*/

// grab the description container
const descriptionContainer = document.getElementById("description-container");

// use filter or reduce to count the number of unfunded games
const unfundedGamesCount = GAMES_JSON.filter(game => game.pledged < game.goal).length;

// create a string that explains the number of unfunded games using the ternary operator
const unfundedExplanation = unfundedGamesCount === 1
    ? `A total of $${GAMES_JSON.reduce((acc, game) => acc + game.pledged, 0).toLocaleString()} has been raised for ${GAMES_JSON.length} games. Currently, ${unfundedGamesCount} game remains unfunded. We need your help to fund these amazing games!`
    : `A total of $${GAMES_JSON.reduce((acc, game) => acc + game.pledged, 0).toLocaleString()} has been raised for ${GAMES_JSON.length} games. Currently, ${unfundedGamesCount} games remain unfunded. We need your help to fund these amazing games!`;

// create a new DOM element containing the template string and append it to the description container
const descriptionElement = document.createElement("p");
descriptionElement.innerHTML = unfundedExplanation;
descriptionContainer.appendChild(descriptionElement);

/************************************************************************************
 * Challenge 7: Select & display the top 2 games
 * Skills used: spread operator, destructuring, template literals, sort 
 */

const firstGameContainer = document.getElementById("first-game");
const secondGameContainer = document.getElementById("second-game");

const sortedGames = [...GAMES_JSON].sort((item1, item2) => {
    return item2.pledged - item1.pledged;
});

// use destructuring and the spread operator to grab the first and second games
const [firstGame, secondGame] = sortedGames;

// create a new element to hold the name of the top pledge game, then append it to the correct element
const firstGameElement = document.createElement("p");
firstGameElement.innerHTML = firstGame.name;
firstGameContainer.appendChild(firstGameElement);

// do the same for the runner up item
const secondGameElement = document.createElement("p");
secondGameElement.innerHTML = secondGame.name;
secondGameContainer.appendChild(secondGameElement);
