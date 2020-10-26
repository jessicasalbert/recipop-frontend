const baseUrl = "http://localhost:3000/api/v1/"
const recipeUrl = 'recipes'
const categoriesUrl = 'categories'


let userId;
//stores recipe ID (key) and ID of favorite instance (value)
let userFavs = {}
let currentUsername;
let currentRecipe;



const clickHandler = () => {

    document.addEventListener('click', function(e){
        //console.log(e.target)
        navClickHandler(e)
        favsClickHandler(e)
        cardClickHandler(e)
        favButtonHandler(e)
        createRecipeClickHandler(e)
        searchBtnHandler(e)
    })
}

function createComment() {
    const form = document.querySelector("#comment-form")
    form.addEventListener("submit", e => {
        e.preventDefault()
        const commentContent = document.querySelector("#comment-input").value
        const newComment = {
            content: commentContent,
            user_id: userId,
            recipe_id: currentRecipe
        }
        const configObject = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(newComment)
        }
        e.target.reset()
        fetch(baseUrl + "comments", configObject)
        .then(res => res.json())
        .then(res => {
            const comments = document.querySelector("#comment-table")
            const row = document.createElement("tr")
            row.classList.add("comment-row")
            row.innerHTML = 
            `<td class="username-td">${currentUsername}  :</td>
            <td class="comment-td">${res.content}</td>
            `
            comments.append(row)
            
        })
        .catch(error => console.log(error.message))
            
    })
}

function loginHandler() {
    const login = document.querySelector("#login")
    login.addEventListener("submit", e => {
        e.preventDefault()
        const username = e.target.name.value.trim()
        const url = baseUrl + '/login?search=' + username
        fetch(url)
        .then(res => res.json())
        .then(res => {
            userId = res.id
            currentUsername = res.username
            for (recipe of res['favorites']) {
                userFavs[recipe.recipe_id] = recipe.id
            }
            document.querySelector("#card-container").style.display = "none"
            document.querySelector("#search").style.display = ""
            document.querySelector("#create-recipe").style.display = "none"
            document.querySelector("#login").style.display = "none"
            document.querySelector("#info").style.display = "none"
            
            fetch(baseUrl + `users/${userId}`)
            .then(response => response.json())
            .then(response => {
                //console.log(response)
                const cardContainer = document.querySelector("#card-container")
                document.querySelector("#welcome-message").textContent = `Hello, ${currentUsername}`
                cardContainer.innerHTML = ""
                appendCards(response["fav_recipes"])
        })
        }
    )})
}

function searchHandler() {
    const search = document.querySelector("#search")
    search.addEventListener("submit", e => {
        e.preventDefault()
        const search_term = e.target.name.value.trim()
        const url = baseUrl + `recipes?search=` + search_term
        e.target.reset()
        fetch(url)
        .then(res => res.json())
        .then(res => {
            const cardContainer = document.querySelector("#card-container")
            document.querySelector("#card-container").style.display = ""
            cardContainer.innerHTML = ""
            appendCards(res)
            document.querySelector("#search").style.display = "none"
        })
    })
}

function searchBtnHandler(e) {
    if (e.target.matches("#search-btn") || e.target.matches("#search-icon")) {
        document.querySelector("#card-container").style.display = "none"
        document.querySelector("#create-recipe").style.display = "none"
        document.querySelector("#login").style.display = "none"
        document.querySelector("#info").style.display = "none"
        document.querySelector("#search").style.display = ""
        document.querySelector("#welcome-message").style.display = "none"
    }
}

function favButtonHandler(e) {
        
    if (e.target.matches("#fav-path")) {
        if (!userFavs[e.target.dataset.recipeId]) {
            const newFav = {recipe_id: parseInt(e.target.dataset.recipeId), user_id: userId}
            //console.log(newFav)
            const configObject = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    accept: "application/json"
                },
                body: JSON.stringify(newFav)
            }
            fetch(baseUrl + 'favorites', configObject)
            .then(response => response.json())
            .then(response => {
                userFavs[response.recipe_id] = response.id
                console.log(userFavs)
                e.target.style.fill = "red"
            })
            .catch(error => console.log(error.message))
        } else {
            const configObject = {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                    accept: "application/json"
                }
            }
            console.log(userFavs[e.target.dataset.recipeId])
            fetch(baseUrl + `favorites/${userFavs[e.target.dataset.recipeId]}`, configObject)
            .then(res => res.json())
            .then(res => {
                userFavs[res.recipe_id] = false
                e.target.style.fill = ""
            })
        }
    //     if (e.target.style.fill === "") {
    //     e.target.style.fill = "red"
    // } else {
    //     e.target.style.fill = ""
    //     }
    }
    
}

