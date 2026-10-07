'use client';

import type { Owner, PhoneScreen } from '@/scene/poses';
import { PHONE_SCREEN_PX } from './size';
import { HomeIntlScreen, HomeVNScreen } from './HomeScreen';
import { ContractLockedScreen } from './ContractLockedScreen';
import { OnbSplashScreen } from './OnbSplashScreen';
import { OnbWelcomeScreen } from './OnbWelcomeScreen';
import { OnbSetupScreen } from './OnbSetupScreen';
import { OnbResidenceScreen } from './OnbResidenceScreen';
import { ChatClientScreen, ChatYouScreen } from './ChatScreen';
import { ContractNew1Screen, ContractNew2Screen, ContractNew3Screen } from './ContractNewScreens';
import { ContractDetailScreen } from './ContractDetailScreen';
import { ContractAcceptScreen } from './ContractAcceptScreen';
import { ContractLockScreen } from './ContractLockScreen';
import { MilestoneSubmittedScreen } from './MilestoneSubmittedScreen';
import { MilestoneReviewScreen } from './MilestoneReviewScreen';
import { MilestoneReleasedScreen } from './MilestoneReleasedScreen';
import { ContractAnyoneActionScreen, ContractDetailLogoClock } from './ContractAnyoneActionScreen';
import { DisclosuresScreen } from './DisclosuresScreen';
import { SUBMITTED_FP } from '@/screens/web/WebSubmitScreen';

function Board({ screen, owner }: { screen: PhoneScreen; owner: Exclude<Owner, 'anyone'> }) {
  switch (screen) {
    case 'home':
      // Hero: your phone shows Home; flipped to the client, it shows their locked contract.
      return owner === 'you' ? <HomeVNScreen /> : <ContractLockedScreen />;
    case 'chatYou':
      return <ChatYouScreen />;
    case 'chatClient':
      return <ChatClientScreen />;
    case 'homeIntl':
      return <HomeIntlScreen />;
    case 'splash':
      return <OnbSplashScreen />;
    case 'onbWelcome':
      return <OnbWelcomeScreen />;
    case 'onbSetup':
      return <OnbSetupScreen />;
    case 'onbResidence':
      return <OnbResidenceScreen />;
    case 'cn1':
      return <ContractNew1Screen />;
    case 'cn2':
      return <ContractNew2Screen />;
    case 'cn3':
      return <ContractNew3Screen />;
    case 'cdNew':
      return <ContractDetailScreen variant="vinhNew" />;
    case 'accept':
      return <ContractAcceptScreen />;
    case 'cdAccepted':
      return <ContractDetailScreen variant="vinhAccepted" />;
    case 'cdMiaAccepted':
      return <ContractDetailScreen variant="miaAccepted" />;
    case 'lock':
      return <ContractLockScreen />;
    case 'lockedClient':
      return <ContractLockedScreen />;
    case 'lockedVN':
      return <ContractLockedScreen side="freelancerVN" />;
    case 'cdVinhLocked':
      return <ContractDetailScreen variant="vinhLocked" />;
    case 'submitted':
      return <MilestoneSubmittedScreen fingerprint={SUBMITTED_FP} />;
    case 'review':
      return <MilestoneReviewScreen />;
    case 'releasedClient':
      return <MilestoneReleasedScreen variant="client" />;
    case 'releasedVN':
      return <MilestoneReleasedScreen variant="freelancerVN" />;
    case 'logoSubmitted':
      return <ContractDetailLogoClock />;
    case 'anyoneRelease':
      return <ContractAnyoneActionScreen kind="release" />;
    case 'anyoneRefund':
      return <ContractAnyoneActionScreen kind="refund" />;
    case 'releasedB':
      return <MilestoneReleasedScreen variant="anyone" />;
    case 'refunded':
      return <MilestoneReleasedScreen variant="refund" />;
    case 'disclosures':
      return <DisclosuresScreen />;
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
