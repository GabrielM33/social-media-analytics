import YoutubeData from "@/components/YoutubeData";
import InputBar from "@/components/InputBar";

export default function Home() {
  return (
    // display counter from youtube api
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold text-center">
        Social Media API Project
      </h1>
      <div className="p-10">
        <InputBar />
      </div>
      <YoutubeData />
    </div>
  );
}
