import InputBar from "@/components/InputBar";
import AggregateData from "@/components/AggregateData";
import YoutubeData from "@/components/YoutubeData";
//import InstagramData from "@/components/InstagramData";
// import TikTokData from "@/components/TikTokData";

export default function Home() {
  return (
    // display counter from youtube api
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold text-center">
        Social Media API Project
      </h1>
      <div className="p-10">
        <InputBar />
        <AggregateData />
      </div>
      <div className="flex flex-row items-center">
        <YoutubeData />
        {/*<InstagramData /> */}
        {/*<TikTokData /> */}
      </div>
    </div>
  );
}
