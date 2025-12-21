document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const form = document.getElementById('predictionForm');
    const resultSection = document.getElementById('resultSection');
    const submitBtn = document.getElementById('submitBtn');

    // 1. Loader Transition
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 2000);

    // 2. Data Mapping
    const getFormDataAsArray = (formData) => {
        const mapping = {
            sex: { "M": 1, "F": 0 },
            chestPain: { "TA": 0, "ATA": 1, "NAP": 2, "ASY": 3 },
            restingECG: { "Normal": 0, "ST": 1, "LVH": 2 },
            angina: { "N": 0, "Y": 1 },
            slope: { "Up": 0, "Flat": 1, "Down": 2 }
        };

        return [
            Number(formData.get('age')),
            mapping.sex[formData.get('sex')],
            mapping.chestPain[formData.get('chestPain')],
            Number(formData.get('restingBP')),
            Number(formData.get('cholesterol')),
            Number(formData.get('fastingBS')),
            mapping.restingECG[formData.get('restingECG')],
            Number(formData.get('maxHR')),
            mapping.angina[formData.get('angina')],
            parseFloat(formData.get('oldpeak')),
            mapping.slope[formData.get('slope')],
            Number(formData.get('heartDisease'))
        ];
    };

    // 3. Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Submit triggered");

        const formData = new FormData(form);
        const inputBuffer = getFormDataAsArray(formData);
        
        submitBtn.innerHTML = `<span>Processing...</span>`;
        submitBtn.classList.add('pointer-events-none');

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "input": inputBuffer })
            });

            if (!response.ok) throw new Error('Server unreachable');

            const data = await response.json();
            console.log("Model Response:", data);
            
            showResults(data.probability * 100);

        } catch (error) {
            console.error(error);
            alert('Error: Check if Flask app.py is running!');
            submitBtn.innerHTML = `<span>Try Again</span>`;
            submitBtn.classList.remove('pointer-events-none');
        }
    });

    function showResults(probValue) {
        form.parentElement.style.display = 'none';
        resultSection.classList.remove('hidden');
        setTimeout(() => {
            resultSection.style.opacity = '1';
            animateProbability(Math.round(probValue));
        }, 50);
    }

    function animateProbability(target) {
        const circle = document.getElementById('probabilityCircle');
        const text = document.getElementById('percentText');
        const badge = document.getElementById('riskBadge');
        const desc = document.getElementById('riskDesc');
        
        const circumference = 2 * Math.PI * 88;
        let current = 0;
        
        const interval = setInterval(() => {
            if (current >= target) {
                clearInterval(interval);
            } else {
                current++;
                text.innerText = current + '%';
                circle.style.strokeDashoffset = circumference - (current / 100) * circumference;
            }
        }, 20);

        if (target >= 50) {
            badge.innerText = "HIGH RISK";
            badge.className = "inline-block px-8 py-3 rounded-2xl text-lg font-bold mb-4 bg-red-500/20 text-red-400 border border-red-500/30";
            circle.style.color = "#ef4444";
            desc.innerText = "Model suggests significant indicators of heart disease.";
        } else {
            badge.innerText = "LOW RISK";
            badge.className = "inline-block px-8 py-3 rounded-2xl text-lg font-bold mb-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            circle.style.color = "#10b981";
            desc.innerText = "Metrics are within healthy ranges.";
        }
        createHealthCharts();
        showExplainability();
    }

    // --- PDF REPORT GENERATION ---
    document.getElementById('downloadBtn').addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 1. Gather Data
        const date = new Date().toLocaleString();
        const age = document.getElementsByName('age')[0].value;
        const sex = document.getElementsByName('sex')[0].options[document.getElementsByName('sex')[0].selectedIndex].text;
        const bp = document.getElementsByName('restingBP')[0].value;
        const chol = document.getElementsByName('cholesterol')[0].value;
        const maxHR = document.getElementsByName('maxHR')[0].value;
        const riskLevel = document.getElementById('riskBadge').innerText;
        const probability = document.getElementById('percentText').innerText;
        
        // 2. Styling the PDF (Professional Medical Look)
        // Header Blue Bar
        doc.setFillColor(59, 130, 246); // Blue color
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("CardioPulse AI", 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Advanced Diagnostic Report", 20, 30);
        doc.text(`Date: ${date}`, 150, 30);

        // Patient Data Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Patient Vitals", 20, 60);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 65, 190, 65);

        const startY = 75;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        
        // List vitals nicely
        doc.text(`• Age: ${age}`, 25, startY);
        doc.text(`• Sex: ${sex}`, 110, startY);
        doc.text(`• Resting BP: ${bp} mm Hg`, 25, startY + 10);
        doc.text(`• Cholesterol: ${chol} mg/dl`, 110, startY + 10);
        doc.text(`• Max Heart Rate: ${maxHR} bpm`, 25, startY + 20);

        // Result Section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("AI Analysis Result", 20, startY + 45);
        doc.line(20, startY + 50, 190, startY + 50);

        // Dynamic Color for Risk
        if (riskLevel.includes("HIGH")) {
            doc.setTextColor(220, 53, 69); // Red
        } else {
            doc.setTextColor(40, 167, 69); // Green
        }
        
        doc.setFontSize(18);
        doc.text(`Status: ${riskLevel}`, 25, startY + 65);
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80); // Grey
        doc.text(`Calculated Probability: ${probability}`, 25, startY + 75);

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated by CardioPulse Neural Engine. Consult a physician for clinical diagnosis.", 105, 280, null, null, "center");

        // 3. Trigger Download
        doc.save("CardioPulse_Medical_Report.pdf");
    });
});
// Add this inside script.js to make the background feel alive
function createParticle() {
    const particlesContainer = document.getElementById('particles-js');
    const particle = document.createElement('div');
    const size = Math.random() * 2 + 1 + 'px';
    
    particle.style.position = 'absolute';
    particle.style.width = size;
    particle.style.height = size;
    particle.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
    particle.style.borderRadius = '50%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.opacity = Math.random();
    
    particlesContainer.appendChild(particle);
    
    // Simple drift animation
    const animation = particle.animate([
        { transform: 'translateY(0)', opacity: particle.style.opacity },
        { transform: 'translateY(-100px)', opacity: 0 }
    ], {
        duration: Math.random() * 5000 + 5000,
        iterations: Infinity
    });
}

