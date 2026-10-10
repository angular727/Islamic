import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { SettingsService } from './core/settings.service';

const entry: CanActivateFn = () => {
  const r = inject(Router);
  return r.parseUrl(inject(SettingsService).s().onboarded ? '/home' : '/splash');
};
/** Setup screens are skipped once onboarding is finished. */
const needsOnboarding: CanActivateFn = () => {
  const s = inject(SettingsService).s();
  return s.onboarded ? inject(Router).parseUrl('/home') : true;
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [entry], children: [] },
  { path: 'splash', canActivate: [needsOnboarding], loadComponent: () => import('./features/onboarding').then(m => m.SplashPage) },
  { path: 'onboarding', canActivate: [needsOnboarding], loadComponent: () => import('./features/onboarding').then(m => m.OnboardingPage) },
  { path: 'language', loadComponent: () => import('./features/onboarding').then(m => m.LanguagePage) },
  { path: 'madhab', loadComponent: () => import('./features/onboarding').then(m => m.MadhabPage) },
  { path: 'location', loadComponent: () => import('./features/onboarding').then(m => m.LocationPage) },

  { path: 'home', loadComponent: () => import('./features/home').then(m => m.HomePage) },
  { path: 'library', loadComponent: () => import('./features/home').then(m => m.LibraryPage) },
  { path: 'more', loadComponent: () => import('./features/home').then(m => m.MorePage) },
  { path: 'search', loadComponent: () => import('./features/search').then(m => m.SearchPage) },

  { path: 'quran', loadComponent: () => import('./features/quran').then(m => m.QuranListPage) },
  { path: 'quran/:n', loadComponent: () => import('./features/quran').then(m => m.QuranReaderPage) },
  { path: 'hadith', loadComponent: () => import('./features/hadith').then(m => m.HadithCollectionsPage) },
  { path: 'hadith/:key', loadComponent: () => import('./features/hadith').then(m => m.HadithBooksPage) },
  { path: 'hadith/:key/:sec', loadComponent: () => import('./features/hadith').then(m => m.HadithListPage) },
  { path: 'duas', loadComponent: () => import('./features/duas').then(m => m.DuasPage) },
  { path: 'duas/:cat', loadComponent: () => import('./features/duas').then(m => m.DuaCategoryPage) },
  { path: 'prayer-times', loadComponent: () => import('./features/prayer').then(m => m.PrayerTimesPage) },
  { path: 'qibla', loadComponent: () => import('./features/qibla').then(m => m.QiblaPage) },
  { path: 'tasbeeh', loadComponent: () => import('./features/tasbeeh').then(m => m.TasbeehPage) },
  { path: 'calendar', loadComponent: () => import('./features/calendar').then(m => m.CalendarPage) },
  { path: 'audio', loadComponent: () => import('./features/audio').then(m => m.RecitersPage) },
  { path: 'audio/:id', loadComponent: () => import('./features/audio').then(m => m.ReciterSurahsPage) },
  { path: 'player', loadComponent: () => import('./features/audio').then(m => m.PlayerPage) },
  { path: 'ibadaat', loadComponent: () => import('./features/ibadaat').then(m => m.IbadaatHomePage) },
  { path: 'ibadaat/:section', loadComponent: () => import('./features/ibadaat').then(m => m.IbadaatSectionPage) },
  { path: 'ibadaat/:section/:lesson', loadComponent: () => import('./features/ibadaat').then(m => m.IbadaatLessonPage) },
  { path: 'names', loadComponent: () => import('./features/names').then(m => m.NamesPage) },
  { path: 'shahadat', loadComponent: () => import('./features/names').then(m => m.ShahadatPage) },
  { path: 'waqf', loadComponent: () => import('./features/waqf').then(m => m.WaqfPage) },
  { path: 'pronunciation', loadComponent: () => import('./features/pronunciation').then(m => m.PronunciationPage) },
  { path: 'flashcards', loadComponent: () => import('./features/flashcards').then(m => m.FlashcardsHubPage) },
  { path: 'flashcards/:deck', loadComponent: () => import('./features/flashcards').then(m => m.FlashcardsPage) },
  { path: 'bookmarks', loadComponent: () => import('./features/bookmarks').then(m => m.BookmarksPage) },
  { path: 'notes', loadComponent: () => import('./features/notes').then(m => m.NotesPage) },
  { path: 'settings', loadComponent: () => import('./features/settings').then(m => m.SettingsPage) },
  { path: 'themes', loadComponent: () => import('./features/settings').then(m => m.ThemesPage) },
  { path: 'downloads', loadComponent: () => import('./features/settings').then(m => m.DownloadsPage) },
  { path: 'help', loadComponent: () => import('./features/settings').then(m => m.HelpPage) },
  { path: 'about', loadComponent: () => import('./features/settings').then(m => m.AboutPage) },
  { path: '**', redirectTo: '' },
];
