"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-medium mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-2">We collect information you provide directly:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Account information (name, email, password)</li>
              <li>Player profiles (name, position, date of birth, jersey number)</li>
              <li>Team and game data</li>
              <li>Training session records</li>
              <li>Performance statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use collected information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Provide and maintain the Service</li>
              <li>Send notifications about games and training</li>
              <li>Generate statistics and reports</li>
              <li>Improve our Service</li>
              <li>Communicate with you about updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">3. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using industry-standard encryption. We use secure databases and implement appropriate technical measures to protect your information from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">4. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. Data is only shared within your team/organization as configured by administrators. We may share data with service providers who assist in operating our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">5. Player Data (Minors)</h2>
            <p className="text-muted-foreground">
              If your team includes players under 18, parental/guardian consent is required. Team administrators are responsible for obtaining appropriate consent before adding minor players to the system.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">6. Your Rights</h2>
            <p className="text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies for authentication and session management. These are necessary for the Service to function properly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active. Upon account deletion, your data will be removed within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">9. Changes to Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this policy periodically. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">10. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights, contact us at privacy@footballcms.com.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-between text-sm">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
