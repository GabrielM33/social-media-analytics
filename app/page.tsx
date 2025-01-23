import InputBarYoututbe from "@/components/InputBarYoututbe";
import AggregateData from "@/components/AggregateData";
import InputBarInstagram from "@/components/InputBarInstagram";
import InputBarTikTok from "@/components/InputBarTikTok";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold text-center">Social Media Analytics</h1>
      <div className="p-10 w-full max-w-4xl">
        <div className="mt-12">
          <AggregateData />
        </div>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">YouTube</h2>
          <InputBarYoututbe />
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">Instagram</h2>
          <InputBarInstagram />
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-center">TikTok</h2>
          <InputBarTikTok />
        </section>
      </div>
    </div>
  );
}
