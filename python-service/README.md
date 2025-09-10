# MetalSense Python Environmental Calculations Service

## Setup Instructions

### 1. Install Python (if not already installed)
Download Python 3.9+ from https://python.org

### 2. Create Virtual Environment
```bash
cd python-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Service
```bash
python main.py
```

The service will be available at: http://127.0.0.1:8001

## API Endpoints

- **GET** `/` - Service information
- **GET** `/health` - Health check
- **POST** `/calculate/hpi` - Calculate Heavy Metal Pollution Index
- **POST** `/calculate/mei` - Calculate Metal Evaluation Index  
- **POST** `/calculate/batch` - Batch calculations
- **GET** `/standards/heavy-metals` - Get WHO/EPA standards

## Example API Usage

### Calculate HPI
```json
POST /calculate/hpi
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "metals": [
    {
      "name": "Lead (Pb)",
      "concentration": 0.02,
      "standard": 0.01,
      "ideal": 0.0
    },
    {
      "name": "Cadmium (Cd)", 
      "concentration": 0.005,
      "standard": 0.003,
      "ideal": 0.0
    }
  ]
}
```

### Response
```json
{
  "hpi_value": 150.0,
  "classification": "Unsuitable",
  "individual_ratings": {
    "Lead (Pb)": 200.0,
    "Cadmium (Cd)": 166.67
  },
  "risk_level": "Critical"
}
```
