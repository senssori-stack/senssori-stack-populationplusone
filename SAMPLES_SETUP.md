# How to Add Your Sample Images

The app is now set up to display sample images in a beautiful carousel gallery accessible from the intro screen via the **"See Samples"** button.

## Steps to Add Your Sample Images

1. **Convert your images to PNG format** (recommended for quality):
   - Use any image converter (online or desktop software)
   - Target size: 1080×1350 pixels (9:11 aspect ratio) for optimal display

2. **Place images in the `assets/` folder**:
   - `sample-baby-pink.png` - Your baby announcement (pink theme)
   - `sample-welcome-columbia.png` - Your welcome sign example
   - `sample-anniversary-purple.png` - Your anniversary time capsule
   - `sample-birthday-capsule.png` - Your birthday time capsule

3. **Restart your app**:
   ```bash
   npx expo start
   ```

## Sample Images You Provided

Based on your screenshots, the samples modal displays these four examples:

1. **Las Vegas Baby Announcement** (Pink)
   - Shows: Welcome sign with city name, population, baby photo

2. **Columbia, MO Welcome Sign** (Purple & Green)
   - Shows: Welcome to city with population and "+1" message

3. **Anniversary Time Capsule** (Purple)
   - Shows: Detailed historical comparison table with data

4. **Birthday Time Capsule** (Pink)
   - Shows: Birth date context with milestone data

## Customizing Sample Titles

Edit the `SamplesModal.tsx` file to customize titles and descriptions:

```typescript
const samples = [
  {
    id: 1,
    title: 'New Baby Announcement',
    subtitle: 'Las Vegas, NV',
    image: require('../../assets/sample-baby-pink.png'),
  },
  // ... more samples
];
```

## Features of the Samples Gallery

✨ **Swipeable Carousel** - Customers can swipe left/right to browse samples
✨ **Dot Indicators** - Shows current sample position
✨ **Beautiful Design** - Matches your app's theme
✨ **Accessible** - Easy-to-use modal with clear close button
✨ **Informative** - Highlights key features like photos, themes, and print quality

The modal appears on the Intro screen where users choose between "New Baby" and "Life Milestones" modes.
