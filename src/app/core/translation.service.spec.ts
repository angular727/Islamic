import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { idbDel } from './store';
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

  it('loads the catalogue of translations, grouped by language, and can select one', async () => {
    const data = [
      { identifier: 'hi.hindi', language: 'hi', englishName: 'Suhel Farooq Khan and Saifur Rahman Nadwi', direction: 'ltr' },
      { identifier: 'fa.makarem', language: 'fa', englishName: 'Naser Makarem Shirazi', direction: 'rtl' },
      { identifier: 'ms.basmeih', language: 'ms', englishName: 'Abdullah Muhammad Basmeih', direction: 'ltr' },
      { identifier: 'ur.ahmedali', language: 'ur', englishName: 'Ahmed Ali', direction: 'rtl' },
    ];
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify({ data })));
    await idbDel('quran:catalog');                                       // do not reuse a catalogue cached by another test
    await ts.loadCatalog();
    const codes = ts.languages().map(l => l.code);
    expect(codes).toEqual(jasmine.arrayContaining(['hi', 'fa', 'ms', 'en', 'fr']));
    expect(codes).not.toContain('ur');                                   // Urdu has its own list
    expect(ts.inLanguage('fa')[0]).toEqual(jasmine.objectContaining({ id: 'fa.makarem', dir: 'rtl', available: true }));
    expect(ts.select('hi.hindi')).toBeTrue();
    expect(ts.selected().language).toBe('hi');
    expect(translatorById('ms.basmeih')?.name).toContain('Basmeih');
    localStorage.removeItem('i360.translatorExtra');
  });

  it('shows the Quran translation in the app language, until another one is chosen', async () => {
    const data = [{ identifier: 'hi.hindi', language: 'hi', englishName: 'Hindi', direction: 'ltr' }, { identifier: 'fa.ayati', language: 'fa', englishName: 'Ayati', direction: 'rtl' }];
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify({ data })));
    settings.patch({ lang: 'hi', translationAuto: true });
    await idbDel('quran:catalog');                                       // do not reuse a catalogue cached by another test
    await ts.loadCatalog();
    expect(ts.selectedId()).toBe('hi.hindi');                            // follows the app language
    settings.patch({ lang: 'fa' });
    expect(ts.selectedId()).toBe('fa.ayati');
    settings.patch({ lang: 'en' });
    expect(ts.selectedId()).toBe(DEFAULT_TRANSLATION);                   // English keeps the saved translation
    settings.patch({ lang: 'hi' });
    expect(ts.select('en.sahih')).toBeTrue();                            // an explicit choice wins
    expect(ts.selectedId()).toBe('en.sahih');
    ts.followApp();
    expect(ts.selectedId()).toBe('hi.hindi');
    localStorage.removeItem('i360.translatorExtra');
  });
});
