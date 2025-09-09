# GIF and Sticker Setup Guide

This guide explains how to set up and use the GIF and sticker functionality in your React Native chat application.

## Features Added

✅ **GIF Picker**: Search and send GIFs from Giphy
✅ **Sticker Picker**: Send emoji stickers organized by categories
✅ **Unified Media Picker**: Combined interface for GIFs and stickers
✅ **Message Rendering**: Proper display of GIFs and stickers in chat bubbles
✅ **Keyboard Integration**: Works with Android Google Keyboard and other keyboards

## Setup Instructions

### 1. Giphy API Configuration

To enable GIF functionality, you need to get a Giphy API key:

1. Go to [Giphy Developers](https://developers.giphy.com/)
2. Create an account and create a new app
3. Get your API key
4. Replace `YOUR_GIPHY_API_KEY` in `/src/components/GifPicker/GifPicker.tsx`:

```typescript
const GIPHY_API_KEY = 'your_actual_api_key_here'; // Replace with your API key
```

### 2. Install Required Dependencies

Install the necessary library for GIF animation:

```bash
npm install react-native-fast-image --legacy-peer-deps
```

For iOS, you'll also need to run:
```bash
cd ios && pod install
```

### 3. Environment Configuration (Recommended)

For better security, create a `.env` file in your project root:

```env
GIPHY_API_KEY=your_actual_api_key_here
```

Then update the GifPicker component to use environment variables:

```typescript
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'YOUR_GIPHY_API_KEY';
```

### 4. Dependencies

The following dependencies are included in your project:
- `react-native-vector-icons` - For icons
- `react-native-gesture-handler` - For swipe gestures
- `react-native-modal` - For modal presentations
- `react-native-fast-image` - **NEW**: For animated GIF support

## Usage

### In Chat Room

1. **Access GIF/Sticker Picker**: Tap the smiley face icon (😊) next to the attachment button
2. **Switch Between GIF/Sticker**: Use the tabs at the top of the picker
3. **Search GIFs**: Type in the search box to find specific GIFs
4. **Browse Stickers**: Navigate through different emoji categories
5. **Send**: Tap any GIF or sticker to send it immediately

### Keyboard Integration

The app now supports GIF and sticker input from:
- Android Google Keyboard GIF panel
- iOS keyboard sticker panel
- Third-party keyboards with media support

## File Structure

```
src/
├── components/
│   ├── GifPicker/
│   │   └── GifPicker.tsx          # GIF search and selection
│   ├── StickerPicker/
│   │   └── StickerPicker.tsx      # Emoji sticker categories
│   ├── MediaPicker/
│   │   └── MediaPicker.tsx        # Combined GIF/sticker picker
│   └── ChatBubble/
│       └── index.tsx              # Updated to render GIFs and stickers
└── screens/
    └── ChatRoom/
        └── Container.tsx          # Updated with GIF/sticker integration
```

## Message Types

The chat now supports these message types:
- `text` - Regular text messages
- `gif` - Animated GIF messages
- `sticker` - Emoji sticker messages
- `voice` - Voice messages (existing)
- `image` - Image messages (existing)
- `video` - Video messages (existing)

## Customization

### Adding More Sticker Categories

Edit `/src/components/StickerPicker/StickerPicker.tsx` and add new categories to the `stickerCategories` array:

```typescript
{
  id: 'custom',
  name: 'Custom',
  icon: 'star-outline',
  stickers: ['🌟', '⭐', '✨', '💫', '🌠']
}
```

### Styling

Customize the appearance by modifying the styles in each component:
- GIF size: Update `gifImage` style in ChatBubble
- Sticker size: Update `stickerText` fontSize in ChatBubble
- Picker colors: Update theme colors in each picker component

## Troubleshooting

### GIFs Not Loading
- Check your Giphy API key is correct
- Ensure internet connection is available
- Check console for API errors

### Keyboard Not Showing GIF Option
- Ensure your keyboard app supports GIF input
- Check app permissions for media access
- Try restarting the keyboard app

### Stickers Too Large/Small
- Adjust `fontSize` in `stickerText` style
- Modify `stickerContainer` dimensions

## Performance Considerations

- GIFs are loaded on-demand to save bandwidth
- Image caching is handled by React Native's Image component
- Search results are limited to 25 items per page for performance

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Consider implementing rate limiting for API calls
- Validate all user inputs before sending

## Future Enhancements

Potential improvements you could add:
- Custom sticker packs
- GIF favorites/recent
- Animated sticker support
- Voice message stickers
- Sticker creation tools
