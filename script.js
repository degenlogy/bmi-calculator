/* ==========================================================================
   BMI Calculator
   Connected to index.html
   ========================================================================== */

(() => {
  "use strict";

  const form = document.getElementById("bmi-form");
  const resetButton = document.getElementById("reset-btn");

  const metricRadio = document.getElementById("unit-metric");
  const imperialRadio = document.getElementById("unit-imperial");

  const metricFields = document.getElementById("metric-fields");
  const imperialFields = document.getElementById("imperial-fields");

  const metricWeight = document.getElementById("metric-weight");
  const metricHeight = document.getElementById("metric-height");

  const imperialWeight = document.getElementById("imperial-weight");
  const imperialHeightFt = document.getElementById("imperial-height-ft");
  const imperialHeightIn = document.getElementById("imperial-height-in");

  const resultSection = document.getElementById("result-section");
  const bmiValue = document.getElementById("bmi-value");
  const bmiCategory = document.getElementById("bmi-category");
  const gaugePointer = document.getElementById("gauge-pointer");
  const healthyRangeText = document.getElementById("healthy-range-text");
  const categoryExplanation = document.getElementById("category-explanation");

  const errorIds = [
    "metric-weight-error",
    "metric-height-error",
    "imperial-weight-error",
    "imperial-height-ft-error",
    "imperial-height-in-error"
  ];

  function clearErrors() {
    errorIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });

    document.querySelectorAll(".input-container.has-error").forEach((el) => {
      el.classList.remove("has-error");
    });
  }

  function setError(input, errorId, message) {
    const container = input.closest(".input-container");
    if (container) container.classList.add("has-error");
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
  }

  function toggleUnits() {
    const metric = metricRadio.checked;
    metricFields.hidden = !metric;
    imperialFields.hidden = metric;

    // Keep inactive inputs out of keyboard/form submission flow.
    [metricWeight, metricHeight].forEach((input) => {
      input.disabled = !metric;
    });

    [imperialWeight, imperialHeightFt, imperialHeightIn].forEach((input) => {
      input.disabled = metric;
    });

    clearErrors();
    resultSection.hidden = true;
  }

  function getNumber(input) {
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) ? value : NaN;
  }

  function categoryFor(bmi) {
    if (bmi < 18.5) {
      return {
        name: "Underweight",
        className: "badge-underweight",
        explanation: "Your BMI is below the standard healthy BMI range for adults."
      };
    }

    if (bmi < 25) {
      return {
        name: "Normal weight",
        className: "badge-normal",
        explanation: "Your BMI is within the standard healthy BMI range for adults."
      };
    }

    if (bmi < 30) {
      return {
        name: "Overweight",
        className: "badge-overweight",
        explanation: "Your BMI is above the standard healthy BMI range for adults."
      };
    }

    return {
      name: "Obese",
      className: "badge-obesity",
      explanation: "Your BMI is in the obesity category under standard adult BMI ranges."
    };
  }

  function gaugePosition(bmi) {
    // The gauge is intentionally capped so extreme BMI values stay inside it.
    const min = 10;
    const max = 40;
    const clamped = Math.min(max, Math.max(min, bmi));
    return ((clamped - min) / (max - min)) * 100;
  }

  function showResult(bmi) {
    const category = categoryFor(bmi);

    bmiValue.textContent = bmi.toFixed(1);
    bmiCategory.textContent = category.name;

    bmiCategory.classList.remove(
      "badge-underweight",
      "badge-normal",
      "badge-overweight",
      "badge-obesity"
    );
    bmiCategory.classList.add(category.className);

    gaugePointer.style.left = `${gaugePosition(bmi)}%`;
    healthyRangeText.innerHTML =
      "Healthy BMI range: <strong>18.5 – 24.9</strong>";
    categoryExplanation.textContent = category.explanation;

    resultSection.hidden = false;
  }

  function calculateBMI(event) {
    event.preventDefault();
    clearErrors();

    let bmi;

    if (metricRadio.checked) {
      const weight = getNumber(metricWeight);
      const heightCm = getNumber(metricHeight);

      if (!Number.isFinite(weight)) {
        setError(metricWeight, "metric-weight-error", "Enter your weight.");
      } else if (weight < 10 || weight > 350) {
        setError(metricWeight, "metric-weight-error", "Use a weight from 10–350 kg.");
      }

      if (!Number.isFinite(heightCm)) {
        setError(metricHeight, "metric-height-error", "Enter your height.");
      } else if (heightCm < 50 || heightCm > 260) {
        setError(metricHeight, "metric-height-error", "Use a height from 50–260 cm.");
      }

      if (
        !Number.isFinite(weight) ||
        !Number.isFinite(heightCm) ||
        weight < 10 || weight > 350 ||
        heightCm < 50 || heightCm > 260
      ) {
        resultSection.hidden = true;
        return;
      }

      const heightM = heightCm / 100;
      bmi = weight / (heightM * heightM);
    } else {
      const weightLb = getNumber(imperialWeight);
      const feet = getNumber(imperialHeightFt);
      const inches = getNumber(imperialHeightIn);

      if (!Number.isFinite(weightLb)) {
        setError(imperialWeight, "imperial-weight-error", "Enter your weight.");
      } else if (weightLb < 20 || weightLb > 800) {
        setError(imperialWeight, "imperial-weight-error", "Use a weight from 20–800 lb.");
      }

      if (!Number.isFinite(feet)) {
        setError(imperialHeightFt, "imperial-height-ft-error", "Enter feet.");
      } else if (feet < 1 || feet > 8) {
        setError(imperialHeightFt, "imperial-height-ft-error", "Use 1–8 feet.");
      }

      if (!Number.isFinite(inches)) {
        setError(imperialHeightIn, "imperial-height-in-error", "Enter inches.");
      } else if (inches < 0 || inches > 11.9) {
        setError(imperialHeightIn, "imperial-height-in-error", "Use 0–11.9 inches.");
      }

      if (
        !Number.isFinite(weightLb) ||
        !Number.isFinite(feet) ||
        !Number.isFinite(inches) ||
        weightLb < 20 || weightLb > 800 ||
        feet < 1 || feet > 8 ||
        inches < 0 || inches > 11.9
      ) {
        resultSection.hidden = true;
        return;
      }

      const totalInches = (feet * 12) + inches;
      if (totalInches <= 0) {
        setError(imperialHeightFt, "imperial-height-ft-error", "Enter a valid height.");
        resultSection.hidden = true;
        return;
      }

      bmi = 703 * weightLb / (totalInches * totalInches);
    }

    showResult(bmi);
  }

  function resetCalculator() {
    form.reset();
    metricRadio.checked = true;
    toggleUnits();
    clearErrors();

    bmiValue.textContent = "--";
    bmiCategory.textContent = "Normal weight";
    bmiCategory.classList.remove(
      "badge-underweight",
      "badge-normal",
      "badge-overweight",
      "badge-obesity"
    );
    gaugePointer.style.left = "0%";
    resultSection.hidden = true;
  }

  metricRadio.addEventListener("change", toggleUnits);
  imperialRadio.addEventListener("change", toggleUnits);
  form.addEventListener("submit", calculateBMI);
  resetButton.addEventListener("click", resetCalculator);

  // Prevent invalid negative values from being entered by keyboard.
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "-" || event.key === "e" || event.key === "E") {
        event.preventDefault();
      }
    });
  });

  toggleUnits();
})();
