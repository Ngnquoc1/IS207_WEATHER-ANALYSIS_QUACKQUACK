# weather Specification Delta

## Context
This delta adds location search by name functionality to the `SearchModal` component, enabling users to find locations using city names, addresses, or landmarks instead of only map selection or manual coordinate entry.

---

## ADDED Requirements

### Requirement: Search Locations by Name in SearchModal

The system SHALL provide location name search functionality within the `SearchModal` component using Open-Meteo Geocoding API.

#### Scenario: User searches for city by name

- **GIVEN** user opens SearchModal from Header dropdown
- **WHEN** user navigates to "Tìm theo Tên" tab
- **AND** enters "Hà Nội" in the search input
- **THEN** a debounced API call is made after 500ms
- **AND** search results display up to 10 matching locations
- **AND** each result shows: `{name}, {admin1}, {country}`
- **AND** user can click a result to select it

#### Scenario: Search with minimum character requirement

- **GIVEN** user is on the "Tìm theo Tên" tab
- **WHEN** user types only 1 character
- **THEN** no API call is made
- **WHEN** user types 2 or more characters
- **THEN** debounced search is triggered

#### Scenario: Select location from search results

- **GIVEN** search results are displayed
- **WHEN** user clicks on a result item
- **THEN** `selectedLocation` state is populated with:
  - `name`: location name
  - `latitude`: decimal degrees
  - `longitude`: decimal degrees
  - `country`: country name
  - `admin1`: state/province (if available)
- **AND** selected location details are displayed
- **AND** "Chọn vị trí này" button becomes enabled

#### Scenario: Confirm selected location

- **GIVEN** a location is selected from search results
- **WHEN** user clicks "Chọn vị trí này" button
- **THEN** `onSelectLocation` callback is triggered
- **AND** SearchModal closes
- **AND** Header receives location data
- **AND** DashboardPage fetches weather for selected coordinates

#### Scenario: No search results found

- **GIVEN** user searches for "asdfasdfasdf"
- **WHEN** Geocoding API returns empty results
- **THEN** error message "Không tìm thấy địa điểm nào" is displayed
- **AND** no results list is shown

#### Scenario: Network error during search

- **GIVEN** user initiates a search
- **WHEN** Geocoding API request fails due to network error
- **THEN** error message "Lỗi kết nối - vui lòng thử lại" is displayed
- **AND** retry option is available

#### Scenario: Search timeout

- **GIVEN** user initiates a search
- **WHEN** API request exceeds 5-second timeout
- **THEN** error message "Hết thời gian chờ - vui lòng thử lại" is displayed

#### Scenario: Clear search input

- **GIVEN** user has typed a search query
- **WHEN** user clicks the clear button (X icon)
- **THEN** search input is reset to empty
- **AND** search results are cleared
- **AND** selected location remains unchanged

---

## MODIFIED Requirements

### Requirement: LocationPicker Component Structure

The `LocationPicker` component now supports **three tabs** instead of two:
1. **Chọn trên Bản đồ** (Map Tab)
2. **Nhập Tọa độ Thủ công** (Manual Tab)
3. **Tìm theo Tên** (Name Tab) - NEW

#### Scenario: Tab navigation with three tabs

- **GIVEN** user opens SearchModal
- **WHEN** LocationPicker renders
- **THEN** three tab buttons are visible
- **AND** user can switch between Map, Manual, and Name tabs
- **AND** active tab is highlighted
- **AND** selected location persists across tab switches

---

## ADDED Components

### Component: NameTab

**Purpose**: Provides location search by name using Open-Meteo Geocoding API.

**Props**:
- `isDark`: boolean - theme indicator
- `selectedLocation`: object | null - currently selected location
- `setSelectedLocation`: function - update selected location
- `loading`: boolean - loading state
- `setLoading`: function - update loading state
- `error`: string - error message
- `setError`: function - update error message
- `onSelectLocation`: function - callback to submit location

**Internal State**:
- `searchQuery`: string - user input value
- `searchResults`: array - geocoding API results
- `isSearching`: boolean - API call in progress

**Behavior**:
- Debounces search input (500ms)
- Requires minimum 2 characters to search
- Displays up to 10 results
- Handles errors gracefully
- Provides clear button to reset search
- Shows loading spinner during API calls

**UI Elements**:
1. Search input with placeholder and clear button
2. Loading spinner ("Đang tìm kiếm...")
3. Results list (scrollable, clickable items)
4. Selected location display with coordinates
5. Confirm button ("Chọn vị trí này")
6. Error messages

---

## ADDED API Integrations

### Geocoding API Usage in SearchModal Context

**Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`

**Parameters**:
- `name`: search query (city, country, address)
- `count`: 10 (max results)
- `language`: "vi" (Vietnamese)
- `format`: "json"

**Timeout**: 5000ms

**Response Transformation**:
```javascript
{
  id: location.id,
  name: location.name,
  latitude: location.latitude,
  longitude: location.longitude,
  country: location.country,
  admin1: location.admin1,
  displayName: `${name}, ${admin1}, ${country}`
}
```

**Error Handling**:
- Empty results → "Không tìm thấy địa điểm nào"
- Network error → "Lỗi kết nối - vui lòng thử lại"
- Timeout → "Hết thời gian chờ - vui lòng thử lại"

---

## ADDED Styling Requirements

### NameTab Visual Design

#### Search Input
- Full-width input field
- Placeholder: "Nhập tên thành phố, quốc gia..."
- Clear button (X icon) on right side
- Search icon on left side
- Border radius: 8px
- Focus state with blue border

#### Results List
- Maximum height: 300px (scrollable)
- Each item: padding 12px, hover background
- Result format: `{name}, {admin1}, {country}`
- Cursor: pointer on hover
- Active item: highlighted background

#### Selected Location Display
- Card-style container
- Shows: name, coordinates, country
- Margin top: 16px
- Background: light gray (light mode), dark gray (dark mode)

#### Confirm Button
- Primary button styling (blue background)
- Disabled state when no selection
- Full-width on mobile
- Padding: 12px 24px

#### Theme Support
- Light mode: white background, dark text
- Dark mode: dark background, light text
- Contrast ratio: WCAG AA compliant

---

## MODIFIED Styling

### LocationPicker Tab Navigation

**Updated Tab Count**: 3 tabs instead of 2

**Tab Button Width**: Adjust to fit 3 tabs
- Desktop: Equal width distribution (33.33% each)
- Mobile: Scrollable horizontal tabs if needed

**Active Tab Indicator**: Bottom border or background highlight

---

## Performance Requirements

### Debouncing
- **Search Input Debounce**: 500ms
- **Rationale**: Balance between responsiveness and API call frequency

### API Call Optimization
- **Minimum Characters**: 2 (prevents excessive API calls)
- **Abort Previous Requests**: Cancel in-flight requests when new search starts

### Rendering Performance
- **Results List**: Virtualized if > 20 items (unlikely, API returns max 10)
- **No Unnecessary Re-renders**: Use `React.memo` if needed

---

## Accessibility Requirements

### Keyboard Navigation
- [ ] Tab key navigates between input, results, and button
- [ ] Enter key selects highlighted result
- [ ] Escape key clears search or closes modal

### ARIA Attributes
- [ ] `role="combobox"` on search input
- [ ] `role="listbox"` on results container
- [ ] `role="option"` on result items
- [ ] `aria-label="Search for location by name"`
- [ ] `aria-live="polite"` for search results announcement

### Screen Reader Support
- [ ] Announce number of results found
- [ ] Announce loading state
- [ ] Announce errors

### Color Contrast
- [ ] Text contrast ratio >= 4.5:1 (WCAG AA)
- [ ] Focus indicators visible and high contrast

---

## Testing Requirements

### Unit Tests (if applicable)
- [ ] Debounce logic works correctly
- [ ] Result transformation matches expected format
- [ ] Error handling covers all cases

### Integration Tests
- [ ] NameTab integrates with LocationPicker
- [ ] SearchModal passes correct props
- [ ] Selected location flows to DashboardPage

### E2E Tests
- [ ] User can search by name and select location
- [ ] Weather data loads for selected location
- [ ] Error states display correctly

---

## Documentation Requirements

### Code Comments
- [ ] JSDoc for `NameTab` component
- [ ] Explain debounce implementation
- [ ] Document prop types

### User-Facing Docs
- [ ] Update SearchModal usage guide (if exists)
- [ ] Add screenshots of Name Search tab

---

## Migration Notes

**No Breaking Changes**: This is an additive feature.

**Backward Compatibility**: Existing Map and Manual tabs continue to work as before.

**Default Tab**: Consider setting "Name" tab as default for better UX (configurable).

---

## Security Considerations

### API Security
- **Public API**: Open-Meteo Geocoding is public, no API key needed
- **Rate Limiting**: Debouncing prevents abuse
- **Input Validation**: Client-side only (API handles server-side)

### XSS Prevention
- **Result Rendering**: Use React's automatic escaping
- **No `dangerouslySetInnerHTML`**: Avoid raw HTML injection

---

## Future Enhancements (Out of Scope)

- [ ] Search history in localStorage
- [ ] Recent searches quick access
- [ ] Autocomplete suggestions as user types
- [ ] Geolocation bias (prioritize results near user)
- [ ] Multi-language search support (already supported by API)

---

## Related Specifications

- **`weather/spec.md`**: Main weather capability spec
- **`SearchModal` component**: Parent component for location search
- **`LocationPicker` component**: Container for all search tabs
- **`weatherService.js`**: Contains `fetchLocationByName` API function

---

## Implementation Reference

**Existing Code to Reuse**:
- `frontend/src/services/weatherService.js::fetchLocationByName` (lines 18-54)
- `frontend/src/pages/SearchPage.js` (lines 20-80) - Search logic pattern

**New Files**:
- `frontend/src/components/LocationPickerComponents/NameTab.js`
- `frontend/src/components/LocationPickerComponents/NameTab.css` (optional, can extend `LocationPicker.css`)

**Modified Files**:
- `frontend/src/components/LocationPicker.js` (add third tab)
- `frontend/src/components/LocationPickerComponents/index.js` (export NameTab)

---

## Approval Status

- [ ] Spec Delta Reviewed
- [ ] Approved for Implementation
- [ ] Implementation Complete
- [ ] Deployed to Production
- [ ] Ready for Archival
