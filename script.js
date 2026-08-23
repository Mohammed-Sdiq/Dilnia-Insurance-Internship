const WORKER_URL = "https://flat-sun-52ba.mhamadsdiq237.workers.dev";

let currentStep = 1;

function goToStep(stepNumber) {
    document.querySelectorAll(".steps").forEach(el => el.classList.remove("active"));
    document.getElementById("step" + stepNumber).classList.add("active");

    document.querySelectorAll(".progressStep").forEach(el => el.classList.remove("active"));
    document.getElementById("progressStep" + stepNumber).classList.add("active");

    currentStep = stepNumber;


    if (stepNumber === 3) {
        renderPlans();
    }
    if (stepNumber === 4) {
        renderOrderSummary();
    }
}


document.querySelectorAll(".theNextButtons").forEach(button => {
    button.addEventListener("click", () => {
        if (!validateStep(currentStep)) {
            alert("Please fill in all fields before continuing.");
            return;
        }
        const nextStep = Number(button.dataset.next);
        goToStep(nextStep);
    });
});


document.querySelectorAll(".theBackButton").forEach(button => {
    button.addEventListener("click", () => {
        goToStep(Number(button.dataset.back));
    });
});


function validateStep(stepNumber) {
    const step = document.getElementById("step" + stepNumber);
    const inputs = step.querySelectorAll("input[required], select[required]");
    for (const input of inputs) {
        if (!input.value) {
            input.focus();
            return false;
        }
    }
    return true;
}

function readClientInfo() {
    return {
        fullName: document.getElementById("fullName").value,
        age: Number(document.getElementById("age").value),
        experience: Number(document.getElementById("experience").value),
        claims: Number(document.getElementById("claims").value),
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value
    };
}

function readCarInfo() {
    return {
        vehicleType: document.getElementById("vehicleType").value,
        make: document.getElementById("make").value,
        model: document.getElementById("model").value,
        plateNumber: document.getElementById("plateNumber").value,
        year: Number(document.getElementById("year").value),
        engineCc: Number(document.getElementById("engineCc").value),
        marketValue: Number(document.getElementById("marketValue").value),
        fuelType: document.getElementById("fuelType").value,
        usageType: document.getElementById("usageType").value,
        annualMileage: Number(document.getElementById("annualMileage").value),
        parking: document.getElementById("parking").value,
        region: document.getElementById("region").value
    };
}


function calculatePrice(client, car, coverageType, periodMonths) {
    const BASE_PREMIUM = 300.0;
    let price = BASE_PREMIUM;


    price *= getAgeFactor(client.age);
    price *= getExperienceFactor(client.experience);
    price *= (1.0 + client.claims * 0.20);


    const vehicleAge = 2026 - car.year;
    price *= getVehicleAgeFactor(vehicleAge);
    price *= getEngineSizeFactor(car.engineCc);
    price *= getVehicleTypeFactor(car.vehicleType);


    price *= (car.usageType === "commercial" ? 1.4 : car.usageType === "ride_hailing" ? 1.5 : 1.0);
    price *= (car.parking === "street" ? 1.1 : 1.0);


    price *= getCoverageFactor(coverageType);
    price *= (car.region === "urban" ? 1.15 : 1.0);


    price = applyPeriodPricing(price, periodMonths);

    return Math.round(price * 100) / 100;
}


function applyPeriodPricing(annualPrice, periodMonths) {
    const monthlyRate = annualPrice / 12;

    switch (periodMonths) {
        case 1:  return monthlyRate * 1 * 1.20; 
        case 3:  return monthlyRate * 3 * 1.12; 
        case 6:  return monthlyRate * 6 * 1.06; 
        case 12: return annualPrice;             
        default: return annualPrice;
    }
}

