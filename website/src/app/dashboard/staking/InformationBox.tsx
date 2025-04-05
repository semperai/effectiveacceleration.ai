'use client';

export const InformationBox = () => {
  return (
    <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
      <h3 className="font-bold text-blue-800 mb-3">How It Works</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">1</div>
          <div className="bg-white rounded-xl p-4 pl-6 shadow-sm min-h-full">
            <h4 className="font-medium text-blue-800 mb-2">Choose Your Lock Period</h4>
            <p className="text-sm text-gray-600">
              Select how long you want to lock your tokens. Longer periods give you substantially higher multipliers.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">2</div>
          <div className="bg-white rounded-xl p-4 pl-6 shadow-sm min-h-full">
            <h4 className="font-medium text-blue-800 mb-2">Stake or Create Stream</h4>
            <p className="text-sm text-gray-600">
              Choose your preferred method: direct staking for EAXX tokens or creating a token stream.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">3</div>
          <div className="bg-white rounded-xl p-4 pl-6 shadow-sm min-h-full">
            <h4 className="font-medium text-blue-800 mb-2">Earn More EACC</h4>
            <p className="text-sm text-gray-600">
              Enjoy increased rewards based on your chosen multiplier. The longer you stake, the more you earn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
