'use client';

export const InformationBox = () => {
  return (
    <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
      <h3 className="font-bold text-blue-800 mb-3">How EACC Staking Works</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">1</div>
          <div className="bg-white rounded-xl p-4 pl-10 pt-6 shadow-sm min-h-full">
            <h4 className="font-medium text-blue-800 mb-2">Stake EACC for EAXX</h4>
            <p className="text-sm text-gray-600">
              Stake your EACC tokens in the EAXX contract (minimum 1 year lockup) to receive a Sablier vesting stream of EAXX tokens with a time-based multiplier.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">2</div>
          <div className="bg-white rounded-xl p-4 pl-10 pt-6 shadow-sm min-h-full">
            <h4 className="font-medium text-blue-800 mb-2">Create an EACC Stream</h4>
            <p className="text-sm text-gray-600">
              Alternatively, send EACC to create a time-locked Sablier stream. A portion goes to the EAXX contract, and you receive a multiplier on tokens based on your lock duration.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">3</div>
          <div className="bg-white rounded-xl p-4 pl-10 pt-6 shadow-sm min-h-full">
            <h4 className="font-medium text-blue-800 mb-2">Redeem EAXX for EACC</h4>
            <p className="text-sm text-gray-600">
              EAXX holders can redeem their tokens for a proportional share of all EACC in the EAXX contract (similar to xSUSHI). EAXX also accumulates tokens from marketplace job completions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
        <h4 className="font-medium text-blue-800 mb-2">Time-Based Multipliers</h4>
        <p className="text-sm text-gray-600">
          Both staking and streaming options offer exponential multipliers based on your lock duration. The longer you commit your tokens, the greater your rewards will be.
        </p>
      </div>
    </div>
  );
};

export default InformationBox;
