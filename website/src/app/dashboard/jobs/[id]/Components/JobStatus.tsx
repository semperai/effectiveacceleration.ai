interface JobStatusProps {
  text: string;
  bgColor: string;
  textColor: string;
}

const JobStatus: React.FC<JobStatusProps> = ({ text, bgColor, textColor }) => (
  <div
    className={`h-[74px] content-center px-8 py-5 text-center ${bgColor} bg-opacity-10`}
  >
    <span className={`font-bold ${textColor}`}>{text}</span>
  </div>
);

export default JobStatus;
