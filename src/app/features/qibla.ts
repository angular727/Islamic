import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { TPipe } from '../core/i18n';
import { LocationService } from '../core/location.service';
import { KAABA, PrayerService } from '../core/prayer.service';
import { SettingsService } from '../core/settings.service';
import { HeaderComponent } from '../shared/ui';

const DIRS = ['North', 'North East', 'East', 'South East', 'South', 'South West', 'West', 'North West'];

@Component({
  selector: 'app-qibla',
  imports: [RouterLink, TPipe, HeaderComponent],
  template: `
    <app-header [title]="'qibla' | t" />
    <div class="pad">
      <div class="seg mb-3">
        <button [class.active]="view() === 'compass'" (click)="setView('compass')"><i class="bi bi-compass"></i> Compass</button>
        <button [class.active]="view() === 'map'" (click)="setView('map')"><i class="bi bi-map"></i> Map</button>
        <button [class.active]="view() === 'camera'" (click)="setView('camera')"><i class="bi bi-camera"></i> Camera</button>
      </div>

      @if (view() === 'compass') {
        <div class="text-center">
          <div class="compass-wrap" [class.aligned]="aligned()">
            <div class="dial" [style.transform]="'rotate(' + (-heading()) + 'deg)'">
              <span class="c n">N</span><span class="c e">E</span><span class="c s">S</span><span class="c w">W</span>
              @for (t of ticks; track t) { <span class="tick" [style.transform]="'rotate(' + t + 'deg)'"></span> }
              <div class="qibla-needle" [style.transform]="'rotate(' + bearing() + 'deg)'"><i class="bi bi-geo-alt-fill"></i><span class="kaaba">🕋</span></div>
            </div>
            <div class="fixed-pointer"></div>
          </div>
          <div class="deg">{{ bearing().toFixed(0) }}°</div>
          <div class="text-secondary">{{ dirName() }}</div>
          @if (aligned()) { <div class="chip mt-2"><i class="bi bi-check-circle-fill"></i> You are facing the Qibla</div> }
        </div>
        @if (!sensor()) {
          <div class="card-i mt-3 small">
            @if (needsPermission()) {
              <p class="mb-2">Allow motion & orientation access to use the live compass.</p>
              <button class="btn-i sm" (click)="enableSensor()">Enable compass</button>
            } @else {
              <i class="bi bi-info-circle"></i> No compass sensor detected on this device. The dial shows the Qibla bearing
              measured clockwise from true North ({{ bearing().toFixed(1) }}°). Use a phone for the live compass.
            }
          </div>
        } @else { <div class="small text-secondary text-center mt-3"><i class="bi bi-phone"></i> Hold your device flat. If the arrow drifts, wave it in a figure-8 to calibrate.</div> }
      }

      @if (view() === 'map') {
        <div #mapEl class="map"></div>
      }

      @if (view() === 'camera') {
        <div class="cam">
          <video #vid autoplay playsinline muted></video>
          @if (camError()) { <div class="cam-msg">{{ camError() }}</div> }
          @else { <div class="cam-arrow" [style.transform]="'translateX(-50%) rotate(' + relative() + 'deg)'"><i class="bi bi-arrow-up-circle-fill"></i></div> }
        </div>
        <div class="small text-secondary mt-2 text-center">Point the arrow straight up to face the Qibla.</div>
      }

      <div class="card-i mt-3 d-flex align-items-center gap-3">
        <div class="ic-k">🕋</div>
        <div class="flex-grow-1">
          <div class="fw-semibold">Distance from Kaaba</div>
          <div class="text-secondary small">{{ loc.loc().name }}</div>
        </div>
        <div class="text-end fw-bold">{{ km() }} km<div class="small text-secondary fw-normal">{{ mi() }} mi</div></div>
      </div>
      @if (!loc.hasLocation()) { <a routerLink="/location" class="btn-i outline mt-3">{{ 'allowLocation' | t }}</a> }
    </div>`,
  styles: [`
    .compass-wrap { position: relative; width: 280px; height: 280px; margin: 8px auto 12px; }
    .dial { position: absolute; inset: 0; border-radius: 50%; border: 6px solid var(--g-700); background: var(--surface); box-shadow: var(--shadow); transition: transform .12s linear; }
    .aligned .dial { border-color: #1fa463; box-shadow: 0 0 0 6px rgba(31, 164, 99, .18); }
    .c { position: absolute; font-weight: 700; color: var(--muted); } .c.n { top: 8px; left: 50%; transform: translateX(-50%); color: #c0392b; }
    .c.s { bottom: 8px; left: 50%; transform: translateX(-50%); } .c.e { right: 12px; top: 50%; transform: translateY(-50%); } .c.w { left: 12px; top: 50%; transform: translateY(-50%); }
    .tick { position: absolute; left: 50%; top: 0; width: 2px; height: 10px; margin-left: -1px; background: var(--line); transform-origin: 1px 134px; }
    .qibla-needle { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; transition: transform .12s linear; }
    .qibla-needle i { font-size: 30px; color: var(--g-700); margin-top: 30px; } .kaaba { font-size: 28px; margin-top: -4px; }
    .fixed-pointer { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); border-left: 9px solid transparent; border-right: 9px solid transparent; border-top: 16px solid var(--gold); }
    .deg { font-size: 34px; font-weight: 700; }
    .map { height: 320px; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); }
    .cam { position: relative; height: 380px; border-radius: 16px; overflow: hidden; background: #000; }
    .cam video { width: 100%; height: 100%; object-fit: cover; }
    .cam-arrow { position: absolute; left: 50%; bottom: 40px; font-size: 64px; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,.6); transition: transform .12s linear; }
    .cam-msg { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; padding: 24px; text-align: center; }
    .ic-k { font-size: 30px; }
  `],
})
export class QiblaPage implements AfterViewInit, OnDestroy {
  loc = inject(LocationService);
  private prayer = inject(PrayerService);
  s = inject(SettingsService);
  @ViewChild('mapEl') mapEl?: ElementRef<HTMLDivElement>;
  @ViewChild('vid') vid?: ElementRef<HTMLVideoElement>;

