# Video Call Demo Setup Guide

## Overview

A demo route has been created to test the video calling functionality between doctors and patients.

## Access the Demo

Visit: `http://localhost:3000/demo/video-call`

Or navigate to `/demo` and click "Try Video Call"

## How to Test

### Prerequisites

1. Make sure the development server is running (`npm run dev`)
2. Ensure you have at least two user accounts:
   - One with role: `doctor`
   - One with role: `patient`

### Testing Steps

1. **Open Two Browser Sessions**
   - Use two different browsers (e.g., Chrome and Firefox), OR
   - Use one regular window and one incognito/private window

2. **Login with Different Accounts**
   - In Browser 1: Login as a doctor
   - In Browser 2: Login as a patient

3. **Navigate to Demo**
   - In both browsers, go to `/demo/video-call`

4. **Join the Call**
   - Click "Join Call" button in both browsers
   - The video call should initialize automatically

5. **Test Functionality**
   - Verify video is working
   - Test audio/microphone
   - Test camera on/off
   - Test microphone mute/unmute
   - Test screen sharing (if available)
   - Test call controls

## Features

- **Role-based access**: Both doctors and patients can join
- **Real-time video**: Powered by Stream.io
- **Call controls**: Mute, camera toggle, leave call, etc.
- **No time restrictions**: Unlike real appointments, this demo can be accessed anytime
- **Automatic call creation**: The demo call is created/reused automatically

## Technical Details

### API Endpoints Created

- `POST /api/video/demo` - Initialize and join demo call
  - Action: `init` - Creates/gets the demo call
  - Action: `join` - Gets token to join the call

### Files Created

1. `/src/app/(main)/demo/video-call/page.jsx` - Demo page UI
2. `/src/app/api/video/demo/route.ts` - Demo API endpoint

### Environment Variables Required

```env
STREAM_API_KEY=your_api_key
STREAM_SECRET=your_secret
STREAM_WEBHOOK_SECRET=your_webhook_secret
```

## Troubleshooting

### Error: "Unauthorized"

- Make sure you're logged in
- Check that your session is valid

### Error: "Unable to join call"

- Verify Stream.io credentials in `.env`
- Check browser console for detailed errors
- Ensure camera/microphone permissions are granted

### Video/Audio Not Working

- Check browser permissions for camera and microphone
- Try refreshing the page
- Make sure no other application is using the camera

### Can't See Other Participant

- Ensure both users have clicked "Join Call"
- Check network connectivity
- Verify both users are on the same demo call ID

## Clean Up

The demo uses a persistent call ID (`demo_consultation_test`), so the same call is reused across sessions. This is intentional for testing purposes.

## Next Steps

Once testing is complete, you can:

1. Integrate this into real appointment flows
2. Add time-based restrictions for production
3. Customize the UI/UX as needed
4. Add additional features like recording, chat, etc.
