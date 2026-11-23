export type GameScreen = 'TITLE' | 'HUB' | 'MODULE';

export type ModuleId =
  | 'warna'
  | 'huruf'
  | 'angka'
  | 'lagu'
  | 'bumi'
  | 'emosi'
  | 'sains'
  | 'gerak'
  | 'digital';

export type BobiMood = 'idle' | 'happy' | 'dancing' | 'encouraging' | 'thinking' | 'jumping';

export type CostumeId =
  | 'default'
  | 'cowboy'
  | 'star_glasses'
  | 'superhero'
  | 'crown'
  | 'astronaut'
  | 'rainbow_scarf';

export interface CostumeItem {
  id: CostumeId;
  name: string;
  description: string;
  starsRequired: number;
  accentColor: string;
}

export interface StickerItem {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  moduleId?: ModuleId;
  starsRequired?: number;
  bgColor: string;
}

export interface ModuleMeta {
  id: ModuleId;
  code: string;
  title: string;
  shortDesc: string;
  category: 'Dasar' | 'Inspiratif';
  cardBg: string;
  cardBorder: string;
  badgeColor: string;
  stickerId: string;
}

export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Tantangan';

export type IllustrationKey =
  | 'apple'
  | 'banana'
  | 'leaf'
  | 'whale'
  | 'carrot'
  | 'grape'
  | 'strawberry'
  | 'sunflower'
  | 'butterfly'
  | 'star_obj'
  | 'fish'
  | 'duck'
  | 'balloon'
  | 'rainbow'
  | 'lizard'
  | 'flamingo'
  | 'train'
  | 'hat'
  | 'banana_peel'
  | 'plastic_bottle'
  | 'apple_core'
  | 'soda_can'
  | 'dry_leaf'
  | 'cardboard'
  | 'emotion_happy'
  | 'emotion_sad'
  | 'emotion_angry'
  | 'emotion_scared'
  | 'emotion_surprised'
  | 'hug_friend'
  | 'share_toy'
  | 'laugh_mean'
  | 'ignore_friend'
  | 'breathe_calm'
  | 'tantrum'
  | 'heavy_rock'
  | 'rubber_duck'
  | 'beach_ball'
  | 'metal_spoon'
  | 'metal_key'
  | 'toy_robot'
  | 'drawing_art'
  | 'house_address'
  | 'phone_number'
  | 'tell_parents'
  | 'reply_stranger'
  | 'strong_password'
  | 'share_password'
  | 'popup_trap'
  | 'apologize_kind'
  | 'eco_tree'
  | 'rocket'
  | 'shield'
  | 'trophy';

export interface QuizOption {
  id: string;
  label: string;
  sublabel?: string;
  colorHex?: string;
  illustration?: IllustrationKey;
  bigSymbol?: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  difficulty: DifficultyLevel;
  promptAudio: string;
  promptText: string;
  visualIllustration?: IllustrationKey;
  visualSymbol?: string;
  visualCount?: number;
  visualColorHex?: string;
  visualLabel?: string;
  options: QuizOption[];
  successAudio: string;
}

export interface SongLyricLine {
  text: string;
  startSec: number;
  endSec: number;
}

export interface SongNote {
  freq: number; // Hz, 0 for rest
  dur: number;  // seconds
}

export interface KidsSong {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  illustration: IllustrationKey;
  accentColor: string;
  lyrics: SongLyricLine[];
  notes: SongNote[];
  quizPrompt: string;
}

export interface EcoTrashQuestion {
  type: 'trash';
  id: string;
  difficulty: DifficultyLevel;
  itemName: string;
  illustration: IllustrationKey;
  correctBin: 'organik' | 'non_organik';
  promptAudio: string;
  successAudio: string;
}

export interface EcoActionQuestion {
  type: 'action';
  id: string;
  difficulty: DifficultyLevel;
  scene: 'lamp' | 'faucet' | 'tv';
  promptText: string;
  promptAudio: string;
  successAudio: string;
}

export type BumiQuestion = EcoTrashQuestion | EcoActionQuestion;

export interface SinkFloatQuestion {
  type: 'sink_float';
  id: string;
  difficulty: DifficultyLevel;
  itemName: string;
  illustration: IllustrationKey;
  answer: 'terapung' | 'tenggelam';
  promptText: string;
  promptAudio: string;
  successAudio: string;
}

export interface ColorMixQuestion {
  type: 'color_mix';
  id: string;
  difficulty: DifficultyLevel;
  colorA: { name: string; hex: string };
  colorB: { name: string; hex: string };
  result: { name: string; hex: string };
  options: { name: string; hex: string; isCorrect: boolean }[];
  promptText: string;
  promptAudio: string;
  successAudio: string;
}

export type SainsQuestion = SinkFloatQuestion | ColorMixQuestion;

export interface GerakChallenge {
  id: string;
  difficulty: DifficultyLevel;
  actionType: 'lompat' | 'tepuk' | 'angkat';
  actionLabel: string;
  targetCount: number;
  promptText: string;
  promptAudio: string;
  successAudio: string;
}
