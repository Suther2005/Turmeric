from typing import Optional
import numpy as np
import random
try:
    from sklearn.ensemble import RandomForestClassifier
except ImportError:
    RandomForestClassifier = None

# Ideal turmeric growing conditions
IDEAL_CONDITIONS = {
    'ph_min': 5.5,           'ph_max': 7.0,           'ph_optimal': 6.2,
    'nitrogen_min': 80,      'nitrogen_max': 200,      'nitrogen_optimal': 140,
    'phosphorus_min': 20,    'phosphorus_max': 80,     'phosphorus_optimal': 50,
    'potassium_min': 100,    'potassium_max': 300,     'potassium_optimal': 200,
    'moisture_min': 60,      'moisture_max': 85,       'moisture_optimal': 70,
    'organic_carbon_min': 0.5, 'organic_carbon_max': 3.0, 'organic_carbon_optimal': 1.5,
    'temperature_min': 25,   'temperature_max': 35,    'temperature_optimal': 28,
    'humidity_min': 60,      'humidity_max': 90,       'humidity_optimal': 75,
}

PARAMETER_WEIGHTS = {
    'ph':             0.20,
    'nitrogen':       0.18,
    'phosphorus':     0.12,
    'potassium':      0.12,
    'moisture':       0.15,
    'organic_carbon': 0.10,
    'temperature':    0.08,
    'humidity':       0.05,
}

PARAM_CONDITION_KEYS = {
    'ph':             ('ph_min',             'ph_max',             'ph_optimal'),
    'nitrogen':       ('nitrogen_min',       'nitrogen_max',       'nitrogen_optimal'),
    'phosphorus':     ('phosphorus_min',     'phosphorus_max',     'phosphorus_optimal'),
    'potassium':      ('potassium_min',      'potassium_max',      'potassium_optimal'),
    'moisture':       ('moisture_min',       'moisture_max',       'moisture_optimal'),
    'organic_carbon': ('organic_carbon_min', 'organic_carbon_max', 'organic_carbon_optimal'),
    'temperature':    ('temperature_min',    'temperature_max',    'temperature_optimal'),
    'humidity':       ('humidity_min',       'humidity_max',       'humidity_optimal'),
}

