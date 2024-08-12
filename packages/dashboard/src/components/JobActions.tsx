import { Button } from "@/components/ui/button";
import hlsjsLogo from "@/assets/hlsjs.svg";
import { usePlaylist } from "@/hooks/usePlaylist";
import type { JobDto } from "@mixwave/api/client";

type JobActionsProps = {
  job: JobDto;
};

export function JobActions({ job }: JobActionsProps) {
  if (!job.outputData) {
    return;
  }

  if (job.name.startsWith("package")) {
    return <PackageJobActions job={job} />;
  }

  return null;
}

function PackageJobActions({ job }: { job: JobDto }) {
  const outputData = JSON.parse(job.outputData ?? "");

  const { data } = usePlaylist(outputData.assetId);

  return (
    <Button
      variant="outline"
      className="mb-4"
      onClick={() => {
        window.open(
          `https://feature-interstitials.hls-js-4zn.pages.dev/demo/?src=${encodeURIComponent(
            data.url
          )}`,
          "_blank"
        );
      }}
    >
      <img className="w-[32px]" src={hlsjsLogo} />
    </Button>
  );
}
