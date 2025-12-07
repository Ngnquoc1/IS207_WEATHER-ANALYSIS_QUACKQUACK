# Implementation Tasks: Add Location Name Search

## Prerequisites
- [x] Proposal approved
- [ ] `fetchLocationByName` API verified working
- [ ] Review `SearchPage.js` implementation for reference

## Phase 1: Component Creation

### Task 1.1: Create NameTab Component File
- [ ] Create `frontend/src/components/LocationPickerComponents/NameTab.js`
- [ ] Set up basic component structure with props
- [ ] Import necessary dependencies (`React`, `useState`, `useEffect`)
- [ ] Import `fetchLocationByName` from `weatherService`

**Acceptance Criteria**:
- File exists and exports `NameTab` component
- Component receives all required props from `LocationPicker`

---

### Task 1.2: Implement Search Input UI
- [ ] Create search input field with placeholder "Nhập tên thành phố, quốc gia..."
- [ ] Add clear button (X icon) to reset search
- [ ] Add search icon for visual clarity
- [ ] Style input to match `MapTab` and `ManualTab` design

**Acceptance Criteria**:
- Input field renders correctly
- Clear button appears when input has text
- Styling consistent with existing tabs

---

### Task 1.3: Add Debounced Search Logic
- [ ] Create `searchQuery` state for input value
- [ ] Create `searchResults` state for API results
- [ ] Create `isSearching` state for loading indicator
- [ ] Implement `useEffect` with debounce (500ms)
- [ ] Trigger search only if query length >= 2 characters
- [ ] Call `fetchLocationByName(searchQuery)` and update `searchResults`

**Acceptance Criteria**:
- Search is debounced (no API call until 500ms after typing stops)
- Minimum 2 characters required to search
- Loading state shows during API call

**Code Reference**:
```javascript
useEffect(() => {
  if (searchQuery.length < 2) {
    setSearchResults([]);
    return;
  }

  const timer = setTimeout(async () => {
    setIsSearching(true);
    try {
      const results = await fetchLocationByName(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [searchQuery]);
```

---

### Task 1.4: Build Search Results List UI
- [ ] Create results container that displays `searchResults`
- [ ] Map over results to render each location item
- [ ] Show: `{name}, {admin1}, {country}` for each result
- [ ] Add hover/focus states for each result item
- [ ] Show "Đang tìm kiếm..." when `isSearching === true`
- [ ] Show "Không tìm thấy địa điểm" when results empty after search
- [ ] Limit display to 10 results (API default)

**Acceptance Criteria**:
- Results render as clickable list items
- Each result shows full location details
- Loading spinner appears during search
- Empty state message appears when no results
- Hover effects work correctly

---

### Task 1.5: Implement Result Selection Handler
- [ ] Add `onClick` handler to each result item
- [ ] Call `setSelectedLocation()` with selected result
- [ ] Transform result format to match expected structure:
  ```javascript
  {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1
  }
  ```
- [ ] Clear search results after selection
- [ ] Display selected location details below results

**Acceptance Criteria**:
- Clicking a result populates `selectedLocation`
- Search results clear after selection
- Selected location displays with coordinates

---

### Task 1.6: Add Selected Location Display
- [ ] Create section to show selected location details
- [ ] Display: Location name, coordinates, country
- [ ] Add "Chọn vị trí này" button (calls `onSelectLocation`)
- [ ] Button only enabled when `selectedLocation` is not null
- [ ] Style to match `ManualTab` selected location display

**Acceptance Criteria**:
- Selected location details visible
- Confirm button triggers `onSelectLocation`
- Button disabled state works correctly

---

### Task 1.7: Add Error Handling UI
- [ ] Display error message from `error` state
- [ ] Show specific messages:
  - "Không tìm thấy địa điểm nào"
  - "Lỗi kết nối - vui lòng thử lại"
  - "Hết thời gian chờ - vui lòng thử lại"
- [ ] Add retry button for network errors
- [ ] Clear error when new search starts

**Acceptance Criteria**:
- Error messages display correctly
- Retry button appears for recoverable errors
- Errors clear on new search

---

## Phase 2: Integration with LocationPicker

### Task 2.1: Update LocationPicker Component
- [ ] Import `NameTab` component
- [ ] Add "name" option to `activeTab` state
- [ ] Add third tab button "Tìm theo Tên"
- [ ] Add conditional rendering for `NameTab` in tab content
- [ ] Pass all required props to `NameTab`:
  - `isDark`
  - `selectedLocation`
  - `setSelectedLocation`
  - `loading`
  - `setLoading`
  - `error`
  - `setError`
  - `onSelectLocation`

