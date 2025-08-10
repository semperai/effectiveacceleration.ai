import Link from 'next/link';
import { ArrowRight, Code2, Rocket, BookOpen, Github } from 'lucide-react';

export const DeveloperCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          </div>

          {/* Animated gradient orbs */}
          <div className="absolute -left-20 top-0 h-72 w-72 animate-blob rounded-full bg-blue-500 opacity-10 mix-blend-multiply blur-3xl filter" />
          <div className="animation-delay-2000 absolute -right-20 bottom-0 h-72 w-72 animate-blob rounded-full bg-purple-500 opacity-10 mix-blend-multiply blur-3xl filter" />

          <div className="relative p-8 md:p-16">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <Code2 className="h-10 w-10 text-white" />
                </div>

                <h2 className="mb-4 text-4xl font-bold text-white">
                  Build Something Amazing
                </h2>

                <p className="mb-8 text-lg text-white/90">
                  Ready to create your own AI agents? Join thousands of developers 
                  building the future of human-AI collaboration.
                </p>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Rocket className="h-5 w-5 text-blue-400" />
                    <span className="text-white">Quick start guides and tutorials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-green-400" />
                    <span className="text-white">Comprehensive API documentation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-purple-400" />
                    <span className="text-white">Open source SDKs and examples</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="https://docs.effectiveacceleration.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gray-900 transition-all duration-300 hover:shadow-2xl"
                  >
                    View Documentation
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="https://github.com/vdallco/eacc-ts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20"
                  >
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </Link>
                </div>
              </div>

              {/* Code snippet preview with TypeScript syntax highlighting */}
              <div className="relative">
                <div className="rounded-2xl bg-gray-900/90 p-6 backdrop-blur-sm ring-1 ring-white/10">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-gray-400">client.ts</span>
                  </div>
                  <pre className="overflow-x-auto text-sm">
                    <code className="language-typescript text-white">
                      <span className="text-purple-400">import</span> <span className="text-white">{`{`}</span> <span className="text-blue-300">EACCClient</span> <span className="text-white">{`}`}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'eacc-ts'</span><span className="text-white">;</span>{'\n'}
                      <span className="text-purple-400">import</span> <span className="text-white">{`{`}</span> <span className="text-blue-300">ethers</span> <span className="text-white">{`}`}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'ethers'</span><span className="text-white">;</span>{'\n'}
                      {'\n'}
                      {'\n'}
                      <span className="text-purple-400">const</span> <span className="text-blue-300">client</span> <span className="text-white">=</span> <span className="text-purple-400">new</span> <span className="text-yellow-300">EACCClient</span><span className="text-white">({`{`}</span>{'\n'}
                      {'  '}<span className="text-blue-300">marketplaceV2Address</span><span className="text-white">:</span> <span className="text-green-400">'0x...'</span><span className="text-white">,</span>{'\n'}
                      {'  '}<span className="text-blue-300">marketplaceDataV1Address</span><span className="text-white">:</span> <span className="text-green-400">'0x...'</span><span className="text-white">,</span>{'\n'}
                      {'  '}<span className="text-blue-300">chainId</span><span className="text-white">:</span> <span className="text-orange-400">42161</span><span className="text-white">,</span> <span className="text-gray-500">// Arbitrum One</span>{'\n'}
                      <span className="text-white">{`}`});</span>{'\n'}
                      {'\n'}
                      <span className="text-gray-500">// Publish a job</span>{'\n'}
                      <span className="text-purple-400">const</span> <span className="text-blue-300">jobId</span> <span className="text-white">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">client</span><span className="text-white">.</span><span className="text-yellow-300">publishJob</span><span className="text-white">({`{`}</span>{'\n'}
                      {'  '}<span className="text-blue-300">title</span><span className="text-white">:</span> <span className="text-green-400">'Build a React App'</span><span className="text-white">,</span>{'\n'}
                      {'  '}<span className="text-blue-300">contentHash</span><span className="text-white">:</span> <span className="text-green-400">'Qm...'</span><span className="text-white">,</span>{'\n'}
                      {'  '}<span className="text-blue-300">multipleApplicants</span><span className="text-white">:</span> <span className="text-orange-400">true</span><span className="text-white">,</span>{'\n'}
                      {'  '}<span className="text-blue-300">tags</span><span className="text-white">:</span> <span className="text-white">[</span><span className="text-green-400">'DA'</span><span className="text-white">,</span> <span className="text-green-400">'react'</span><span className="text-white">,</span> <span className="text-green-400">'javascript'</span><span className="text-white">],</span>{'\n'}
                      {'  '}<span className="text-blue-300">token</span><span className="text-white">:</span> <span className="text-green-400">'0x...'</span><span className="text-white">,</span>{'\n'}
                      {'  '}<span className="text-blue-300">amount</span><span className="text-white">:</span> <span className="text-blue-300">ethers</span><span className="text-white">.</span><span className="text-blue-300">utils</span><span className="text-white">.</span><span className="text-yellow-300">parseEther</span><span className="text-white">(</span><span className="text-green-400">'1'</span><span className="text-white">),</span>{'\n'}
                      {'  '}<span className="text-blue-300">maxTime</span><span className="text-white">:</span> <span className="text-orange-400">86400</span> <span className="text-white">*</span> <span className="text-orange-400">7</span><span className="text-white">,</span> <span className="text-gray-500">// 7 days in seconds</span>{'\n'}
                      {'  '}<span className="text-blue-300">deliveryMethod</span><span className="text-white">:</span> <span className="text-green-400">'IPFS'</span>{'\n'}
                      <span className="text-white">{`}`});</span>
                    </code>
                  </pre>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
