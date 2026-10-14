
"use strict";

// ============================================
// 1. Get HTML elements
// ============================================

const qInput = document.getElementById("q");
const alphaInput = document.getElementById("alpha");
const alicePrivateInput = document.getElementById("alicePrivate");
const bobPrivateInput = document.getElementById("bobPrivate");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const results = document.getElementById("results");

const calculateBtn = document.getElementById("calculateBtn");
const randomBtn = document.getElementById("randomBtn");
const resetBtn = document.getElementById("resetBtn");

const previousStepBtn = document.getElementById("previousStepBtn");
const nextStepBtn = document.getElementById("nextStepBtn");

const progressBar = document.getElementById("progressBar");
const stepCounter = document.getElementById("stepCounter");
const stepTitle = document.getElementById("stepTitle");
const stepDescription = document.getElementById("stepDescription");
const stepCalculation = document.getElementById("stepCalculation");
const stepExplanation = document.getElementById("stepExplanation");

const runTestsBtn = document.getElementById("runTestsBtn");
const clearTestsBtn = document.getElementById("clearTestsBtn");
const testResults = document.getElementById("testResults");
const testSummary = document.getElementById("testSummary");

let calculationSteps = [];
let currentStep = 0;


// ============================================
// 2. Mathematical helper functions
// ============================================

function isInteger(value) {
    return Number.isSafeInteger(value);
}

function isPrime(number) {
    if (!isInteger(number) || number < 2) {
        return false;
    }

    if (number === 2) {
        return true;
    }

    if (number % 2 === 0) {
        return false;
    }

    for (let i = 3; i <= Math.sqrt(number); i += 2) {
        if (number % i === 0) {
            return false;
        }
    }

    return true;
}

// Calculate (base ^ exponent) mod modulus using BigInt.
function modularExponentiation(base, exponent, modulus) {
    let b = BigInt(base);
    let e = BigInt(exponent);
    const m = BigInt(modulus);

    let result = 1n;
    b = b % m;

    while (e > 0n) {
        if (e % 2n === 1n) {
            result = (result * b) % m;
        }

        b = (b * b) % m;
        e = e / 2n;
    }

    return Number(result);
}

function primeFactors(number) {
    const factors = new Set();
    let n = number;

    for (let divisor = 2; divisor * divisor <= n; divisor++) {
        if (n % divisor === 0) {
            factors.add(divisor);

            while (n % divisor === 0) {
                n /= divisor;
            }
        }
    }

    if (n > 1) {
        factors.add(n);
    }

    return [...factors];
}

// Check whether alpha is a primitive root modulo prime q.
function isPrimitiveRoot(alpha, q) {
    if (!isPrime(q) || alpha < 2 || alpha >= q) {
        return false;
    }

    const factors = primeFactors(q - 1);

    for (const factor of factors) {
        if (
            modularExponentiation(alpha, (q - 1) / factor, q) === 1
        ) {
            return false;
        }
    }

    return true;
}


// ============================================
// 3. Input validation
// ============================================

function validateParameters(q, alpha, XA, XB) {
    if (
        qInput.value.trim() === "" ||
        alphaInput.value.trim() === "" ||
        alicePrivateInput.value.trim() === "" ||
        bobPrivateInput.value.trim() === ""
    ) {
        return "Please enter all four values.";
    }

    if (![q, alpha, XA, XB].every(isInteger)) {
        return "All inputs must be valid whole numbers.";
    }

    if (q < 3 || q > 10000) {
        return "q must be between 3 and 10000 in this simulator.";
    }

    if (!isPrime(q)) {
        return "Invalid q: q must be a prime number.";
    }

    if (alpha < 2 || alpha >= q) {
        return "Invalid α: enter a value from 2 to q - 1.";
    }

    if (!isPrimitiveRoot(alpha, q)) {
        return "Invalid α: it must be a primitive root modulo q.";
    }

    if (XA < 1 || XA > q - 2) {
        return "Alice's private key XA must be between 1 and q - 2.";
    }

    if (XB < 1 || XB > q - 2) {
        return "Bob's private key XB must be between 1 and q - 2.";
    }

    return null;
}

