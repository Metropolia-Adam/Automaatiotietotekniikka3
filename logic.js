
/* =====================================
   RUOKASOVELLUKSEN LOGIIKKA
   ===================================== */


/* 1. Raaka-aineiden nimien yhtenäistäminen */

const ingredientAliases = {
    "kanafilee": "kana",
    "broileri": "kana",
    "kananliha": "kana",
    "ruokakerma": "kerma",
    "kuohukerma": "kerma",
    "makaroni": "pasta",
    "kananmuna": "muna",
    "kananmunat": "muna",
    "perunat": "peruna",
    "tomaatit": "tomaatti",
    "sipulit": "sipuli",
    "porkkanat": "porkkana",
    "juustoraaste": "juusto",
    "linssit": "linssi",
    "sienet": "sieni",
    "pippuri": "mustapippuri"
};

function normalizeIngredient(name) {
    const normalized = name.trim().toLowerCase();
    return ingredientAliases[normalized] || normalized;
}


/* 2. Päivämäärien käsittely */

function calculateDaysLeft(expiryDate, today = new Date()) {
    const expiry = new Date(expiryDate + "T00:00:00Z");

    const current = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ));

    if (Number.isNaN(expiry.getTime())) {
        throw new Error("Virheellinen päivämäärä");
    }

    return Math.round(
        (expiry.getTime() - current.getTime()) /
        (1000 * 60 * 60 * 24)
    );
}


/* 3. Tuotteen kiireellisyyden määrittely */

function getUrgencyLevel(daysLeft) {
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 2) return "red";
    if (daysLeft <= 5) return "yellow";

    return "normal";
}


/* 4. Tuotetietojen käsittely */

function processProduct(product, today = new Date()) {
    const daysLeft = calculateDaysLeft(
        product.expiryDate,
        today
    );

    return {
        ...product,
        daysLeft,
        urgency: getUrgencyLevel(daysLeft)
    };
}


/* 5. Tuotteiden järjestäminen */

function sortProducts(products, today = new Date()) {
    return products
        .map(product => processProduct(product, today))
        .sort((a, b) => a.daysLeft - b.daysLeft);
}


/* 6. Reseptien suosittelu */

function recommendRecipes(products, recipes, today = new Date()) {

    const availableIngredients = sortProducts(products, today)
        .filter(product => product.daysLeft >= 0)
        .map(product => ({
            name: normalizeIngredient(product.name),
            urgency: product.urgency
        }));

    const recommendations = recipes.map(recipe => {

        const ingredients = recipe.ingredients.map(
            normalizeIngredient
        );

        const foundIngredients = ingredients.filter(ingredient =>
            availableIngredients.some(
                product => product.name === ingredient
            )
        );

        const missingIngredients = ingredients.filter(ingredient =>
            !availableIngredients.some(
                product => product.name === ingredient
            )
        );

        const redMatches = foundIngredients.filter(ingredient =>
            availableIngredients.some(
                product =>
                    product.name === ingredient &&
                    product.urgency === "red"
            )
        );

        const yellowMatches = foundIngredients.filter(ingredient =>
            availableIngredients.some(
                product =>
                    product.name === ingredient &&
                    product.urgency === "yellow"
            )
        );

        const score =
            redMatches.length * 3 +
            yellowMatches.length * 2 +
            foundIngredients.length;

        return {
            ...recipe,
            foundIngredients,
            missingIngredients,
            score,
            matchPercentage: Math.round(
                foundIngredients.length / ingredients.length * 100
            )
        };
    });

    return recommendations
        .filter(recipe => recipe.score > 0)
        .sort((a, b) =>
            b.score - a.score ||
            b.matchPercentage - a.matchPercentage
        );
}


/* 7. Reseptitiedoston lataaminen */

async function loadRecipes() {
    try {
        const response = await fetch("./recipes.json");

        if (!response.ok) {
            throw new Error("Reseptitiedoston lataaminen epäonnistui");
        }

        return await response.json();

    } catch (error) {
        console.error("Reseptien latausvirhe:", error);
        return [];
    }
}