  view = signal<'compass' | 'map' | 'camera'>('compass');
  heading = signal(0);
  sensor = signal(false);
  camError = signal('');
  needsPermission = signal(typeof (DeviceOrientationEvent as any)?.requestPermission === 'function');
  ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  bearing = computed(() => { this.loc.loc(); return this.prayer.qiblaBearing(); });
  km = computed(() => { this.loc.loc(); return Math.round(this.prayer.distanceToKaaba()).toLocaleString(); });
  mi = computed(() => { this.loc.loc(); return Math.round(this.prayer.distanceToKaaba() * 0.621371).toLocaleString(); });
  dirName = computed(() => DIRS[Math.round(this.bearing() / 45) % 8]);
  relative = computed(() => this.norm(this.bearing() - this.heading()));
  aligned = computed(() => this.sensor() && Math.abs(this.relative()) < 5);
  private map?: L.Map;
  private stream?: MediaStream;
  private wasAligned = false;
  private handler = (e: DeviceOrientationEvent) => this.onOrient(e);

  ngAfterViewInit() { if (!this.needsPermission()) this.listen(); }

  private norm(d: number) { d = ((d % 360) + 540) % 360 - 180; return d; }

  async enableSensor() {
    try {
      const r = await (DeviceOrientationEvent as any).requestPermission();
      if (r === 'granted') { this.needsPermission.set(false); this.listen(); }
    } catch { /* denied */ }
  }

  private listen() {
    window.addEventListener('deviceorientationabsolute', this.handler as any, true);
    window.addEventListener('deviceorientation', this.handler as any, true);
  }

  private onOrient(e: DeviceOrientationEvent) {
    const ios = (e as any).webkitCompassHeading;
    let h: number | null = null;
    if (typeof ios === 'number') h = ios;
    else if (e.alpha != null && (e.absolute || e.type === 'deviceorientationabsolute')) h = (360 - e.alpha) % 360;
    if (h == null) return;
    this.sensor.set(true);
    this.heading.set(h);
    const al = Math.abs(this.norm(this.bearing() - h)) < 5;
    if (al && !this.wasAligned && this.s.s().haptics) navigator.vibrate?.(60);
    this.wasAligned = al;
  }

  setView(v: 'compass' | 'map' | 'camera') {
    this.view.set(v);
    this.stopCamera();
    this.map?.remove(); this.map = undefined;
    setTimeout(() => { if (v === 'map') this.initMap(); if (v === 'camera') this.startCamera(); }, 80);
  }

  private initMap() {
    if (!this.mapEl) return;
    const l = this.loc.loc();
    const m = L.map(this.mapEl.nativeElement, { zoomControl: true }).setView([l.lat, l.lng], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(m);
    const dot = (c: string) => ({ radius: 8, color: '#fff', weight: 2, fillColor: c, fillOpacity: 1 });
    L.circleMarker([l.lat, l.lng], dot('#1a7f55')).addTo(m).bindPopup('You').openPopup();
    L.circleMarker([KAABA.lat, KAABA.lng], dot('#c9a24b')).addTo(m).bindPopup('Kaaba, Makkah');
    const line = L.polyline(this.arc(l.lat, l.lng), { color: '#0b5d3b', weight: 3, dashArray: '8 6' }).addTo(m);
    m.fitBounds(line.getBounds().pad(0.2));
    this.map = m;
  }

  /** Great-circle path between the user and the Kaaba. */
  private arc(lat1: number, lng1: number): L.LatLngTuple[] {
    const r = (x: number) => x * Math.PI / 180, d = (x: number) => x * 180 / Math.PI;
    const p1 = r(lat1), l1 = r(lng1), p2 = r(KAABA.lat), l2 = r(KAABA.lng);
    const dist = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
    if (!dist) return [[lat1, lng1], [KAABA.lat, KAABA.lng]];
    const pts: L.LatLngTuple[] = [];
    for (let i = 0; i <= 40; i++) {
      const f = i / 40, A = Math.sin((1 - f) * dist) / Math.sin(dist), B = Math.sin(f * dist) / Math.sin(dist);
      const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
      const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
      const z = A * Math.sin(p1) + B * Math.sin(p2);
      pts.push([d(Math.atan2(z, Math.sqrt(x * x + y * y))), d(Math.atan2(y, x))]);
    }
    return pts;
  }

  private async startCamera() {
    this.camError.set('');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (this.vid) this.vid.nativeElement.srcObject = this.stream;
    } catch { this.camError.set('Camera access was denied or is not available on this device.'); }
  }
  private stopCamera() { this.stream?.getTracks().forEach(t => t.stop()); this.stream = undefined; }

  ngOnDestroy() {
    window.removeEventListener('deviceorientationabsolute', this.handler as any, true);
    window.removeEventListener('deviceorientation', this.handler as any, true);
    this.stopCamera(); this.map?.remove();
  }
}
