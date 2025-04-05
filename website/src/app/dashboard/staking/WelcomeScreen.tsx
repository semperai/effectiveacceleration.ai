import { ConnectButton } from '@/components/ConnectButton';
import { PiWallet, PiCoinVertical, PiClock, PiChartLineUp } from 'react-icons/pi';

export const WelcomeScreen = () => {
  return (
    <div className="max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          EACC Staking Platform
        </h1>
        <p className="text-gray-600 text-lg">
          Stake your EACC tokens to earn rewards and participate in governance
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <ConnectButton />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <PiCoinVertical className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-blue-800">Direct Staking</h2>
          </div>
          <p className="text-blue-700">
            Stake your EACC tokens to receive EAXX tokens based on your lockup period.
            The longer you lock, the more EAXX you receive.
          </p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <PiChartLineUp className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-indigo-800">Token Streaming</h2>
          </div>
          <p className="text-indigo-700">
            Create streams of EACC tokens. The longer the stream duration,
            the higher the multiplier. Tokens are streamed linearly over time.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">How It Works</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 shrink-0">
              <PiWallet className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">1. Connect Your Wallet</h4>
              <p className="text-gray-600">
                Connect your wallet to access the staking platform on Arbitrum One
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 shrink-0">
              <PiCoinVertical className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">2. Choose Amount</h4>
              <p className="text-gray-600">
                Select how many EACC tokens you want to stake or stream
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 shrink-0">
              <PiClock className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">3. Set Lockup Period</h4>
              <p className="text-gray-600">
                Choose your lockup duration - longer periods provide better multipliers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>Ready to boost your EACC earnings? Connect your wallet to get started.</p>
      </div>
    </div>
  );
};