**Acceptance Criteria**:
- Third tab button renders
- Tab switching works between all 3 tabs
- `NameTab` receives correct props

**Code Reference**:
```javascript
<button 
  className={`tab-button ${activeTab === 'name' ? 'active' : ''}`}
  onClick={() => setActiveTab('name')}
>
  Tìm theo Tên
</button>

{activeTab === 'name' && (
  <NameTab 
    isDark={isDark}
    selectedLocation={selectedLocation}
    setSelectedLocation={setSelectedLocation}
    loading={loading}
    setLoading={setLoading}
    error={error}
    setError={setError}
    onSelectLocation={onSelectLocation}
  />
)}
```

---

### Task 2.2: Export NameTab from Index
- [ ] Update `LocationPickerComponents/index.js`
- [ ] Add `export { default as NameTab } from './NameTab';`
- [ ] Verify import works in `LocationPicker.js`

**Acceptance Criteria**:
- Import statement works: `import { MapTab, ManualTab, NameTab } from './LocationPickerComponents';`

---

### Task 2.3: Test Tab State Persistence
- [ ] Test switching tabs with partial search query
- [ ] Verify `selectedLocation` persists across tab switches
- [ ] Ensure `error` and `loading` states clear appropriately
- [ ] Test switching from NameTab with selected location to other tabs

**Acceptance Criteria**:
- No state loss when switching tabs
- Selected location remains visible in all tabs
- No console errors during tab transitions

---

## Phase 3: Styling & UX

### Task 3.1: Create NameTab Styles
- [ ] Create CSS styles for NameTab (add to `LocationPicker.css` or create `NameTab.css`)
- [ ] Style search input container
- [ ] Style search results list
- [ ] Style selected location display
- [ ] Add hover/focus states for accessibility
- [ ] Ensure consistent spacing with other tabs

**CSS Classes Needed**:
- `.name-tab-container`
- `.search-input-wrapper`
- `.search-input`
- `.clear-button`
- `.search-results`
- `.result-item`
- `.selected-location-display`
- `.confirm-button`

**Acceptance Criteria**:
- NameTab visually matches MapTab and ManualTab
- Hover/focus states work smoothly
- Spacing and padding consistent

---

### Task 3.2: Add Loading Spinner
- [ ] Create spinner for search in progress
- [ ] Use same spinner design as other components
- [ ] Display spinner below search input during `isSearching`
- [ ] Add "Đang tìm kiếm..." text with spinner

**Acceptance Criteria**:
- Spinner appears during API call
- Spinner matches project design system
- Text provides clear feedback

---

### Task 3.3: Theme Support (Dark/Light)
- [ ] Add theme classes to NameTab container
- [ ] Test dark mode styling for:
  - Search input
  - Results list
  - Selected location display
  - Buttons
- [ ] Ensure text contrast meets accessibility standards
- [ ] Test light mode styling

**Acceptance Criteria**:
- Dark mode renders correctly
- Light mode renders correctly
- Theme switching works without visual glitches

---

### Task 3.4: Mobile Responsive Design
- [ ] Test NameTab on mobile viewport (< 768px)
- [ ] Adjust search input width for small screens
- [ ] Ensure results list scrollable on mobile
- [ ] Test touch interactions (tap to select)
- [ ] Verify button sizes meet touch target guidelines (44x44px minimum)

**Acceptance Criteria**:
- Mobile layout doesn't break
- All interactions work on touch devices
- No horizontal scrolling

---

## Phase 4: Testing

### Task 4.1: Functional Testing
- [ ] Test search with Vietnamese city names ("Hà Nội", "Hồ Chí Minh")
- [ ] Test search with English city names ("Paris", "London")
- [ ] Test search with country names ("Vietnam", "France")
- [ ] Test search with partial names ("Ha N", "Lon")
- [ ] Test search with special characters ("São Paulo")
- [ ] Test search with numbers ("District 1")
- [ ] Test minimum character requirement (1 char = no search, 2+ chars = search)
- [ ] Test clear button functionality

**Acceptance Criteria**:
- All search types return relevant results
- API handles various inputs correctly
- Clear button resets search state

---

### Task 4.2: Error Scenario Testing
- [ ] Test with invalid query (gibberish: "asdfasdfasdf")
- [ ] Test with network disconnected (simulate offline)
- [ ] Test with slow network (throttle to 3G)
- [ ] Test with API timeout
- [ ] Verify error messages display correctly
- [ ] Test retry button after network error

