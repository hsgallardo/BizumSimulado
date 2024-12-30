// Cargar cuentas desde localStorage
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

// Mostrar cuentas al cargar la página
window.onload = function() {
    loadAccounts();
};

// Función para cambiar entre paneles
function showPanel(panelName) {
    if (panelName === "create-account") {
        document.getElementById("create-account").style.display = "block";
        document.getElementById("bizum").style.display = "none";
        document.getElementById("view-accounts").style.display = "none";
        document.getElementById("create-account-btn").disabled = true;
        document.getElementById("bizum-btn").disabled = false;
        document.getElementById("show-accounts-btn").disabled = false;
    } else if (panelName === "bizum") {
        document.getElementById("create-account").style.display = "none";
        document.getElementById("bizum").style.display = "block";
        document.getElementById("view-accounts").style.display = "none";
        document.getElementById("create-account-btn").disabled = false;
        document.getElementById("bizum-btn").disabled = true;
        document.getElementById("show-accounts-btn").disabled = false;
    } else if (panelName === "view-accounts") {
        document.getElementById("create-account").style.display = "none";
        document.getElementById("bizum").style.display = "none";
        document.getElementById("view-accounts").style.display = "block";
        document.getElementById("create-account-btn").disabled = false;
        document.getElementById("bizum-btn").disabled = false;
        document.getElementById("show-accounts-btn").disabled = true;
    }
}

// Función para cargar cuentas al selector
function loadAccounts() {
    const accountSelector = document.getElementById("account-selector");
    accountSelector.innerHTML = '<option value="">Selecciona una cuenta</option>'; // Limpiar las opciones

    accounts.forEach(account => {
        const option = document.createElement("option");
        option.value = account.phone;
        option.textContent = `${account.name} (${account.phone}) - €${account.balance}`;
        accountSelector.appendChild(option);
    });

    // Si hay cuentas, mostrar la sección de acciones
    if (accounts.length > 0) {
        document.getElementById("account-actions").style.display = "block";
    }
}

// Función para ver todas las cuentas
function showAllAccounts() {
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = ""; // Limpiar lista actual

    if (accounts.length === 0) {
        accountsList.innerHTML = "<p>No hay cuentas creadas.</p>";
    } else {
        accounts.forEach((account, index) => {
            const accountItem = document.createElement("div");
            accountItem.classList.add("account-item");

            accountItem.innerHTML = `
                <span>${account.name} (${account.phone})</span>
                <span>€${account.balance}</span>
                <button class="delete-account" onclick="deleteAccount(${index})">Eliminar</button>
            `;
            accountsList.appendChild(accountItem);
        });
    }

    showPanel('view-accounts');  // Mostrar el panel con la lista de cuentas
}

// Función para eliminar una cuenta
function deleteAccount(index) {
    // Eliminar la cuenta del array
    accounts.splice(index, 1);

    // Actualizar localStorage
    localStorage.setItem("accounts", JSON.stringify(accounts));

    // Recargar las cuentas
    loadAccounts();

    // Mostrar mensaje de éxito
    displayMessage("Cuenta eliminada con éxito.");
}

// Crear cuenta bancaria
document.getElementById("create-account-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("account-name").value;
    const phone = document.getElementById("account-phone").value;
    const balance = parseFloat(document.getElementById("initial-balance").value);

    // Validar si el teléfono ya existe (número de teléfono único)
    const isPhoneDuplicate = accounts.some(account => account.phone === phone);

    if (isPhoneDuplicate) {
        displayMessage("El número de teléfono ya está registrado.");
        return;
    }

    // Crear nueva cuenta
    const newAccount = { name, phone, balance };
    accounts.push(newAccount);

    // Guardar las cuentas en localStorage
    localStorage.setItem("accounts", JSON.stringify(accounts));

    // Limpiar el formulario y recargar las cuentas
    document.getElementById("create-account-form").reset();
    loadAccounts();
    showPanel('bizum');  // Cambiar al panel de "Realizar Bizum" después de crear la cuenta
});

// Realizar Bizum
document.getElementById("submit-bizum").addEventListener("click", function() {
    const senderPhone = document.getElementById("account-selector").value;
    const recipientPhone = document.getElementById("bizum-recipient").value;
    const amount = parseFloat(document.getElementById("bizum-amount").value);

    if (!senderPhone || !recipientPhone || !amount) {
        displayMessage("Por favor, completa todos los campos.");
        return;
    }

    // Buscar cuentas
    const senderAccount = accounts.find(account => account.phone === senderPhone);
    const recipientAccount = accounts.find(account => account.phone === recipientPhone);

    if (!recipientAccount) {
        displayMessage("La cuenta del destinatario no existe.");
        return;
    }

    // Verificar si el saldo es suficiente
    if (senderAccount.balance < amount) {
        displayMessage("No tienes saldo suficiente para realizar el Bizum.");
        return;
    }

    // Realizar la transferencia
    senderAccount.balance -= amount;
    recipientAccount.balance += amount;

    // Guardar las cuentas actualizadas en localStorage
    localStorage.setItem("accounts", JSON.stringify(accounts));

    displayMessage(`Bizum de €${amount} realizado a ${recipientPhone}.`);
    loadAccounts();  // Recargar las cuentas
});

// Función para mostrar mensajes
function displayMessage(message) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.display = "block";
    setTimeout(function() {
        messageElement.style.display = "none";
    }, 3000);
}
