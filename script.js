const passwordInput = document.getElementById("password");
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const errorMessage = document.getElementById("errorMessage");
const copyMessage = document.getElementById("copyMessage");

const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.?"
};

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

function secureRandomIndex(max) {
  // Rejection sampling avoids modulo bias.
  const range = 256;
  const limit = Math.floor(range / max) * max;
  const randomByte = new Uint8Array(1);

  do {
    crypto.getRandomValues(randomByte);
  } while (randomByte[0] >= limit);

  return randomByte[0] % max;
}

function shuffleCharacters(characters) {
  // Fisher-Yates shuffle using cryptographically strong random values.
  for (let i = characters.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters;
}

function generatePassword() {
  errorMessage.textContent = "";
  copyMessage.textContent = "";

  const selectedSets = Object.keys(characterSets)
    .filter(type => document.getElementById(type).checked)
    .map(type => characterSets[type]);

  if (selectedSets.length === 0) {
    passwordInput.value = "";
    errorMessage.textContent =
      "Please select at least one character type.";
    return;
  }

  const length = Number(lengthInput.value);

  if (!Number.isInteger(length) || length < 8 || length > 64) {
    errorMessage.textContent = "Choose a length from 8 to 64.";
    return;
  }

  // Include at least one character from every selected set.
  const passwordCharacters = selectedSets.map(set =>
    set[secureRandomIndex(set.length)]
  );

  const allCharacters = selectedSets.join("");

  while (passwordCharacters.length < length) {
    passwordCharacters.push(
      allCharacters[secureRandomIndex(allCharacters.length)]
    );
  }

  shuffleCharacters(passwordCharacters);
  passwordInput.value = passwordCharacters.join("");
}

async function copyPassword() {
  copyMessage.textContent = "";

  if (!passwordInput.value) {
    copyMessage.textContent = "Generate a password first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordInput.value);
    copyMessage.textContent = "Password copied successfully!";
  } catch {
    // Fallback for browsers where Clipboard API is unavailable.
    passwordInput.select();
    const copied = document.execCommand("copy");

    copyMessage.textContent = copied
      ? "Password copied successfully!"
      : "Copy failed. Please select and copy the password manually.";
  }
}

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

// Generate a password when the page first loads.
generatePassword();
