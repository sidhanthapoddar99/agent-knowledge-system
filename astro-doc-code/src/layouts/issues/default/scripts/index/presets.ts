/**
 * Preset (Saved View) helpers. Views CANNOT include a status-tab filter —
 * the status tab is a per-user cached preference, not part of shareable
 * views. Any preset that ships with a `state` field is ignored and a
 * warning is logged.
 */
import { FIELDS } from './types';
import type { FilterState, PresetView } from './types';

export function warnIfPresetHasState(preset: PresetView): void {
  if (preset.state) {
    console.warn(
      `[issues] Preset "${preset.name}" has a "state" field; ignoring. ` +
      `Views cannot pin status filters.`,
    );
  }
}

export function presetMatchesState(preset: PresetView, state: FilterState): boolean {
  if ((preset.search || '') !== state.q) return false;
  if ((preset.group || '') !== (state.group || '')) return false;
  if ((preset.sort || '') !== (state.sort || '')) return false;
  if ((preset.dir || '') !== (state.dir || '')) return false;
  const filters = preset.filters || {};
  for (const f of FIELDS) {
    const pv = new Set(filters[f] || []);
    const sv = state.fields[f];
    if (pv.size !== sv.size) return false;
    for (const v of pv) if (!sv.has(v)) return false;
  }
  return true;
}

/** Build a URLSearchParams payload for a preset. Status tab is taken from
 * the user's current state, NOT the preset (see module header). */
export function presetToParams(preset: PresetView, currentStateTab: string): URLSearchParams {
  warnIfPresetHasState(preset);
  const params = new URLSearchParams();
  if (preset.search) params.set('q', preset.search);
  const filters = preset.filters || {};
  for (const f of FIELDS) {
    const vals = filters[f];
    if (vals && vals.length) params.set(f, vals.join(','));
  }
  if (currentStateTab !== 'active') params.set('state', currentStateTab);
  if (preset.group) params.set('group', preset.group);
  if (preset.sort && preset.dir) {
    params.set('sort', preset.sort);
    params.set('dir', preset.dir);
  }
  return params;
}
