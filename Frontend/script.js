const scoreRing = document.getElementById("scoreRing");
const ringValue = document.getElementById("ringValue");
const threatLevel = document.getElementById("threatLevel");
const scanButton = document.getElementById("scanButton");
const urlInput = document.getElementById("urlInput");

function setLoadingState(isLoading) {
    scanButton.disabled = isLoading;
    scanButton.classList.toggle("is-loading", isLoading);
    const label = scanButton.querySelector(".button-label");
    label.textContent = isLoading ? "Analyzing..." : "Analyze URL";
}

function updateScoreVisual(score, risk) {
    const clamped = Math.min(Math.max(score, 0), 100);
    const ringColor = risk === "High Risk"
        ? "#ef4444"
        : risk === "Medium Risk"
            ? "#f59e0b"
            : risk === "Low Risk"
                ? "#22c55e"
                : "#3b82f6";

    scoreRing.style.background = `conic-gradient(${ringColor} ${clamped}%, rgba(148, 163, 184, 0.18) 0)`;
    ringValue.textContent = clamped;
    threatLevel.textContent = risk;
}

async function analyzeURL() {
    const url = urlInput.value.trim();

    if (!url) {
        alert("Please enter a URL.");
        urlInput.focus();
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        const resultBox = document.getElementById("result");
        const riskLabel = document.getElementById("risk");
        const riskBadge = document.getElementById("riskBadge");
        const scoreEl = document.getElementById("score");
        const reasonsList = document.getElementById("reasons");

        resultBox.classList.remove("hidden");
        resultBox.classList.remove("success", "warning", "danger");

        if (data.risk === "High Risk") {
            resultBox.classList.add("danger");
        } else if (data.risk === "Medium Risk") {
            resultBox.classList.add("warning");
        } else {
            resultBox.classList.add("success");
        }

        riskLabel.textContent = data.risk;
        scoreEl.textContent = "Score: " + data.score + "/100";

        riskBadge.textContent = data.risk;
        riskBadge.classList.remove("high", "medium", "low", "safe");

        if (data.risk === "High Risk") {
            riskBadge.classList.add("high");
        } else if (data.risk === "Medium Risk") {
            riskBadge.classList.add("medium");
        } else if (data.risk === "Low Risk") {
            riskBadge.classList.add("low");
        } else {
            riskBadge.classList.add("safe");
        }

        updateScoreVisual(data.score, data.risk);

        reasonsList.innerHTML = "";
        data.reasons.forEach(reason => {
            const li = document.createElement("li");
            li.textContent = reason;
            reasonsList.appendChild(li);
        });

    } catch (error) {
        alert("Cannot connect to the detector server. Make sure app.py is running.");
    } finally {
        setLoadingState(false);
    }
}

urlInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        analyzeURL();
    }
});

updateScoreVisual(0, "Safe");