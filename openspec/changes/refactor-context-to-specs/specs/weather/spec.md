# Weather API Specification

## Purpose

Fetch, process, and serve weather data from Open-Meteo API, including current conditions, forecasts, anomaly detection, and smart recommendations.

## ADDED Requirements

### Requirement: Get Comprehensive Weather Data

The system SHALL fetch and return comprehensive weather data for a given location.

#### Scenario: Valid coordinates provided

- **GIVEN** valid latitude and longitude (e.g., 10.8231, 106.6297 for HCMC)
- **WHEN** GET request to `/api/weather/{lat}/{lon}`
- **THEN** a 200 response is returned
- **AND** response includes current_weather, hourly_forecast (24h), daily_forecast (7 days)
- **AND** anomaly detection is performed against 30-day historical average
- **AND** smart recommendations are generated based on conditions

#### Scenario: Public access to weather data

- **GIVEN** a non-authenticated user
- **WHEN** GET request to `/api/weather/{lat}/{lon}`
- **THEN** the request is allowed (public endpoint)

### Requirement: Bulk Weather Data for Major Cities

The system SHALL provide weather data for 24 major cities worldwide.

#### Scenario: Authenticated user requests bulk data

- **GIVEN** an authenticated user with valid token
- **WHEN** GET request to `/api/weather/bulk` with Bearer token
- **THEN** a 200 response is returned
- **AND** response contains weather data for 24 predefined cities

#### Scenario: Unauthenticated user requests bulk data

- **GIVEN** a non-authenticated user
- **WHEN** GET request to `/api/weather/bulk` without token
- **THEN** a 401 Unauthenticated error is returned

### Requirement: Location Comparison

The system SHALL compare weather data between two locations.

#### Scenario: Valid comparison request

- **GIVEN** two location objects with lat, lon, and name
- **WHEN** authenticated user POSTs to `/api/weather/comparison`
- **THEN** a 200 response is returned
- **AND** response includes weather data for both locations
- **AND** response includes calculated differences (temp, humidity, wind, etc.)

#### Scenario: Comparison without authentication

- **GIVEN** a non-authenticated user
- **WHEN** POST to `/api/weather/comparison`
- **THEN** a 401 Unauthenticated error is returned

### Requirement: Anomaly Detection

The system MUST detect temperature anomalies by comparing current temperature with 30-day historical average.

#### Scenario: Significant temperature deviation detected

- **GIVEN** current temperature differs from 30-day average by more than 5°C
- **WHEN** weather data is processed
- **THEN** anomaly object is included in response
- **AND** anomaly type is "hot" if current > average, "cold" if current < average
- **AND** difference value is included

#### Scenario: Normal temperature (no anomaly)

- **GIVEN** current temperature is within 5°C of 30-day average
- **WHEN** weather data is processed
- **THEN** anomaly object indicates no anomaly

### Requirement: Smart Recommendations

The system SHALL generate context-aware recommendations based on weather conditions.

#### Scenario: High UV index

- **GIVEN** UV index > 6
- **WHEN** recommendations are generated
- **THEN** UV protection advice is included

#### Scenario: Rain expected

- **GIVEN** weather code indicates rain (61, 63, 65)
- **WHEN** recommendations are generated
- **THEN** umbrella/rain gear advice is included

#### Scenario: Extreme temperature

- **GIVEN** temperature > 35°C or < 15°C
- **WHEN** recommendations are generated
- **THEN** temperature-appropriate advice is included

#### Scenario: High wind speed

- **GIVEN** wind speed > 25 km/h
- **WHEN** recommendations are generated
- **THEN** wind caution advice is included

## API Endpoints

### GET /api/weather/{lat}/{lon}

