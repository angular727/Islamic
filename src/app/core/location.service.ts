import { Injectable, computed, inject, signal } from '@angular/core';
import { Loc, SettingsService } from './settings.service';

export const MAKKAH: Loc = { name: 'Makkah, Saudi Arabia', lat: 21.4225, lng: 39.8262, tz: 'Asia/Riyadh' };

@Injectable({ providedIn: 'root' })
export class LocationService {
  private settings = inject(SettingsService);
  readonly loc = computed<Loc>(() => this.settings.s().location ?? MAKKAH);
  readonly hasLocation = computed(() => !!this.settings.s().location);
  readonly busy = signal(false);
  readonly error = signal('');

  /** Ask the browser for the current position, reverse-geocode a city name and store it. */
  async detect(): Promise<boolean> {
    this.error.set('');
    if (!('geolocation' in navigator)) { this.error.set('Geolocation is not supported on this device.'); return false; }
    this.busy.set(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }));
      const { latitude: lat, longitude: lng } = pos.coords;
      const name = await this.reverse(lat, lng);
      this.setLocation({ name, lat, lng, auto: true });
      return true;
    } catch (e: any) {
      this.error.set(e?.code === 1 ? 'Location permission was denied. You can search for your city instead.'
        : 'Could not determine your location. You can search for your city instead.');
      return false;
    } finally { this.busy.set(false); }
  }

  setLocation(l: Loc) {
    const saved = this.settings.s().savedLocations;
    const exists = saved.some(x => Math.abs(x.lat - l.lat) < 0.01 && Math.abs(x.lng - l.lng) < 0.01);
    this.settings.patch({ location: l, savedLocations: exists ? saved : [l, ...saved].slice(0, 10) });
  }

  removeSaved(l: Loc) {
    this.settings.patch({ savedLocations: this.settings.s().savedLocations.filter(x => x !== l && x.name !== l.name) });
  }

  async reverse(lat: number, lng: number): Promise<string> {
    try {
      const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const j = await r.json();
      const city = j.city || j.locality || j.principalSubdivision;
      return [city, j.countryName].filter(Boolean).join(', ') || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    } catch { return `${lat.toFixed(2)}, ${lng.toFixed(2)}`; }
  }

  async search(q: string): Promise<Loc[]> {
    if (q.trim().length < 2) return [];
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`);
      const j = await r.json();
      return (j.results ?? []).map((x: any) => ({
        name: [x.name, x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lng: x.longitude, tz: x.timezone,
      }));
    } catch { return []; }
  }
}
