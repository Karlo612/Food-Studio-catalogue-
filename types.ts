export enum ImageStyle {
  RusticDark = 'Rustic/Dark',
  BrightModern = 'Bright/Modern',
  SocialMedia = 'Social Media (Top-Down)',
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  referenceImageUrl?: string;
  imageUrl?: string;
  isGenerating?: boolean;
}
