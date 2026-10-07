'use client';

import type { Owner, PhoneScreen } from '@/scene/poses';
import { HomeScreen } from './HomeScreen';
import { ChatClientScreen, ChatYouScreen } from './ChatScreen';
import { SplashScreen } from './SplashScreen';

/** One place that maps a poses-table screen name to its template. */
export function PhoneScreenView({ screen, owner }: { screen: PhoneScreen; owner: Exclude<Owner, 'anyone'> }) {
  switch (screen) {
    case 'home':
      return <HomeScreen owner={owner} />;
    case 'chatYou':
      return <ChatYouScreen />;
    case 'chatClient':
      return <ChatClientScreen />;
    case 'splash':
      return <SplashScreen />;
  }
}