// Separate validation for automated test cases.
function validateTestValues(q, alpha, XA, XB) {
    if ([q, alpha, XA, XB].some(value => value === null)) {
        return "Please enter all four values.";
    }

    if (![q, alpha, XA, XB].every(isInteger)) {
        return "All inputs must be valid whole numbers.";
    }

    if (q < 3 || q > 10000) {
        return "q must be between 3 and 10000.";
    }

    if (!isPrime(q)) {
        return "Invalid q: q must be a prime number.";
    }

    if (alpha < 2 || alpha >= q) {
        return "Invalid α: enter a value from 2 to q - 1.";
    }

    if (!isPrimitiveRoot(alpha, q)) {
        return "Invalid α: it must be a primitive root modulo q.";
    }

    if (XA < 1 || XA > q - 2) {
        return "Alice's private key XA must be between 1 and q - 2.";
    }

    if (XB < 1 || XB > q - 2) {
        return "Bob's private key XB must be between 1 and q - 2.";
    }

    return null;
}


// ============================================
// 4. Messages and display helpers
// ============================================

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    successMessage.hidden = true;
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.hidden = false;
    errorMessage.hidden = true;
}

function clearMessages() {
    errorMessage.hidden = true;
    successMessage.hidden = true;

    document.querySelectorAll(".field input").forEach(input => {
        input.classList.remove("invalid");
    });
}

function highlightInvalidInputs() {
    document.querySelectorAll(".field input").forEach(input => {
        input.classList.remove("invalid");
    });

    const fields = [
        qInput,
        alphaInput,
        alicePrivateInput,
        bobPrivateInput
    ];

    fields.forEach(input => {
        if (input.value.trim() === "") {
            input.classList.add("invalid");
        }
    });

    const q = Number(qInput.value);
    const alpha = Number(alphaInput.value);
    const XA = Number(alicePrivateInput.value);
    const XB = Number(bobPrivateInput.value);

    if (qInput.value.trim() !== "" &&
        (!isInteger(q) || q < 3 || q > 10000 || !isPrime(q))) {
        qInput.classList.add("invalid");
        return;
    }

    if (alphaInput.value.trim() !== "" &&
        (!isInteger(alpha) || !isPrimitiveRoot(alpha, q))) {
        alphaInput.classList.add("invalid");
        return;
    }

    if (alicePrivateInput.value.trim() !== "" &&
        (!isInteger(XA) || XA < 1 || XA > q - 2)) {
        alicePrivateInput.classList.add("invalid");
    }

    if (bobPrivateInput.value.trim() !== "" &&
        (!isInteger(XB) || XB < 1 || XB > q - 2)) {
        bobPrivateInput.classList.add("invalid");
    }
}

function clearCalculation() {
    results.hidden = true;
    calculationSteps = [];
    currentStep = 0;

    progressBar.style.width = "0%";
    stepCounter.textContent = "Step 0 of 5";
    stepTitle.textContent = "Ready to calculate";
    stepDescription.textContent =
        "Enter valid values and click Calculate Keys.";
    stepCalculation.textContent = "No calculation yet.";
    stepExplanation.textContent = "";

    previousStepBtn.disabled = true;
    nextStepBtn.disabled = true;
    nextStepBtn.textContent = "Next Step";
}


// ============================================
// 5. Step-by-step calculations
// ============================================

function createCalculationSteps(q, alpha, XA, XB, YA, YB, KA, KB) {
    return [
        {
            title: "Step 1: Agree on public parameters",
            description: "Alice and Bob use the same prime number q and primitive root alpha.",
            calculation: `q = ${q}\nα = ${alpha}`,
            explanation: "These values are public and do not need to be secret."
        },
        {
            title: "Step 2: Alice calculates her public key",
            description: "Alice uses her private key XA to calculate YA.",
            calculation:
                `YA = α^XA mod q\n` +
                `YA = ${alpha}^${XA} mod ${q}\n` +
                `YA = ${YA}`,
            explanation: "Alice keeps XA private and shares YA with Bob."
        },
        {
            title: "Step 3: Bob calculates his public key",
            description: "Bob uses his private key XB to calculate YB.",
            calculation:
                `YB = α^XB mod q\n` +
                `YB = ${alpha}^${XB} mod ${q}\n` +
                `YB = ${YB}`,
            explanation: "Bob keeps XB private and shares YB with Alice."
        },
        {
            title: "Step 4: Exchange public keys",
            description: "Alice and Bob exchange their public keys.",
            calculation: `Alice sends YA = ${YA}\nBob sends YB = ${YB}`,
            explanation: "Their private keys XA and XB are not exchanged."
        },
        {
            title: "Step 5: Calculate the shared secret",
            description: "Each person uses the other person's public key and their own private key.",
            calculation:
                `Alice: KA = YB^XA mod q\n` +
                `KA = ${YB}^${XA} mod ${q} = ${KA}\n\n` +
                `Bob: KB = YA^XB mod q\n` +
                `KB = ${YA}^${XB} mod ${q} = ${KB}`,
            explanation: KA === KB
                ? `Both calculated ${KA}. The shared keys match.`
                : "The keys do not match. Check the calculation and inputs."
        }
    ];
}