class SoilPredictor:
    """Random Forest turmeric soil fertility predictor."""

    def __init__(self):
        self.rf_model = None
        self.health_classes = ['poor', 'fair', 'good', 'excellent']
        self._initialize_random_forest()

    def _initialize_random_forest(self):
        """Train a synthetic Random Forest model if sklearn is available."""
        if RandomForestClassifier is None:
            print("scikit-learn is not installed. Will fallback to rule-based.")
            return

        print("Training synthetic Random Forest model for soil prediction...")
        # Generate synthetic data based on our rules
        X_train = []
        y_train = []
        
        for _ in range(1000):
            # Generate random soil sample
            sample = {
                'ph': random.uniform(4.0, 9.0),
                'nitrogen': random.uniform(20, 250),
                'phosphorus': random.uniform(5, 120),
                'potassium': random.uniform(50, 400),
                'moisture': random.uniform(20, 100),
                'organic_carbon': random.uniform(0.1, 4.0),
                'temperature': random.uniform(15, 45),
                'humidity': random.uniform(30, 100),
            }
            # Score it with the rule-based approach to get the ground truth class
            param_scores = self._rule_based_parameter_scores(sample)
            score = self._compute_rule_fertility_score(param_scores)
            health = self._classify_health(score)
            
            # Map health string to index
            class_idx = self.health_classes.index(health)
            
            features = [sample[k] for k in PARAMETER_WEIGHTS.keys()]
            X_train.append(features)
            y_train.append(class_idx)
            
        self.rf_model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.rf_model.fit(X_train, y_train)
        print("Random Forest model trained successfully.")

    def predict(self, soil_data: dict) -> dict:
        """Predict soil health and generate actionable recommendations."""
        try:
            # We still calculate param_scores for individual component feedback in UI
            param_scores = self._rule_based_parameter_scores(soil_data)
            
            if self.rf_model is not None:
                # Use Random Forest for prediction
                features = [soil_data.get(k, 0) for k in PARAMETER_WEIGHTS.keys()]
                class_idx = self.rf_model.predict([features])[0]
                probs = self.rf_model.predict_proba([features])[0]
                soil_health = self.health_classes[class_idx]
                
                # Convert the probability distribution into a 0-100 score dynamically
                fertility_score = 0.0
                for i, c_idx in enumerate(self.rf_model.classes_):
                    weight = 25 + (c_idx * 25)  # poor=25, fair=50, good=75, excellent=100
                    fertility_score += probs[i] * weight
            else:
                # Fallback to pure rule-based
                fertility_score = self._compute_rule_fertility_score(param_scores)
                soil_health = self._classify_health(fertility_score)
                
            recommendations = self._generate_recommendations(soil_data, fertility_score)

            return {
                'fertility_score':  round(fertility_score, 2),
                'soil_health':      soil_health,
                'recommendations':  recommendations,
                'parameter_scores': param_scores,
            }
        except Exception as e:
            print(f'Soil prediction error: {e}')
            return {
                'fertility_score':  50.0,
                'soil_health':      'fair',
                'recommendations':  self._default_recommendations(),
                'parameter_scores': {},
            }

    # ------------------------------------------------------------------
    # Rule-Based Fallbacks and Feature Generators
    # ------------------------------------------------------------------

    def _score_parameter(self, value: Optional[float], p_min: float, p_max: float, p_optimal: float) -> float:
        if value is None:
            return 50.0
        if p_min <= value <= p_max:
            denom = max(abs(p_max - p_optimal), abs(p_min - p_optimal), 1e-6)
            distance = abs(value - p_optimal) / denom
            return 100.0 - (distance * 40.0)
        elif value < p_min:
            deficit = (p_min - value) / max(p_min, 1e-6)
            return max(0.0, 60.0 - deficit * 60.0)
        else:
            excess = (value - p_max) / max(p_max, 1e-6)
            return max(0.0, 60.0 - excess * 60.0)

    def _rule_based_parameter_scores(self, soil_data: dict) -> dict:
        scores = {}
        for param, (mn, mx, op) in PARAM_CONDITION_KEYS.items():
            val = soil_data.get(param)
            scores[param] = round(
                self._score_parameter(val, IDEAL_CONDITIONS[mn], IDEAL_CONDITIONS[mx], IDEAL_CONDITIONS[op]),
                2,
            )
        return scores

    def _compute_rule_fertility_score(self, param_scores: dict) -> float:
        total = sum(param_scores.get(p, 50.0) * w for p, w in PARAMETER_WEIGHTS.items())
        return max(0.0, min(100.0, total))

    def _classify_health(self, score: float) -> str:
        if score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'fair'
        return 'poor'

    def _generate_recommendations(self, soil_data: dict, fertility_score: float) -> dict:
        ph             = soil_data.get('ph', 6.0)
        nitrogen       = soil_data.get('nitrogen', 100)
        phosphorus     = soil_data.get('phosphorus', 40)
        potassium      = soil_data.get('potassium', 150)
        moisture       = soil_data.get('moisture', 65)
        organic_carbon = soil_data.get('organic_carbon', 1.0)
        temperature    = soil_data.get('temperature', 28)

        recs = {}

        # Fertilizer
        if nitrogen is not None and nitrogen < 80:
            recs['fertilizer'] = (
                'Apply Urea @ 100 kg/ha or Ammonium Sulphate @ 220 kg/ha. '
                'Split into 3 equal doses at planting, 30 days, and 60 days.'
            )
        elif nitrogen is not None and nitrogen > 200:
            recs['fertilizer'] = (
                'Nitrogen is excessive. Avoid nitrogen fertilizers for 30 days. '
                'Monitor for leaf burn and lodging.'
            )
        else:
            recs['fertilizer'] = 'Apply NPK 15:15:15 @ 200 kg/ha as basal dose at planting.'

        if phosphorus is not None and phosphorus < 20:
            recs['fertilizer'] += ' Apply SSP (Single Super Phosphate) @ 375 kg/ha for phosphorus deficiency.'
        if potassium is not None and potassium < 100:
            recs['fertilizer'] += ' Apply MOP (Muriate of Potash) @ 166 kg/ha to correct potassium deficiency.'

        # Organic manure
        if organic_carbon is not None and organic_carbon < 0.5:
            recs['organic_manure'] = (
                'Apply FYM (Farm Yard Manure) @ 25 tonnes/ha. '
                'Add Vermicompost @ 5 tonnes/ha. '
                'Incorporate green manure crops before main crop planting.'
            )
        else:
            recs['organic_manure'] = (
                'Maintain organic matter with FYM @ 10 tonnes/ha annually. '
                'Consider green manuring with dhaincha (Sesbania).'
            )

        # Irrigation
        if moisture is not None and moisture < 60:
            recs['irrigation'] = (
                'Implement drip irrigation at 30-40 mm/week. '
                'Irrigate every 5-7 days. '
                'Avoid water stress during rhizome bulking stage (4-6 months).'
            )
        elif moisture is not None and moisture > 85:
            recs['irrigation'] = (
                'Improve field drainage immediately. '
                'Create raised beds (15-20 cm height). '
                'Reduce irrigation frequency to prevent waterlogging and rhizome rot.'
            )
        else:
            recs['irrigation'] = (
                'Maintain current schedule. Use furrow irrigation @ 700-800 mm/season. '
                'Mulch with paddy straw (5 tonnes/ha) to conserve soil moisture.'
            )

        # Soil improvement
        if ph is not None and ph < 5.5:
            recs['soil_improvement'] = (
                f'Soil is strongly acidic (pH={ph}). '
                'Apply agricultural lime @ 1-2 tonnes/ha and incorporate well. '
                'Re-test pH after 4 weeks before planting.'
            )
        elif ph is not None and ph > 7.0:
            recs['soil_improvement'] = (
                f'Soil is alkaline (pH={ph}). '
                'Apply gypsum @ 400 kg/ha and elemental sulphur @ 25 kg/ha to gradually lower pH.'
            )
        else:
            recs['soil_improvement'] = (
                f'pH is optimal ({ph}). '
                'Deep plough to 30 cm before planting. '
                'Incorporate coarse sand into heavy clay soils for better drainage.'
            )

        # Pesticide
        if temperature is not None and temperature > 32:
            recs['pesticide'] = (
                'High temperature increases soil pest pressure. '
                'Apply Chlorpyrifos 2.5 ml/L as soil drench at planting. '
                'Use Mancozeb 2.5 g/L as preventive foliar spray every 15 days.'
            )
        else:
            recs['pesticide'] = (
                'Apply Trichoderma viride @ 2.5 kg/ha for biological pest and disease control. '
                'Preventive spray of Bordeaux mixture (1%) at 30 and 60 days after planting.'
            )

        # General tips
        tips = [
            'Plant certified disease-free rhizomes treated with Mancozeb (3 g/L) for 30 minutes.',
            'Maintain row spacing of 45 cm and plant spacing of 25 cm for optimal canopy.',
            'Apply paddy straw mulch @ 5-10 tonnes/ha immediately after planting.',
            'Monitor for leaf spot diseases weekly during monsoon season.',
            'Harvest rhizomes 7-9 months after planting when leaves turn yellow and dry.',
        ]
        if fertility_score < 40:
            tips.insert(0, 'URGENT: Soil fertility is poor. Conduct full soil nutrient test before next season.')
        recs['tips'] = tips

        return recs

    def _default_recommendations(self) -> dict:
        return {
            'fertilizer':       'Apply balanced NPK fertilizer as per soil test recommendations.',
            'organic_manure':   'Add FYM @ 10 tonnes/ha annually to maintain organic matter.',
            'irrigation':       'Maintain regular irrigation schedule based on crop stage.',
            'soil_improvement': 'Conduct soil pH test and amend with lime or sulphur accordingly.',
            'pesticide':        'Apply Trichoderma viride for biological pest control.',
            'tips': [
                'Conduct comprehensive soil testing before planting.',
                'Maintain proper field drainage to prevent waterlogging.',
                'Use certified disease-free seed rhizomes.',
            ],
        }
