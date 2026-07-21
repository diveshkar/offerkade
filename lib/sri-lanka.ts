// The 25 administrative districts of Sri Lanka, grouped by province.
export const PROVINCES: { province: string; districts: string[] }[] = [
  { province: 'Western', districts: ['Colombo', 'Gampaha', 'Kalutara'] },
  { province: 'Central', districts: ['Kandy', 'Matale', 'Nuwara Eliya'] },
  { province: 'Southern', districts: ['Galle', 'Matara', 'Hambantota'] },
  { province: 'Northern', districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'] },
  { province: 'Eastern', districts: ['Ampara', 'Batticaloa', 'Trincomalee'] },
  { province: 'North Western', districts: ['Kurunegala', 'Puttalam'] },
  { province: 'North Central', districts: ['Anuradhapura', 'Polonnaruwa'] },
  { province: 'Uva', districts: ['Badulla', 'Monaragala'] },
  { province: 'Sabaragamuwa', districts: ['Ratnapura', 'Kegalle'] },
];

export const DISTRICTS: string[] = PROVINCES.flatMap((p) => p.districts).sort();

export function isDistrict(value: string): boolean {
  return DISTRICTS.includes(value);
}