function displayStep() {
    if (calculationSteps.length === 0) {
        return;
    }

    const step = calculationSteps[currentStep];

    stepTitle.textContent = step.title;
    stepDescription.textContent = step.description;
    stepCalculation.textContent = step.calculation;
    stepExplanation.textContent = step.explanation;

    stepCounter.textContent =
        `Step ${currentStep + 1} of ${calculationSteps.length}`;

    progressBar.style.width =
        `${((currentStep + 1) / calculationSteps.length) * 100}%`;

    previousStepBtn.disabled = currentStep === 0;
    nextStepBtn.disabled = currentStep === calculationSteps.length - 1;

    nextStepBtn.textContent =
        currentStep === calculationSteps.length - 1
            ? "Completed"
            : "Next Step";
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        displayStep();
    }
}

function nextStep() {
    if (currentStep < calculationSteps.length - 1) {
        currentStep++;
        displayStep();
    }
}


// ============================================
// 6. Calculate Diffie-Hellman keys
// ============================================

function calculateSharedSecret() {
    clearMessages();

    const q = Number(qInput.value);
    const alpha = Number(alphaInput.value);
    const XA = Number(alicePrivateInput.value);
    const XB = Number(bobPrivateInput.value);

    const validationError = validateParameters(q, alpha, XA, XB);

    if (validationError) {
        clearCalculation();
        highlightInvalidInputs();
        showError(validationError);
        return;
    }

    const YA = modularExponentiation(alpha, XA, q);
    const YB = modularExponentiation(alpha, XB, q);

    const KA = modularExponentiation(YB, XA, q);
    const KB = modularExponentiation(YA, XB, q);

    document.getElementById("alicePublic").textContent = YA;
    document.getElementById("bobPublic").textContent = YB;
    document.getElementById("aliceSecret").textContent = KA;
    document.getElementById("bobSecret").textContent = KB;

    const keyMatch = document.getElementById("keyMatch");

    if (KA === KB) {
        keyMatch.textContent =
            "SUCCESS: Alice and Bob have the same shared key.";
        keyMatch.className = "match-message";
    } else {
        keyMatch.textContent =
            "WARNING: The shared keys do not match.";
        keyMatch.className = "match-message mismatch";
    }

    results.hidden = false;

    calculationSteps = createCalculationSteps(
        q, alpha, XA, XB, YA, YB, KA, KB
    );

    currentStep = 0;
    displayStep();

    showSuccess("Keys calculated successfully.");
}


// ============================================
// 7. Generate random private keys
// ============================================

function generateRandomKeys() {
    clearMessages();

    const q = Number(qInput.value);
    const alpha = Number(alphaInput.value);

    if (!isInteger(q) || q < 3 || q > 10000 || !isPrime(q)) {
        clearCalculation();
        showError("Enter a valid prime q between 3 and 10000 first.");
        return;
    }

    if (!isInteger(alpha) || !isPrimitiveRoot(alpha, q)) {
        clearCalculation();
        showError("Enter a valid primitive root α for the chosen q.");
        return;
    }

    const randomPrivateKey = () =>
        Math.floor(Math.random() * (q - 2)) + 1;

    alicePrivateInput.value = randomPrivateKey();
    bobPrivateInput.value = randomPrivateKey();

    calculateSharedSecret();
}


// ============================================
// 8. Reset simulator
// ============================================

function resetExample() {
    qInput.value = 23;
    alphaInput.value = 5;
    alicePrivateInput.value = 6;
    bobPrivateInput.value = 15;

    clearMessages();
    clearCalculation();
}


// ============================================
// 9. Automated exceptional-case tests
// ============================================

function verifySharedKeys(KA, KB) {
    return KA === KB;
}

