# Change Proposal: Add Location Name Search to SearchModal

## Metadata
- **Change ID**: `add-location-name-search`
- **Status**: Draft
- **Created**: 2025-12-07
- **Author**: AI Assistant
- **Affected Capabilities**: `weather` (location search)

## Problem Statement

Currently, the `SearchModal` component only provides two methods for location selection:
1. **Map Tab**: Users click on an interactive map to select coordinates
2. **Manual Tab**: Users manually enter latitude and longitude values

This is limiting because:
- Users must know exact coordinates to use manual entry
- Map navigation can be tedious for finding specific cities
- No search by city name, address, or landmark
- The `fetchLocationByName` function exists in `weatherService.js` but is only used in `SearchPage.js`
- Inconsistent UX: `SearchPage` has name search, but `SearchModal` (used in `Header`) doesn't

**Current Pain Points**:
- User wants to check weather for "Paris" → must navigate map manually or look up coordinates
- User wants "Hồ Chí Minh" → needs to click through dropdown quick locations or use map
- No autocomplete or search suggestions in the main search workflow

## Proposed Solution

Add a **third tab "Tìm theo Tên"** (Search by Name) to `LocationPicker` component that:
1. Provides a text input for city/location name search
2. Uses existing `fetchLocationByName` API from `weatherService.js`
3. Displays search results with autocomplete-style list
4. Shows location details: name, admin region, country
5. Allows user to select from results to populate `selectedLocation`

**Why This Solution**:
- Reuses existing, tested geocoding integration (Open-Meteo Geocoding API)
- Consistent with `SearchPage` implementation pattern
- Natural UX progression: Map → Manual → Name Search (easiest to hardest)
- No backend changes needed - frontend-only enhancement

## Architecture Impact

### Components Affected
- **LocationPicker.js**: Add new tab state and conditional rendering
- **New Component**: `NameTab.js` - similar structure to `MapTab` and `ManualTab`
- **SearchModal.js**: No changes needed (already passes all required props)

### Data Flow
```
User types "Hanoi" → NameTab debounces input → fetchLocationByName() 
→ Open-Meteo Geocoding API → Results displayed 
→ User clicks result → setSelectedLocation() → SearchModal.handleSelectLocation() 
→ Header.onLocationSelect() → DashboardPage fetches weather
```

### API Dependencies
- **Existing**: Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`)
- **No New APIs Required**

### State Management
- Uses existing `selectedLocation`, `loading`, `error`, `setError` from `SearchModal`
- No new Redux/Context needed

## Technical Design

### Component Structure
```
LocationPicker.js
├── Tab Navigation (3 tabs: Map | Manual | Name)
├── MapTab (existing)
├── ManualTab (existing)
└── NameTab (NEW)
    ├── Search Input
    ├── Search Results List
    └── Selected Location Display