- **Access**: Public
- **URL Parameters**:
  - `lat`: Latitude (float)
  - `lon`: Longitude (float)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "current_weather": {
      "temperature": 28.5,
      "humidity": 65,
      "wind_speed": 15.2,
      "weather_code": 1,
      "uv_index": 7
    },
    "hourly_forecast": [
      {
        "time": "2025-11-01T14:00",
        "temperature": 29.0,
        "precipitation_probability": 20
      }
    ],
    "daily_forecast": [
      {
        "date": "2025-11-01",
        "temperature_max": 32.0,
        "temperature_min": 24.0,
        "weather_code": 2
      }
    ],
    "anomaly": {
      "detected": true,
      "type": "hot",
      "difference": 6.5,
      "avg_temperature": 22.0
    },
    "recommendation": {
      "recommendations": [
        "UV index cao, nên sử dụng kem chống nắng",
        "Nhiệt độ cao, nhớ uống đủ nước"
      ]
    }
  }
  ```

### GET /api/weather/bulk

- **Access**: Protected (auth:sanctum)
- **Headers**: `Authorization: Bearer {token}`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "cities": [
      {
        "name": "Ho Chi Minh City",
        "lat": 10.8231,
        "lon": 106.6297,
        "current_weather": { ... }
      }
    ]
  }
  ```

### POST /api/weather/comparison

- **Access**: Protected (auth:sanctum)
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "location1": {
      "lat": 10.8231,
      "lon": 106.6297,
      "name": "Ho Chi Minh City"
    },
    "location2": {
      "lat": 21.0285,
      "lon": 105.8542,
      "name": "Hanoi"
    }
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "comparison": {
      "location1": {
        "name": "Ho Chi Minh City",
        "current_weather": { ... }
      },
      "location2": {
        "name": "Hanoi",
        "current_weather": { ... }
      },
      "differences": {
        "temperature": 5.2,
        "humidity": -10,
        "wind_speed": 3.5
      }
    }
  }
  ```

## External API Integration

### Open-Meteo API

- **Base URL**: https://api.open-meteo.com/v1/forecast
- **Authentication**: None required (free API)
- **Parameters**:
  - `latitude`, `longitude`: Location coordinates
  - `current`: Current weather parameters
  - `hourly`: Hourly forecast parameters
  - `daily`: Daily forecast parameters
  - `past_days`: Historical data for anomaly detection (30 days)
- **Rate Limits**: Reasonable free tier (~10,000 requests/day)
- **Retry Strategy**: 3 retries with exponential backoff
- **Caching**: Consider caching responses for 10-15 minutes

## Data Processing

### Current Weather Processing

- Extract temperature, humidity, wind speed, weather code, UV index
- Format for frontend consumption
- Add descriptive labels and units

### Hourly Forecast Processing

- Extract 24-hour forecast data
- Include temperature and precipitation probability
- Format timestamps to ISO 8601

### Daily Forecast Processing

- Extract 7-day forecast
- Include max/min temperatures, weather codes
- Format dates to YYYY-MM-DD

### Anomaly Detection Algorithm

1. Fetch 30 days of historical max temperatures from Open-Meteo
2. Calculate average max temperature: `avgMaxTemp = sum(temps) / 30`
3. Get current temperature: `currentTemp`
4. Calculate difference: `diff = currentTemp - avgMaxTemp`
5. If `abs(diff) > 5°C`, flag as anomaly
6. Classify as "hot" if `diff > 0`, "cold" if `diff < 0`
7. Include difference value and average in response

### Recommendation Engine Logic

Analyze multiple weather factors and generate Vietnamese recommendations:

**UV Index Analysis**:

- UV < 3: Low protection needed
- UV 3-6: Moderate protection - suggest sunscreen
- UV 6-8: High protection - suggest sunscreen + hat
- UV > 8: Very high - avoid midday sun

**Temperature Analysis**:

- Temp > 35°C: Hydration warning, avoid outdoor activities
- Temp < 15°C: Warm clothing advice

**Weather Code Analysis**:

- Rain codes (61, 63, 65): Bring umbrella
- Storm codes (95, 96, 99): Stay indoors warning
- Fog codes (45, 48): Driving caution

**Wind Speed Analysis**:

- Wind > 40 km/h: Very windy warning
- Wind > 25 km/h: Moderate wind caution

**Humidity Analysis**:

- Humidity > 80%: High humidity alert

Return multiple recommendations prioritized by severity.