// Generate 50 particles for the "Neural" look
for(let i=0; i<50; i++) {
    createParticle();
}


 function createHealthCharts() {
        const age = Number(document.getElementsByName('age')[0].value);
        const bp = Number(document.getElementsByName('restingBP')[0].value);
        const chol = Number(document.getElementsByName('cholesterol')[0].value);
        const maxHR = Number(document.getElementsByName('maxHR')[0].value);
        const oldpeak = Number(document.getElementsByName('oldpeak')[0].value);

        const userData = [age, bp, chol, maxHR, oldpeak];
        const healthyData = [45, 120, 190, 160, 0.2];

        new Chart(document.getElementById('radarChart'), {
            type: 'radar',
            data: {
                labels: ['Age', 'Resting BP', 'Cholesterol', 'Max HR', 'Oldpeak'],
                datasets: [
                    {
                        label: 'User',
                        data: userData,
                        fill: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgb(59, 130, 246)',
                        pointBackgroundColor: 'rgb(59, 130, 246)'
                    },
                    {
                        label: 'Healthy Baseline',
                        data: healthyData,
                        fill: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: 'rgb(16, 185, 129)',
                        pointBackgroundColor: 'rgb(16, 185, 129)'
                    }
                ]
            }
        });

        new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: ['Age', 'BP', 'Chol', 'HR', 'Oldpeak'],
                datasets: [
                    {
                        label: 'User',
                        data: userData,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)'
                    },
                    {
                        label: 'Healthy',
                        data: healthyData,
                        backgroundColor: 'rgba(16, 185, 129, 0.6)'
                    }
                ]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
function showExplainability() {

    const explainBox = document.getElementById('explainBox');
    const explainList = document.getElementById('explainList');
    explainBox.classList.remove('hidden');
    explainList.innerHTML = "";

    const age = Number(document.getElementsByName('age')[0].value);
    const bp = Number(document.getElementsByName('restingBP')[0].value);
    const chol = Number(document.getElementsByName('cholesterol')[0].value);
    const maxHR = Number(document.getElementsByName('maxHR')[0].value);
    const angina = document.getElementsByName('angina')[0].value;
    const oldpeak = Number(document.getElementsByName('oldpeak')[0].value);

    const reasons = [];

    // medical rules
    if (chol > 240) reasons.push("High cholesterol detected");
    if (bp > 140) reasons.push("Resting blood pressure above normal range");
    if (maxHR < 120) reasons.push("Low maximum heart rate detected");
    if (oldpeak > 2.0) reasons.push("ST depression indicates ischemia risk");
    if (angina === "Y") reasons.push("Exercise-induced angina present");
    if (age > 55) reasons.push("Age above average cardiac risk threshold");

    if (reasons.length === 0) {
        reasons.push("No major risk indicators detected in clinical inputs.");
    }

    reasons.forEach(r => {
        const item = document.createElement("li");
        item.innerText = r;
        explainList.appendChild(item);
    });
}
/* ============================= */
/* SMOOTH NAVIGATION BEHAVIOR    */
/* ============================= */

document.querySelectorAll('nav a.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});


/* ============================= */
/* ACTIVE NAV ITEM HIGHLIGHT     */
/* ============================= */

const navItems = document.querySelectorAll('nav a.nav-link');
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(sec => {
        const top = window.scrollY;
        if (top >= sec.offsetTop - 120) {
            current = sec.getAttribute("id");
        }
    });

    navItems.forEach(li => {
        li.classList.remove("text-blue-400");
        li.style.opacity = "0.5";
        if (li.getAttribute("href") === `#${current}`) {
            li.classList.add("text-blue-400");
            li.style.opacity = "1";
        }
    });
});


/* ============================= */
/* SECTION REVEAL ON SCROLL      */
/* ============================= */

const revealElements = document.querySelectorAll("#home, #predict, #about");

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    },
    { threshold: 0.2 }
);

revealElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity .8s ease, transform .8s ease";
    revealObserver.observe(el);
});
