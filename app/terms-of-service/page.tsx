import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using this website (foundermode.bio), you accept
            and agree to be bound by these Terms of Service. If you do not agree
            to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. Service Description
          </h2>
          <p className="mb-4">
            Our service provides analytics and metrics for social media content,
            specifically:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>TikTok video metrics and analytics</li>
            <li>YouTube video analytics</li>
            <li>Aggregated social media performance data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. User Responsibilities
          </h2>
          <p className="mb-4">You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate information when using our service</li>
            <li>Use the service in compliance with all applicable laws</li>
            <li>Not misuse or attempt to manipulate the service</li>
            <li>Maintain the security of your account credentials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Third-Party Platforms
          </h2>
          <p className="mb-4">
            Our service integrates with third-party platforms including TikTok
            and YouTube. By using our service, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Comply with each platform&apos;s terms of service</li>
            <li>Grant us necessary permissions to access your data</li>
            <li>
              Understand that we are not responsible for third-party services
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            5. Data Usage and Privacy
          </h2>
          <p>
            Your use of our service is also governed by our Privacy Policy. We
            collect and use data as described in our Privacy Policy, which is
            incorporated into these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Limitations of Liability
          </h2>
          <p>
            Our service is provided &quot;as is&quot; without any warranties. We
            are not liable for any damages arising from your use of our service
            or any interruptions in service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. Modifications to Service
          </h2>
          <p>
            We reserve the right to modify or discontinue our service at any
            time, with or without notice. We are not liable to you or any third
            party for any modification, suspension, or discontinuance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your access to our
            service immediately, without prior notice, for any violation of
            these Terms of Service or for any other reason.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            9. Contact Information
          </h2>
          <p>
            For any questions regarding these Terms of Service, please contact
            us at{" "}
            <a
              href="mailto:contact@foundermode.bio"
              className="text-blue-600 hover:underline"
            >
              contact@foundermode.bio
            </a>
          </p>
        </section>

        <footer className="mt-8 pt-8 border-t text-sm text-gray-600">
          <p>Last updated: January 25, 2024</p>
        </footer>
      </div>
    </div>
  );
}
