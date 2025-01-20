import YoutubeViews from "@/components/youtibe/YoutubeViews";

export default function Home() {
  return (
    // display counter from youtube api
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold">Social Media API Project</h1>
      <YoutubeViews videoId="Z9xzPDRrQHw" />
      <YoutubeViews videoId="dQw4w9WgXcQ" />
    </div>
  );
}
