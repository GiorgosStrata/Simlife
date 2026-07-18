/**
 * Central copy / localization map. Menu labels and category names live here
 * so the game's tone is consistent and easy to re-word or translate later.
 * Rename a value in one place and it updates everywhere it's used.
 */
export const STRINGS = {
  // Navigation hubs
  tabs: {
    life: 'Dashboard',
    career: 'Career',
    relationships: 'Social',
    activities: 'Lifestyle',
  },
  advanceYear: 'Advance Year',

  // Wellness hub (was "Mind & Body")
  wellnessHub: 'Wellness',
  wellnessTagline: 'Look after yourself — good habits add years to your life.',
  clinic: 'Visit the Clinic',
  dentist: 'Dental Checkup',
  counseling: 'Mental Health Counseling',
  spa: 'Spa & Relaxation',
  cosmeticSurgery: 'Cosmetic Surgery',

  // Activity / pursuit labels
  workout: 'Workout at Fitness Center',
  mindfulness: 'Practice Mindfulness',
} as const
