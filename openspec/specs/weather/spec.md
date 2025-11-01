# weather Specification

## Purpose

Fetch, process, and serve weather data from Open-Meteo API, including current conditions, forecasts, anomaly detection, and smart recommendations.

## Requirements

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
