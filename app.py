from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# 1. Load your existing model and the scaler
try:
    with open("models/random_forest_model.pkl", "rb") as f:
        model = pickle.load(f)
    
    with open("models/scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    print("Model and Scaler loaded successfully!")
except Exception as e:
    print(f"Error loading files: {e}")

# 2. Define the exact columns the model expects
MODEL_FEATURE_NAMES = [
    'Age', 'RestingBP', 'Cholesterol', 'FastingBS', 'MaxHR', 'Oldpeak',
    'Sex_F', 'Sex_M', 
    'ChestPainType_ASY', 'ChestPainType_ATA', 'ChestPainType_NAP', 'ChestPainType_TA',
    'RestingECG_LVH', 'RestingECG_Normal', 'RestingECG_ST',
    'ExerciseAngina_N', 'ExerciseAngina_Y',
    'ST_Slope_Down', 'ST_Slope_Flat', 'ST_Slope_Up'
]

# 3. Define ONLY the columns that were scaled in the notebook
NUMERIC_COLUMNS = ['Age', 'RestingBP', 'Cholesterol', 'MaxHR', 'Oldpeak']

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get raw data from website
        raw_data = request.json["input"]
        
        # Map indices back to category names
        data_dict = {
            'Age': raw_data[0],
            'Sex': "M" if raw_data[1] == 1 else "F",
            'ChestPainType': ["TA", "ATA", "NAP", "ASY"][raw_data[2]],
            'RestingBP': raw_data[3],
            'Cholesterol': raw_data[4],
            'FastingBS': raw_data[5],
            'RestingECG': ["Normal", "ST", "LVH"][raw_data[6]],
            'MaxHR': raw_data[7],
            'ExerciseAngina': "Y" if raw_data[8] == 1 else "N",
            'Oldpeak': raw_data[9],
            'ST_Slope': ["Up", "Flat", "Down"][raw_data[10]]
        }
        
        # Convert to DataFrame
        input_df = pd.DataFrame([data_dict])
        
        # Apply get_dummies (Encoding)
        encoded_df = pd.get_dummies(input_df)
        
        # Align with the 20 model features
        final_input = encoded_df.reindex(columns=MODEL_FEATURE_NAMES, fill_value=0)

        # 4. SCALE ONLY THE NUMERIC COLUMNS (Matches your Notebook logic)
        # This fixes the "expecting 5 features, got 20" error
        final_input[NUMERIC_COLUMNS] = scaler.transform(final_input[NUMERIC_COLUMNS])

        # 5. Get Prediction using the correctly formatted data
        result = model.predict(final_input)[0]
        prob = model.predict_proba(final_input)[0][1]
        
        print(f"Prediction success: Result={result}, Prob={prob:.4f}")

        return jsonify({
            "result": int(result),
            "probability": float(prob)
        })

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)