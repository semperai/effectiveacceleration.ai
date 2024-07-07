import useJobs from "./useJobs";
import { Job, JobState } from "effectiveacceleration-contracts";


export default function useOpenJobs() {
  const { data, ...rest } = useJobs();

  return {
    jobs: data.filter((job: Job) => job.state === JobState.Open),
    ...rest,
  };
}