// Haetaan HTML-elementit muuttujiin
const form = document.getElementById('add-product-form');
const nameInput = document.getElementById('product-name');
const amountInput = document.getElementById('product-amount');
const dateInput = document.getElementById('product-date');
const errorMessage = document.getElementById('error-message');
const fridgeList = document.getElementById('fridge-list');
const suggestRecipesButton = document.getElementById('suggest-recipes-btn');
const recipeResults = document.getElementById('recipe-results');

// 1. Ladataan tallennetut tuotteet LocalStoragesta (tai aloitetaan tyhjällä listalla)
let products = JSON.parse(localStorage.getItem('fridgeProducts')) || [];

// Tallennusfunktio: muuttaa taulukon tekstiksi ja tallentaa selaimeen
function saveProducts() {
  localStorage.setItem('fridgeProducts', JSON.stringify(products));
}

const coopLager = products.find(
  (product) => normalizeIngredient(product.name) === 'coop lager'
);
let productsChanged = false;

if (coopLager) {
  if (!coopLager.permanent || coopLager.expiryDate) {
    coopLager.permanent = true;
    delete coopLager.expiryDate;
    productsChanged = true;
  }
} else {
  products.push({
    id: 'permanent-coop-lager',
    name: 'Coop Lager',
    amount: '1 kpl',
    permanent: true
  });
  productsChanged = true;
}

if (productsChanged) {
  saveProducts();
}

// Virheilmoituksen näyttäminen ja piilotus (V4)
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

// 2. Tuotteiden piirtäminen ruudulle
function renderFridge() {
  fridgeList.innerHTML = ''; // Tyhjennetään vanha näkymä

  sortProducts(products).forEach((product) => {
    const li = document.createElement('li');
    li.className = 'product-item';

    if (product.urgency === 'red' || product.urgency === 'expired') {
      li.classList.add('urgent-red');
    } else if (product.urgency === 'yellow') {
      li.classList.add('warning-yellow');
    }

    const expiryStatus = product.permanent
      ? 'Pysyvä ainesosa'
      : product.daysLeft < 0
        ? 'vanhentunut'
        : product.daysLeft === 0
          ? 'viimeinen päivä tänään'
          : `${product.daysLeft} pv jäljellä`;
    const expiryLabel = product.permanent
      ? expiryStatus
      : `Parasta ennen: ${product.expiryDate} (${expiryStatus})`;

    // Luodaan tekstisisältö
    li.innerHTML = `
      <div class="product-info">
        <strong>${product.name}</strong> (${product.amount || '1 kpl'})
        <span class="days-left">${expiryLabel}</span>
      </div>
      ${product.permanent ? '' : `<button class="btn-delete" data-id="${product.id}" title="Poista">✕</button>`}
    `;

    fridgeList.appendChild(li);
  });
}

// 3. Tuotteen lisäys lomakkeelta (V1 & V4)
form.addEventListener('submit', function(event) {
  event.preventDefault(); // Estää sivun uudelleenlatauksen
  clearError();

  const name = nameInput.value.trim().toLowerCase(); // Pienet kirjaimet vertailua varten
  const amount = amountInput.value.trim();
  const expiryDate = dateInput.value;

  // Tarkistukset (V4)
  if (name === '') {
    showError('Tuotteen nimi ei voi olla tyhjä.');
    return;
  }

  if (expiryDate === '') {
    showError('Valitse parasta ennen -päivämäärä.');
    return;
  }

  // Tarkistetaan, ettei päivämäärä ole menneisyydessä
  const today = new Date().toISOString().split('T')[0];
  if (expiryDate < today) {
    showError('Et voi lisätä jo vanhentunutta tuotetta.');
    return;
  }

  // Luodaan uusi tuote-objekti
  const newProduct = {
    id: Date.now().toString(), // Uniikki tunniste aikaleimasta
    name: name,
    amount: amount,
    expiryDate: expiryDate
  };

  // Lisätään listaan, tallennetaan ja päivitetään ruutu
  products.push(newProduct);
  saveProducts();
  renderFridge();

  // Tyhjennetään lomake seuraavaa tuotetta varten
  form.reset();
});

// 4. Tuotteen poistaminen listalta (Event Delegation)
fridgeList.addEventListener('click', function(event) {
  if (event.target.classList.contains('btn-delete')) {
    const idToDelete = event.target.getAttribute('data-id');
    const productToDelete = products.find(product => product.id === idToDelete);

    if (productToDelete && productToDelete.permanent) {
      return;
    }
    
    // Suodatetaan pois tuote, jolla on kyseinen id
    products = products.filter(product => product.id !== idToDelete);
    
    saveProducts();
    renderFridge();
  }
});

// Näyttää reseptiehdotukset tai niihin liittyvän tilaviestin.
function renderRecipes(recommendations) {
  recipeResults.replaceChildren();

  if (recommendations.length === 0) {
    const message = document.createElement('p');
    message.className = 'instructions';
    message.textContent = products.length === 0
      ? 'Lisää ensin tuotteita jääkaappiin, jotta voin ehdottaa reseptejä.'
      : 'Jääkaapin tuotteille ei löytynyt sopivia reseptejä.';
    recipeResults.appendChild(message);
    return;
  }

  recommendations.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    const title = document.createElement('h3');
    title.textContent = recipe.name;
    card.appendChild(title);

    const found = document.createElement('p');
    found.className = 'uses-urgent';
    found.textContent = `Löytyvät ainekset: ${recipe.foundIngredients.join(', ')}`;
    card.appendChild(found);

    const missing = document.createElement('p');
    missing.className = 'missing-items';
    missing.textContent = recipe.missingIngredients.length > 0
      ? `Puuttuvat ainekset: ${recipe.missingIngredients.join(', ')}`
      : 'Kaikki ainekset löytyvät jääkaapista.';
    card.appendChild(missing);

    const instructions = document.createElement('ol');
    instructions.className = 'instructions';
    recipe.instructions.forEach((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      instructions.appendChild(item);
    });
    card.appendChild(instructions);

    recipeResults.appendChild(card);
  });
}

suggestRecipesButton.addEventListener('click', async function() {
  suggestRecipesButton.disabled = true;
  recipeResults.replaceChildren();

  const loadingMessage = document.createElement('p');
  loadingMessage.className = 'instructions';
  loadingMessage.textContent = 'Ladataan reseptejä...';
  recipeResults.appendChild(loadingMessage);

  try {
    const recipes = await loadRecipes();
    renderRecipes(recommendRecipes(products, recipes));
  } catch (error) {
    console.error('Reseptien latausvirhe:', error);
    const errorMessage = document.createElement('p');
    errorMessage.className = 'instructions';
    errorMessage.textContent = 'Reseptien lataaminen epäonnistui. Avaa sovellus paikallisen verkkopalvelimen kautta ja yritä uudelleen.';
    recipeResults.replaceChildren(errorMessage);
  } finally {
    suggestRecipesButton.disabled = false;
  }
});

// Piirretään lista heti, kun sivu avataan
renderFridge();