function runAllTests() {
    const testCases = [
        {
            id: "TC01",
            name: "Valid input",
            input: "q=23, α=5, XA=6, XB=15",
            expected: "YA=8, YB=19, KA=KB=2",
            run: () => {
                const error = validateTestValues(23, 5, 6, 15);

                if (error) {
                    return { pass: false, actual: error };
                }

                const YA = modularExponentiation(5, 6, 23);
                const YB = modularExponentiation(5, 15, 23);
                const KA = modularExponentiation(YB, 6, 23);
                const KB = modularExponentiation(YA, 15, 23);

                const pass =
                    YA === 8 && YB === 19 && KA === 2 && KB === 2;

                return {
                    pass,
                    actual: `YA=${YA}, YB=${YB}, KA=${KA}, KB=${KB}`
                };
            }
        },
        {
            id: "TC02",
            name: "Empty input",
            input: "q is empty",
            expected: "Reject with missing-input error",
            run: () => {
                const error = validateTestValues(null, 5, 6, 15);

                return {
                    pass: error === "Please enter all four values.",
                    actual: error || "Input unexpectedly accepted"
                };
            }
        },
        {
            id: "TC03",
            name: "Non-prime q",
            input: "q=15, α=2, XA=3, XB=4",
            expected: "Reject because q is not prime",
            run: () => {
                const error = validateTestValues(15, 2, 3, 4);

                return {
                    pass: error === "Invalid q: q must be a prime number.",
                    actual: error || "Input unexpectedly accepted"
                };
            }
        },
        {
            id: "TC04",
            name: "Invalid primitive root",
            input: "q=23, α=4, XA=6, XB=15",
            expected: "Reject because α is not a primitive root",
            run: () => {
                const error = validateTestValues(23, 4, 6, 15);

                return {
                    pass: error ===
                        "Invalid α: it must be a primitive root modulo q.",
                    actual: error || "Input unexpectedly accepted"
                };
            }
        },
        {
            id: "TC05",
            name: "Invalid private key",
            input: "q=23, α=5, XA=0, XB=15",
            expected: "Reject because XA is outside the allowed range",
            run: () => {
                const error = validateTestValues(23, 5, 0, 15);

                return {
                    pass: error ===
                        "Alice's private key XA must be between 1 and q - 2.",
                    actual: error || "Input unexpectedly accepted"
                };
            }
        },
        {
            id: "TC06",
            name: "Shared-key mismatch",
            input: "Simulated keys: KA=2, KB=3",
            expected: "Detect mismatch",
            run: () => {
                const matches = verifySharedKeys(2, 3);

                return {
                    pass: matches === false,
                    actual: matches
                        ? "Keys match unexpectedly"
                        : "Mismatch detected correctly"
                };
            }
        }
    ];

    testResults.innerHTML = "";

    let passed = 0;
    let failed = 0;

    testCases.forEach(test => {
        let outcome;

        try {
            outcome = test.run();
        } catch (error) {
            outcome = {
                pass: false,
                actual: `Test error: ${error.message}`
            };
        }

        if (outcome.pass) {
            passed++;
        } else {
            failed++;
        }

        const row = document.createElement("tr");

        [
            test.id,
            test.name,
            test.input,
            test.expected,
            outcome.actual
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.className = `status ${outcome.pass ? "pass" : "fail"}`;
        status.textContent = outcome.pass ? "PASS" : "FAIL";

        statusCell.appendChild(status);
        row.appendChild(statusCell);
        testResults.appendChild(row);
    });

    testSummary.hidden = false;
    testSummary.textContent =
        `Testing complete: ${passed} passed, ${failed} failed, ` +
        `${testCases.length} total test cases.`;

    testSummary.style.color = failed === 0 ? "#86efac" : "#fda4af";
}

function clearTestResults() {
    testResults.innerHTML = `
        <tr>
            <td colspan="6" class="empty-table">
                Click "Run All Test Cases" to begin testing.
            </td>
        </tr>
    `;

    testSummary.hidden = true;
}


// ============================================
// 10. Connect buttons to functions
// ============================================

calculateBtn.addEventListener("click", calculateSharedSecret);
randomBtn.addEventListener("click", generateRandomKeys);
resetBtn.addEventListener("click", resetExample);

previousStepBtn.addEventListener("click", previousStep);
nextStepBtn.addEventListener("click", nextStep);

runTestsBtn.addEventListener("click", runAllTests);
clearTestsBtn.addEventListener("click", clearTestResults);

// Clear messages when the user edits an input.
document.querySelectorAll(".field input").forEach(input => {
    input.addEventListener("input", () => {
        input.classList.remove("invalid");
        errorMessage.hidden = true;
        successMessage.hidden = true;
    });
});

// Initial display
clearCalculation();
clearTestResults();
