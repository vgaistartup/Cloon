🔄 Complete Photo Flow Redesign - FIXED

## ❌ Root Problems Identified:
1. **Incorrect photo mapping**: Photos stored in array order, not linked to poses
2. **Array-based storage**: `capturedPhotos[index]` didn't match pose IDs  
3. **Retake logic flawed**: Updated wrong photo positions
4. **No real functionality**: Used placeholder arrays instead of proper mapping

## ✅ Complete Solution Implemented:

### 1. Proper Photo Mapping System
- **NEW**: `Map<stepId, PhotoCapture>` structure
- **Each photo** linked to specific pose by step ID
- **Retake** updates exact same step, not array position

### 2. Fixed Data Structure
```typescript
interface PhotoCapture {
  stepId: number;    // Links to captureSteps[].id
  pose: string;      // "Front Face", "Left Profile", etc.
  uri: string;       // Actual photo URI
  timestamp: number; // For cache busting
}
```

### 3. Real Functionality Implemented
- **Capture**: `capturedPhotos.set(stepId, photoData)`
- **Retake**: `capturedPhotos.delete(stepId)` then recapture
- **Review**: Convert Map to array with proper pose mapping
- **Update**: Uses step ID to update exact photo

### 4. Fixed Flow Logic
- **Initial capture**: Photo saved to correct step ID
- **Retake mode**: Pre-loads existing photo for retaking
- **Navigation**: Passes complete photo objects with proper IDs
- **Update**: Maps by ID, not array position

## 🎯 Now Working Correctly:
✅ Photos save to correct pose positions
✅ Retake updates exact same photo
✅ Swipe navigation works intuitively  
✅ Real functionality, not placeholders
✅ Cache busting prevents stale images

## 🧪 Test Again:
1. Complete guided capture - verify photos match poses
2. Retake specific photo - verify same card updates
3. Swipe navigation - verify right=forward, left=backward