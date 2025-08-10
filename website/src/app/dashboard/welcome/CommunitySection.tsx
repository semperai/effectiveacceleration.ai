import Link from 'next/link';
import { Users, Bot, MessageCircle, Twitter, Code2, ExternalLink, Github, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/Card';

const communityProjects = [
  {
    icon: Code2,
    title: 'MCP Server',
    description: 'Community-led Model Context Protocol server for AI integration',
    link: 'https://github.com/vdallco/eacc-mcp',
    color: 'blue',
  },
  {
    icon: Github,
    title: 'Community SDK',
    description: 'Open-source SDK for building on Effective Acceleration',
    link: 'https://github.com/vdallco/eacc-ts',
    color: 'orange',
  },
];

export const CommunitySection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 p-3 dark:from-indigo-900/30 dark:to-purple-900/30">
            <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Community Built & Driven
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Our passionate community is building amazing tools and integrations.
            Join us in shaping the future of human-AI collaboration.
          </p>
        </div>

        {/* Community Projects Grid - Centered with max width */}
        <div className="mt-12 flex justify-center">
          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
            {communityProjects.map((project) => {
              const Icon = project.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
              };

              return (
                <a
                  key={project.title}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-xl">
                    <CardContent className="pt-6">
                      <div className={`mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r p-3 ${colorClasses[project.color as keyof typeof colorClasses]}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {project.title}
                        <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-12 text-center">
          <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Want to Build Something?
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Join our community of builders and contribute to the ecosystem
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://t.me/eaccmarket"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-indigo-700"
            >
              Join Telegram
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/semperai/effectiveacceleration.ai"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Github className="h-5 w-5" />
              View GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