```

### NameTab Component Spec
**Props** (inherited from LocationPicker):
- `isDark`: boolean (theme)
- `selectedLocation`: object | null
- `setSelectedLocation`: function
- `loading`: boolean
- `setLoading`: function
- `error`: string
- `setError`: function
- `onSelectLocation`: function (submit handler)

**Internal State**:
- `searchQuery`: string (input value)
- `searchResults`: array (geocoding results)
- `isSearching`: boolean (API call in progress)

**Behavior**:
1. **Search Input**:
   - Debounced API calls (500ms after user stops typing)
   - Minimum 2 characters to trigger search
   - Clear button to reset search
   - Placeholder: "Nhập tên thành phố, quốc gia..."

2. **Results Display**:
   - Shows up to 10 results (API default)
   - Each result shows: `{name}, {admin1}, {country}`
   - Hover/focus states for accessibility
   - Click to select → populates `selectedLocation`

3. **Selected Location**:
   - Display selected location details
   - Show coordinates for verification
   - "Chọn vị trí này" button to confirm

4. **Error Handling**:
   - No results: "Không tìm thấy địa điểm nào"
   - Network error: "Lỗi kết nối - vui lòng thử lại"
   - Timeout: "Hết thời gian chờ - vui lòng thử lại"

### Code Reuse from SearchPage
`SearchPage.js` already implements this pattern:
- Search input with debouncing
- Results list rendering
- Click handler for location selection

**Adaptation Strategy**:
- Extract reusable logic into `NameTab` component
- Align styling with `MapTab` and `ManualTab` (CSS consistency)
- Use same `fetchLocationByName` service function
- Match error handling patterns from existing tabs

## Implementation Plan

### Phase 1: Component Creation
1. Create `NameTab.js` in `LocationPickerComponents/`
2. Implement search input with debouncing
3. Integrate `fetchLocationByName` API
4. Build results list UI
5. Add selection handler

### Phase 2: Integration
1. Update `LocationPicker.js`:
   - Add "name" tab option
   - Import `NameTab` component
   - Add tab navigation button
2. Test all tab transitions
3. Verify state persistence across tabs

### Phase 3: Styling & UX
1. Create `NameTab.css` (or extend `LocationPicker.css`)
2. Match visual style of `MapTab` and `ManualTab`
3. Add loading spinners for search
4. Polish result hover/focus states
5. Ensure dark/light theme compatibility

### Phase 4: Testing
1. Test search with various queries (Vietnamese, English, special chars)
2. Test error scenarios (no results, network failure)
3. Test tab switching with partial data
4. Test integration with `SearchModal` → `Header` → `DashboardPage`
5. Cross-browser testing (Chrome, Firefox, Safari)

## Success Criteria

### Functional Requirements
- [ ] Users can search locations by typing city/country names
- [ ] Search returns relevant results from Open-Meteo Geocoding API
- [ ] Search is debounced (no excessive API calls)
- [ ] Results display clearly with name, region, country
- [ ] Clicking a result selects it and populates `selectedLocation`
- [ ] Selected location can be confirmed to fetch weather data
- [ ] All error states handled gracefully

### Non-Functional Requirements
- [ ] Search response time < 1 second (API dependent)
- [ ] No flickering during debounced search
- [ ] Consistent styling with existing tabs
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Mobile responsive

### User Experience
- [ ] Easier than navigating map for known locations
- [ ] Clear visual feedback during search/loading
- [ ] Error messages in Vietnamese
- [ ] Smooth transitions between tabs

## Risk Assessment

### Low Risk
- **API Stability**: Open-Meteo Geocoding is established and reliable
- **Code Impact**: Isolated to `LocationPicker` and new `NameTab` component
- **Breaking Changes**: None - additive feature only

### Medium Risk
- **UX Complexity**: Third tab adds cognitive load
  - *Mitigation*: Make tab labels clear, set "Name" as default tab
- **Search Quality**: Geocoding may return unexpected results
  - *Mitigation*: Show full location details (city, region, country) to verify

### Minimal Risk
- **Performance**: API calls are debounced and cached by browser
- **Accessibility**: Follow existing tab patterns for a11y

## Alternative Solutions Considered

### Alternative 1: Merge Name Search into Manual Tab
**Pros**: No new tab, simpler UI
**Cons**: Mixing coordinates and name search is confusing UX
**Verdict**: Rejected - separate concerns

### Alternative 2: Replace Map Tab with Name Search
**Pros**: Fewer tabs, name search is more intuitive
**Cons**: Removes map visualization, some users prefer visual selection
**Verdict**: Rejected - keep both options

### Alternative 3: Add Name Search to Quick Locations Dropdown
**Pros**: No modal changes needed
**Cons**: Dropdown already crowded, search results need more space
**Verdict**: Rejected - dropdown is for presets, modal is for search

## Dependencies

### Internal
- `weatherService.js::fetchLocationByName` (existing)
- `LocationPicker.js` component structure
- `SearchModal.js` state management

### External
- Open-Meteo Geocoding API (no API key required)

### Libraries
- None (uses existing Axios for HTTP)

## Rollout Plan

### Phase 1: Development (Day 1-2)
- Create `NameTab` component
- Integrate into `LocationPicker`
- Basic testing

### Phase 2: Testing (Day 3)
- Comprehensive functional testing
- User acceptance testing (UAT)
- Bug fixes

### Phase 3: Deployment (Day 4)
- Merge to feature branch
- Deploy to staging
- Production release

### Phase 4: Monitoring (Day 5+)
- Monitor API usage (Geocoding API calls)
- Track user adoption (tab usage analytics)
- Gather feedback

## Rollback Plan

If issues arise:
1. **Frontend Only**: No database changes, easy rollback
2. **Feature Toggle**: Can disable third tab via config
3. **Revert Commit**: Clean revert without breaking changes

## Open Questions

1. **Default Tab**: Should "Name Search" be the default tab instead of "Map"?
   - *Recommendation*: Yes - most users know location names, not coordinates
   
2. **Search History**: Should we cache recent searches in localStorage?
   - *Recommendation*: Future enhancement - not in this PR

3. **Result Limit**: Open-Meteo returns 10 results - is this enough?
   - *Recommendation*: Yes - if not found in top 10, user should refine query

4. **Multi-language**: Should we support English queries for Vietnamese locations?
   - *Recommendation*: API already handles this - "Hanoi" returns "Hà Nội"

## Approval

- [ ] Product Owner Review
- [ ] Tech Lead Review
- [ ] Security Review (N/A - no new auth/data)
- [ ] Final Approval

## Notes

- This feature aligns with existing `SearchPage` functionality - creates consistency
- No backend changes required - pure frontend enhancement
- Reuses battle-tested Open-Meteo Geocoding API
- Low risk, high user value