function cardClickHandler(e) {
    if (e.target.matches(".card") || e.target.parentElement.matches(".card") || e.target.parentElement.parentElement.matches(".card")) {
        document.querySelector("#card-container").style.display = "none"
        document.querySelector("#create-recipe").style.display = "none"
        document.querySelector("#info").style.display = ""
        document.querySelector("#welcome-message").style.display = "none"
        let recipeId = e.target.closest("img").dataset.id
        fetch(baseUrl + `recipes/${recipeId}`)
        .then(response => response.json())
        .then(response => renderRecipeInfo(response))
    }
}

function renderRecipeInfo(recipe) {
    const cardInfo = document.querySelector(".info-card")
    const recipeInfo = recipe.recipe
    currentRecipe = recipeInfo.id
    cardInfo.querySelector("#name").textContent = recipeInfo.name
    cardInfo.querySelector("#region").textContent = `Region: ${recipeInfo.region}`
    cardInfo.querySelector("#rec_image").src = recipeInfo.image_url
    cardInfo.querySelector("#rec_vid").src = recipeInfo.youtube_url
    const ingreds = cardInfo.querySelector("#ingredients")
    ingreds.innerHTML = ""
    for (let i = 0; i < recipeInfo.ingredients.length; i++) {
        const ul = document.createElement("li")
        ul.innerHTML = `${recipeInfo.measurements[i]} - ${recipeInfo.ingredients[i]}`
        ingreds.append(ul)
    }
    const comments = cardInfo.querySelector("#comment-table")
    comments.classList.add("comment-table")
    comments.innerHTML = `
        <tr>
            <th id='comment-label'>Comments</th>
        </tr>`
    for (comment of recipe.comments) {
        const row = document.createElement("tr")
        row.classList.add("comment-row")
        row.innerHTML = 
        `<td id="username-td">${comment.username}  : </td>
        <td id="comment-td">${comment.content}</td>
        `
        comments.append(row)
    }
    //for (comment of recipeInfo.comments)
    const instructions = cardInfo.querySelector("#instructions")
    instructions.textContent = ""
    let instrucArray = recipeInfo.instructions.split(/[\r\n\n]/)
    instrucArray = instrucArray.filter(instruc => instruc !== "" && instruc !== " ")
    for (instruc of instrucArray) {
        const instructP = document.createElement("p")
        instructP.innerHTML = `<input type="checkbox" name="instruction"><label for="instruction">${instruc}</label>` 
        instructions.append(instructP)
    }
    const likeBtn = cardInfo.querySelector("#fav-path")
    likeBtn.dataset.recipeId = recipeInfo.id
    if (userFavs[recipeInfo.id]) {
        likeBtn.style.fill = "red"
    } else {
        likeBtn.style.fill = ""
    }
}

function favsClickHandler(e) {
    if (e.target.matches("#fav") || e.target.matches("#fav-btn")) {
        document.querySelector("#card-container").style.display = ""
        document.querySelector("#create-recipe").style.display = "none"
        document.querySelector("#login").style.display = "none"
        document.querySelector("#info").style.display = "none"
        document.querySelector("#search").style.display = "none"
        document.querySelector("#welcome-message").style.display = "none"
        fetch(baseUrl + `users/${userId}`)
        .then(response => response.json())
        .then(response => {
            //console.log(response)
            const cardContainer = document.querySelector("#card-container")
            cardContainer.innerHTML = ""
            appendCards(response["fav_recipes"])
        })
    }
}

function navClickHandler(e) {
    if (e.target.parentElement.matches(".category") || e.target.parentElement.matches(".category")) {
        document.querySelector("#card-container").style.display = ""
        document.querySelector("#create-recipe").style.display = "none"
        document.querySelector("#login").style.display = "none"
        document.querySelector("#info").style.display = "none"
        document.querySelector("#search").style.display = "none"
        document.querySelector("#welcome-message").style.display = "none"
        let queryId;
        if (e.target.parentElement.matches(".category")) {
            queryId = e.target.parentElement.id
        } else if (e.target.matches(".category")) {
            queryId = e.target.id
        }
        fetch(baseUrl + `categories?search=${queryId}`)
        .then(response => response.json())
        .then(response => {
            const cardContainer = document.querySelector("#card-container")
            cardContainer.innerHTML = ""
            //cardContainer.innerHTML = `<h1 style="display:block">${queryId[0].toUpperCase() + queryId.slice(1)}</h1>`
            appendCards(response["recipes"])
        })
    }
    
}


