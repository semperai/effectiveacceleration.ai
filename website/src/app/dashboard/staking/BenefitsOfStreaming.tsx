'use client';
import { TrendingUp, Clock, Zap, BarChart4, Shield, Coins } from 'lucide-react';

export function BenefitsOfStreaming() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
      <h3 className="text-xl font-bold text-indigo-900 mb-4">Maximize Rewards with Advanced Staking</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 mr-3 shadow-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-800">Exponential Growth</h4>
              <p className="text-sm text-gray-600 mt-1">
                Unlock multipliers that grow exponentially based on your commitment time.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 mr-3 shadow-sm">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-800">Power Compounding</h4>
              <p className="text-sm text-gray-600 mt-1">
                Stack your rewards by utilizing both EACC and EAXX token strategies.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 mr-3 shadow-sm">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-800">Marketplace Rewards</h4>
              <p className="text-sm text-gray-600 mt-1">
                EAXX automatically accumulates tokens from marketplace job completions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
