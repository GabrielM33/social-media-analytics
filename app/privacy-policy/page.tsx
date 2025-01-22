import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Information We Collect
          </h2>
          <p className="mb-4">
            When you use our service, we collect and process the following
            information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>TikTok account information when you connect your account</li>
            <li>Video metrics and statistics from your TikTok videos</li>
            <li>YouTube analytics data when you connect your account</li>
            <li>Basic usage data to improve our service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Display your social media metrics and analytics</li>
            <li>Improve and optimize our services</li>
            <li>Provide technical support</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. Data Storage and Security
          </h2>
          <p>
            We take appropriate measures to protect your information. We do not
            store your TikTok or YouTube access tokens permanently, and we only
            access the data necessary to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Third-Party Services
          </h2>
          <p className="mb-4">
            Our service integrates with third-party platforms:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>TikTok (through TikTok&apos;s API)</li>
            <li>YouTube (through YouTube&apos;s API)</li>
          </ul>
          <p className="mt-4">
            Each platform has its own privacy policy and terms of service that
            you should review.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a
              href="mailto:contact@foundermode.bio"
              className="text-blue-600 hover:underline"
            >
              contact@foundermode.bio
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </p>
        </section>

        <footer className="mt-8 pt-8 border-t text-sm text-gray-600">
          <p>Last updated: January 25, 2024</p>
        </footer>
      </div>
    </div>
  );
}