**Acceptance Criteria**:
- "Không tìm thấy địa điểm" for no results
- "Lỗi kết nối" for network errors
- Retry button works to re-attempt search

---

### Task 4.3: Integration Testing
- [ ] Select location in NameTab → click "Chọn vị trí này"
- [ ] Verify `SearchModal` closes
- [ ] Verify `Header` receives location data
- [ ] Verify `DashboardPage` fetches weather for selected location
- [ ] Verify weather data displays correctly for selected location
- [ ] Test with multiple locations in sequence

**Acceptance Criteria**:
- End-to-end flow works without errors
- Weather data loads for selected location
- No prop drilling issues

---

### Task 4.4: Tab Switching Testing
- [ ] Start search in NameTab → switch to MapTab → switch back
- [ ] Verify search query persists (or clears, depending on UX decision)
- [ ] Select location in NameTab → switch to ManualTab
- [ ] Verify selected location coordinates pre-fill ManualTab inputs
- [ ] Switch tabs rapidly (stress test)

**Acceptance Criteria**:
- No console errors during rapid switching
- State behaves consistently
- No memory leaks

---

### Task 4.5: Accessibility Testing
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify screen reader announces search results
- [ ] Add ARIA labels to search input, results list
- [ ] Add `role="listbox"` to results container
- [ ] Add `role="option"` to result items
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Check color contrast ratios (WCAG AA)

**Acceptance Criteria**:
- Keyboard navigation works without mouse
- Screen reader announces all interactive elements
- ARIA roles implemented correctly

---

### Task 4.6: Cross-Browser Testing
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (macOS/iOS)
- [ ] Test in Edge (latest)
- [ ] Check for browser-specific CSS issues
- [ ] Verify Geocoding API works in all browsers

**Acceptance Criteria**:
- Feature works identically in all major browsers
- No browser-specific bugs

---

## Phase 5: Documentation & Cleanup

### Task 5.1: Add Code Comments
- [ ] Add JSDoc comments to `NameTab` component
- [ ] Document prop types with PropTypes or TypeScript
- [ ] Comment debounce logic
- [ ] Comment error handling logic

**Acceptance Criteria**:
- Code is well-documented
- Props are typed/documented

---

### Task 5.2: Update README (if applicable)
- [ ] Add feature description to project README
- [ ] Document new tab in SearchModal section
- [ ] Add screenshots if needed

**Acceptance Criteria**:
- README reflects new feature

---

### Task 5.3: Performance Optimization
- [ ] Verify no unnecessary re-renders (use React DevTools)
- [ ] Check for memory leaks (unmount cleanup)
- [ ] Optimize debounce timeout (test user feedback)
- [ ] Consider adding `useMemo` for result transformations

**Acceptance Criteria**:
- Component performance meets standards
- No memory leaks detected

---

### Task 5.4: Final Code Review
- [ ] Self-review code for best practices
- [ ] Remove console.logs
- [ ] Remove commented-out code
- [ ] Ensure consistent formatting (Prettier/ESLint)
- [ ] Verify no hardcoded values (use constants)

**Acceptance Criteria**:
- Code passes linting
- Code follows project conventions

---

## Phase 6: Deployment

### Task 6.1: Create Feature Branch
- [ ] Create branch: `feature/add-location-name-search`
- [ ] Commit changes with descriptive messages
- [ ] Push to remote repository

---

### Task 6.2: Create Pull Request
- [ ] Open PR with link to proposal
- [ ] Fill PR template with testing details
- [ ] Request reviews from team members

---

### Task 6.3: Merge & Deploy
- [ ] Address review feedback
- [ ] Merge to `main` branch
- [ ] Deploy to staging environment
- [ ] Verify on staging
- [ ] Deploy to production

**Acceptance Criteria**:
- Feature live in production
- No deployment errors

---

## Rollback Checklist
If issues arise post-deployment:
- [ ] Revert PR commit
- [ ] Redeploy previous version
- [ ] Notify team of rollback
- [ ] Document issues for post-mortem

---

## Definition of Done
- [ ] All tasks completed and checked
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Feature deployed to production
- [ ] No critical bugs reported within 24 hours

---

## Notes
- Refer to `SearchPage.js` implementation for reference patterns
- Reuse existing `fetchLocationByName` function (no changes needed)
- Coordinate with design team for final UX approval
- Monitor Open-Meteo API usage (free tier limits)