const appendCard = (recipe) => {
    const cardContainer = document.querySelector("#card-container")
    newCard = document.createElement("div")
    newCard.classList.add("card")
    newCard.innerHTML = `
        <div class="image-wrapper">
            <img data-id=${recipe.id} src="${recipe.image_url}", alt="${recipe.name}">
        </div>
        <h3 class="name">${recipe.name}</h3>
    `
    cardContainer.append(newCard)
}

const appendCards = (cards) => {
    for (const card of cards) {
        appendCard(card)
    }
}


const createRecipeClickHandler = (e) => {
    if (e.target.matches("#create-svg") || e.target.matches("#add-form")) {
        document.querySelector("#create-recipe").style.display = ""
        document.querySelector("#card-container").style.display = "none"
        document.querySelector("#login").style.display = "none"
        document.querySelector("#info").style.display = "none"
        document.querySelector("#search").style.display = "none"
        document.querySelector("#welcome-message").style.display = "none"
            
    }
}

function createRecipeForm() {
    const submitBtn = document.getElementById('create-recipe')
    submitBtn.addEventListener('submit', function(e) {
        e.preventDefault()    
        const recipeInput = document.getElementById('recipe-name-input').value  
        const regionInput = document.getElementById('region-input').value  
        const imageInput = document.getElementById('image-input').value  
        const ingredientInput = document.getElementById('ingredients-input').value  
        const youtubeInput = document.getElementById('yt-input').value  
        const instructionInput = document.getElementById('instruction-input').value  
        const categoriesInput = document.getElementById('categories').value
        const categoryId = parseInt(categoriesInput)
        const measurements = []
        const ingredients = []
        const ingredsInputArray = ingredientInput.split("\n")
            for (ingred of ingredsInputArray) {
                ingred = ingred.split(":")
                measurements.push(ingred[0])
                ingredients.push(ingred[1])
            }
        const newRecipe = {
            name: recipeInput, 
            region: regionInput, 
            image_url: imageInput,
            ingredients: ingredients,
            instructions: instructionInput,
            measurements: measurements,
            category_id: categoryId,
            youtube_url: youtubeInput
        }
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(newRecipe)
        }
        e.target.reset()
        fetch(baseUrl + 'recipes', options)
        .then(response => response.json())
        .then(recipeInfo => {
            document.querySelector("#create-recipe").style.display = "none"
            document.querySelector("#info").style.display = ""
            const cardInfo = document.querySelector(".info-card")
            currentRecipe = recipeInfo.id
            cardInfo.querySelector("#name").textContent = recipeInfo.name
            cardInfo.querySelector("#region").textContent = `Region: ${recipeInfo.region}`
            cardInfo.querySelector("#rec_image").src = recipeInfo.image_url
            cardInfo.querySelector("#rec_vid").src = recipeInfo.youtube_url
            const ingreds = cardInfo.querySelector("#ingredients")
            ingreds.innerHTML = ""
            for (let i = 0; i < recipeInfo.ingredients.length; i++) {
                const ul = document.createElement("li")
                ul.innerHTML = `${recipeInfo.measurements[i]} - ${recipeInfo.ingredients[i]}`
                ingreds.append(ul)
            }
            const instructions = cardInfo.querySelector("#instructions")
            instructions.textContent = ""
            let instrucArray = recipeInfo.instructions.split(/[\r\n\n]/)
            instrucArray = instrucArray.filter(instruc => instruc !== "" && instruc !== " ")
            for (instruc of instrucArray) {
                const instructP = document.createElement("p")
                instructP.innerHTML = `<input type="checkbox" name="instruction"><label for="instruction">${instruc}</label>` 
                instructions.append(instructP)
            }
            const likeBtn = cardInfo.querySelector("#fav-path")
            likeBtn.dataset.recipeId = recipeInfo.id
            if (userFavs[recipeInfo.id]) {
                likeBtn.style.fill = "red"
            } else {
                likeBtn.style.fill = ""
            }
            const comments = cardInfo.querySelector("#comment-table")
            comments.classList.add("comment-table")
            comments.innerHTML = `
                <tr>
                    <th id='comment-label'>Comments</th>
                </tr>`
        })

    })
}

clickHandler()
loginHandler()
createRecipeForm()
createComment()
searchHandler()