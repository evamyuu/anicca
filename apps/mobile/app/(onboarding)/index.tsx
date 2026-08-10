/**
 * @fileoverview Implementation of index.
 *
 * @module app/(onboarding)/indexx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/intro" />;
}