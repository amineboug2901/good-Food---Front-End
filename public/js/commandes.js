const forms = document.querySelectorAll(".form-etat");

//Etat
const validateIDEtat = (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const selectChangeState = form.querySelector(".form-select");
  const errorChangeState = form.querySelector(".error-etat");

  if (selectChangeState.validity.valid) {
    // reset border color
    selectChangeState.style.borderColor = "inherit";
    errorChangeState.style.display = "none";
  } else {
    // if (selectChangeState.validity.valueMissing) {
    selectChangeState.style.borderColor = "red";
    errorChangeState.style.display = "block";
  }
};

for (let form of forms) {
  form.addEventListener("submit", validateIDEtat);
}

const updateEtatCommande = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const selectChangeState = form.querySelector(".form-select");
  const submitBtn = form.querySelector("input[type=submit]");
  let data = {
    id_commande: parseInt(submitBtn.id),
    id_etat_commande: parseInt(selectChangeState.value),
    date: new Date().getTime(),
  };
  
  await fetch("/api/commande", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};

for (let form of forms) {
  form.addEventListener("submit", updateEtatCommande);
}