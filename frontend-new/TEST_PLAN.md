# VTO App - Photo Review Fixes Test Plan

## 🎯 Testing Both Critical Fixes

### Issue 1: Photo Cards Not Updating After Retake
### Issue 2: Swipe Direction in Photo Preview

---

## 📋 Pre-Test Setup

1. **Start the Expo server** (you'll need to install Node.js first):
   ```bash
   cd /Users/vikash/VTO/temp-frontend
   npm start
   # or if you have yarn: yarn start
   ```

2. **Open the app** on your device/simulator
3. **Navigate to guided capture** from the dashboard

---

## 🧪 Test Scenario 1: Photo Update After Retake

### Steps:
1. **Complete guided capture** - take all 6 photos
2. **Go to photo review screen** - you should see a 3x2 grid of photos
3. **Note the current photos** - pay attention to specific visual details
4. **Tap any photo** to open full-screen preview
5. **Tap "Retake" button** at the bottom
6. **Capture a new photo** in guided mode (make it visually different)
7. **Return to photo review** automatically

### ✅ Expected Results:
- [ ] The specific photo card in the grid should **immediately show the new image**
- [ ] No old cached image should be visible
- [ ] The quality indicator should update if quality changed
- [ ] Console logs should show: `"✅ PhotoReview: Updated photos:"`

### 🔍 What to Check:
- **Visual verification**: The thumbnail in the grid reflects the new photo
- **Quality indicators**: Green checkmark or yellow warning updates appropriately  
- **No caching issues**: Image changes immediately without app restart

---

## 🧪 Test Scenario 2: Swipe Navigation Direction

### Steps:
1. **Open any photo** in full-screen preview mode
2. **Check current position** - note the "X / 6" counter at top
3. **Test swipe right** (tap right side of screen or swipe right)
4. **Verify direction** - should go to NEXT photo (higher number)
5. **Test swipe left** (tap left side of screen or swipe left)  
6. **Verify direction** - should go to PREVIOUS photo (lower number)

### ✅ Expected Results:

| Current Photo | Swipe Right (→) | Expected Result |
|---------------|----------------|-----------------|
| 1/6           | →              | 2/6 (forward)   |
| 2/6           | →              | 3/6 (forward)   |
| 3/6           | →              | 4/6 (forward)   |

| Current Photo | Swipe Left (←)  | Expected Result |
|---------------|----------------|-----------------|
| 6/6           | ←              | 5/6 (backward)  |
| 5/6           | ←              | 4/6 (backward)  |
| 4/6           | ←              | 3/6 (backward)  |

### 🔍 What to Check:
- **Intuitive navigation**: Right swipe = forward, Left swipe = backward
- **Visual feedback**: Navigation hints (‹ › arrows) appear on sides
- **Boundary handling**: Can't go beyond first/last photo
- **Console logs**: Should show direction logs like `"➡️ Touch: Right side tapped - going to NEXT photo (forward)"`

---

## 🔧 Debug Information to Monitor

### Console Logs to Look For:

#### Photo Update Success:
```
🔄 PhotoReview: Detected new photos, updating...
✅ PhotoReview: Updated photos: Front Face:..., Left Profile:...
```

#### Swipe Navigation Success:
```
💆 Touch at locationX: 89, threshold: 97, screen width: 390
➡️ Touch: Right side tapped - going to NEXT photo (forward)
📏 Navigation: Current photo 2/6, going next
✅ Navigation: Moving to photo 3/6
```

### Key Implementation Details:

#### Photo Update Mechanism:
- **Force refresh counter**: Increments on each update
- **Cache busting**: URIs include timestamp `?t=timestamp`
- **Enhanced keys**: Include force refresh for complete re-render
- **State management**: Timestamp-based updates prevent stale data

#### Swipe Navigation Logic:
- **Left tap**: `locationX < threshold` → `navigateToPhoto('prev')`
- **Right tap**: `locationX > width - threshold` → `navigateToPhoto('next')`
- **Threshold**: 25% of screen width from each edge
- **Center tap**: No navigation (stays on current photo)

---

## 🚨 Common Issues to Watch For

### Photo Update Issues:
- [ ] **Old image persists**: Check if timestamp parameter is being passed
- [ ] **Grid doesn't refresh**: Verify force refresh counter is incrementing
- [ ] **Image caching**: Look for cache busting in URI (`?t=timestamp`)

### Swipe Navigation Issues:
- [ ] **Backwards navigation**: Verify touch coordinates and direction mapping
- [ ] **No response**: Check if touch events are being registered
- [ ] **Wrong boundaries**: Ensure can't navigate beyond first/last photo

---

## 📊 Test Results Template

### Photo Update Test:
- [ ] ✅ PASS: Photo cards update immediately after retake
- [ ] ❌ FAIL: Photo cards still show old images
- **Notes**: _______________

### Swipe Navigation Test:
- [ ] ✅ PASS: Swipe right goes forward (1→2→3→4→5→6)
- [ ] ✅ PASS: Swipe left goes backward (6→5→4→3→2→1)
- [ ] ❌ FAIL: Swipe directions are still reversed
- **Notes**: _______________

### Overall Assessment:
- [ ] Both issues completely resolved
- [ ] One issue resolved, one still needs work
- [ ] Both issues still need attention

---

## 📱 Manual Testing Notes

**Device/Simulator**: _______________
**Test Date**: _______________
**Expo Version**: _______________
**Issues Found**: _______________
**Additional Observations**: _______________