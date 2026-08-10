/**
 * @fileoverview Implementation of index.
 *
 * @module app/(tabs)/indexx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useOnboardingStore } from '@/shared/lib/zustand-persist';

import { PatientHome } from '../../src/features/home/ui/PatientHome';
import { CaregiverHome } from '../../src/features/home/ui/CaregiverHome';
import { DoctorHome } from '../../src/features/home/ui/DoctorHome';

export default function HubScreen() {
  const profileType = useOnboardingStore(s => s.profileType);

  if (!profileType) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fbf9f6'}}>
        <ActivityIndicator size="large" color="#f28b50" />
      </View>
    );
  }

  if (profileType === 'doctor') {
    return <DoctorHome />;
  }

  if (profileType === 'caregiver') {
    return <CaregiverHome />;
  }

  return <PatientHome />;
}