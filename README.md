# CardioPulse AI — Next-Gen Cardiovascular Risk Assessment Platform

CardioPulse AI is an end-to-end, full-stack predictive healthcare application designed to evaluate cardiac health risks in real time. Powered by an optimized Random Forest binary classification model on the backend, the platform processes 12 critical clinical patient metrics to output instant statistical disease risk probabilities through an immersive, responsive frontend interface.

---

## 🚀 Key Features
* **Live Machine Learning Inference:** Instant data processing and prediction execution via an optimized Random Forest pipeline.
* **Modern UI/UX Design:** Implements a cutting-edge dark-themed glassmorphic design system using Tailwind CSS.
* **Interactive Probability Visualizations:** Features responsive, animated SVG progress rings that dynamically scale and shift color matching the designated clinical risk threshold.
* **Real-time Developer Telemetry:** Includes a live terminal logging transmission window inside the UI to display the exact structure of JSON payloads sent across the ports.
* **Full Asynchronous Pipeline:** Completely non-blocking network requests powered by Javascript `Fetch API` communicating seamlessly with a Python `Flask` server.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Client Tier)
* **HTML5 & Vanilla JavaScript (ES6+):** Manages DOM state transitions, form capture, real-time input boundaries verification, and asynchronous payload formatting.
* **Tailwind CSS:** Fuels utility-first styling and interactive responsive layouts.
* **Lucide Icons:** Provides clean, vector-based telemetry medical iconography.

### Backend (Server/Model Tier)
* **Python Engine:** Core system controller.
* **Flask Server Framework:** Serves lightweight, fast routing for API endpoints.
* **Flask-CORS:** Mitigates Cross-Origin Resource Sharing policy issues during secure local port tunneling (`Port 3000` $\rightarrow$ `Port 5000`).
* **Scikit-Learn:** Serialized framework used to run the pipeline.
* **NumPy:** Handles high-performance array shaping ($1 \times 12$) for matrix model feeds.

---

## 📊 The 12 Clinical Data Features
The system accepts an array containing exactly 12 preprocessed attributes. Categorical attributes are mapped using customized dictionaries to map raw string values directly into integers required by the `scikit-learn` framework:

| Index | Feature Label | UI Input Element Type | Mapping Matrix / Constraints |
|---|---|---|---|
| **0** | `Age` | Number Input | Numeric boundaries: $1$ to $120$ |
| **1** | `Sex` | Select Dropdown | `M` $\rightarrow 1$, `F` $\rightarrow 0$ |
| **2** | `ChestPainType` | Select Dropdown | `TA` $\rightarrow 0$, `ATA` $\rightarrow 1$, `NAP` $\rightarrow 2$, `ASY` $\rightarrow 3$ |
| **3** | `RestingBP` | Number Input | Continuous scale values (mm Hg) |
| **4** | `Cholesterol` | Number Input | Continuous scale values (mg/dl) |
| **5** | `FastingBS` | Select Dropdown | `Fasting BS > 120 mg/dl`: `Yes` $\rightarrow 1$, `No` $\rightarrow 0$ |
| **6** | `RestingECG` | Select Dropdown | `Normal` $\rightarrow 0$, `ST` $\rightarrow 1$, `LVH` $\rightarrow 2$ |
| **7** | `MaxHR` | Number Input | Continuous scale values (bpm) |
| **8** | `ExerciseAngina`| Select Dropdown | `Yes` $\rightarrow 1$, `No` $\rightarrow 0$ |
| **9** | `Oldpeak` | Decimal (Step 0.1) | ST depression value relative to rest |
| **10**| `ST_Slope` | Select Dropdown | `Up` $\rightarrow 0$, `Flat` $\rightarrow 1$, `Down` $\rightarrow 2$ |
| **11**| `HeartDisease` | Select Dropdown | Medical History Status: `Yes` $\rightarrow 1$, `No` $\rightarrow 0$ |

---

## 💻 Installation & Setup Guide

Ensure Python 3.10+ and a local HTTP utility (e.g., Live Server or Node/npm) are ready on your machine.

### 1. Clone the Workspace Repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```
### 2. Configure Environment Dependencies
Install required packages using your Python runtime manager:
```bash
pip install flask flask-cors numpy scikit-learn
```
Note: If your local setup utilizes multi-version environments, explicitly execute via targeting standard binary paths:
```Bash
& "D:\path_to_your_python\python.exe" -m pip install flask-cors flask numpy scikit-learn
```
### 3. Initialize the Backend Engine
Run the core file to awaken the Flask local routing node:
```Bash
python app.py
```
Upon a successful load sequence, the terminal should confirm activation:
* Running on http://127.0.0.1:5000
### 4. Serve the Frontend Dashboard
* Open the workspace directory via your chosen system utility (VS Code Live Server, Python's built-in http.server, or simple manual instantiation).
* Serve files locally at http://127.0.0.1:3000/index.html or similar ports.
* Ensure both systems run simultaneously side-by-side to allow data synchronization.

### 📡 Core API Specification
Endpoint: Execute Diagnostic Prediction
* URL: /predict
* Method: POST
* Content-Type: application/json

### 🛡️ Clinical Classifications Logic
The application automatically shifts styles based on the specific prediction metrics received:
* Risk Score $\ge$ 50%: Intercepted as HIGH RISK. The UI changes accents to crimson red and issues a warning urging professional medical consultations.
* Risk Score < 50%: Intercepted as LOW RISK. UI transitions to standard emerald green, signaling data ranges sit securely within safer baseline tracking parameters.
