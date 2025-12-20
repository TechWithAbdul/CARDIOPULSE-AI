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
    }
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