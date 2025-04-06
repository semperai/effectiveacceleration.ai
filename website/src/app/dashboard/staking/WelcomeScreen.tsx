import { ConnectButton } from '@/components/ConnectButton';
import { PiWallet, PiCoinVertical, PiClock, PiChartLineUp, PiMathOperations, PiFlowArrow, PiGraph } from 'react-icons/pi';

export const WelcomeScreen = () => {
  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-700 rounded-3xl overflow-hidden shadow-2xl mb-8 p-8 md:p-12 text-white relative">
        <div className="relative z-10">
          <h1 className="text-4xl text-white md:text-6xl font-extrabold mb-6 leading-tight">
            Algorithmic EACC Staking
          </h1>
          <p className="text-xl md:text-2xl font-medium text-blue-100 mb-8 max-w-2xl">
            Boost your governance power with strategic staking
          </p>

          <div className="mt-8">
            <ConnectButton />
          </div>
        </div>

        {/* Enhanced Animated Particles Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 12 + 5}px`,
                height: `${Math.random() * 12 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.3,
                animation: `float ${Math.random() * 15 + 10}s linear infinite, pulse ${Math.random() * 4 + 2}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-3xl shadow-lg transform hover:scale-[1.02] transition-all">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-4 shadow-lg">
              <PiMathOperations className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-800">Power Stake</h2>
          </div>
          <p className="text-indigo-700 mb-4">
            Stake your EACC tokens to receive EAXX tokens with exponential multipliers based on your lockup period. Redeem these for EACC tokens as protocol tokens are forwarded.
          </p>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-indigo-600">1 Year Lock</span>
              <span className="text-sm font-medium text-indigo-800">+40% Bonus</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-indigo-600">2 Year Lock</span>
              <span className="text-sm font-medium text-indigo-800">+109% Bonus</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-600">4 Year Lock</span>
              <span className="text-sm font-medium text-indigo-800">+470% Bonus</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl shadow-lg transform hover:scale-[1.02] transition-all">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
              <PiFlowArrow className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-purple-800">Cascade Yield</h2>
          </div>
          <p className="text-purple-700 mb-4">
            Create streams of EACC tokens with algorithmic multipliers for any length duration. Receive tokens continuously over time.
          </p>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="h-5 w-full bg-purple-100 rounded-full overflow-hidden mb-2 relative">
              <div className="absolute top-0 left-0 h-full w-full flex">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[40%]"></div>
                <div className="h-full bg-purple-300 w-[5%] animate-stream"></div>
              </div>
            </div>
            <div className="text-xs text-purple-600 text-center">Algorithmic token distribution</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Mathematical Optimization Process</h3>
        <div className="space-y-6">
          <div className="flex">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mr-5 shadow-md flex-shrink-0">
              <PiWallet className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">1. Connect & Initialize</h4>
              <p className="text-gray-600">
                Connect your wallet to access the staking platform on Arbitrum One. Initialize your position with EACC tokens.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mr-5 shadow-md flex-shrink-0">
              <PiGraph className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">2. Select Optimization Strategy</h4>
              <p className="text-gray-600">
                Choose between Power Stake for EAXX or Cascade Yield for time-based token streams with recursive growth patterns.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mr-5 shadow-md flex-shrink-0">
              <PiClock className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">3. Configure Time Variable</h4>
              <p className="text-gray-600">
                Set your time commitment. The longer the lockup, the greater the overall multiplier.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-lg mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">System Advantages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-bold text-lg mb-2 text-indigo-900">Exponential Growth</h4>
            <p className="text-gray-600 text-sm">
              Achieve potentially significant growth by betting on future platform participation.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-bold text-lg mb-2 text-purple-900">Strategic Flexibility</h4>
            <p className="text-gray-600 text-sm">
              Choose between algorithmic staking models based on your governance priorities and investment parameters.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
            </div>
            <h4 className="font-bold text-lg mb-2 text-blue-900">Recursive Compounding</h4>
            <p className="text-gray-600 text-sm">
              EAXX tokens continuously aggregate value from protocol activities, creating a recursive value accumulation cycle.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <ConnectButton />
        <p className="text-gray-500 text-sm mt-4">
          Connect your wallet on Arbitrum One to access EACC Staking
        </p>
      </div>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes stream {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-stream {
          animation: stream 2s infinite linear;
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.5);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};
