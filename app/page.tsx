import InputBarYoututbe from "@/components/InputBarYoututbe";
import YoutubeData from "@/components/YoutubeData";
import AggregateData from "@/components/AggregateData";
import InputBarInstagram from "@/components/InputBarInstagram";
import InputBarTiktok from "@/components/InputBarTiktok";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold text-center">
        Social Media API Project
      </h1>
      <div className="p-10 w-full max-w-4xl">
        <section>
          <h2 className="text-2xl font-semibold mb-4">TikTok Analytics</h2>
          <InputBarTiktok />
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Instagram Analytics</h2>
          <InputBarInstagram />
        </section>
        {/* YouTube Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">YouTube Analytics</h2>
          <InputBarYoututbe />
          <YoutubeData />
        </section>
      </div>

      <div className="mt-12">
        <AggregateData />
      </div>
    </div>
  );
}
