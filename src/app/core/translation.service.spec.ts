import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { DEFAULT_TRANSLATION, TranslationService, URDU_TRANSLATORS, translatorById } from './translation.service';

describe('TranslationService', () => {
  let ts: TranslationService;
  let settings: SettingsService;

  beforeEach(() => {
    localStorage.removeItem('i360.settings');
    TestBed.configureTestingModule({});
    settings = TestBed.inject(SettingsService);
    ts = TestBed.inject(TranslationService);
  });

  it('lists the eight Urdu translators in the requested order', () => {
    expect(URDU_TRANSLATORS.map(t => t.title)).toEqual([
      'Tarjuma-e-Quran (Mauzih-ul-Quran)', 'Literal word-for-word Quran translation', 'Bayan-ul-Quran', 'Aasan Urdu Translation',
      'Kanz-ul-Iman', 'Tafheem-ul-Quran', 'Urdu Translation of the Quran', 'Aasan Tarjuma-e-Quran',
    ]);
  });

  it('only offers translations that have a verified source, and explains the others', () => {
    for (const t of URDU_TRANSLATORS) {
      if (t.available) expect(t.source).withContext(t.id).toBeDefined();
      else expect(t.reason?.length).withContext(t.id).toBeGreaterThan(20);
    }
    expect(URDU_TRANSLATORS.filter(t => t.available).length).toBe(5);
  });

  it('defaults to a valid, available translation', () => {
    expect(ts.selectedId()).toBe(DEFAULT_TRANSLATION);
    expect(translatorById(DEFAULT_TRANSLATION)?.available).toBeTrue();
  });

  it('selects an available translator and remembers it in the settings', () => {
    expect(ts.select('ur.maududi')).toBeTrue();
    expect(ts.selectedId()).toBe('ur.maududi');
    expect(settings.s().translation).toBe('ur.maududi');
    expect(ts.select('fz.urd-muhammadtaqiusm')).toBeTrue();
    expect(ts.isUrdu()).toBeTrue();
  });

  it('refuses unavailable or unknown translators and keeps the current one', () => {
    ts.select('ur.kanzuliman');
    expect(ts.select('ur.thanvi-bayan')).toBeFalse();
    expect(ts.select('nope')).toBeFalse();
    expect(ts.selectedId()).toBe('ur.kanzuliman');
  });

  it('falls back to the default when the saved id is no longer valid', () => {
    settings.patch({ translation: 'ur.dehlvi-abdulqadir' });
    expect(ts.selectedId()).toBe(DEFAULT_TRANSLATION);
  });
});