function getAgeFactor(age) {
    if (age < 25) return 1.6;
    if (age <= 65) return 1.0;
    return 1.2;
}
function getExperienceFactor(years) {
    if (years < 2) return 1.3;
    if (years <= 5) return 1.1;
    return 1.0;
}
function getVehicleAgeFactor(age) {
    if (age <= 3) return 1.2;
    if (age <= 10) return 1.0;
    return 0.9;
}
function getEngineSizeFactor(cc) {
    if (cc <= 1400) return 1.0;
    if (cc <= 2000) return 1.15;
    return 1.35;
}
function getVehicleTypeFactor(vehicleType) {
    if (vehicleType === "truck") return 1.5;
    return 1.0; 
}
function getCoverageFactor(coverageType) {
    if (coverageType === "third_party") return 1.0;
    if (coverageType === "fire_theft") return 1.3;
    if (coverageType === "comprehensive") return 1.8;
    return 1.0;
}

const PLAN_INFO = {
    third_party: {
        label: "Third-Party Only",
        description: "Covers damage you cause to others. Legal minimum in most places."
    },
    fire_theft: {
        label: "Third-Party, Fire & Theft",
        description: "Everything in Third-Party, plus your own car if it's stolen or burnt."
    },
    comprehensive: {
        label: "Comprehensive",
        description: "Covers your car too, even if the accident was your fault."
    }
};



let selectedPlan = null;

function renderPlans() {
    const client = readClientInfo();
    const car = readCarInfo();
    const periodMonths = Number(document.getElementById("coveragePeriod").value);

    const container = document.getElementById("plansContainer");
    container.innerHTML = ""; 

    
    selectedPlan = null;
    document.getElementById("toPaymentBtn").disabled = true;

    Object.keys(PLAN_INFO).forEach(planKey => {
        const price = calculatePrice(client, car, planKey, periodMonths);
        const info = PLAN_INFO[planKey];
        const periodLabel = getPeriodLabel(periodMonths);

        const card = document.createElement("div");
        card.className = "thePlanCards";
        card.dataset.plan = planKey;

        card.innerHTML = `
            <h3>${info.label}</h3>
            <p class="thePlanPrice">$${price.toFixed(2)} / ${periodLabel}</p>
            <p class="thePlanDescription">${info.description}</p>
        `;

        card.addEventListener("click", () => {

            document.querySelectorAll(".thePlanCards").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");

            selectedPlan = { type: planKey, label: info.label, price: price, periodMonths: periodMonths, periodLabel: periodLabel };
            document.getElementById("toPaymentBtn").disabled = false;
        });

        container.appendChild(card);
    });
}

function getPeriodLabel(months) {
    if (months === 1) return "month";
    if (months === 12) return "year";
    return months + " months";
}

document.getElementById("coveragePeriod").addEventListener("change", () => {
    renderPlans(); });



function renderOrderSummary() {
    const summary = document.getElementById("orderSummary");
    summary.innerHTML = `
        <p><strong>Plan:</strong> ${selectedPlan.label}</p>
        <p><strong>Coverage Period:</strong> ${selectedPlan.periodLabel}</p>
        <p><strong>Total:</strong> $${selectedPlan.price.toFixed(2)}</p>
    `;
}


async function handleSubmit(event) {
    event.preventDefault();

    const resultBox = document.getElementById("resultMessage");
    resultBox.textContent = "Processing payment...";
    resultBox.style.color = "black";

    await new Promise(resolve => setTimeout(resolve, 1200));
    const paymentSucceeded = true;


    if (!paymentSucceeded) {
        resultBox.textContent = "Payment failed. Please check your card details.";
        resultBox.style.color = "red";
        return;
    }

    const client = readClientInfo();
    const car = readCarInfo();


    const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, car, selectedPlan })
    });

    const result = await response.json();

    if (!response.ok) {
        resultBox.textContent = "Payment succeeded, but saving your policy failed: " + result.error;
        resultBox.style.color = "red";
    } else {
        resultBox.textContent = `Payment successful (demo)! Your ${selectedPlan.label} policy is confirmed at $${selectedPlan.price.toFixed(2)}/year.`;
        resultBox.style.color = "green";
    }
}

document.getElementById("quoteForm").addEventListener("submit", handleSubmit);
