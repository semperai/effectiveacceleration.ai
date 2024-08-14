interface JobStatusProps {
    text: string;
    bgColor: string;
    textColor: string;
}
  
const JobStatus: React.FC<JobStatusProps> = ({ text, bgColor, textColor }) => (
    <div className={`h-[74px] content-center py-5 px-8 text-center ${bgColor} bg-opacity-10`}>
      <span className={`font-bold ${textColor}`}>
        {text}
      </span>
    </div>
);

export default JobStatus