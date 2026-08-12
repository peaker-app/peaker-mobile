export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export type Visibility = "Public" | "Private";
export type SnowCondition = "None" | "Patchy" | "Continuous" | "Deep";
export type WindCondition = "Calm" | "Moderate" | "Strong" | "Storm";
export type TrailCondition = "Good" | "Muddy" | "Icy" | "Blocked";

export const visibilityValues: readonly Visibility[] = ["Public", "Private"];
export const snowValues: readonly SnowCondition[] = [
  "None",
  "Patchy",
  "Continuous",
  "Deep",
];
export const windValues: readonly WindCondition[] = [
  "Calm",
  "Moderate",
  "Strong",
  "Storm",
];
export const trailValues: readonly TrailCondition[] = [
  "Good",
  "Muddy",
  "Icy",
  "Blocked",
];

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  tokenType: string;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  visibility: Visibility;
}

export interface ProfileStatsResponse {
  totalAscents: number;
  distinctPeaks: number;
  highestAltitudeMeters: number;
  highestPeakId: string | null;
  highestPeakName: string | null;
  lastAscentDate: string | null;
}

export interface PublicProfileResponse {
  userId: string;
  displayName: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  stats: ProfileStatsResponse;
}

export interface AvatarResponse {
  avatarUrl: string;
}

export interface PeakListItemResponse {
  id: string;
  name: string;
  altitudeMeters: number;
  prominenceMeters: number | null;
  latitude: number;
  longitude: number;
  countryCode: string | null;
  region: string | null;
  imageUrl: string | null;
  imageAuthor: string | null;
  imageLicense: string | null;
}

export interface NearbyPeakResponse {
  id: string;
  name: string;
  altitudeMeters: number;
  latitude: number;
  longitude: number;
  countryCode: string | null;
  region: string | null;
  imageUrl: string | null;
  imageAuthor: string | null;
  imageLicense: string | null;
  distanceMeters: number;
}

export interface PeakNameResponse {
  languageCode: string;
  name: string;
  isOfficial: boolean;
}

export interface PeakDetailResponse {
  id: string;
  name: string;
  altitudeMeters: number;
  prominenceMeters: number | null;
  latitude: number;
  longitude: number;
  countryCode: string | null;
  region: string | null;
  imageUrl: string | null;
  imageAuthor: string | null;
  imageLicense: string | null;
  imageLicenseUrl: string | null;
  imageCreditUrl: string | null;
  rangeId: string | null;
  rangeName: string | null;
  alternativeNames: PeakNameResponse[];
}

export interface AscentPhotoResponse {
  id: string;
  secureUrl: string;
  width: number;
  height: number;
  position: number;
  uploadedAtUtc: string;
}

export interface AscentConditionsResponse {
  snow: SnowCondition | null;
  wind: WindCondition | null;
  trail: TrailCondition | null;
}

export interface AscentResponse {
  id: string;
  userId: string;
  peakId: string;
  peakName: string;
  peakAltitudeMeters: number;
  ascentDate: string;
  companions: string | null;
  routeNotes: string | null;
  conditions: AscentConditionsResponse;
  visibility: Visibility;
  photos: AscentPhotoResponse[];
}

export interface AscentSummaryResponse {
  id: string;
  peakId: string;
  peakName: string;
  peakAltitudeMeters: number;
  ascentDate: string;
  visibility: Visibility;
  thumbnailUrl: string | null;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ConfirmEmailRequest {
  token: string;
}

export interface UpdateProfileRequest {
  displayName: string;
  bio: string | null;
  countryCode: string | null;
  visibility: Visibility;
}

export interface ChangeSlugRequest {
  slug: string;
}

export interface RegisterAscentRequest {
  peakId: string;
  ascentDate: string;
  companions: string | null;
  routeNotes: string | null;
  snow: SnowCondition | null;
  wind: WindCondition | null;
  trail: TrailCondition | null;
  visibility: Visibility | null;
  clientAscentId?: string;
}

export type UpdateAscentRequest = Omit<
  RegisterAscentRequest,
  "peakId" | "clientAscentId"
>;

export type CollectionKind = "WantToClimb" | "Custom";

export interface CollectionSummaryResponse {
  id: string;
  name: string;
  description: string | null;
  kind: CollectionKind;
  peakCount: number;
}

export interface CollectionPeakResponse {
  id: string;
  peakId: string;
  peakName: string;
  peakAltitudeMeters: number;
  addedAtUtc: string;
}

export interface CollectionDetailResponse extends CollectionSummaryResponse {
  peaks: PagedResponse<CollectionPeakResponse>;
}

export interface SaveCollectionRequest {
  name: string;
  description: string | null;
}

export interface AddCollectionPeakRequest {
  peakId: string;
}
