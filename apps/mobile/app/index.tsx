/**
 * @fileoverview Application entry-point route — redirects to the welcome screen.
 *
 * @module app/index
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { Redirect } from 'expo-router';

/**
 * Immediately redirects to the onboarding welcome carousel.
 *
 * @remarks
 * This file is required by Expo Router to serve as the root route (`/`).
 * In a future iteration this redirect will check auth state and deep-link
 * to either `(onboarding)/step-1-welcome` or `(tabs)/hub` accordingly.
 *
 * @returns A {@link Redirect} element.
 */
export default function Index() {
  return <Redirect href="/(onboarding)/step-1-welcome" />;
}
