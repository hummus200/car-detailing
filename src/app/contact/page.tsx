import { ContactForm } from "@/components/contact/contact-form";
import { GlassCard } from "@/components/common/glass-card";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Contact B2 Auto Detailing
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-gray-400">
            Based in Perth, WA. Use the form or details below and we&apos;ll
            respond with a clear next step.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          {/* Left: contact details + map in one glass card */}
          <GlassCard className="flex h-full flex-col p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300/80">
              Studio & operations
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Perth, Western Australia
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Placeholder address for now:
              <br />
              123 Abernethy Road, Perth WA 6000
            </p>
            <dl className="mt-4 space-y-2 text-sm text-gray-300">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Phone</dt>
                <dd className="font-medium text-gray-100">+61 427 816 980</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Email</dt>
                <dd className="font-medium text-gray-100">
                  contact@b2autodetailers.au
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Hours</dt>
                <dd className="font-medium text-gray-100">
                  Mon–Fri, 08:00–17:30 AWST
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex-1 overflow-hidden rounded-xl">
              <iframe
                title="B2 Auto Detailing – Perth, Western Australia"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d335475.3551497547!2d115.43808275!3d-31.9558964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2a32a51187f82a91%3A0x2a0b9702a7a3e3aa!2sPerth%20WA!5e0!3m2!1sen!2sau!4v1700000000000!5m2!1sen!2sau"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </GlassCard>

          {/* Right: full-width glass card with form */}
          <GlassCard className="flex h-full flex-col p-5 sm:p-6 lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300/80">
              Send a message
            </p>
            <p className="mt-1 mb-4 text-xs text-gray-400">
              Share your vehicle, location and timelines. We&apos;ll respond
              with a clear path forward.
            </p>
            <div className="flex-1">
              <ContactForm />
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
