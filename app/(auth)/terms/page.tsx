"use client"

import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-6">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-medium mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Football CMS ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Football CMS is a team management platform that allows coaches, administrators, and players to manage team rosters, track games, schedule training sessions, and analyze performance statistics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">4. User Content</h2>
            <p className="text-muted-foreground">
              You retain ownership of all content you submit to the Service. By submitting content, you grant us a license to use, store, and display that content as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">5. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You may not attempt to gain unauthorized access to any part of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">6. Data Protection</h2>
            <p className="text-muted-foreground">
              We take data protection seriously. Player data, statistics, and team information are stored securely and handled in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">7. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to terminate or suspend your account at any time for violations of these terms. You may also delete your account at any time through the account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">10. Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us at support@footballcms.com.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-between text-sm">
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
