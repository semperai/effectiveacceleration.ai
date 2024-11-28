import { Layout } from '@/components/FullLayout';
import { Link } from '@/components/Link';
import BackgroundImage from '@/images/lost.webp';
import Image from 'next/image';

export default function NotFound() {
  return (
    <Layout>
      <main className="relative isolate min-h-screen">
        <div className="absolute inset-0 -z-10">
          <Image
            src={BackgroundImage}
            alt=""
            className="h-full w-full object-cover object-center opacity-50 blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" />
        </div>

        <div className="relative mx-auto max-w-xl px-6 py-32 text-center sm:py-40 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-base font-semibold text-white/80">
                404 Error
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Page not found
              </h1>
              <p className="mt-4 text-lg text-white/70">
                Sorry, we couldn't find the page you're looking for.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <span aria-hidden="true">←</span>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
