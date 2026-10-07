'use client';

import type { Owner, PhoneScreen } from '@/scene/poses';
import { PHONE_SCREEN_PX } from './size';
import { HomeVNScreen } from './HomeVNScreen';
import { ContractLockedScreen } from './ContractLockedScreen';
import { OnbSplashScreen } from './OnbSplashScreen';
import { ChatClientScreen, ChatYouScreen } from './ChatScreen';

function Board({ screen, owner }: { screen: PhoneScreen; owner: Exclude<Owner, 'anyone'> }) {
  switch (screen) {
    case 'home':
      // Hero: your phone shows Home; flipped to the client, it shows their locked contract.
      return owner === 'you' ? <HomeVNScreen /> : <ContractLockedScreen />;
    case 'chatYou':
      return <ChatYouScreen />;
    case 'chatClient':
      return <ChatClientScreen />;
    case 'splash':
      return <OnbSplashScreen />;
  }
}

/**
 * One place that maps a poses-table screen name to its template. The rounded clip is the device's
 * glass (radius matches the 3D screen), not part of the board.
 */
export function PhoneScreenView({ screen, owner }: { screen: PhoneScreen; owner: Exclude<Owner, 'anyone'> }) {
  return (
    <div style={{ width: PHONE_SCREEN_PX.w, height: PHONE_SCREEN_PX.h, borderRadius: 48, overflow: 'hidden' }}>
      <Board screen={screen} owner={owner} />
    </div>
  );
}
